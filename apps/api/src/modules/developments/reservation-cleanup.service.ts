import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReservationCleanupService {
  private readonly logger = new Logger(ReservationCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/15 * * * *') // Every 15 minutes
  async handleExpiredReservations() {
    try {
      const result = await this.prisma.projectUnit.updateMany({
        where: {
          status: 'reserved',
          reservationExpiresAt: { lt: new Date(), not: null },
        },
        data: {
          status: 'available',
          reservedAt: null,
          reservationExpiresAt: null,
          reservedByName: null,
          reservedByPhone: null,
          reservedByEmail: null,
        },
      });
      if (result.count > 0) {
        this.logger.log(`Released ${result.count} expired reservation(s)`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired reservations', error);
    }
  }
}
