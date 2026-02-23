import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  previewText?: string;
}

@Injectable()
export class EmailNotificationsService {
  private readonly logger = new Logger(EmailNotificationsService.name);
  private readonly resendApiKey: string;
  private readonly fromEmail: string;
  private readonly webUrl: string;

  constructor(private configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY') || '';
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@turnolink.com';
    this.webUrl = this.configService.get<string>('WEB_URL') || 'https://turnolink.mubitt.com';
  }

  // ============ TRIAL EXPIRING NOTIFICATION ============

  async sendTrialExpiringEmail(
    to: string,
    name: string,
    planName: string,
    daysRemaining: number,
    tenantSlug: string,
  ): Promise<void> {
    const upgradeUrl = `${this.webUrl}/mi-suscripcion`;

    const html = this.buildEmailTemplate({
      previewText: `Tu prueba gratis de ${planName} termina en ${daysRemaining} días`,
      headerColor: 'warning', // amber/orange
      headerIcon: '⏰',
      headerTitle: 'Tu prueba está por terminar',
      greeting: name,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu período de prueba del plan <strong style="color: #111827;">${planName}</strong> termina en <strong style="color: #D97706;">${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}</strong>.
        </p>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Para seguir disfrutando de todas las funcionalidades premium, activa tu suscripción ahora.
        </p>
      `,
      ctaText: 'Activar suscripción',
      ctaUrl: upgradeUrl,
      ctaColor: 'warning',
      infoBox: {
        icon: '💡',
        title: '¿Qué pasa si no activo?',
        content: 'Tu cuenta pasará automáticamente al plan Gratis con funcionalidades limitadas. No perderás tus datos.',
      },
      footerNote: 'Si tienes preguntas sobre los planes, responde a este email.',
    });

    await this.sendEmail({
      to,
      subject: `⏰ Tu prueba de ${planName} termina en ${daysRemaining} días - TurnoLink`,
      html,
    });
  }

  // ============ PAYMENT SUCCESS NOTIFICATION ============

  async sendPaymentSuccessEmail(
    to: string,
    name: string,
    planName: string,
    amount: number,
    billingPeriod: 'MONTHLY' | 'YEARLY',
    nextBillingDate: Date,
  ): Promise<void> {
    const dashboardUrl = `${this.webUrl}/dashboard`;
    const subscriptionUrl = `${this.webUrl}/mi-suscripcion`;

    const periodText = billingPeriod === 'YEARLY' ? 'anual' : 'mensual';
    const formattedAmount = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
    const formattedDate = new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(nextBillingDate);

    const html = this.buildEmailTemplate({
      previewText: `¡Pago confirmado! Tu plan ${planName} está activo`,
      headerColor: 'success', // green
      headerIcon: '✓',
      headerTitle: '¡Pago confirmado!',
      greeting: name,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu pago ha sido procesado exitosamente. Ya puedes disfrutar de todas las funcionalidades del plan <strong style="color: #111827;">${planName}</strong>.
        </p>

        <!-- Payment Details Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #bbf7d0;">
                    <p style="margin: 0; color: #166534; font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 500;">DETALLE DEL PAGO</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">Plan</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${planName} (${periodText})</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">Monto</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${formattedAmount}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">Próxima facturación</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${formattedDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
      ctaText: 'Ir al Dashboard',
      ctaUrl: dashboardUrl,
      ctaColor: 'success',
      secondaryCta: {
        text: 'Ver mi suscripción',
        url: subscriptionUrl,
      },
      footerNote: 'Recibirás un recordatorio antes de cada renovación automática.',
    });

    await this.sendEmail({
      to,
      subject: `✓ Pago confirmado - Plan ${planName} activo - TurnoLink`,
      html,
    });
  }

  // ============ WELCOME EMAIL (after verification) ============

  async sendWelcomeEmail(
    to: string,
    name: string,
    businessName: string,
    tenantSlug: string,
  ): Promise<void> {
    const dashboardUrl = `${this.webUrl}/dashboard`;
    const publicUrl = `${this.webUrl}/${tenantSlug}`;

    const html = this.buildEmailTemplate({
      previewText: `¡Bienvenido a TurnoLink! Tu cuenta está lista`,
      headerColor: 'brand', // pink
      headerIcon: '🎉',
      headerTitle: '¡Bienvenido a TurnoLink!',
      greeting: name,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu cuenta para <strong style="color: #111827;">${businessName}</strong> está lista. Ahora puedes empezar a recibir reservas de tus clientes las 24 horas, los 7 días de la semana.
        </p>

        <!-- Quick Start Steps -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td style="background-color: #ECF6F8; border-radius: 12px; padding: 20px;">
              <p style="margin: 0 0 16px 0; color: #1D3C44; font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 600;">PRIMEROS PASOS</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="28" valign="top">
                          <span style="display: inline-block; width: 20px; height: 20px; background: #3F8697; color: white; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; font-weight: 600;">1</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px;">Configura tus servicios y precios</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="28" valign="top">
                          <span style="display: inline-block; width: 20px; height: 20px; background: #3F8697; color: white; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; font-weight: 600;">2</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px;">Define tus horarios de atención</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="28" valign="top">
                          <span style="display: inline-block; width: 20px; height: 20px; background: #3F8697; color: white; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; font-weight: 600;">3</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px;">Comparte tu link de reservas</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Public Link -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="background-color: #f9fafb; border-radius: 10px; padding: 16px;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-family: -apple-system, sans-serif; font-size: 12px;">Tu link de reservas:</p>
              <a href="${publicUrl}" style="color: #3F8697; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 500; text-decoration: none;">${publicUrl}</a>
            </td>
          </tr>
        </table>
      `,
      ctaText: 'Configurar mi negocio',
      ctaUrl: dashboardUrl,
      ctaColor: 'brand',
      footerNote: 'Si necesitas ayuda, responde a este email.',
    });

    await this.sendEmail({
      to,
      subject: `🎉 ¡Bienvenido a TurnoLink, ${name}!`,
      html,
    });
  }

