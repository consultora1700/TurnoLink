import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const isProfessional = registerDto.accountType === 'PROFESSIONAL';

    let tenantName: string;
    let tenantSlug: string;
    let tenantType: string;

    if (isProfessional) {
      tenantName = registerDto.name;
      tenantSlug = `pro-${this.slugify(registerDto.name)}-${crypto.randomBytes(3).toString('hex')}`;
      tenantType = 'PROFESSIONAL';
    } else {
      // Business flow
      if (registerDto.businessSlug) {
        // Explicit slug provided: check availability
        const existingTenant = await this.tenantsService.findBySlug(
          registerDto.businessSlug,
        );
        if (existingTenant) {
          throw new ConflictException('Business URL already taken');
        }
        tenantSlug = registerDto.businessSlug;
      } else {
        // No slug provided: auto-generate
        tenantSlug = `${this.slugify(registerDto.name)}-${crypto.randomBytes(3).toString('hex')}`;
      }
      tenantName = registerDto.businessName || registerDto.name;
      tenantType = 'BUSINESS';
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create tenant first
    const tenant = await this.tenantsService.create(
      { name: tenantName, slug: tenantSlug },
      tenantType,
    );

    // Create user with tenant association
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      role: 'OWNER',
      tenantId: tenant.id,
    });

    // Create free subscription for BUSINESS tenants (async, don't block registration)
    if (!isProfessional) {
      this.subscriptionsService.createFreeSubscription(tenant.id, false).catch((error) => {
        this.logger.error(`Failed to create free subscription for tenant ${tenant.id}: ${error.message}`);
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, tenant.id, tenant.type);

    // Send verification email (async, don't block registration)
    this.emailVerificationService.sendVerificationEmail(user.id).catch((error) => {
      this.logger.error(`Failed to send verification email to ${user.email}: ${error.message}`);
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        type: tenant.type,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Fetch tenant type
    let tenantType = 'BUSINESS';
    if (user.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { type: true },
      });
      if (tenant) {
        tenantType = tenant.type;
      }
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.tenantId,
      tenantType,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantType,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Fetch tenant type
      let tenantType = 'BUSINESS';
      if (user.tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: user.tenantId },
          select: { type: true },
        });
        if (tenant) {
          tenantType = tenant.type;
        }
      }

      return this.generateTokens(user.id, user.email, user.role, user.tenantId, tenantType);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    // Always return success to avoid email enumeration
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Delete existing tokens for this user
    await this.prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send email
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    this.sendPasswordResetEmail(user.email, user.name, resetUrl).catch((error) => {
      this.logger.error(`Failed to send password reset email to ${user.email}: ${error.message}`);
    });

    this.logger.log(`Password reset email sent to ${user.email}`);

    return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new BadRequestException('El enlace es inválido o ha expirado');
    }

    if (resetRecord.used) {
      throw new BadRequestException('Este enlace ya fue utilizado');
    }

    if (new Date() > resetRecord.expiresAt) {
      throw new BadRequestException('El enlace ha expirado. Solicita uno nuevo.');
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true, usedAt: new Date() },
      }),
    ]);

    this.logger.log(`Password reset successful for user ${resetRecord.userId}`);

    return { message: 'Contraseña actualizada correctamente' };
  }

  private async sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@turnolink.com';

    if (!resendApiKey) {
      this.logger.warn('RESEND_API_KEY not configured, skipping email');
      return;
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Restablecer contraseña - TurnoLink</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .button-link { padding: 18px 48px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100%; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Restablece tu contraseña de TurnoLink
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://turnolink.mubitt.com/claro2.png" alt="TurnoLink" width="140" style="display: block; height: auto; border: 0;" />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

              <!-- Header gradient -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #3F8697 0%, #346E7D 100%); padding: 40px 32px;">
                    <!-- Icon circle -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" width="72" height="72" style="background-color: rgba(255,255,255,0.2); border-radius: 36px; vertical-align: middle; font-size: 32px;">
                          &#128274;
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 20px 0 0 0; padding: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 22px; font-weight: 600; line-height: 1.3;">
                      Restablecer contraseña
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 40px 32px;">

                    <!-- Greeting -->
                    <p style="margin: 0 0 6px 0; padding: 0; color: #9ca3af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                      Hola de nuevo
                    </p>
                    <h2 style="margin: 0 0 20px 0; padding: 0; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      ${name}
                    </h2>

                    <!-- Message -->
                    <p style="margin: 0 0 32px 0; padding: 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 15px; line-height: 1.6;">
                      Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva contraseña.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: 32px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="background: linear-gradient(135deg, #3F8697 0%, #346E7D 100%); border-radius: 12px;">
                                <a href="${resetUrl}" target="_blank" class="button-link" style="display: inline-block; padding: 16px 40px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; text-align: center;">
                                  Restablecer contraseña &rarr;
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Link fallback box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #f9fafb; border-radius: 10px; padding: 16px;">
                          <p style="margin: 0 0 8px 0; padding: 0; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.4;">
                            ¿El botón no funciona? Copia y pega este enlace:
                          </p>
                          <a href="${resetUrl}" target="_blank" style="color: #3F8697; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.4; word-break: break-all; text-decoration: none;">
                            ${resetUrl}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiration notice -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-top: 24px; border-top: 1px solid #e5e7eb; margin-top: 24px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="28" valign="middle" style="padding-right: 10px;">
                                <span style="font-size: 18px; line-height: 1;">&#9200;</span>
                              </td>
                              <td valign="middle">
                                <p style="margin: 0; padding: 0; color: #9ca3af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13px; line-height: 1.4;">
                                  Este enlace expira en <strong style="color: #6b7280;">1 hora</strong>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <p style="margin: 0 0 8px 0; padding: 0; color: #9ca3af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.5;">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este email.
              </p>
              <p style="margin: 0; padding: 0; color: #d1d5db; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 11px; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} TurnoLink &middot; Sistema de turnos online
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `TurnoLink <${fromEmail}>`,
          to: [to],
          subject: 'Restablecer contraseña - TurnoLink',
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to send password reset email: ${error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending password reset email: ${error}`);
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    tenantId: string | null,
    tenantType?: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role,
      tenantId,
      tenantType: tenantType || 'BUSINESS',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
