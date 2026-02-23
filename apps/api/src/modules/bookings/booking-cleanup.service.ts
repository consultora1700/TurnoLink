import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingEvent, BookingCancelledPayload } from '../../common/events';

/**
 * Automatically cancels PENDING bookings that require a deposit
 * but haven't been paid within 20 minutes.
 * Runs every 5 minutes.
 */
@Injectable()
export class BookingCleanupService {
  private readonly logger = new Logger(BookingCleanupService.name);
  private static readonly EXPIRATION_MINUTES = 20;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredBookings(): Promise<void> {
    const cutoff = new Date(
      Date.now() - BookingCleanupService.EXPIRATION_MINUTES * 60 * 1000,
    );

    // Find PENDING bookings with unpaid deposits created before cutoff
    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: 'PENDING',
        depositAmount: { not: null },
        depositPaid: false,
        createdAt: { lt: cutoff },
      },
      include: {
        service: true,
        customer: true,
        employee: true,
      },
    });

    if (expiredBookings.length === 0) {
      return;
    }

    this.logger.log(`Found ${expiredBookings.length} expired unpaid bookings to cancel`);

    for (const booking of expiredBookings) {
      try {
        // Cancel the booking
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });

        // Mark associated DepositPayment as EXPIRED if exists
        await this.prisma.depositPayment.updateMany({
          where: {
            bookingId: booking.id,
            status: 'PENDING',
          },
          data: { status: 'EXPIRED' },
        });

        // Emit cancellation event for notifications
        const eventPayload: BookingCancelledPayload = {
          booking: { ...booking, status: 'CANCELLED' },
          tenantId: booking.tenantId,
          cancelledBy: 'system',
        };
        this.eventEmitter.emit(BookingEvent.CANCELLED, eventPayload);

        this.logger.log(
          `Auto-cancelled expired booking ${booking.id} (tenant: ${booking.tenantId}, created: ${booking.createdAt.toISOString()})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to cancel expired booking ${booking.id}: ${error.message}`,
        );
      }
    }
  }
}
