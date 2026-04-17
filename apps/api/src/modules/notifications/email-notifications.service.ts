import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RubroTerms, getTermsForRubro, bookingGender } from '@common/utils/rubro-terms';

const DEFAULT_TERMS = getTermsForRubro('');

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
    this.webUrl = this.configService.get<string>('WEB_URL') || 'https://turnolink.com.ar';
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
    terms: RubroTerms = DEFAULT_TERMS,
  ): Promise<void> {
    const dashboardUrl = `${this.webUrl}/dashboard`;
    const publicUrl = `${this.webUrl}/${tenantSlug}`;
    const t = terms;

    const html = this.buildEmailTemplate({
      previewText: `¡Bienvenido a TurnoLink! Tu cuenta está lista`,
      headerColor: 'brand',
      headerIcon: '🎉',
      headerTitle: '¡Bienvenido a TurnoLink!',
      greeting: name,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu cuenta para <strong style="color: #111827;">${businessName}</strong> está lista. Ahora puedes empezar a recibir ${t.bookingPlural.toLowerCase()} de tus clientes las 24 horas, los 7 días de la semana.
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
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px;">Configura tus ${t.servicePlural.toLowerCase()} y precios</span>
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
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px;">Comparte tu link de ${t.bookingPlural.toLowerCase()}</span>
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
              <p style="margin: 0 0 8px 0; color: #6b7280; font-family: -apple-system, sans-serif; font-size: 12px;">Tu link de ${t.bookingPlural.toLowerCase()}:</p>
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
    terms: RubroTerms = DEFAULT_TERMS,
  ): Promise<void> {
    const publicUrl = `${this.webUrl}/${tenantSlug}`;
    const profileUrl = profileToken
      ? `${this.webUrl}/perfil-profesional?token=${profileToken}`
      : publicUrl;
    const t = terms;
    const g = bookingGender(t);

    // Gastro rubros use simpler staff messaging (no profile/booking language)
    const isGastro = t.employeeSingular === 'Mozo';

    const html = this.buildEmailTemplate({
      previewText: `¡${businessName} te agregó a su equipo!${isGastro ? '' : ' Creá tu perfil'}`,
      headerColor: 'brand',
      headerIcon: isGastro ? '🍽️' : '💼',
      headerTitle: '¡Bienvenido al equipo!',
      greeting: employeeName,
      bodyContent: isGastro
        ? `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong style="color: #111827;">${businessName}</strong> te agregó como parte de su equipo en TurnoLink. Ya podés acceder al sistema para gestionar pedidos y atender mesas.
        </p>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Desde el panel vas a poder ver los pedidos en tiempo real, gestionar el salón y coordinar con cocina.
        </p>
        `
        : `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong style="color: #111827;">${businessName}</strong> te agregó como parte de su equipo en TurnoLink. Los clientes ya pueden ver tu perfil y ${t.bookingVerb} ${t.bookingPlural.toLowerCase()} contigo.
        </p>
        ${profileToken ? `
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Ahora puedes crear tu <strong style="color: #111827;">perfil profesional</strong> — contá tu experiencia, habilidades y certificaciones. Es 100% tuyo y privado.
        </p>
        ` : `
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu perfil ya está visible en la página del negocio. Los clientes pueden elegirte al momento de ${t.bookingVerb} ${g.articleUn} ${t.bookingSingular.toLowerCase()}.
        </p>
        `}
        `,
      ctaText: isGastro ? 'Ver página del negocio' : (profileToken ? 'Crear mi perfil profesional' : 'Ver mi perfil'),
      ctaUrl: isGastro ? publicUrl : profileUrl,
      ctaColor: 'brand',
      secondaryCta: !isGastro && profileToken ? { text: 'Ver página del negocio', url: publicUrl } : undefined,
      infoBox: {
        icon: '🔒',
        title: 'Tu privacidad es importante',
        content: isGastro
          ? 'Tu email y datos personales son privados — solo tu nombre es visible para el equipo.'
          : profileToken
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

  // ============ PLAN PRICE CHANGE ============

  async sendPlanPriceChangeEmail(
    to: string,
    name: string,
    planName: string,
    billingPeriod: string,
    oldPrice: number,
    newPrice: number,
    currency: string,
  ): Promise<void> {
    const subscriptionUrl = `${this.webUrl}/mi-suscripcion`;
    const isPriceIncrease = newPrice > oldPrice;
    const periodLabel = billingPeriod === 'YEARLY' ? 'anual' : 'mensual';

    const formatPrice = (price: number) =>
      new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(price);

    const html = this.buildEmailTemplate({
      previewText: `Actualización de precio en tu plan ${planName}`,
      headerColor: 'brand',
      headerIcon: '💰',
      headerTitle: 'Actualización de tu suscripción',
      greeting: name,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Te informamos que el precio de tu plan <strong style="color: #111827;">${planName}</strong> ha sido actualizado.
        </p>
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px;">Precio anterior (${periodLabel})</td>
              <td style="padding: 8px 0; text-align: right; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; text-decoration: line-through; color: #9ca3af;">${formatPrice(oldPrice)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #111827; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 16px; font-weight: 600;">Nuevo precio (${periodLabel})</td>
              <td style="padding: 8px 0; text-align: right; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 16px; font-weight: 700; color: #111827;">${formatPrice(newPrice)}</td>
            </tr>
          </table>
        </div>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Este cambio se aplicará a partir de tu <strong style="color: #111827;">próximo ciclo de facturación</strong>.
        </p>
      `,
      ctaText: 'Ver mi suscripción',
      ctaUrl: subscriptionUrl,
      ctaColor: 'brand',
      infoBox: isPriceIncrease
        ? {
            icon: '💬',
            title: '¿Tenés consultas?',
            content: 'Si tenés alguna duda sobre este cambio, no dudes en contactarnos respondiendo a este email.',
          }
        : {
            icon: '✅',
            title: 'Ajuste automático',
            content: 'El nuevo precio se aplica automáticamente en tu próximo ciclo. No necesitás hacer nada.',
          },
      footerNote: 'Gracias por ser parte de TurnoLink.',
    });

    await this.sendEmail({
      to,
      subject: `Actualización de precio - Plan ${planName} - TurnoLink`,
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

  // ============ JOB POSTING: NEW MATCH ============

  async sendNewJobPostingMatchEmail(
    to: string,
    professionalName: string,
    businessName: string,
    jobTitle: string,
    postingId: string,
  ): Promise<void> {
    const offersUrl = `${this.webUrl}/mi-perfil/ofertas`;

    const html = this.buildEmailTemplate({
      previewText: `${businessName} publicó una oferta que coincide con tu perfil`,
      headerColor: 'brand',
      headerIcon: '📋',
      headerTitle: 'Nueva oferta laboral',
      greeting: professionalName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong style="color: #111827;">${businessName}</strong> publicó una oferta que coincide con tu perfil:
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td style="background-color: #ECF6F8; border: 1px solid #C5E3EA; border-radius: 12px; padding: 20px;">
              <p style="margin: 0; color: #1D3C44; font-family: -apple-system, sans-serif; font-size: 18px; font-weight: 600;">${jobTitle}</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Ingresá a tu panel para ver los detalles y postularte.
        </p>
      `,
      ctaText: 'Ver oferta',
      ctaUrl: offersUrl,
      ctaColor: 'brand',
      infoBox: {
        icon: '💡',
        title: 'Postulate rápido',
        content: 'Las ofertas pueden tener un límite de postulaciones. No pierdas tu oportunidad.',
      },
      footerNote: 'Recibiste este email porque tu perfil coincide con esta oferta en TurnoLink.',
    });

    await this.sendEmail({
      to,
      subject: `📋 ${businessName} busca: ${jobTitle} - TurnoLink`,
      html,
    });
  }

  // ============ JOB POSTING: APPLICATION RECEIVED ============

  async sendJobApplicationReceivedEmail(
    to: string,
    businessOwnerName: string,
    professionalName: string,
    jobTitle: string,
    postingId: string,
  ): Promise<void> {
    const postingUrl = `${this.webUrl}/talento/ofertas/${postingId}`;

    const html = this.buildEmailTemplate({
      previewText: `${professionalName} se postuló a tu oferta "${jobTitle}"`,
      headerColor: 'brand',
      headerIcon: '👤',
      headerTitle: 'Nueva postulación',
      greeting: businessOwnerName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong style="color: #111827;">${professionalName}</strong> se postuló a tu oferta:
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td style="background-color: #ECF6F8; border: 1px solid #C5E3EA; border-radius: 12px; padding: 20px;">
              <p style="margin: 0; color: #1D3C44; font-family: -apple-system, sans-serif; font-size: 18px; font-weight: 600;">${jobTitle}</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Revisá su perfil y respondé a la postulación.
        </p>
      `,
      ctaText: 'Ver postulación',
      ctaUrl: postingUrl,
      ctaColor: 'brand',
      footerNote: 'Recibiste este email porque publicaste una oferta laboral en TurnoLink.',
    });

    await this.sendEmail({
      to,
      subject: `👤 ${professionalName} se postuló a "${jobTitle}" - TurnoLink`,
      html,
    });
  }

  // ============ JOB POSTING: APPLICATION RESPONSE ============

  async sendJobApplicationResponseEmail(
    to: string,
    professionalName: string,
    businessName: string,
    jobTitle: string,
    status: 'ACCEPTED' | 'REJECTED',
    responseMessage?: string,
    contactInfo?: { email: string; phone: string | null },
  ): Promise<void> {
    const isAccepted = status === 'ACCEPTED';

    const responseCard = responseMessage ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
        <tr>
          <td style="background-color: ${isAccepted ? '#f0fdf4' : '#f9fafb'}; border: 1px solid ${isAccepted ? '#bbf7d0' : '#e5e7eb'}; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 8px 0; color: ${isAccepted ? '#166534' : '#374151'}; font-family: -apple-system, sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">MENSAJE DE ${businessName.toUpperCase()}</p>
            <p style="margin: 0; color: #4b5563; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.6; font-style: italic;">"${responseMessage}"</p>
          </td>
        </tr>
      </table>
    ` : '';

    const contactCard = (isAccepted && contactInfo) ? `
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
        ? `${businessName} aceptó tu postulación para "${jobTitle}"`
        : `${businessName} respondió a tu postulación para "${jobTitle}"`,
      headerColor: isAccepted ? 'success' : 'neutral',
      headerIcon: isAccepted ? '✓' : '📋',
      headerTitle: isAccepted ? 'Postulación aceptada' : 'Respuesta a tu postulación',
      greeting: professionalName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          ${isAccepted
            ? `<strong style="color: #111827;">${businessName}</strong> aceptó tu postulación para <strong style="color: #111827;">${jobTitle}</strong>.`
            : `<strong style="color: #111827;">${businessName}</strong> respondió a tu postulación para <strong style="color: #111827;">${jobTitle}</strong>.`
          }
        </p>
        ${responseCard}
        ${contactCard}
      `,
      ctaText: isAccepted ? 'Ver mis postulaciones' : 'Explorar más ofertas',
      ctaUrl: isAccepted ? `${this.webUrl}/mi-perfil/postulaciones` : `${this.webUrl}/mi-perfil/ofertas`,
      ctaColor: isAccepted ? 'success' : 'brand',
      infoBox: {
        icon: isAccepted ? '🤝' : '🔍',
        title: isAccepted ? 'Próximos pasos' : 'Seguí buscando',
        content: isAccepted
          ? 'Contactá al negocio usando los datos que te compartió.'
          : 'Seguí explorando ofertas laborales en TurnoLink.',
      },
      footerNote: 'Recibiste este email porque te postulaste a una oferta laboral en TurnoLink.',
    });

    await this.sendEmail({
      to,
      subject: isAccepted
        ? `✓ ${businessName} aceptó tu postulación - TurnoLink`
        : `📋 ${businessName} respondió a tu postulación - TurnoLink`,
      html,
    });
  }

  // ============ REVIEW REQUEST EMAIL ============

  async sendReviewRequestEmail(
    to: string,
    customerName: string,
    businessName: string,
    serviceName: string,
    reviewUrl: string,
    terms: RubroTerms = DEFAULT_TERMS,
  ): Promise<void> {
    const t = terms;
    const html = this.buildEmailTemplate({
      previewText: `Como fue tu experiencia en ${businessName}?`,
      headerColor: 'brand',
      headerIcon: '\u2B50',
      headerTitle: `Como fue tu ${t.bookingSingular.toLowerCase()}?`,
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 16px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Esperamos que tu experiencia en <strong style="color: #111827;">${businessName}</strong> haya sido excelente.
        </p>
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu opinion sobre <strong style="color: #111827;">${serviceName}</strong> ayuda a otros clientes y nos permite mejorar.
        </p>

        <!-- Quick Stars -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td align="center">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-family: -apple-system, sans-serif; font-size: 13px;">Toca las estrellas para calificar:</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  ${[1, 2, 3, 4, 5].map((n) =>
                    `<td style="padding: 0 4px;">
                      <a href="${reviewUrl}&rating=${n}" style="text-decoration: none; font-size: 32px; line-height: 1;">\u2B50</a>
                    </td>`
                  ).join('')}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
      ctaText: 'Dejar mi resena',
      ctaUrl: reviewUrl,
      ctaColor: 'brand',
      footerNote: 'Si ya dejaste tu resena, ignora este mensaje.',
    });

    await this.sendEmail({
      to,
      subject: `\u2B50 Como fue tu ${t.bookingSingular.toLowerCase()} en ${businessName}? - TurnoLink`,
      html,
    });
  }

  // ============ BOOKING EMAILS (professional templates) ============

  async sendBookingConfirmationEmail(
    to: string,
    customerName: string,
    businessName: string,
    date: string,
    time: string,
    serviceName: string,
    tenantSlug: string,
    extra?: { address?: string; city?: string; phone?: string; videoJoinUrl?: string },
    terms: RubroTerms = DEFAULT_TERMS,
  ): Promise<void> {
    const t = terms;
    const g = bookingGender(t);
    let detailRows = `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📅 Fecha</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${date}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">🕐 Hora</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${time}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">${t.emoji} ${t.serviceSingular}</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${serviceName}</span>
        </td>
      </tr>`;

    if (extra?.address) {
      const location = extra.city ? `${extra.address}, ${extra.city}` : extra.address;
      detailRows += `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📍 Dirección</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${location}</span>
        </td>
      </tr>`;
    }

    if (extra?.phone) {
      detailRows += `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📞 Teléfono</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${extra.phone}</span>
        </td>
      </tr>`;
    }

    let videoSection = '';
    if (extra?.videoJoinUrl) {
      videoSection = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 16px;">
          <tr>
            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #1e40af; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">📹 Sesión online</p>
              <a href="${extra.videoJoinUrl}" target="_blank" style="color: #2563eb; font-family: -apple-system, sans-serif; font-size: 14px; word-break: break-all;">${extra.videoJoinUrl}</a>
            </td>
          </tr>
        </table>`;
    }

    const html = this.buildEmailTemplate({
      previewText: `Tu ${t.bookingSingular.toLowerCase()} en ${businessName} está confirmad${g.suffix}`,
      headerColor: 'success',
      headerIcon: '✅',
      headerTitle: `${t.bookingSingular} confirmad${g.suffix}`,
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu ${t.bookingSingular.toLowerCase()} en <strong style="color: #111827;">${businessName}</strong> ha sido confirmad${g.suffix} exitosamente.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #bbf7d0;">
                    <p style="margin: 0; color: #166534; font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 500;">DETALLE ${g.preposition.toUpperCase()} ${t.bookingSingular.toUpperCase()}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${detailRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ${videoSection}
      `,
      ctaText: `Ver mi ${t.bookingSingular.toLowerCase()}`,
      ctaUrl: `${this.webUrl}/${tenantSlug}`,
      ctaColor: 'success',
      footerNote: 'Si necesitas cancelar o reprogramar, contacta al establecimiento.',
    });

    await this.sendEmail({
      to,
      subject: `✅ ${t.bookingSingular} confirmad${g.suffix} en ${businessName} - TurnoLink`,
      html,
    });
  }

  /**
   * Email sent to customer when a gastro reservation REQUEST is created (before confirmation).
   * Amber/warning theme — "Tu solicitud fue recibida, el local la confirmará a la brevedad."
   */
  async sendBookingPendingEmail(
    to: string,
    customerName: string,
    businessName: string,
    date: string,
    time: string,
    serviceName: string,
    tenantSlug: string,
    extra?: { address?: string; city?: string; phone?: string },
    terms: RubroTerms = DEFAULT_TERMS,
  ): Promise<void> {
    const t = terms;
    const g = bookingGender(t);
    let detailRows = `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📅 Fecha</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${date}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">🕐 Hora</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${time}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">${t.emoji} ${t.serviceSingular}</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${serviceName}</span>
        </td>
      </tr>`;

    if (extra?.address) {
      const location = extra.city ? `${extra.address}, ${extra.city}` : extra.address;
      detailRows += `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📍 Dirección</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${location}</span>
        </td>
      </tr>`;
    }

    if (extra?.phone) {
      detailRows += `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📞 Teléfono</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${extra.phone}</span>
        </td>
      </tr>`;
    }

    const html = this.buildEmailTemplate({
      previewText: `Tu solicitud de reserva en ${businessName} fue recibida`,
      headerColor: 'warning',
      headerIcon: '🕐',
      headerTitle: 'Solicitud recibida',
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu solicitud de reserva en <strong style="color: #111827;">${businessName}</strong> fue recibida correctamente. El local la revisará y te confirmaremos a la brevedad.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #fde68a;">
                    <p style="margin: 0; color: #92400e; font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 500;">DETALLE DE TU SOLICITUD</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${detailRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="background-color: #f3f4f6; border-radius: 8px; padding: 12px 16px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-family: -apple-system, sans-serif; font-size: 13px;">
                Recibirás un email de confirmación cuando el local apruebe tu reserva.
              </p>
            </td>
          </tr>
        </table>
      `,
      ctaText: `Ver ${businessName}`,
      ctaUrl: `${this.webUrl}/${tenantSlug}`,
      ctaColor: 'warning',
      footerNote: 'Si necesitas hacer cambios, contacta directamente al establecimiento.',
    });

    await this.sendEmail({
      to,
      subject: `🕐 Solicitud de reserva recibida — ${businessName}`,
      html,
    });
  }

  async sendVideoLinkEmail(
    to: string,
    recipientName: string,
    businessName: string,
    date: string,
    time: string,
    serviceName: string,
    videoJoinUrl: string,
    tenantSlug: string,
    terms: RubroTerms = DEFAULT_TERMS,
    customerName?: string, // if sending to owner, show customer name
  ): Promise<void> {
    const t = terms;
    const g = bookingGender(t);

    let customerRow = '';
    if (customerName) {
      customerRow = `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">👤 Cliente</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${customerName}</span>
        </td>
      </tr>`;
    }

    const html = this.buildEmailTemplate({
      previewText: `Link de videollamada para tu ${t.bookingSingular.toLowerCase()} en ${businessName}`,
      headerColor: 'brand',
      headerIcon: '📹',
      headerTitle: 'Sesión online confirmada',
      greeting: recipientName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu ${t.bookingSingular.toLowerCase()} online en <strong style="color: #111827;">${businessName}</strong> ya tiene link de videollamada.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #bae6fd;">
                    <p style="margin: 0; color: #0c4a6e; font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 500;">DETALLE ${g.preposition.toUpperCase()} ${t.bookingSingular.toUpperCase()}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${customerRow}
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📅 Fecha</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${date}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">🕐 Hora</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${time}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">${t.emoji} ${t.serviceSingular}</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${serviceName}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center;">
              <p style="margin: 0 0 12px 0; color: #1e40af; font-family: -apple-system, sans-serif; font-size: 16px; font-weight: 700;">📹 Link de videollamada</p>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-family: -apple-system, sans-serif; font-size: 13px;">Hacé clic en el botón para unirte a la sesión el día y hora indicados</p>
              <a href="${videoJoinUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-family: -apple-system, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px;">Unirse a la sesión</a>
              <p style="margin: 12px 0 0 0;"><a href="${videoJoinUrl}" target="_blank" style="color: #2563eb; font-family: -apple-system, sans-serif; font-size: 12px; word-break: break-all;">${videoJoinUrl}</a></p>
            </td>
          </tr>
        </table>
      `,
      ctaText: `Ver mi ${t.bookingSingular.toLowerCase()}`,
      ctaUrl: `${this.webUrl}/${tenantSlug}`,
      ctaColor: 'brand',
      footerNote: 'Si necesitas cancelar o reprogramar, contacta al establecimiento.',
    });

    await this.sendEmail({
      to,
      subject: `📹 Link de sesión online — ${serviceName} en ${businessName} - TurnoLink`,
      html,
    });
  }

  async sendNewBookingOwnerEmail(
    to: string,
    businessName: string,
    customerName: string,
    customerPhone: string,
    customerEmail: string | null,
    date: string,
    time: string,
    serviceName: string,
    duration: number,
    extra?: { videoJoinUrl?: string; bookingMode?: string },
    terms: RubroTerms = DEFAULT_TERMS,
  ): Promise<void> {
    let detailRows = `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">👤 Cliente</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${customerName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📱 Teléfono</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${customerPhone}</span>
        </td>
      </tr>`;

    if (customerEmail) {
      detailRows += `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">✉️ Email</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${customerEmail}</span>
        </td>
      </tr>`;
    }

    detailRows += `
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📅 Fecha</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${date}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">🕐 Hora</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${time}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">${terms.emoji} ${terms.serviceSingular}</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${serviceName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">
          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">⏱ Duración</span>
        </td>
        <td align="right" style="padding: 8px 0;">
          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${duration} min</span>
        </td>
      </tr>`;

    const t = terms;
    const g = bookingGender(t);

    let videoInfo = '';
    if (extra?.videoJoinUrl) {
      videoInfo = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 16px;">
          <tr>
            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center;">
              <p style="margin: 0 0 4px 0; color: #1e40af; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">📹 Sesión online</p>
              <a href="${extra.videoJoinUrl}" target="_blank" style="color: #2563eb; font-family: -apple-system, sans-serif; font-size: 13px; word-break: break-all;">${extra.videoJoinUrl}</a>
            </td>
          </tr>
        </table>`;
    } else if (extra?.bookingMode === 'online') {
      videoInfo = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 16px;">
          <tr>
            <td style="background-color: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; text-align: center;">
              <p style="margin: 0; color: #92400e; font-family: -apple-system, sans-serif; font-size: 14px;">📹 Modo online — link pendiente</p>
            </td>
          </tr>
        </table>`;
    }

    const html = this.buildEmailTemplate({
      previewText: `Nuev${g.suffix} ${t.bookingSingular.toLowerCase()}: ${customerName} - ${serviceName}`,
      headerColor: 'brand',
      headerIcon: t.emoji,
      headerTitle: `Nuev${g.suffix} ${t.bookingSingular.toLowerCase()} recibid${g.suffix}`,
      greeting: businessName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tienes ${g.articleUn} nuev${g.suffix} ${t.bookingSingular.toLowerCase()} agendad${g.suffix}. Revisa los detalles:
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="background-color: #ECF6F8; border: 1px solid #C5E3EA; border-radius: 12px; padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #C5E3EA;">
                    <p style="margin: 0; color: #1D3C44; font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 500;">DETALLE ${g.preposition.toUpperCase()} ${t.bookingSingular.toUpperCase()}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${detailRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ${videoInfo}
      `,
      ctaText: 'Ver en TurnoLink',
      ctaUrl: `${this.webUrl}/turnos`,
      ctaColor: 'brand',
      footerNote: `Este email es automático. Ingresá a TurnoLink para gestionar ${g.article} ${t.bookingSingular.toLowerCase()}.`,
    });

    await this.sendEmail({
      to,
      subject: `${t.emoji} Nuev${g.suffix} ${t.bookingSingular.toLowerCase()}: ${customerName} - ${serviceName} - TurnoLink`,
      html,
    });
  }

  async sendBookingReminderEmail(
    to: string,
    customerName: string,
    businessName: string,
    date: string,
    time: string,
    serviceName: string,
    tenantSlug: string,
    videoJoinUrl?: string,
    terms: RubroTerms = DEFAULT_TERMS,
  ): Promise<void> {
    let videoSection = '';
    if (videoJoinUrl) {
      videoSection = `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 16px;">
          <tr>
            <td style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #1e40af; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">📹 Sesión online</p>
              <a href="${videoJoinUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 10px 24px; border-radius: 8px;">Entrar a la sesión</a>
            </td>
          </tr>
        </table>`;
    }

    const t = terms;
    const g = bookingGender(t);

    const html = this.buildEmailTemplate({
      previewText: `Recordatorio: tu ${t.bookingSingular.toLowerCase()} mañana en ${businessName}`,
      headerColor: 'warning',
      headerIcon: '⏰',
      headerTitle: `Recordatorio de ${t.bookingSingular.toLowerCase()}`,
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Te recordamos que tienes ${g.articleUn} ${t.bookingSingular.toLowerCase()} <strong style="color: #111827;">mañana</strong> en <strong style="color: #111827;">${businessName}</strong>.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #fde68a;">
                    <p style="margin: 0; color: #92400e; font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 500;">TU ${t.bookingSingular.toUpperCase()}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📅 Fecha</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${date}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">🕐 Hora</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${time}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">${t.emoji} ${t.serviceSingular}</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${serviceName}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ${videoSection}
      `,
      ctaText: `Ver mi ${t.bookingSingular.toLowerCase()}`,
      ctaUrl: `${this.webUrl}/${tenantSlug}`,
      ctaColor: 'warning',
      infoBox: {
        icon: '💡',
        title: '¿Necesitas cancelar?',
        content: `Si no puedes asistir, contacta al establecimiento para reprogramar tu ${t.bookingSingular.toLowerCase()}.`,
      },
      footerNote: 'Te esperamos mañana.',
    });

    await this.sendEmail({
      to,
      subject: `⏰ Recordatorio: tu ${t.bookingSingular.toLowerCase()} mañana en ${businessName} - TurnoLink`,
      html,
    });
  }

  async sendBookingCancellationEmail(
    to: string,
    customerName: string,
    businessName: string,
    date: string,
    time: string,
    serviceName: string,
    tenantSlug: string,
    terms: RubroTerms = DEFAULT_TERMS,
  ): Promise<void> {
    const t = terms;
    const g = bookingGender(t);

    const html = this.buildEmailTemplate({
      previewText: `Tu ${t.bookingSingular.toLowerCase()} en ${businessName} ha sido cancelad${g.suffix}`,
      headerColor: 'neutral',
      headerIcon: '❌',
      headerTitle: `${t.bookingSingular} cancelad${g.suffix}`,
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu ${t.bookingSingular.toLowerCase()} en <strong style="color: #111827;">${businessName}</strong> ha sido cancelad${g.suffix}.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #374151; font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 500;">${t.bookingSingular.toUpperCase()} CANCELAD${g.suffix.toUpperCase()}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">📅 Fecha</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600; text-decoration: line-through;">${date}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">🕐 Hora</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600; text-decoration: line-through;">${time}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-family: -apple-system, sans-serif; font-size: 14px;">${t.emoji} ${t.serviceSingular}</span>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="color: #111827; font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;">${serviceName}</span>
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
      ctaText: `${t.bookAction} nuev${g.suffix} ${t.bookingSingular.toLowerCase()}`,
      ctaUrl: `${this.webUrl}/${tenantSlug}`,
      ctaColor: 'brand',
      footerNote: 'Si tienes preguntas, contacta al establecimiento.',
    });

    await this.sendEmail({
      to,
      subject: `❌ ${t.bookingSingular} cancelad${g.suffix} en ${businessName} - TurnoLink`,
      html,
    });
  }

  // ============ LOYALTY EMAILS ============

  async sendLoyaltyPointsEmail(
    to: string,
    customerName: string,
    points: number,
    totalBalance: number,
    description: string,
    programName: string,
    currencyPerPoint: number,
    tenantName: string,
  ): Promise<void> {
    const monetaryValue = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalBalance * currencyPerPoint);

    const html = this.buildEmailTemplate({
      previewText: `¡Ganaste ${points} puntos en ${tenantName}!`,
      headerColor: 'success',
      headerIcon: '⭐',
      headerTitle: `¡Ganaste ${points} puntos!`,
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 16px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Por tu <strong>${description.toLowerCase()}</strong> en <strong>${tenantName}</strong> ganaste <strong style="color: #059669;">${points} puntos</strong> en el ${programName}.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
          <tr>
            <td style="padding: 12px 16px; background: #f0fdf4; border-radius: 8px 8px 0 0; border-bottom: 1px solid #dcfce7;">
              <span style="font-size: 13px; color: #6b7280;">Puntos ganados</span><br/>
              <strong style="font-size: 18px; color: #059669;">+${points}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; background: #f0fdf4; border-bottom: 1px solid #dcfce7;">
              <span style="font-size: 13px; color: #6b7280;">Saldo total</span><br/>
              <strong style="font-size: 18px; color: #111827;">${totalBalance} puntos</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; background: #f0fdf4; border-radius: 0 0 8px 8px;">
              <span style="font-size: 13px; color: #6b7280;">Valor equivalente</span><br/>
              <strong style="font-size: 18px; color: #111827;">${monetaryValue}</strong>
            </td>
          </tr>
        </table>
      `,
      ctaText: 'Ver mis puntos',
      ctaUrl: this.webUrl,
      ctaColor: 'success',
    });

    await this.sendEmail({ to, subject: `⭐ ¡Ganaste ${points} puntos en ${tenantName}!`, html });
  }

  async sendTierUpgradeEmail(
    to: string,
    customerName: string,
    tierName: string,
    tierColor: string,
    benefitDescription: string | null,
    tenantName: string,
  ): Promise<void> {
    const html = this.buildEmailTemplate({
      previewText: `¡Subiste a nivel ${tierName} en ${tenantName}!`,
      headerColor: 'brand',
      headerIcon: '🏆',
      headerTitle: `¡Subiste a ${tierName}!`,
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 16px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          ¡Felicitaciones! Alcanzaste el nivel <strong style="color: ${tierColor};">${tierName}</strong> en el programa de fidelización de <strong>${tenantName}</strong>.
        </p>
        ${benefitDescription ? `
        <div style="padding: 16px; background: #eff6ff; border-radius: 8px; margin: 0 0 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #3b82f6; font-weight: 600;">Tus beneficios:</p>
          <p style="margin: 8px 0 0; font-size: 14px; color: #4b5563;">${benefitDescription}</p>
        </div>` : ''}
      `,
      ctaText: 'Ver mi nivel',
      ctaUrl: this.webUrl,
      ctaColor: 'brand',
    });

    await this.sendEmail({ to, subject: `🏆 ¡Subiste a nivel ${tierName} en ${tenantName}!`, html });
  }

  async sendManualCouponEmail(
    to: string,
    customerName: string,
    couponCode: string,
    rewardName: string,
    tenantName: string,
  ): Promise<void> {
    const html = this.buildEmailTemplate({
      previewText: `Tenés un cupón de ${tenantName}: ${rewardName}`,
      headerColor: 'brand',
      headerIcon: '🎁',
      headerTitle: '¡Tenés un cupón!',
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 16px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong>${tenantName}</strong> te envió un cupón: <strong>${rewardName}</strong>
        </p>
        <div style="padding: 20px; background: #f0fdf4; border-radius: 12px; text-align: center; margin: 0 0 24px 0; border: 2px dashed #86efac;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">Tu código:</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #059669; letter-spacing: 2px;">${couponCode}</p>
        </div>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">Presentá este código en tu próxima visita o reserva.</p>
      `,
      ctaText: 'Reservar turno',
      ctaUrl: this.webUrl,
      ctaColor: 'success',
    });

    await this.sendEmail({ to, subject: `🎁 Cupón de ${tenantName}: ${rewardName}`, html });
  }

  async sendSorteoRegistrationEmail(
    to: string,
    participantName: string,
    sorteoTitle: string,
    tenantName: string,
  ): Promise<void> {
    const html = this.buildEmailTemplate({
      previewText: `¡Ya estás participando en "${sorteoTitle}" de ${tenantName}!`,
      headerColor: 'brand',
      headerIcon: '🎉',
      headerTitle: '¡Ya estás participando!',
      greeting: participantName,
      bodyContent: `
        <p style="margin: 0 0 16px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Te registraste en el sorteo <strong>"${sorteoTitle}"</strong> de <strong>${tenantName}</strong>.
        </p>
        <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Te avisaremos por email si ganás. ¡Mucha suerte! 🍀
        </p>
      `,
      ctaText: 'Ver más',
      ctaUrl: this.webUrl,
      ctaColor: 'brand',
    });

    await this.sendEmail({ to, subject: `🎉 ¡Ya participás en "${sorteoTitle}" de ${tenantName}!`, html });
  }

  async sendSorteoWinnerEmail(
    to: string,
    winnerName: string,
    sorteoTitle: string,
    prizeName: string,
    tenantName: string,
  ): Promise<void> {
    const html = this.buildEmailTemplate({
      previewText: `¡Ganaste en "${sorteoTitle}" de ${tenantName}!`,
      headerColor: 'success',
      headerIcon: '🏆',
      headerTitle: '¡Felicitaciones, ganaste!',
      greeting: winnerName,
      bodyContent: `
        <p style="margin: 0 0 16px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          ¡Sos el ganador del sorteo <strong>"${sorteoTitle}"</strong> de <strong>${tenantName}</strong>!
        </p>
        ${prizeName ? `
        <div style="padding: 20px; background: #fef3c7; border-radius: 12px; text-align: center; margin: 0 0 24px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #92400e;">Tu premio:</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #d97706;">🎁 ${prizeName}</p>
        </div>` : ''}
        <p style="margin: 0; color: #4b5563; font-size: 15px;">
          El comercio se pondrá en contacto con vos para coordinar la entrega del premio.
        </p>
      `,
      ctaText: 'Contactar',
      ctaUrl: this.webUrl,
      ctaColor: 'success',
    });

    await this.sendEmail({ to, subject: `🏆 ¡Ganaste en "${sorteoTitle}" de ${tenantName}!`, html });
  }

  // ============ INVESTMENT PAYMENT OVERDUE ============

  async sendInvestmentPaymentOverdueEmail(
    to: string,
    investorName: string,
    unitIdentifier: string | null,
    projectName: string,
    installmentNumber: number,
    amount: number,
    dueDate: Date,
    tenantName: string,
  ): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    const formattedDate = dueDate.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

    const html = this.buildEmailTemplate({
      previewText: `Cuota vencida - ${projectName}`,
      headerColor: 'warning',
      headerIcon: '⚠️',
      headerTitle: 'Cuota vencida',
      greeting: investorName,
      bodyContent: `
        <p style="margin: 0 0 16px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu cuota <strong>#${installmentNumber}</strong> del proyecto <strong>${projectName}</strong>${unitIdentifier ? ` (Unidad ${unitIdentifier})` : ''} venció el <strong style="color: #D97706;">${formattedDate}</strong>.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
          <tr>
            <td style="padding: 12px 16px; background: #fffbeb; border-radius: 8px 8px 0 0; border-bottom: 1px solid #fef3c7;">
              <span style="font-size: 13px; color: #6b7280;">Monto pendiente</span><br/>
              <strong style="font-size: 20px; color: #D97706;">${formattedAmount}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; background: #fffbeb; border-radius: 0 0 8px 8px;">
              <span style="font-size: 13px; color: #6b7280;">Fecha de vencimiento</span><br/>
              <strong style="font-size: 15px; color: #111827;">${formattedDate}</strong>
            </td>
          </tr>
        </table>
        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Por favor, regularizá tu situación a la brevedad. Si ya realizaste el pago, comunicate con <strong>${tenantName}</strong> para que lo registren.
        </p>
      `,
      ctaText: 'Contactar',
      ctaUrl: this.webUrl,
      ctaColor: 'warning',
      footerNote: `Este email fue enviado por ${tenantName} a través de TurnoLink.`,
    });

    await this.sendEmail({ to, subject: `⚠️ Cuota vencida #${installmentNumber} - ${projectName} | ${tenantName}`, html });
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
  <meta name="supported-color-schemes" content="light">
  <title>TurnoLink</title>
</head>
<body style="margin: 0; padding: 0; width: 100%; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
  <div style="display: none; max-height: 0; overflow: hidden;">${options.previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">

          <!-- Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

              <!-- Header with integrated logo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="background: ${headerStyle.gradient}; padding: 32px 32px 36px;">
                    <!-- Logo -->
                    <img src="https://turnolink.com.ar/logo-email-white.png" alt="TurnoLink" width="120" style="display: block; height: auto; border: 0; margin: 0 auto 24px; opacity: 0.9;" />
                    <!-- Icon -->
                    <div style="width: 52px; height: 52px; background: rgba(255,255,255,0.15); border-radius: 50%; line-height: 52px; text-align: center; margin: 0 auto 14px;">
                      <span style="font-size: 26px;">${options.headerIcon}</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 21px; font-weight: 600;">
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
                © ${new Date().getFullYear()} TurnoLink · Sistema de gestión
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

  // ============ ORDER CONFIRMATION (to customer) ============

  async sendOrderConfirmationEmail(
    to: string,
    customerName: string,
    businessName: string,
    orderNumber: string,
    items: { name: string; quantity: number; price: number }[],
    total: number,
    orderUrl: string,
  ): Promise<void> {
    const itemsHtml = items.map((item) =>
      `<tr>
        <td style="padding: 6px 0; color: #374151; font-family: -apple-system, sans-serif; font-size: 14px;">${item.name} x${item.quantity}</td>
        <td style="padding: 6px 0; color: #374151; font-family: -apple-system, sans-serif; font-size: 14px; text-align: right;">$${item.price.toLocaleString('es-AR')}</td>
      </tr>`
    ).join('');

    const html = this.buildEmailTemplate({
      previewText: `Pedido ${orderNumber} confirmado en ${businessName}`,
      headerColor: 'success',
      headerIcon: '🛒',
      headerTitle: 'Pedido recibido',
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.6;">
          Tu pedido <strong style="color: #111827;">${orderNumber}</strong> fue recibido por <strong>${businessName}</strong>.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 10px 0 0; border-top: 1px solid #e5e7eb; color: #111827; font-family: -apple-system, sans-serif; font-size: 15px; font-weight: 700;">Total</td>
            <td style="padding: 10px 0 0; border-top: 1px solid #e5e7eb; color: #111827; font-family: -apple-system, sans-serif; font-size: 15px; font-weight: 700; text-align: right;">$${total.toLocaleString('es-AR')}</td>
          </tr>
        </table>
      `,
      ctaText: 'Ver mi pedido',
      ctaUrl: orderUrl,
      ctaColor: 'success',
      footerNote: `Pedido realizado en ${businessName} a través de TurnoLink Mercado.`,
    });

    await this.sendEmail({
      to,
      subject: `Pedido ${orderNumber} recibido — ${businessName}`,
      html,
    });
  }

  // ============ NEW ORDER NOTIFICATION (to business owner) ============

  async sendNewOrderOwnerEmail(
    to: string,
    businessName: string,
    customerName: string,
    orderNumber: string,
    total: number,
    dashboardUrl: string,
  ): Promise<void> {
    const html = this.buildEmailTemplate({
      previewText: `Nuevo pedido ${orderNumber} de ${customerName}`,
      headerColor: 'brand',
      headerIcon: '📦',
      headerTitle: 'Nuevo pedido',
      greeting: businessName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong style="color: #111827;">${customerName}</strong> realizó el pedido <strong>${orderNumber}</strong> por un total de <strong>$${total.toLocaleString('es-AR')}</strong>.
        </p>
      `,
      ctaText: 'Ver pedidos',
      ctaUrl: dashboardUrl,
      ctaColor: 'brand',
      footerNote: 'Revisá los detalles del pedido en tu panel de administración.',
    });

    await this.sendEmail({
      to,
      subject: `Nuevo pedido ${orderNumber} — $${total.toLocaleString('es-AR')}`,
      html,
    });
  }

  // ============ ORDER PAYMENT APPROVED (to customer) ============

  async sendOrderPaymentApprovedEmail(
    to: string,
    customerName: string,
    businessName: string,
    orderNumber: string,
    items: { name: string; quantity: number; price: number }[],
    total: number,
    orderUrl: string,
  ): Promise<void> {
    const html = this.buildEmailTemplate({
      previewText: `Pago aprobado para pedido ${orderNumber}`,
      headerColor: 'success',
      headerIcon: '✅',
      headerTitle: 'Pago aprobado',
      greeting: customerName,
      bodyContent: `
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.6;">
          El pago de tu pedido <strong style="color: #111827;">${orderNumber}</strong> fue aprobado. Total: <strong>$${total.toLocaleString('es-AR')}</strong>.
        </p>
        <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.6;">
          <strong>${businessName}</strong> te avisará cuando tu pedido esté listo.
        </p>
      `,
      ctaText: 'Ver mi pedido',
      ctaUrl: orderUrl,
      ctaColor: 'success',
      footerNote: `Pedido procesado en ${businessName} a través de TurnoLink Mercado.`,
    });

    await this.sendEmail({
      to,
      subject: `Pago aprobado — Pedido ${orderNumber}`,
      html,
    });
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

  // ============ RENTAL CONTRACT ADJUSTMENT ============

  async sendRentalAdjustmentEmail(
    to: string,
    tenantName: string,
    propertyAddress: string,
    previousAmount: number,
    newAmount: number,
    adjustmentPercent: number,
    indexUsed: string,
    effectiveDate: Date,
    businessName: string,
  ): Promise<void> {
    const fmtDate = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(effectiveDate);
    const fmtPrev = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(previousAmount);
    const fmtNew = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(newAmount);
    const indexLabel = indexUsed === 'ICL' ? 'Índice de Contratos de Locación (ICL)' : indexUsed === 'IPC' ? 'Índice de Precios al Consumidor (IPC)' : indexUsed || 'Índice pactado';

    const html = this.buildEmailTemplate({
      previewText: `Ajuste de alquiler a partir del ${fmtDate}`,
      headerColor: 'brand',
      headerIcon: '📊',
      headerTitle: 'Ajuste de alquiler',
      greeting: tenantName,
      bodyContent: `
        <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Te informamos que a partir del <strong>${fmtDate}</strong> se aplica el ajuste correspondiente a tu contrato de alquiler.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 24px 0;">
          <tr>
            <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Propiedad</td>
            <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;font-size:14px;font-weight:600;color:#111827;">${propertyAddress}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Monto anterior</td>
            <td style="padding:12px 16px;border:1px solid #e5e7eb;font-size:14px;color:#111827;">${fmtPrev}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;background:#f0fdf4;border:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Nuevo monto</td>
            <td style="padding:12px 16px;background:#f0fdf4;border:1px solid #e5e7eb;font-size:16px;font-weight:700;color:#15803d;">${fmtNew}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Ajuste</td>
            <td style="padding:12px 16px;border:1px solid #e5e7eb;font-size:14px;color:#111827;">+${adjustmentPercent.toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Índice</td>
            <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;font-size:14px;color:#111827;">${indexLabel}</td>
          </tr>
        </table>
      `,
      ctaText: 'Contactar',
      ctaUrl: this.webUrl,
      ctaColor: 'brand',
      footerNote: `Este ajuste fue generado automáticamente por ${businessName}.`,
    });

    await this.sendEmail({
      to,
      subject: `📊 Ajuste de alquiler — Nuevo monto: ${fmtNew}`,
      html,
    });
  }
}