  // ============ EMPLOYEE WELCOME EMAIL ============

  async sendEmployeeWelcomeEmail(
    to: string,
    employeeName: string,
    businessName: string,
    tenantSlug: string,
    profileToken?: string,
  ): Promise<void> {
    const publicUrl = `${this.webUrl}/${tenantSlug}`;
    const profileUrl = profileToken
      ? `${this.webUrl}/perfil-profesional?token=${profileToken}`
      : publicUrl;

    const html = this.buildEmailTemplate({
      previewText: `¡${businessName} te agregó a su equipo! Creá tu perfil profesional`,
      headerColor: 'brand',
      headerIcon: '💼',
      headerTitle: '¡Bienvenido al equipo!',
      greeting: employeeName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong style="color: #111827;">${businessName}</strong> te agregó como parte de su equipo en TurnoLink. Los clientes ya pueden ver tu perfil y reservar turnos contigo.
        </p>
        ${profileToken ? `
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Ahora puedes crear tu <strong style="color: #111827;">perfil profesional</strong> — contá tu experiencia, habilidades y certificaciones. Es 100% tuyo y privado.
        </p>
        ` : `
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu perfil ya está visible en la página del negocio. Los clientes pueden elegirte al momento de agendar un turno.
        </p>
        `}
      `,
      ctaText: profileToken ? 'Crear mi perfil profesional' : 'Ver mi perfil',
      ctaUrl: profileUrl,
      ctaColor: 'brand',
      secondaryCta: profileToken ? { text: 'Ver página del negocio', url: publicUrl } : undefined,
      infoBox: {
        icon: '🔒',
        title: 'Tu privacidad es importante',
        content: profileToken
          ? 'Tu perfil profesional es 100% tuyo. Tu empleador nunca sabrá tus preferencias de visibilidad.'
          : 'Tu email y teléfono son privados — solo se muestra tu nombre, especialidad y foto a los clientes.',
      },
      footerNote: `Este email fue enviado porque ${businessName} te registró en TurnoLink.`,
    });

    await this.sendEmail({
      to,
      subject: `💼 ¡${businessName} te agregó a su equipo! - TurnoLink`,
      html,
    });
  }

  // ============ PROFILE ACCESS EMAIL ============

  async sendProfileAccessEmail(
    to: string,
    employeeName: string,
    profileToken: string,
  ): Promise<void> {
    const profileUrl = `${this.webUrl}/perfil-profesional?token=${profileToken}`;

    const html = this.buildEmailTemplate({
      previewText: 'Accedé a tu perfil profesional en TurnoLink',
      headerColor: 'brand',
      headerIcon: '🔑',
      headerTitle: 'Acceso a tu perfil',
      greeting: employeeName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Solicitaste acceso a tu perfil profesional en TurnoLink. Usá el siguiente enlace para acceder y editar tu perfil.
        </p>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Este enlace es válido por <strong style="color: #111827;">30 días</strong>. Si necesitas uno nuevo, podés solicitarlo en cualquier momento.
        </p>
      `,
      ctaText: 'Acceder a mi perfil',
      ctaUrl: profileUrl,
      ctaColor: 'brand',
      infoBox: {
        icon: '🔒',
        title: 'Enlace seguro y privado',
        content: 'Este enlace es único para vos. No lo compartas con nadie.',
      },
      footerNote: 'Si no solicitaste este enlace, podés ignorar este email.',
    });

    await this.sendEmail({
      to,
      subject: `🔑 Acceso a tu perfil profesional - TurnoLink`,
      html,
    });
  }

