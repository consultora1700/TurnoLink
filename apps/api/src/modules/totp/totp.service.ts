import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TotpService {
  private readonly logger = new Logger(TotpService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private getEncryptionKey(): Buffer {
    const key = this.configService.get<string>('TOTP_ENCRYPTION_KEY');
    if (!key) {
      throw new Error('TOTP_ENCRYPTION_KEY is not configured');
    }
    return Buffer.from(key, 'hex');
  }

  private encrypt(text: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
      encrypted: encrypted + ':' + authTag.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  private decrypt(encrypted: string, iv: string): string {
    const [encryptedText, authTag] = encrypted.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      Buffer.from(iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  async setup(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { totpSecret: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.totpSecret?.isEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `TurnoLink:${user.email}`,
      issuer: 'TurnoLink',
      length: 32,
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map((code) => this.hashBackupCode(code));

    // Encrypt secret
    const { encrypted: encryptedSecret, iv } = this.encrypt(secret.base32);
    const { encrypted: encryptedBackupCodes } = this.encrypt(JSON.stringify(hashedBackupCodes));

    // Save or update TOTP secret
    if (user.totpSecret) {
      await this.prisma.totpSecret.update({
        where: { userId },
        data: {
          secret: encryptedSecret,
          iv,
          backupCodes: encryptedBackupCodes,
          isEnabled: false,
          isVerified: false,
        },
      });
    } else {
      await this.prisma.totpSecret.create({
        data: {
          userId,
          secret: encryptedSecret,
          iv,
          backupCodes: encryptedBackupCodes,
          isEnabled: false,
          isVerified: false,
        },
      });
    }

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes, // Return plain backup codes (only shown once)
    };
  }

  async verify(userId: string, code: string) {
    const totpSecret = await this.prisma.totpSecret.findUnique({
      where: { userId },
    });

    if (!totpSecret) {
      throw new BadRequestException('2FA setup not found. Please set up 2FA first.');
    }

    if (totpSecret.isEnabled) {
      throw new BadRequestException('2FA is already verified and enabled');
    }

    const secret = this.decrypt(totpSecret.secret, totpSecret.iv);

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1, // Allow 1 step tolerance (30 seconds)
    });

    if (!verified) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.totpSecret.update({
      where: { userId },
      data: {
        isEnabled: true,
        isVerified: true,
        enabledAt: new Date(),
      },
    });

    return { success: true, message: '2FA has been enabled successfully' };
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    const totpSecret = await this.prisma.totpSecret.findUnique({
      where: { userId },
    });

    if (!totpSecret || !totpSecret.isEnabled) {
      return true; // 2FA not enabled, skip verification
    }

    const secret = this.decrypt(totpSecret.secret, totpSecret.iv);

    // First try TOTP code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (verified) {
      await this.prisma.totpSecret.update({
        where: { userId },
        data: { lastUsedAt: new Date() },
      });
      return true;
    }

    // Try backup code
    if (code.length === 8) {
      const hashedCode = this.hashBackupCode(code);
      const backupCodesEncrypted = totpSecret.backupCodes;

      if (backupCodesEncrypted) {
        const backupCodes: string[] = JSON.parse(
          this.decrypt(backupCodesEncrypted, totpSecret.iv),
        );

        const codeIndex = backupCodes.indexOf(hashedCode);
        if (codeIndex !== -1) {
          // Remove used backup code
          backupCodes.splice(codeIndex, 1);
          const { encrypted: newBackupCodes } = this.encrypt(JSON.stringify(backupCodes));

          await this.prisma.totpSecret.update({
            where: { userId },
            data: {
              backupCodes: newBackupCodes,
              lastUsedAt: new Date(),
            },
          });

          return true;
        }
      }
    }

    return false;
  }

  async disable(userId: string, password: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { totpSecret: true },
    });

    if (!user || !user.totpSecret?.isEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    // Verify TOTP code
    const verified = await this.verifyCode(userId, code);
    if (!verified) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.totpSecret.delete({
      where: { userId },
    });

    return { success: true, message: '2FA has been disabled' };
  }

  async getStatus(userId: string) {
    const totpSecret = await this.prisma.totpSecret.findUnique({
      where: { userId },
      select: {
        isEnabled: true,
        isVerified: true,
        enabledAt: true,
        lastUsedAt: true,
      },
    });

    if (!totpSecret) {
      return {
        enabled: false,
        verified: false,
        enabledAt: null,
        lastUsedAt: null,
      };
    }

    return {
      enabled: totpSecret.isEnabled,
      verified: totpSecret.isVerified,
      enabledAt: totpSecret.enabledAt,
      lastUsedAt: totpSecret.lastUsedAt,
    };
  }

  async regenerateBackupCodes(userId: string, code: string) {
    const verified = await this.verifyCode(userId, code);
    if (!verified) {
      throw new BadRequestException('Invalid verification code');
    }

    const totpSecret = await this.prisma.totpSecret.findUnique({
      where: { userId },
    });

    if (!totpSecret) {
      throw new BadRequestException('2FA is not set up');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map((code) => this.hashBackupCode(code));
    const { encrypted: encryptedBackupCodes } = this.encrypt(JSON.stringify(hashedBackupCodes));

    await this.prisma.totpSecret.update({
      where: { userId },
      data: { backupCodes: encryptedBackupCodes },
    });

    return { backupCodes }; // Return plain backup codes (only shown once)
  }

  async getRemainingBackupCodesCount(userId: string): Promise<number> {
    const totpSecret = await this.prisma.totpSecret.findUnique({
      where: { userId },
    });

    if (!totpSecret?.backupCodes) {
      return 0;
    }

    const backupCodes: string[] = JSON.parse(
      this.decrypt(totpSecret.backupCodes, totpSecret.iv),
    );

    return backupCodes.length;
  }

  is2FAEnabled(userId: string): Promise<boolean> {
    return this.prisma.totpSecret
      .findUnique({ where: { userId }, select: { isEnabled: true } })
      .then((result) => result?.isEnabled ?? false);
  }
}
