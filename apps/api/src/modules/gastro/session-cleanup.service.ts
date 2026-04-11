import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);
  private static readonly MAX_SESSION_HOURS = 6;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Every 30 minutes, close table sessions that have been open for more than 6 hours
   * without any activity. This prevents "ghost" occupied tables when customers leave
   * without requesting the bill.
   */
  @Cron('*/30 * * * *')
  async handleStaleSessionsCleanup(): Promise<void> {
    try {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - SessionCleanupService.MAX_SESSION_HOURS);

      // Find stale sessions: opened before cutoff, still in active states
      const staleSessions = await this.prisma.tableSession.findMany({
        where: {
          openedAt: { lt: cutoff },
          status: { in: ['OCCUPIED', 'ORDERING', 'BILL_REQUESTED', 'PAYMENT_ENABLED'] },
        },
        select: { id: true, tenantId: true, tableNumber: true, status: true, openedAt: true },
      });

      if (staleSessions.length === 0) return;

      // Close all stale sessions
      const result = await this.prisma.tableSession.updateMany({
        where: {
          id: { in: staleSessions.map((s) => s.id) },
        },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
      });

      this.logger.log(
        `Closed ${result.count} stale table session(s) older than ${SessionCleanupService.MAX_SESSION_HOURS}h`,
      );
    } catch (error) {
      this.logger.error('Session cleanup cron failed', error);
    }
  }
}
