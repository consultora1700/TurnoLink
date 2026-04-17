import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationsService } from './notifications.service';
import { EmailNotificationsService } from './email-notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EMAIL_QUEUE } from '../../common/queue/queue.module';
import { getTermsForTenant, bookingGender } from '@common/utils/rubro-terms';

export type EmailJobName =
  | 'booking-confirmation'
  | 'booking-pending'
  | 'booking-owner-notification'
  | 'booking-cancellation'
  | 'booking-reminder'
  | 'booking-video-link'
  | 'review-request'
  | 'plan-price-change';

export interface EmailJobData {
  type: EmailJobName;
  booking: any; // BookingWithDetails serialized
  reviewData?: {
    to: string;
    customerName: string;
    businessName: string;
    serviceName: string;
    reviewUrl: string;
  };
  priceChangeData?: {
    to: string;
    name: string;
    planName: string;
    billingPeriod: string;
    oldPrice: number;
    newPrice: number;
    currency: string;
  };
}

@Injectable()
@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailNotificationsService: EmailNotificationsService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { type, booking, reviewData } = job.data;

    this.logger.log(`Processing email job ${job.id}: ${type}${booking ? ` for booking ${booking.id}` : ''}`);

    switch (type) {
      case 'booking-confirmation':
        await this.notificationsService.sendBookingConfirmation(booking);
        break;
      case 'booking-pending':
        await this.notificationsService.sendBookingPending(booking);
        break;
      case 'booking-owner-notification':
        await this.notificationsService.sendNewBookingToOwner(booking);
        break;
      case 'booking-cancellation':
        await this.notificationsService.sendBookingCancellation(booking);
        break;
      case 'booking-reminder':
        await this.notificationsService.sendBookingReminder(booking);
        break;
      case 'booking-video-link':
        await this.processVideoLinkEmail(booking);
        break;
      case 'review-request':
        if (reviewData) {
          await this.emailNotificationsService.sendReviewRequestEmail(
            reviewData.to,
            reviewData.customerName,
            reviewData.businessName,
            reviewData.serviceName,
            reviewData.reviewUrl,
          );
        }
        break;
      case 'plan-price-change':
        if (job.data.priceChangeData) {
          const d = job.data.priceChangeData;
          if (!d.to || !d.planName || d.oldPrice === undefined || d.newPrice === undefined) {
            this.logger.error(`Invalid priceChangeData in job ${job.id}: missing required fields`);
            break;
          }
          await this.emailNotificationsService.sendPlanPriceChangeEmail(
            d.to,
            d.name || 'Usuario',
            d.planName,
            d.billingPeriod || 'MONTHLY',
            d.oldPrice,
            d.newPrice,
            d.currency || 'ARS',
          );
        }
        break;
      default:
        this.logger.warn(`Unknown email job type: ${type}`);
    }
  }

  /**
   * Fetch full booking details and send video link email to customer + owner.
   */
  private async processVideoLinkEmail(data: any): Promise<void> {
    const fullBooking = await this.prisma.booking.findUnique({
      where: { id: data.id },
      include: {
        service: { select: { name: true, duration: true } },
        product: { select: { name: true, price: true } },
        customer: { select: { name: true, phone: true, email: true } },
        tenant: { select: { name: true, slug: true, email: true, settings: true } },
      },
    });

    if (!fullBooking || !data.videoJoinUrl) return;

    const settings = typeof fullBooking.tenant?.settings === 'string'
      ? JSON.parse(fullBooking.tenant.settings)
      : fullBooking.tenant?.settings || {};
    const terms = getTermsForTenant(settings);
    const g = bookingGender(terms);

    const date = new Date(fullBooking.date).toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    // Send to customer
    const customerEmail = fullBooking.customerEmail || fullBooking.customer?.email;
    if (customerEmail) {
      await this.emailNotificationsService.sendVideoLinkEmail(
        customerEmail,
        fullBooking.customer.name,
        fullBooking.tenant?.name || '',
        date,
        fullBooking.startTime,
        (fullBooking.service?.name ?? fullBooking.product?.name ?? 'Sin detalle'),
        data.videoJoinUrl,
        fullBooking.tenant?.slug || '',
        terms,
      );
      this.logger.log(`Video link email sent to customer ${customerEmail} for booking ${data.id}`);
    }

    // Send to owner (update with video link)
    const ownerEmail = settings.notificationEmail || fullBooking.tenant?.email;
    if (ownerEmail) {
      await this.emailNotificationsService.sendVideoLinkEmail(
        ownerEmail,
        fullBooking.tenant?.name || 'Equipo',
        fullBooking.tenant?.name || '',
        date,
        fullBooking.startTime,
        (fullBooking.service?.name ?? fullBooking.product?.name ?? 'Sin detalle'),
        data.videoJoinUrl,
        fullBooking.tenant?.slug || '',
        terms,
        fullBooking.customer.name, // extra: show customer name to owner
      );
      this.logger.log(`Video link email sent to owner ${ownerEmail} for booking ${data.id}`);
    }
  }
}
