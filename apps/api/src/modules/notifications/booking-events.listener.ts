import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { PushService } from '../push/push.service';
import { ReviewsService } from '../reviews/reviews.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLoggerService } from '../../common/logger';
import {
  BookingEvent,
  BookingCreatedPayload,
  BookingCancelledPayload,
  BookingEventPayload,
  BookingVideoCreatedPayload,
} from '../../common/events';
import { CacheService } from '../../common/cache';
import { EMAIL_QUEUE } from '../../common/queue/queue.module';
import { EmailJobData } from './email.processor';
import { getTermsForTenant, bookingGender } from '@common/utils/rubro-terms';

/**
 * Event listener that handles booking events and triggers notifications.
 * This decouples BookingsService from NotificationsService.
 */
@Injectable()
export class BookingEventsListener {
  private readonly webUrl: string;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
    private readonly reviewsService: ReviewsService,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {
    this.logger.setContext('BookingEventsListener');
    this.webUrl = this.configService.get<string>('WEB_URL') || 'https://turnolink.com.ar';
  }

  /**
   * Get parsed tenant settings, using cache to avoid repeated DB queries.
   */
  private async getTenantPushSettings(tenantId: string): Promise<Record<string, unknown>> {
    try {
      const cached = await this.cacheService.getTenantSettings(tenantId);
      if (cached?.raw) return cached.raw;

      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { settings: true },
      });
      if (!tenant?.settings) return {};
      const settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : tenant.settings;

      // Cache for reuse by other methods
      await this.cacheService.setTenantSettings(tenantId, { raw: settings });

      return settings as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  /**
   * Check if a specific push notification type is enabled for a tenant.
   */
  private async isPushEnabled(tenantId: string, settingKey: string): Promise<boolean> {
    const settings = await this.getTenantPushSettings(tenantId);
    return (settings[settingKey] as boolean) ?? true;
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
  private readonly emailJobOptions = {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 60000 },
    removeOnComplete: true,
    removeOnFail: false,
  };

