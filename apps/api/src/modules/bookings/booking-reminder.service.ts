import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingEvent } from '../../common/events';

@Injectable()
export class BookingReminderService {
  private readonly logger = new Logger(BookingReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Every 15 minutes: find confirmed bookings in the next 2 hours
   * that haven't had a reminder sent yet, and emit REMINDER_DUE event.
   */
  @Cron('*/15 * * * *')
  async handleBookingReminders() {
    try {
      const now = new Date();
      const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Format times for comparison (HH:mm)
      const nowTime = now.toTimeString().slice(0, 5);
      const in2HoursTime = in2Hours.toTimeString().slice(0, 5);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Find bookings happening in the next 2 hours that need reminders
      const bookings = await this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          reminderSent: false,
          date: today,
          startTime: {
            gte: nowTime,
            lte: in2HoursTime,
          },
        },
        include: {
          service: true,
          customer: true,
          employee: true,
        },
        take: 100,
      });

      if (bookings.length === 0) return;

      this.logger.log(`Sending ${bookings.length} booking reminders`);

      for (const booking of bookings) {
        try {
          this.eventEmitter.emit(BookingEvent.REMINDER_DUE, {
            booking,
            tenantId: booking.tenantId,
          });

          await this.prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true },
          });
        } catch (error) {
          this.logger.error(`Failed to send reminder for booking ${booking.id}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error('Booking reminder cron failed', error);
    }
  }
}
