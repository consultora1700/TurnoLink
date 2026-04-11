import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailNotificationsService } from './email-notifications.service';
import {
  LoyaltyEvent,
  LoyaltyPointsEarnedPayload,
  TierUpgradedPayload,
  SorteoRegistrationPayload,
  SorteoWinnerPayload,
} from '../../common/events/loyalty.events';

@Injectable()
export class LoyaltyEmailListener {
  private readonly logger = new Logger(LoyaltyEmailListener.name);

  constructor(
    private readonly emailService: EmailNotificationsService,
  ) {}

  @OnEvent(LoyaltyEvent.POINTS_EARNED, { async: true })
  async handlePointsEarned(payload: LoyaltyPointsEarnedPayload): Promise<void> {
    if (!payload.customerEmail) return;
    try {
      await this.emailService.sendLoyaltyPointsEmail(
        payload.customerEmail,
        payload.customerName,
        payload.points,
        payload.totalBalance,
        payload.description,
        payload.programName,
        payload.currencyPerPoint,
        payload.tenantName,
      );
      this.logger.log(`Sent loyalty points email to ${payload.customerEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send loyalty points email: ${error.message}`, error.stack);
    }
  }

  @OnEvent(LoyaltyEvent.TIER_UPGRADED, { async: true })
  async handleTierUpgraded(payload: TierUpgradedPayload): Promise<void> {
    if (!payload.customerEmail) return;
    try {
      await this.emailService.sendTierUpgradeEmail(
        payload.customerEmail,
        payload.customerName,
        payload.newTierName,
        payload.newTierColor,
        payload.benefitDescription,
        payload.tenantName,
      );
      this.logger.log(`Sent tier upgrade email to ${payload.customerEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send tier upgrade email: ${error.message}`, error.stack);
    }
  }

  @OnEvent(LoyaltyEvent.SORTEO_REGISTRATION, { async: true })
  async handleSorteoRegistration(payload: SorteoRegistrationPayload): Promise<void> {
    if (!payload.participantEmail) return;
    try {
      await this.emailService.sendSorteoRegistrationEmail(
        payload.participantEmail,
        payload.participantName,
        payload.sorteoTitle,
        payload.tenantName,
      );
      this.logger.log(`Sent sorteo registration email to ${payload.participantEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send sorteo registration email: ${error.message}`, error.stack);
    }
  }

  @OnEvent(LoyaltyEvent.SORTEO_WINNER, { async: true })
  async handleSorteoWinner(payload: SorteoWinnerPayload): Promise<void> {
    if (!payload.winnerEmail) return;
    try {
      await this.emailService.sendSorteoWinnerEmail(
        payload.winnerEmail,
        payload.winnerName,
        payload.sorteoTitle,
        payload.prizeName,
        payload.tenantName,
      );
      this.logger.log(`Sent sorteo winner email to ${payload.winnerEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send sorteo winner email: ${error.message}`, error.stack);
    }
  }
}
