import { Module } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyTiersService } from './loyalty-tiers.service';
import { LoyaltyRewardsService } from './loyalty-rewards.service';
import { SorteoService } from './sorteo.service';
import { LoyaltyController } from './loyalty.controller';
import { SorteoController } from './sorteo.controller';
import { PublicLoyaltyController } from './public-loyalty.controller';
import { PublicSorteoController } from './public-sorteo.controller';
import { LoyaltyEventsListener } from './loyalty-events.listener';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [
    LoyaltyController,
    SorteoController,
    PublicLoyaltyController,
    PublicSorteoController,
  ],
  providers: [
    LoyaltyService,
    LoyaltyTiersService,
    LoyaltyRewardsService,
    SorteoService,
    LoyaltyEventsListener,
  ],
  exports: [LoyaltyService, SorteoService],
})
export class LoyaltyModule {}
