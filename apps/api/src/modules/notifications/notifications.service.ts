import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import { EmailNotificationsService } from './email-notifications.service';
import { WhatsAppService } from './whatsapp.service';
import { Booking } from '@prisma/client';
import { RubroTerms, getTermsForTenant, bookingGender } from '@common/utils/rubro-terms';

// Notification constants
const NotificationType = {
  BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER: 'BOOKING_REMINDER',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_RESCHEDULED: 'BOOKING_RESCHEDULED',
} as const;

const NotificationChannel = {
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
  SMS: 'SMS',
} as const;

const NotificationStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

interface BookingWithDetails extends Booking {
  service?: { name: string; duration: number; price?: number } | null;
  product?: { name: string; price?: number } | null;
  customer: { name: string; phone: string; email: string | null };
  tenant?: { name: string; phone: string | null };
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly emailNotificationsService: EmailNotificationsService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async sendBookingConfirmation(booking: BookingWithDetails) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: booking.tenantId },
      select: { name: true, slug: true, address: true, city: true, phone: true, settings: true },
    });

    if (!tenant) return;

    const terms = getTermsForTenant(tenant.settings as any);
    const message = this.formatBookingConfirmation(booking, tenant, terms);

    // Send WhatsApp
    await this.sendNotification({
      tenantId: booking.tenantId,
      bookingId: booking.id,
      type: NotificationType.BOOKING_CONFIRMATION,
      channel: NotificationChannel.WHATSAPP,
      recipient: booking.customer.phone,
      content: message,
    });

    // Send professional HTML email
    const recipientEmail = (booking as any).customerEmail || booking.customer.email;
    if (recipientEmail) {
      const date = new Date(booking.date).toLocaleDateString('es-AR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      try {
        await this.emailNotificationsService.sendBookingConfirmationEmail(
          recipientEmail,
          booking.customer.name,
          tenant.name,
          date,
          booking.startTime,
          booking.service?.name ?? booking.product?.name ?? 'Sin detalle',
          tenant.slug || '',
          {
            address: tenant.address || undefined,
            city: tenant.city || undefined,
            phone: tenant.phone || undefined,
            videoJoinUrl: (booking as any).videoJoinUrl || undefined,
          },
          terms,
        );
        // Record notification
        await this.prisma.notification.create({
          data: {
            tenantId: booking.tenantId,
            bookingId: booking.id,
            type: NotificationType.BOOKING_CONFIRMATION,
            channel: NotificationChannel.EMAIL,
            recipient: recipientEmail,
            content: 'Professional HTML email',
            status: NotificationStatus.SENT,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        await this.prisma.notification.create({
          data: {
            tenantId: booking.tenantId,
            bookingId: booking.id,
            type: NotificationType.BOOKING_CONFIRMATION,
            channel: NotificationChannel.EMAIL,
            recipient: recipientEmail,
            content: 'Professional HTML email',
            status: NotificationStatus.FAILED,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }
  }

  /**
   * Send "solicitud recibida" email to customer for gastro reservations (pending approval).
   */
  async sendBookingPending(booking: BookingWithDetails) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: booking.tenantId },
      select: { name: true, slug: true, address: true, city: true, phone: true, settings: true },
    });

    if (!tenant) return;

    const recipientEmail = (booking as any).customerEmail || booking.customer.email;
    if (!recipientEmail) return;

    const date = new Date(booking.date).toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    try {
      await this.emailNotificationsService.sendBookingPendingEmail(
        recipientEmail,
        booking.customer.name,
        tenant.name,
        date,
        booking.startTime,
        booking.service?.name ?? booking.product?.name ?? 'Sin detalle',
        tenant.slug || '',
        {
          address: tenant.address || undefined,
          city: tenant.city || undefined,
          phone: tenant.phone || undefined,
        },
      );
      await this.prisma.notification.create({
        data: {
          tenantId: booking.tenantId,
          bookingId: booking.id,
          type: 'BOOKING_PENDING',
          channel: NotificationChannel.EMAIL,
          recipient: recipientEmail,
          content: 'Booking pending HTML email',
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.notification.create({
        data: {
          tenantId: booking.tenantId,
          bookingId: booking.id,
          type: 'BOOKING_PENDING',
          channel: NotificationChannel.EMAIL,
          recipient: recipientEmail,
          content: 'Booking pending HTML email',
          status: NotificationStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * Send email notification to business owner when a new booking is created.
   */
  async sendNewBookingToOwner(booking: BookingWithDetails) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: booking.tenantId },
      select: { name: true, email: true, settings: true },
    });

    if (!tenant) return;

    // Check notification preferences
    let settings: Record<string, any> = {};
    try {
      settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : tenant.settings;
    } catch { /* use defaults */ }

    // If explicitly disabled, skip
    if (settings.notifyOwnerByEmail === false) return;

    const terms = getTermsForTenant(settings);

    // Determine recipient: notificationEmail setting > tenant.email > owner user email
    let recipientEmail = settings.notificationEmail || tenant.email;

    if (!recipientEmail) {
      // Fallback to owner user email
      const owner = await this.prisma.user.findFirst({
        where: { tenantId: booking.tenantId, role: 'OWNER' },
        select: { email: true },
      });
      recipientEmail = owner?.email;
    }

    if (!recipientEmail) return;

    const date = new Date(booking.date).toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    try {
      await this.emailNotificationsService.sendNewBookingOwnerEmail(
        recipientEmail,
        tenant.name,
        booking.customer.name,
        booking.customer.phone,
        booking.customer.email,
        date,
        booking.startTime,
        booking.service?.name ?? booking.product?.name ?? 'Sin detalle',
        booking.service?.duration ?? 15,
        {
          videoJoinUrl: (booking as any).videoJoinUrl || undefined,
          bookingMode: (booking as any).bookingMode || undefined,
        },
        terms,
      );
      await this.prisma.notification.create({
        data: {
          tenantId: booking.tenantId,
          bookingId: booking.id,
          type: 'BOOKING_NEW_OWNER',
          channel: NotificationChannel.EMAIL,
          recipient: recipientEmail,
          content: 'Professional HTML email',
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.notification.create({
        data: {
          tenantId: booking.tenantId,
          bookingId: booking.id,
          type: 'BOOKING_NEW_OWNER',
          channel: NotificationChannel.EMAIL,
          recipient: recipientEmail,
          content: 'Professional HTML email',
          status: NotificationStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  async sendBookingReminder(booking: BookingWithDetails) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: booking.tenantId },
      select: { name: true, slug: true, settings: true },
    });

    if (!tenant) return;

    const terms = getTermsForTenant(tenant.settings as any);
    const message = this.formatBookingReminder(booking, tenant.name, terms);

    // Send WhatsApp
    await this.sendNotification({
      tenantId: booking.tenantId,
      bookingId: booking.id,
      type: NotificationType.BOOKING_REMINDER,
      channel: NotificationChannel.WHATSAPP,
      recipient: booking.customer.phone,
      content: message,
    });

    // Send professional HTML email
    const recipientEmail = (booking as any).customerEmail || booking.customer.email;
    if (recipientEmail) {
      const date = new Date(booking.date).toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long',
      });
      try {
        await this.emailNotificationsService.sendBookingReminderEmail(
          recipientEmail,
          booking.customer.name,
          tenant.name,
          date,
          booking.startTime,
          booking.service?.name ?? booking.product?.name ?? 'Sin detalle',
          tenant.slug || '',
          (booking as any).videoJoinUrl || undefined,
          terms,
        );
        await this.prisma.notification.create({
          data: {
            tenantId: booking.tenantId,
            bookingId: booking.id,
            type: NotificationType.BOOKING_REMINDER,
            channel: NotificationChannel.EMAIL,
            recipient: recipientEmail,
            content: 'Professional HTML email',
            status: NotificationStatus.SENT,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        await this.prisma.notification.create({
          data: {
            tenantId: booking.tenantId,
            bookingId: booking.id,
            type: NotificationType.BOOKING_REMINDER,
            channel: NotificationChannel.EMAIL,
            recipient: recipientEmail,
            content: 'Professional HTML email',
            status: NotificationStatus.FAILED,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }
  }

  async sendBookingCancellation(booking: BookingWithDetails) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: booking.tenantId },
      select: { name: true, slug: true, settings: true },
    });

    if (!tenant) return;

    const terms = getTermsForTenant(tenant.settings as any);
    const message = this.formatBookingCancellation(booking, tenant.name, terms);

    // Send WhatsApp
    await this.sendNotification({
      tenantId: booking.tenantId,
      bookingId: booking.id,
      type: NotificationType.BOOKING_CANCELLED,
      channel: NotificationChannel.WHATSAPP,
      recipient: booking.customer.phone,
      content: message,
    });

    // Send professional HTML email
    const recipientEmail = (booking as any).customerEmail || booking.customer.email;
    if (recipientEmail) {
      const date = new Date(booking.date).toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long',
      });
      try {
        await this.emailNotificationsService.sendBookingCancellationEmail(
          recipientEmail,
          booking.customer.name,
          tenant.name,
          date,
          booking.startTime,
          booking.service?.name ?? booking.product?.name ?? 'Sin detalle',
          tenant.slug || '',
          terms,
        );
        await this.prisma.notification.create({
          data: {
            tenantId: booking.tenantId,
            bookingId: booking.id,
            type: NotificationType.BOOKING_CANCELLED,
            channel: NotificationChannel.EMAIL,
            recipient: recipientEmail,
            content: 'Professional HTML email',
            status: NotificationStatus.SENT,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        await this.prisma.notification.create({
          data: {
            tenantId: booking.tenantId,
            bookingId: booking.id,
            type: NotificationType.BOOKING_CANCELLED,
            channel: NotificationChannel.EMAIL,
            recipient: recipientEmail,
            content: 'Professional HTML email',
            status: NotificationStatus.FAILED,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }
  }

  private async sendNotification(data: {
    tenantId: string;
    bookingId: string;
    type: string;
    channel: string;
    recipient: string;
    content: string;
  }) {
    // Create notification record
    const notification = await this.prisma.notification.create({
      data: {
        ...data,
        status: NotificationStatus.PENDING,
      },
    });

    try {
      // Send based on channel
      if (data.channel === NotificationChannel.WHATSAPP) {
        await this.whatsAppService.send(data.recipient, data.content);
      } else if (data.channel === NotificationChannel.EMAIL) {
        const subject = data.type === 'BOOKING_NEW_OWNER'
          ? 'Nueva reserva recibida'
          : data.type === NotificationType.BOOKING_CANCELLED
          ? 'Reserva cancelada'
          : 'Confirmación de reserva';
        await this.emailService.send(data.recipient, subject, data.content);
      }

      // Update status to sent
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      // Update status to failed
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  private formatBookingConfirmation(
    booking: BookingWithDetails,
    tenant: { name: string; address?: string | null; city?: string | null; phone?: string | null },
    terms?: RubroTerms,
  ): string {
    const t = terms || getTermsForTenant(null);
    const g = bookingGender(t);
    const date = new Date(booking.date).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let locationInfo = '';
    if (tenant.address) {
      locationInfo = `\n📍 *Dirección:* ${tenant.address}`;
      if (tenant.city) {
        locationInfo += `, ${tenant.city}`;
      }
    }

    let contactInfo = '';
    if (tenant.phone) {
      contactInfo = `\n📞 *Teléfono:* ${tenant.phone}`;
    }

    let videoInfo = '';
    if ((booking as any).videoJoinUrl) {
      videoInfo = `\n\n📹 *Sesión online:* ${(booking as any).videoJoinUrl}`;
    }

    return `✅ *${t.bookingSingular} confirmad${g.suffix}*

Hola ${booking.customer.name}!

Tu ${t.bookingSingular.toLowerCase()} en *${tenant.name}* ha sido confirmad${g.suffix}.

📅 *Fecha:* ${date}
🕐 *Hora:* ${booking.startTime}
${t.emoji} *${t.serviceSingular}:* ${booking.service?.name ?? booking.product?.name ?? 'Sin detalle'}${locationInfo}${contactInfo}${videoInfo}

Te esperamos!

_Este mensaje es automático. Por favor no responder._`;
  }

  private formatNewBookingForOwner(booking: BookingWithDetails, terms?: RubroTerms): string {
    const t = terms || getTermsForTenant(null);
    const g = bookingGender(t);
    const date = new Date(booking.date).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let customerInfo = `👤 *Cliente:* ${booking.customer.name}\n📱 *Teléfono:* ${booking.customer.phone}`;
    if (booking.customer.email) {
      customerInfo += `\n✉️ *Email:* ${booking.customer.email}`;
    }

    let videoLine = '';
    if ((booking as any).videoJoinUrl) {
      videoLine = `\n📹 *Modo:* Online\n🔗 *Link:* ${(booking as any).videoJoinUrl}`;
    } else if ((booking as any).bookingMode === 'online') {
      videoLine = '\n📹 *Modo:* Online (link pendiente)';
    }

    return `${t.emoji} *Nuev${g.suffix} ${t.bookingSingular.toLowerCase()} recibid${g.suffix}*

${customerInfo}

📅 *Fecha:* ${date}
🕐 *Hora:* ${booking.startTime}
${t.emoji} *${t.serviceSingular}:* ${booking.service?.name ?? booking.product?.name ?? 'Sin detalle'}
⏱ *Duración:* ${booking.service?.duration ?? 15} minutos${videoLine}

_Ingresá a TurnoLink para ver los detalles._`;
  }

  private formatBookingReminder(booking: BookingWithDetails, businessName: string, terms?: RubroTerms): string {
    const t = terms || getTermsForTenant(null);
    const g = bookingGender(t);
    const date = new Date(booking.date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    let videoReminder = '';
    if ((booking as any).videoJoinUrl) {
      videoReminder = `\n\n📹 *Sesión online:* ${(booking as any).videoJoinUrl}`;
    }

    return `⏰ *Recordatorio de ${t.bookingSingular.toLowerCase()}*

Hola ${booking.customer.name}!

Te recordamos que tienes ${g.articleUn} ${t.bookingSingular.toLowerCase()} mañana en *${businessName}*.

📅 *Fecha:* ${date}
🕐 *Hora:* ${booking.startTime}
${t.emoji} *${t.serviceSingular}:* ${booking.service?.name ?? booking.product?.name ?? 'Sin detalle'}${videoReminder}

Te esperamos!`;
  }

  private formatBookingCancellation(booking: BookingWithDetails, businessName: string, terms?: RubroTerms): string {
    const t = terms || getTermsForTenant(null);
    const g = bookingGender(t);
    const date = new Date(booking.date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    return `❌ *${t.bookingSingular} cancelad${g.suffix}*

Hola ${booking.customer.name},

Tu ${t.bookingSingular.toLowerCase()} en *${businessName}* ha sido cancelad${g.suffix}.

📅 *Fecha:* ${date}
🕐 *Hora:* ${booking.startTime}
${t.emoji} *${t.serviceSingular}:* ${booking.service?.name ?? booking.product?.name ?? 'Sin detalle'}

Para ${t.bookingVerb} ${g.articleUn} nuev${g.suffix} ${t.bookingSingular.toLowerCase()}, visita nuestra página.`;
  }
}
