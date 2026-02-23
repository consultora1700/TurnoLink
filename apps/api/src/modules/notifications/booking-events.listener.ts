import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { PushService } from '../push/push.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLoggerService } from '../../common/logger';
import {
  BookingEvent,
  BookingCreatedPayload,
  BookingCancelledPayload,
  BookingEventPayload,
} from '../../common/events';

/**
 * Event listener that handles booking events and triggers notifications.
 * This decouples BookingsService from NotificationsService.
 */
@Injectable()
export class BookingEventsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('BookingEventsListener');
  }

  /**
   * Check if a specific push notification type is enabled for a tenant.
   */
  private async isPushEnabled(tenantId: string, settingKey: string): Promise<boolean> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { settings: true },
      });
      if (!tenant?.settings) return true; // default: enabled
      const settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : tenant.settings;
      return settings[settingKey] ?? true; // default: enabled
    } catch {
      return true; // on error, default to sending
    }
  }

  /**
   * Format a booking date in Spanish for push notification body.
   */
  private formatBookingDate(date: Date | string, startTime: string): string {
    const bookingDate = new Date(date);
    const dateStr = bookingDate.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return `${dateStr} a las ${startTime} hs`;
  }

  /**
   * Handle booking created event.
   * Sends confirmation notification only if no deposit is required.
   */
  @OnEvent(BookingEvent.CREATED, { async: true })
  async handleBookingCreated(payload: BookingCreatedPayload): Promise<void> {
    this.logger.log('Handling booking created event', {
      bookingId: payload.booking.id,
      tenantId: payload.tenantId,
      depositRequired: payload.depositRequired,
      action: 'booking.event.created',
    });

    // If deposit is required, ALL notifications wait until payment is confirmed
    if (payload.depositRequired) {
      this.logger.log('Deposit required — notifications deferred until payment', {
        bookingId: payload.booking.id,
      });
      return;
    }

    // No deposit required — send all notifications now
    await this.sendAllBookingNotifications(payload.booking, payload.tenantId);
  }

  /**
   * Handle booking confirmed event (e.g., after payment).
   * Sends ALL notifications: customer confirmation, owner email, push.
   */
  @OnEvent(BookingEvent.CONFIRMED, { async: true })
  async handleBookingConfirmed(payload: BookingEventPayload): Promise<void> {
    this.logger.log('Handling booking confirmed event', {
      bookingId: payload.booking.id,
      tenantId: payload.tenantId,
      action: 'booking.event.confirmed',
    });

    await this.sendAllBookingNotifications(payload.booking, payload.tenantId);
  }

  /**
   * Send all notifications for a confirmed booking:
   * - Customer confirmation (WhatsApp + email)
   * - Owner email notification
   * - Push notification to tenant
   */
  private async sendAllBookingNotifications(
    booking: BookingCreatedPayload['booking'],
    tenantId: string,
  ): Promise<void> {
    // 1. Customer confirmation (WhatsApp + email)
    try {
      await this.notificationsService.sendBookingConfirmation(booking);
    } catch (error) {
      this.logger.error('Failed to send booking confirmation',
        error instanceof Error ? error.stack : String(error), {
        bookingId: booking.id, tenantId,
      });
    }

    // 2. Email to business owner
    try {
      await this.notificationsService.sendNewBookingToOwner(booking);
    } catch (error) {
      this.logger.error('Failed to send new booking email to owner',
        error instanceof Error ? error.stack : String(error), {
        bookingId: booking.id, tenantId,
      });
    }

    // 3. Push notification to tenant
    try {
      const pushEnabled = await this.isPushEnabled(tenantId, 'pushNewBooking');
      if (pushEnabled) {
        const dateStr = this.formatBookingDate(booking.date, booking.startTime);
        await this.pushService.sendToTenant(tenantId, {
          title: '\u{1F4C5} Nueva reserva',
          body: `${booking.customer.name} reservó ${booking.service.name} para el ${dateStr}`,
          url: '/turnos',
          tag: 'new-booking',
        });
      }
    } catch (error) {
      this.logger.error('Failed to send push notification',
        error instanceof Error ? error.stack : String(error), {
        bookingId: booking.id, tenantId,
      });
    }
  }

  /**
   * Handle booking cancelled event.
   */
  @OnEvent(BookingEvent.CANCELLED, { async: true })
  async handleBookingCancelled(payload: BookingCancelledPayload): Promise<void> {
    this.logger.log('Handling booking cancelled event', {
      bookingId: payload.booking.id,
      tenantId: payload.tenantId,
      cancelledBy: payload.cancelledBy,
      action: 'booking.event.cancelled',
    });

    try {
      await this.notificationsService.sendBookingCancellation(payload.booking);
    } catch (error) {
      this.logger.error('Failed to send booking cancellation',
        error instanceof Error ? error.stack : String(error), {
        bookingId: payload.booking.id,
        tenantId: payload.tenantId,
      });
    }

    // Push notification for cancellation
    try {
      const pushEnabled = await this.isPushEnabled(payload.tenantId, 'pushCancellation');
      if (pushEnabled) {
        const dateStr = this.formatBookingDate(payload.booking.date, payload.booking.startTime);
        await this.pushService.sendToTenant(payload.tenantId, {
          title: '\u274C Turno cancelado',
          body: `${payload.booking.customer.name} canceló su turno de ${payload.booking.service.name} del ${dateStr}`,
          url: '/turnos',
          tag: 'cancellation',
        });
      }
    } catch (error) {
      this.logger.error('Failed to send cancellation push notification',
        error instanceof Error ? error.stack : String(error), {
        bookingId: payload.booking.id,
        tenantId: payload.tenantId,
      });
    }
  }

  /**
   * Handle reminder due event (called by scheduler).
   */
  @OnEvent(BookingEvent.REMINDER_DUE, { async: true })
  async handleReminderDue(payload: BookingEventPayload): Promise<void> {
    this.logger.log('Handling booking reminder event', {
      bookingId: payload.booking.id,
      tenantId: payload.tenantId,
      action: 'booking.event.reminder',
    });

    try {
      await this.notificationsService.sendBookingReminder(payload.booking);
    } catch (error) {
      this.logger.error('Failed to send booking reminder',
        error instanceof Error ? error.stack : String(error), {
        bookingId: payload.booking.id,
        tenantId: payload.tenantId,
      });
    }

    // Push notification for reminder
    try {
      const pushEnabled = await this.isPushEnabled(payload.tenantId, 'pushReminder');
      if (pushEnabled) {
        await this.pushService.sendToTenant(payload.tenantId, {
          title: '\u23F0 Próximo turno',
          body: `${payload.booking.customer.name} tiene turno de ${payload.booking.service.name} hoy a las ${payload.booking.startTime} hs`,
          url: '/turnos',
          tag: 'reminder',
        });
      }
    } catch (error) {
      this.logger.error('Failed to send reminder push notification',
        error instanceof Error ? error.stack : String(error), {
        bookingId: payload.booking.id,
        tenantId: payload.tenantId,
      });
    }
  }
}
