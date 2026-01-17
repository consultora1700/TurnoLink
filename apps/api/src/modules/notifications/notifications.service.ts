import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import { WhatsAppService } from './whatsapp.service';
import { Booking } from '@prisma/client';

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
  service: { name: string; duration: number };
  customer: { name: string; phone: string; email: string | null };
  tenant?: { name: string; phone: string | null };
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async sendBookingConfirmation(booking: BookingWithDetails) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: booking.tenantId },
      select: { name: true, address: true, city: true, phone: true },
    });

    if (!tenant) return;

    const message = this.formatBookingConfirmation(booking, tenant);

    // Send WhatsApp
    await this.sendNotification({
      tenantId: booking.tenantId,
      bookingId: booking.id,
      type: NotificationType.BOOKING_CONFIRMATION,
      channel: NotificationChannel.WHATSAPP,
      recipient: booking.customer.phone,
      content: message,
    });

    // Send Email if available
    if (booking.customer.email) {
      await this.sendNotification({
        tenantId: booking.tenantId,
        bookingId: booking.id,
        type: NotificationType.BOOKING_CONFIRMATION,
        channel: NotificationChannel.EMAIL,
        recipient: booking.customer.email,
        content: message,
      });
    }
  }

  async sendBookingReminder(booking: BookingWithDetails) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: booking.tenantId },
    });

    if (!tenant) return;

    const message = this.formatBookingReminder(booking, tenant.name);

    await this.sendNotification({
      tenantId: booking.tenantId,
      bookingId: booking.id,
      type: NotificationType.BOOKING_REMINDER,
      channel: NotificationChannel.WHATSAPP,
      recipient: booking.customer.phone,
      content: message,
    });
  }

  async sendBookingCancellation(booking: BookingWithDetails) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: booking.tenantId },
    });

    if (!tenant) return;

    const message = this.formatBookingCancellation(booking, tenant.name);

    await this.sendNotification({
      tenantId: booking.tenantId,
      bookingId: booking.id,
      type: NotificationType.BOOKING_CANCELLED,
      channel: NotificationChannel.WHATSAPP,
      recipient: booking.customer.phone,
      content: message,
    });
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
        await this.emailService.send(data.recipient, 'Confirmación de turno', data.content);
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
    tenant: { name: string; address?: string | null; city?: string | null; phone?: string | null }
  ): string {
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

    return `✅ *Turno confirmado*

Hola ${booking.customer.name}!

Tu turno en *${tenant.name}* ha sido confirmado.

📅 *Fecha:* ${date}
🕐 *Hora:* ${booking.startTime}
💇 *Servicio:* ${booking.service.name}${locationInfo}${contactInfo}

Te esperamos!

_Este mensaje es automático. Por favor no responder._`;
  }

  private formatBookingReminder(booking: BookingWithDetails, businessName: string): string {
    const date = new Date(booking.date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    return `⏰ *Recordatorio de turno*

Hola ${booking.customer.name}!

Te recordamos que tienes un turno mañana en *${businessName}*.

📅 *Fecha:* ${date}
🕐 *Hora:* ${booking.startTime}
💇 *Servicio:* ${booking.service.name}

Te esperamos!`;
  }

  private formatBookingCancellation(booking: BookingWithDetails, businessName: string): string {
    const date = new Date(booking.date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    return `❌ *Turno cancelado*

Hola ${booking.customer.name},

Tu turno en *${businessName}* ha sido cancelado.

📅 *Fecha:* ${date}
🕐 *Hora:* ${booking.startTime}
💇 *Servicio:* ${booking.service.name}

Para reservar un nuevo turno, visita nuestra página.`;
  }
}