  private async sendAllBookingNotifications(
    booking: BookingCreatedPayload['booking'],
    tenantId: string,
  ): Promise<void> {
    const isProductBooking = !!(booking as any).productId && !(booking as any).serviceId;

    // 1. Customer confirmation — enqueue (WhatsApp + email with retry)
    // Skip for product bookings (in-store sales don't need customer confirmation)
    if (!isProductBooking) {
      try {
        await this.emailQueue.add('booking-confirmation', {
          type: 'booking-confirmation',
          booking: JSON.parse(JSON.stringify(booking)),
        } as EmailJobData, this.emailJobOptions);
      } catch (error) {
        this.logger.error('Failed to enqueue booking confirmation',
          error instanceof Error ? error.stack : String(error), {
          bookingId: booking.id, tenantId,
        });
      }
    }

    // 2. Email to business owner — enqueue
    try {
      await this.emailQueue.add('booking-owner-notification', {
        type: 'booking-owner-notification',
        booking: JSON.parse(JSON.stringify(booking)),
      } as EmailJobData, this.emailJobOptions);
    } catch (error) {
      this.logger.error('Failed to enqueue owner notification',
        error instanceof Error ? error.stack : String(error), {
        bookingId: booking.id, tenantId,
      });
    }

    // 3. Push notification to tenant (still sync — lightweight)
    try {
      const pushEnabled = await this.isPushEnabled(tenantId, 'pushNewBooking');
      if (pushEnabled) {
        const settings = await this.getTenantPushSettings(tenantId);
        const terms = getTermsForTenant(settings as any);
        const g = bookingGender(terms);
        const dateStr = this.formatBookingDate(booking.date, booking.startTime);
        const itemName = (booking.service?.name ?? booking.product?.name ?? 'Sin detalle');

        if (isProductBooking) {
          await this.pushService.sendToTenant(tenantId, {
            title: 'Venta registrada',
            body: `${booking.customer.name} — ${itemName}, ${dateStr}`,
            url: '/autogestion',
            tag: 'new-sale',
          });
        } else {
          await this.pushService.sendToTenant(tenantId, {
            title: `Nuev${g.suffix} ${terms.bookingSingular.toLowerCase()}`,
            body: `${booking.customer.name} — ${itemName}, ${dateStr}`,
            url: '/turnos',
            tag: 'new-booking',
          });
        }
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
      await this.emailQueue.add('booking-cancellation', {
        type: 'booking-cancellation',
        booking: JSON.parse(JSON.stringify(payload.booking)),
      } as EmailJobData, this.emailJobOptions);
    } catch (error) {
      this.logger.error('Failed to enqueue booking cancellation',
        error instanceof Error ? error.stack : String(error), {
        bookingId: payload.booking.id,
        tenantId: payload.tenantId,
      });
    }

    // Push notification for cancellation
    try {
      const pushEnabled = await this.isPushEnabled(payload.tenantId, 'pushCancellation');
      if (pushEnabled) {
        const settings = await this.getTenantPushSettings(payload.tenantId);
        const terms = getTermsForTenant(settings as any);
        const g = bookingGender(terms);
        const dateStr = this.formatBookingDate(payload.booking.date, payload.booking.startTime);
        await this.pushService.sendToTenant(payload.tenantId, {
          title: `${terms.bookingSingular} cancelad${g.suffix}`,
          body: `${payload.booking.customer.name} canceló ${(payload.booking.service?.name ?? payload.booking.product?.name ?? 'Sin detalle')} del ${dateStr}`,
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
      await this.emailQueue.add('booking-reminder', {
        type: 'booking-reminder',
        booking: JSON.parse(JSON.stringify(payload.booking)),
      } as EmailJobData, this.emailJobOptions);
    } catch (error) {
      this.logger.error('Failed to enqueue booking reminder',
        error instanceof Error ? error.stack : String(error), {
        bookingId: payload.booking.id,
        tenantId: payload.tenantId,
      });
    }

    // Push notification for reminder
    try {
      const pushEnabled = await this.isPushEnabled(payload.tenantId, 'pushReminder');
      if (pushEnabled) {
        const settings = await this.getTenantPushSettings(payload.tenantId);
        const terms = getTermsForTenant(settings as any);
        await this.pushService.sendToTenant(payload.tenantId, {
          title: `Próxim${terms.bookingSingular.toLowerCase().endsWith('o') ? 'o' : 'a'} ${terms.bookingSingular.toLowerCase()}`,
          body: `${payload.booking.customer.name} — ${(payload.booking.service?.name ?? payload.booking.product?.name ?? 'Sin detalle')} hoy a las ${payload.booking.startTime}`,
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

  /**
   * Handle booking completed event.
   * Schedules a review request email 2 hours after the booking ends.
   */
  @OnEvent(BookingEvent.COMPLETED, { async: true })
  async handleBookingCompleted(payload: BookingEventPayload): Promise<void> {
    this.logger.log('Handling booking completed event — scheduling review request', {
      bookingId: payload.booking.id,
      tenantId: payload.tenantId,
      action: 'booking.event.completed',
    });

    try {
      const booking = payload.booking;

      // Only send review request if customer has email
      if (!booking.customer.email) {
        this.logger.log('Skipping review request — customer has no email', {
          bookingId: booking.id,
        });
        return;
      }

      // Check if review already exists for this booking
      const existingReview = await this.prisma.review.findUnique({
        where: { bookingId: booking.id },
      });
      if (existingReview) {
        this.logger.log('Skipping review request — review already exists', {
          bookingId: booking.id,
        });
        return;
      }

      // Get tenant info for slug and name
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: payload.tenantId },
        select: { slug: true, name: true },
      });
      if (!tenant) return;

      // Generate review token
      const token = this.reviewsService.generateReviewToken(
        booking.id,
        booking.customerId,
        payload.tenantId,
      );

      const reviewUrl = `${this.webUrl}/${tenant.slug}/review?token=${token}&bookingId=${booking.id}`;

      // Schedule email 2 hours after completion
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

      await this.emailQueue.add('review-request', {
        type: 'review-request',
        booking: JSON.parse(JSON.stringify(booking)),
        reviewData: {
          to: booking.customer.email,
          customerName: booking.customer.name,
          businessName: tenant.name,
          serviceName: (booking.service?.name ?? booking.product?.name ?? 'Sin detalle'),
          reviewUrl,
        },
      } as EmailJobData, {
        ...this.emailJobOptions,
        delay: TWO_HOURS_MS,
      });

      this.logger.log('Review request email scheduled for 2 hours', {
        bookingId: booking.id,
        tenantSlug: tenant.slug,
      });
    } catch (error) {
      this.logger.error('Failed to schedule review request email',
        error instanceof Error ? error.stack : String(error), {
        bookingId: payload.booking.id,
        tenantId: payload.tenantId,
      });
    }
  }

  /**
   * Handle video meeting created event.
   * Sends a follow-up email with the video join URL to both customer and owner.
   */
  @OnEvent(BookingEvent.VIDEO_CREATED, { async: true })
  async handleVideoCreated(payload: BookingVideoCreatedPayload): Promise<void> {
    this.logger.log('Handling video created event — sending video link email', {
      bookingId: payload.bookingId,
      tenantId: payload.tenantId,
      action: 'booking.event.video_created',
    });

    try {
      await this.emailQueue.add('booking-video-link', {
        type: 'booking-video-link',
        booking: {
          id: payload.bookingId,
          tenantId: payload.tenantId,
          videoJoinUrl: payload.videoJoinUrl,
          videoProvider: payload.videoProvider,
        },
      } as EmailJobData, this.emailJobOptions);
    } catch (error) {
      this.logger.error('Failed to enqueue video link email',
        error instanceof Error ? error.stack : String(error), {
        bookingId: payload.bookingId,
        tenantId: payload.tenantId,
      });
    }
  }
}