  // ============ SUBSCRIPTION CANCELLED ============

  async sendSubscriptionCancelledEmail(
    to: string,
    name: string,
    planName: string,
    accessUntil: Date,
  ): Promise<void> {
    const reactivateUrl = `${this.webUrl}/mi-suscripcion`;

    const formattedDate = new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(accessUntil);

    const html = this.buildEmailTemplate({
      previewText: `Tu suscripción ha sido cancelada`,
      headerColor: 'neutral', // gray
      headerIcon: '👋',
      headerTitle: 'Suscripción cancelada',
      greeting: name,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Hemos procesado la cancelación de tu suscripción al plan <strong style="color: #111827;">${planName}</strong>.
        </p>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Seguirás teniendo acceso a todas las funcionalidades premium hasta el <strong style="color: #111827;">${formattedDate}</strong>. Después de esa fecha, tu cuenta pasará al plan Gratis.
        </p>
      `,
      ctaText: 'Reactivar suscripción',
      ctaUrl: reactivateUrl,
      ctaColor: 'brand',
      infoBox: {
        icon: '💾',
        title: 'Tus datos están seguros',
        content: 'No perderás ningún dato. Siempre puedes volver a activar tu suscripción.',
      },
      footerNote: '¿Cambias de opinión? Puedes reactivar en cualquier momento.',
    });

    await this.sendEmail({
      to,
      subject: `Suscripción cancelada - TurnoLink`,
      html,
    });
  }

  // ============ PROPOSAL NOTIFICATION ============

  async sendProposalNotificationEmail(
    to: string,
    professionalName: string,
    businessName: string,
    role: string,
    profileToken: string,
  ): Promise<void> {
    const profileUrl = `${this.webUrl}/perfil-profesional?token=${profileToken}`;

    const html = this.buildEmailTemplate({
      previewText: `${businessName} te envió una propuesta laboral`,
      headerColor: 'brand',
      headerIcon: '💼',
      headerTitle: '¡Nueva propuesta!',
      greeting: professionalName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong style="color: #111827;">${businessName}</strong> está interesado en tu perfil y te envió una propuesta para el puesto de <strong style="color: #111827;">${role}</strong>.
        </p>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Ingresá a tu perfil profesional para ver los detalles de la propuesta y responder.
        </p>
      `,
      ctaText: 'Ver propuesta',
      ctaUrl: profileUrl,
      ctaColor: 'brand',
      infoBox: {
        icon: '🔒',
        title: 'Tu privacidad es importante',
        content: 'Tu empleador actual no tiene acceso a esta información.',
      },
      footerNote: 'Recibiste este email porque un negocio se interesó en tu perfil profesional de TurnoLink.',
    });

    await this.sendEmail({
      to,
      subject: `💼 ${businessName} te envió una propuesta laboral - TurnoLink`,
      html,
    });
  }

  // ============ PROPOSAL TO SELF-REGISTERED PROFESSIONAL ============

