import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);
  private static readonly MAX_SESSION_HOURS = 6;
  private static readonly AGENT_OFFLINE_SECONDS = 90;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

  /**
   * Every minute, check for print agents that haven't been seen recently.
   * Emits a dashboard alert so the kitchen knows printing is down.
   */
  @Cron('* * * * *')
  async handleAgentWatchdog(): Promise<void> {
    try {
      const cutoff = new Date();
      cutoff.setSeconds(cutoff.getSeconds() - SessionCleanupService.AGENT_OFFLINE_SECONDS);

      // Find tenants that have active agents but all are offline
      const offlineAgents = await this.prisma.printAgent.findMany({
        where: {
          isActive: true,
          lastSeenAt: { lt: cutoff },
        },
        select: {
          id: true,
          tenantId: true,
          name: true,
          lastSeenAt: true,
        },
      });

      if (offlineAgents.length === 0) return;

      // Group by tenant and emit one alert per tenant
      const byTenant = new Map<string, typeof offlineAgents>();
      for (const agent of offlineAgents) {
        if (!byTenant.has(agent.tenantId)) byTenant.set(agent.tenantId, []);
        byTenant.get(agent.tenantId)!.push(agent);
      }

      // Only alert if the tenant has kitchen stations configured (uses the feature)
      for (const [tenantId, agents] of byTenant) {
        const stationCount = await this.prisma.kitchenStation.count({
          where: { tenantId, isActive: true },
        });
        if (stationCount === 0) continue;

        // Check if there are pending comandas — only alert if there's actual risk
        const pendingCount = await this.prisma.kitchenComanda.count({
          where: { tenantId, status: { in: ['PENDING', 'PRINT_FAILED'] } },
        });

        this.eventEmitter.emit('gastro.agent.offline', {
          tenantId,
          agents: agents.map((a) => ({
            id: a.id,
            name: a.name,
            lastSeenAt: a.lastSeenAt?.toISOString(),
          })),
          pendingComandas: pendingCount,
        });
      }
    } catch (error) {
      this.logger.error('Agent watchdog cron failed', error);
    }
  }
}
