import { Module } from '@nestjs/common';
import { DevelopmentsService } from './developments.service';
import { DevelopmentsController, PublicDevelopmentsController } from './developments.controller';
import { ReservationCleanupService } from './reservation-cleanup.service';
import { PaymentOverdueService } from './payment-overdue.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DevelopmentsController, PublicDevelopmentsController],
  providers: [DevelopmentsService, ReservationCleanupService, PaymentOverdueService],
  exports: [DevelopmentsService],
})
export class DevelopmentsModule {}
