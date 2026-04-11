import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { PlatformService } from '../platform/platform.service';
import { SubscriptionEvent, PlanPriceUpdatedPayload } from '../../common/events';
import { EMAIL_QUEUE } from '../../common/queue/queue.module';
import { EmailJobData } from '../notifications/email.processor';

@Injectable()
export class PlanPriceUpdateListener {
  private readonly logger = new Logger(PlanPriceUpdateListener.name);

  private readonly emailJobOptions = {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 60000 },
    removeOnComplete: true,
    removeOnFail: false,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly platformService: PlatformService,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  @OnEvent(SubscriptionEvent.PLAN_PRICE_UPDATED, { async: true })
  async handlePlanPriceUpdated(payload: PlanPriceUpdatedPayload): Promise<void> {
    const { planId, planName, changes, currency } = payload;

    // Only process if price actually changed
    if (!changes.priceMonthly && !changes.priceYearly) {
      this.logger.log(`Plan "${planName}" name changed but no price change — skipping MP update`);
      return;
    }

    // Find all active subscriptions with MP recurring for this plan
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        planId,
        status: 'ACTIVE',
        mpSubscriptionId: { not: null },
      },
      include: {
        tenant: {
          include: {
            users: {
              where: { role: 'OWNER' },
              take: 1,
            },
          },
        },
      },
    });

    if (subscriptions.length === 0) {
      this.logger.log(`No active MP subscriptions affected by plan "${planName}" price change`);
      return;
    }

    this.logger.log(`Found ${subscriptions.length} active MP subscriptions to update for plan "${planName}"`);

    for (const subscription of subscriptions) {
      try {
        // Determine the new amount based on billing period
        // YEARLY subs only update when priceYearly changes; MONTHLY only when priceMonthly changes
        let newAmount: number | undefined;
        let oldAmount: number | undefined;

        if (subscription.billingPeriod === 'YEARLY') {
          if (changes.priceYearly) {
            newAmount = changes.priceYearly.new ?? undefined;
            oldAmount = changes.priceYearly.old ?? undefined;
          }
          // If only monthly changed, YEARLY subs are not affected — skip
        } else if (changes.priceMonthly) {
          newAmount = changes.priceMonthly.new;
          oldAmount = changes.priceMonthly.old;
        }

        if (newAmount === undefined) {
          // No relevant price change for this billing period
          continue;
        }

        // Update MP preapproval
        const mpResult = await this.platformService.updatePreapprovalAmount(
          subscription.mpSubscriptionId!,
          {
            transactionAmount: newAmount,
            reason: `Actualización de precio del plan ${planName}`,
          },
        );

        // Find owner email (may not exist)
        const owner = subscription.tenant.users?.[0];
        const ownerEmail = owner?.email || null;
        const ownerName = owner?.name || 'Usuario';

        if (!owner) {
          this.logger.warn(`No owner found for tenant ${subscription.tenantId}, skipping email`);
        }

        // Create audit record
        await this.prisma.planPriceChangeAudit.create({
          data: {
            planId,
            planName,
            subscriptionId: subscription.id,
            tenantId: subscription.tenantId,
            mpSubscriptionId: subscription.mpSubscriptionId!,
            billingPeriod: subscription.billingPeriod,
            oldPriceMonthly: changes.priceMonthly ? changes.priceMonthly.old : undefined,
            newPriceMonthly: changes.priceMonthly ? changes.priceMonthly.new : undefined,
            oldPriceYearly: changes.priceYearly?.old ?? undefined,
            newPriceYearly: changes.priceYearly?.new ?? undefined,
            oldName: changes.name?.old,
            newName: changes.name?.new,
            mpApiSuccess: mpResult.success,
            mpApiStatusCode: mpResult.statusCode,
            mpApiResponse: mpResult.response ? JSON.stringify(mpResult.response) : null,
            emailQueued: !!(ownerEmail && mpResult.success),
            emailRecipient: ownerEmail,
          },
        });

        // Queue notification email (only if MP update succeeded and we have an email)
        if (ownerEmail && mpResult.success && oldAmount !== undefined) {
          await this.emailQueue.add(
            'plan-price-change',
            {
              type: 'plan-price-change',
              booking: null,
              priceChangeData: {
                to: ownerEmail,
                name: ownerName,
                planName,
                billingPeriod: subscription.billingPeriod,
                oldPrice: oldAmount,
                newPrice: newAmount,
                currency,
              },
            } as EmailJobData,
            this.emailJobOptions,
          );
          this.logger.log(`Price change email queued for ${ownerEmail} (tenant ${subscription.tenantId})`);
        }

        if (mpResult.success) {
          this.logger.log(`MP preapproval ${subscription.mpSubscriptionId} updated: ${oldAmount} → ${newAmount}`);
        } else {
          this.logger.error(
            `Failed to update MP preapproval ${subscription.mpSubscriptionId}: ${mpResult.statusCode} - ${JSON.stringify(mpResult.response)}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error processing subscription ${subscription.id} for plan price update: ${error}`,
        );

        // Record failure audit so it's not silently lost
        try {
          await this.prisma.planPriceChangeAudit.create({
            data: {
              planId,
              planName,
              subscriptionId: subscription.id,
              tenantId: subscription.tenantId,
              mpSubscriptionId: subscription.mpSubscriptionId!,
              billingPeriod: subscription.billingPeriod,
              oldPriceMonthly: changes.priceMonthly ? changes.priceMonthly.old : undefined,
              newPriceMonthly: changes.priceMonthly ? changes.priceMonthly.new : undefined,
              oldPriceYearly: changes.priceYearly?.old ?? undefined,
              newPriceYearly: changes.priceYearly?.new ?? undefined,
              mpApiSuccess: false,
              mpApiStatusCode: 0,
              mpApiResponse: String(error),
            },
          });
        } catch (auditError) {
          this.logger.error(`Failed to create error audit record: ${auditError}`);
        }
        // Continue with next subscription
      }
    }

    this.logger.log(`Plan "${planName}" price update processing complete`);
  }
}
