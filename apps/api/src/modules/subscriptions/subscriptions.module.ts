import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionPlansController, IndustryGroupsController } from './subscription-plans.controller';
import { AdminIndustryGroupsController, AdminPlansController } from './admin-plans.controller';
import { AdminPromoCodesController, PromoCodesController } from './promo-codes.controller';
import { PromoCodesService } from './promo-codes.service';
import { SubscriptionCronService } from './subscription-cron.service';
import { PlanPriceUpdateListener } from './plan-price-update.listener';
import { PlatformModule } from '../platform/platform.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [PrismaModule, ConfigModule, forwardRef(() => PlatformModule), NotificationsModule, forwardRef(() => AdminModule)],
  controllers: [
    SubscriptionsController,
    SubscriptionPlansController,
    IndustryGroupsController,
    AdminIndustryGroupsController,
    AdminPlansController,
    AdminPromoCodesController,
    PromoCodesController,
  ],
  providers: [SubscriptionsService, PromoCodesService, SubscriptionCronService, PlanPriceUpdateListener],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
