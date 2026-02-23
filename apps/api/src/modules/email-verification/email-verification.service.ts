import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate a verification token and send email
   */
  async sendVerificationEmail(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: { select: { type: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      return { success: true, message: 'Email already verified' };
    }

    const tenantType = (user as any).tenant?.type || 'BUSINESS';

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    // Delete any existing tokens for this user
    await this.prisma.emailVerification.deleteMany({
      where: { userId },
    });

    // Create new verification token
    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    // Send email using Resend
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/verificar-email?token=${token}`;

    await this.sendEmail(user.email, user.name, verificationUrl, tenantType);

    this.logger.log(`Verification email sent to ${user.email}`);

    return { success: true, message: 'Verification email sent' };
  }

  /**
   * Verify the email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verification.verified) {
      return { success: true, message: 'Email already verified' };
    }

    if (new Date() > verification.expiresAt) {
      throw new BadRequestException('Verification token has expired. Please request a new one.');
    }

    // Update verification and user
    await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: verification.userId },
        data: {
          emailVerified: true,
        },
      }),
    ]);

    this.logger.log(`Email verified for user ${verification.userId}`);

    return { success: true, message: 'Email verified successfully' };
  }

  /**
   * Check if user has verified email
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    return user?.emailVerified ?? false;
  }

  /**
   * Send email using Resend API
   */
  private async sendEmail(to: string, name: string, verificationUrl: string, tenantType: string = 'BUSINESS'): Promise<void> {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@turnolink.com';

    if (!resendApiKey) {
      this.logger.warn('RESEND_API_KEY not configured, skipping email');
      return;
    }

    const isProfessional = tenantType === 'PROFESSIONAL';
    const previewText = isProfessional
      ? 'Activa tu cuenta de TurnoLink y comienza a recibir propuestas'
      : 'Activa tu cuenta de TurnoLink y comienza a gestionar tus turnos';
    const bodyText = isProfessional
      ? 'Gracias por unirte a TurnoLink. Estás a un paso de activar tu cuenta y comenzar a recibir propuestas de negocios que buscan tu talento.'
      : 'Gracias por unirte a TurnoLink. Estás a un paso de activar tu cuenta y comenzar a gestionar tus turnos de forma profesional.';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Verifica tu email - TurnoLink</title>
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
    ${previewText}
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
                        <td align="center" width="72" height="72" style="background-color: rgba(255,255,255,0.2); border-radius: 36px; vertical-align: middle;">
                          <img src="https://turnolink.mubitt.com/email-verify-icon.png" alt="" width="36" height="36" style="display: block;" onerror="this.style.display='none'" />
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 20px 0 0 0; padding: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 22px; font-weight: 600; line-height: 1.3;">
                      Verifica tu email
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
                      Bienvenido/a
                    </p>
                    <h2 style="margin: 0 0 20px 0; padding: 0; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      ¡Hola ${name}!
                    </h2>

                    <!-- Message -->
                    <p style="margin: 0 0 32px 0; padding: 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 15px; line-height: 1.6;">
                      ${bodyText}
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: 32px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="background: linear-gradient(135deg, #3F8697 0%, #346E7D 100%); border-radius: 12px;">
                                <a href="${verificationUrl}" target="_blank" class="button-link" style="display: inline-block; padding: 16px 40px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; text-align: center;">
                                  Verificar mi email &rarr;
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
                          <a href="${verificationUrl}" target="_blank" style="color: #3F8697; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.4; word-break: break-all; text-decoration: none;">
                            ${verificationUrl}
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
                                <span style="font-size: 18px; line-height: 1;">⏰</span>
                              </td>
                              <td valign="middle">
                                <p style="margin: 0; padding: 0; color: #9ca3af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13px; line-height: 1.4;">
                                  Este enlace expira en <strong style="color: #6b7280;">24 horas</strong>
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
                Si no creaste una cuenta en TurnoLink, puedes ignorar este email.
              </p>
              <p style="margin: 0; padding: 0; color: #d1d5db; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 11px; line-height: 1.5;">
                © ${new Date().getFullYear()} TurnoLink · Sistema de turnos online
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
          subject: 'Verifica tu email - TurnoLink',
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to send verification email: ${error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending email: ${error}`);
    }
  }
}