  async sendProposalToSelfRegisteredEmail(
    to: string,
    professionalName: string,
    businessName: string,
    role: string,
  ): Promise<void> {
    const proposalsUrl = `${this.webUrl}/mi-perfil/propuestas`;

    const html = this.buildEmailTemplate({
      previewText: `${businessName} te envió una propuesta laboral`,
      headerColor: 'brand',
      headerIcon: '💼',
      headerTitle: '¡Nueva propuesta!',
      greeting: professionalName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong style="color: #111827;">${businessName}</strong> está interesado en tu perfil y te envió una propuesta para el puesto de <strong style="color: #111827;">${role}</strong>.
        </p>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Ingresá a tu panel para ver los detalles y responder.
        </p>
      `,
      ctaText: 'Ver propuesta',
      ctaUrl: proposalsUrl,
      ctaColor: 'brand',
      infoBox: {
        icon: '💡',
        title: 'Podés aceptar o rechazar',
        content: 'Revisá los detalles de la propuesta y respondé desde tu panel de profesional.',
      },
      footerNote: 'Recibiste este email porque un negocio se interesó en tu perfil profesional de TurnoLink.',
    });

    await this.sendEmail({
      to,
      subject: `💼 ${businessName} te envió una propuesta laboral - TurnoLink`,
      html,
    });
  }

  // ============ PROPOSAL RESPONSE TO BUSINESS ============

  async sendProposalResponseEmail(
    to: string,
    businessOwnerName: string,
    professionalName: string,
    role: string,
    status: 'ACCEPTED' | 'REJECTED',
    responseMessage?: string,
    contactInfo?: { email: string; phone: string | null },
  ): Promise<void> {
    const isAccepted = status === 'ACCEPTED';

    const responseCard = responseMessage ? `
      <!-- Response Message Card -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
        <tr>
          <td style="background-color: ${isAccepted ? '#f0fdf4' : '#f9fafb'}; border: 1px solid ${isAccepted ? '#bbf7d0' : '#e5e7eb'}; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 8px 0; color: ${isAccepted ? '#166534' : '#374151'}; font-family: -apple-system, sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">MENSAJE DE ${professionalName.toUpperCase()}</p>
            <p style="margin: 0; color: #4b5563; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.6; font-style: italic;">"${responseMessage}"</p>
          </td>
        </tr>
      </table>
    ` : '';

    // Contact info card for accepted proposals
    const contactCard = (isAccepted && contactInfo) ? `
      <!-- Contact Info Card -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
        <tr>
          <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 12px 0; color: #1e40af; font-family: -apple-system, sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">DATOS DE CONTACTO</p>
            <p style="margin: 0 0 6px 0; color: #1e3a5f; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.6;">
              <strong>Email:</strong> <a href="mailto:${contactInfo.email}" style="color: #2563eb; text-decoration: none;">${contactInfo.email}</a>
            </p>
            ${contactInfo.phone ? `
              <p style="margin: 0; color: #1e3a5f; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.6;">
                <strong>Teléfono:</strong> <a href="tel:${contactInfo.phone}" style="color: #2563eb; text-decoration: none;">${contactInfo.phone}</a>
              </p>
            ` : ''}
          </td>
        </tr>
      </table>
    ` : '';

    const html = this.buildEmailTemplate({
      previewText: isAccepted
        ? `${professionalName} aceptó tu propuesta para ${role}`
        : `${professionalName} respondió a tu propuesta para ${role}`,
      headerColor: isAccepted ? 'success' : 'neutral',
      headerIcon: isAccepted ? '✓' : '📋',
      headerTitle: isAccepted ? '¡Propuesta aceptada!' : 'Respuesta a tu propuesta',
      greeting: businessOwnerName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          ${isAccepted
            ? `<strong style="color: #111827;">${professionalName}</strong> aceptó tu propuesta para el puesto de <strong style="color: #111827;">${role}</strong>.`
            : `<strong style="color: #111827;">${professionalName}</strong> no está disponible para <strong style="color: #111827;">${role}</strong> en este momento.`
          }
        </p>
        ${responseCard}
        ${contactCard}
      `,
      ctaText: isAccepted ? 'Ver propuestas' : 'Explorar más talento',
      ctaUrl: isAccepted ? `${this.webUrl}/talento/propuestas` : `${this.webUrl}/talento`,
      ctaColor: isAccepted ? 'success' : 'brand',
      infoBox: {
        icon: isAccepted ? '🤝' : '🔍',
        title: isAccepted ? 'Próximos pasos' : 'Seguí buscando',
        content: isAccepted
          ? 'Contactá al profesional usando los datos que te compartió.'
          : 'Seguí explorando perfiles profesionales en TurnoLink.',
      },
      footerNote: 'Recibiste este email porque enviaste una propuesta desde TurnoLink.',
    });

    await this.sendEmail({
      to,
      subject: isAccepted
        ? `✓ ${professionalName} aceptó tu propuesta - TurnoLink`
        : `📋 ${professionalName} respondió a tu propuesta - TurnoLink`,
      html,
    });
  }

