import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Daily at 8:00 AM Argentina (11:00 UTC):
   * 1. Auto-downgrade expired trials
   * 2. Send trial expiring warnings (3 days, 1 day)
   */
  @Cron('0 11 * * *')
  async handleTrialExpirations() {
    this.logger.log('Running trial expiration check...');

    try {
      // 1. Find and auto-downgrade expired trials
      const expiredTrials = await this.prisma.subscription.findMany({
        where: {
          status: 'TRIALING',
          trialEndAt: { lt: new Date() },
        },
        select: { tenantId: true },
      });

      for (const sub of expiredTrials) {
        try {
          await this.subscriptionsService.getSubscription(sub.tenantId);
          this.logger.log(`Auto-downgraded expired trial for tenant ${sub.tenantId}`);
        } catch (error) {
          this.logger.error(`Failed to downgrade tenant ${sub.tenantId}: ${error.message}`);
        }
      }

      // 2. Send warnings for trials expiring in 3 days or 1 day
      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

      const soonExpiring = await this.prisma.subscription.findMany({
        where: {
          status: 'TRIALING',
          trialEndAt: {
            gt: now,
            lte: in3Days,
          },
        },
        select: { tenantId: true },
      });

      for (const sub of soonExpiring) {
        try {
          await this.subscriptionsService.checkTrialStatus(sub.tenantId);
        } catch (error) {
          this.logger.error(`Failed to check trial status for tenant ${sub.tenantId}: ${error.message}`);
        }
      }

      this.logger.log(`Trial check complete: ${expiredTrials.length} expired, ${soonExpiring.length} warnings sent`);
    } catch (error) {
      this.logger.error('Trial expiration cron failed', error);
    }
  }

  /**
   * Daily at 9:00 AM Argentina (12:00 UTC):
   * Move ACTIVE paid subscriptions with expired currentPeriodEnd to PAST_DUE
   */
  @Cron('0 12 * * *')
  async handlePaidSubscriptionExpirations() {
    this.logger.log('Running paid subscription expiration check...');

    try {
      // Find ACTIVE subscriptions where currentPeriodEnd has passed
      // Exclude free plan (currentPeriodEnd set to year 12025+)
      const gracePeriodDays = 3;
      const graceDate = new Date();
      graceDate.setDate(graceDate.getDate() - gracePeriodDays);

      const expired = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lt: graceDate,
            // Only paid plans: exclude "forever" dates (year > 2100)
            gt: new Date('2020-01-01'),
          },
          plan: {
            slug: { not: 'gratis' },
          },
        },
        include: {
          plan: true,
          tenant: {
            include: {
              users: { where: { role: 'OWNER' }, take: 1 },
            },
          },
        },
      });

      for (const sub of expired) {
        try {
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'PAST_DUE' },
          });

          this.logger.warn(
            `Subscription for tenant ${sub.tenantId} (${sub.plan.name}) moved to PAST_DUE — period ended ${sub.currentPeriodEnd?.toISOString()}`,
          );

          // TODO: Enviar email de suscripción vencida cuando se implemente el template
          const owner = sub.tenant?.users?.[0];
          if (owner) {
            this.logger.log(`Subscription expired notification pending for ${owner.email} (tenant ${sub.tenantId})`);
          }
        } catch (error) {
          this.logger.error(`Failed to expire subscription for tenant ${sub.tenantId}: ${error.message}`);
        }
      }

      this.logger.log(`Paid subscription check complete: ${expired.length} moved to PAST_DUE`);
    } catch (error) {
      this.logger.error('Paid subscription expiration cron failed', error);
    }
  }
}