  // ============ PRIVATE HELPERS ============

  private buildEmailTemplate(options: {
    previewText: string;
    headerColor: 'brand' | 'success' | 'warning' | 'neutral';
    headerIcon: string;
    headerTitle: string;
    greeting: string;
    bodyContent: string;
    ctaText: string;
    ctaUrl: string;
    ctaColor: 'brand' | 'success' | 'warning';
    secondaryCta?: { text: string; url: string };
    infoBox?: { icon: string; title: string; content: string };
    footerNote?: string;
  }): string {
    const colors = {
      brand: { gradient: 'linear-gradient(135deg, #3F8697 0%, #346E7D 100%)', bg: '#ECF6F8', border: '#C5E3EA', text: '#1D3C44' },
      success: { gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
      warning: { gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
      neutral: { gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)', bg: '#f9fafb', border: '#e5e7eb', text: '#374151' },
    };

    const headerStyle = colors[options.headerColor];
    const ctaStyle = colors[options.ctaColor];

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <title>TurnoLink</title>
</head>
<body style="margin: 0; padding: 0; width: 100%; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
  <div style="display: none; max-height: 0; overflow: hidden;">${options.previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
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

              <!-- Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="background: ${headerStyle.gradient}; padding: 40px 32px;">
                    <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; line-height: 56px; text-align: center; margin: 0 auto 16px;">
                      <span style="font-size: 28px;">${options.headerIcon}</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 22px; font-weight: 600;">
                      ${options.headerTitle}
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 40px 32px;">
                    <p style="margin: 0 0 6px 0; color: #9ca3af; font-family: -apple-system, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Hola</p>
                    <h2 style="margin: 0 0 24px 0; color: #111827; font-family: -apple-system, sans-serif; font-size: 24px; font-weight: 700;">
                      ${options.greeting}
                    </h2>

                    ${options.bodyContent}

                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: ${options.secondaryCta ? '16px' : '0'};">
                          <a href="${options.ctaUrl}" target="_blank" style="display: inline-block; background: ${ctaStyle.gradient}; color: #ffffff; font-family: -apple-system, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px;">
                            ${options.ctaText}
                          </a>
                        </td>
                      </tr>
                      ${options.secondaryCta ? `
                      <tr>
                        <td align="center">
                          <a href="${options.secondaryCta.url}" target="_blank" style="display: inline-block; color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px; text-decoration: underline;">
                            ${options.secondaryCta.text}
                          </a>
                        </td>
                      </tr>
                      ` : ''}
                    </table>

                    ${options.infoBox ? `
                    <!-- Info Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px;">
                      <tr>
                        <td style="background-color: #f9fafb; border-radius: 12px; padding: 16px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="32" valign="top">
                                <span style="font-size: 20px;">${options.infoBox.icon}</span>
                              </td>
                              <td style="padding-left: 8px;">
                                <p style="margin: 0 0 4px 0; color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${options.infoBox.title}</p>
                                <p style="margin: 0; color: #6b7280; font-family: -apple-system, sans-serif; font-size: 13px; line-height: 1.5;">${options.infoBox.content}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 16px;">
              ${options.footerNote ? `<p style="margin: 0 0 12px 0; color: #9ca3af; font-family: -apple-system, sans-serif; font-size: 12px;">${options.footerNote}</p>` : ''}
              <p style="margin: 0; color: #d1d5db; font-family: -apple-system, sans-serif; font-size: 11px;">
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
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.resendApiKey) {
      this.logger.warn('RESEND_API_KEY not configured, skipping email');
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.resendApiKey}`,
        },
        body: JSON.stringify({
          from: `TurnoLink <${this.fromEmail}>`,
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to send email: ${error}`);
      } else {
        this.logger.log(`Email sent successfully to ${options.to}`);
      }
    } catch (error) {
      this.logger.error(`Error sending email: ${error}`);
    }
  }
}
