import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PublicBookingsController } from './public-bookings.controller';
import { BookingCleanupService } from './booking-cleanup.service';
import { BookingReminderService } from './booking-reminder.service';
import { BookingVideoListener } from './booking-video.listener';
import { AssignmentService } from './assignment.service';
import { SchedulesModule } from '../schedules/schedules.module';
import { CustomersModule } from '../customers/customers.module';
import { ServicesModule } from '../services/services.module';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';
import { VideoIntegrationModule } from '../video-integration/video-integration.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { IntakeFormsModule } from '../intake-forms/intake-forms.module';

// Note: NotificationsModule removed - communication via EventEmitter
// This breaks the circular dependency pattern

@Module({
  imports: [
    ConfigModule,
    SchedulesModule,
    CustomersModule,
    ServicesModule,
    MercadoPagoModule,
    VideoIntegrationModule,
    SubscriptionsModule,
    IntakeFormsModule,
  ],
  controllers: [BookingsController, PublicBookingsController],
  providers: [BookingsService, BookingCleanupService, BookingReminderService, BookingVideoListener, AssignmentService],
  exports: [BookingsService, AssignmentService],
})
export class BookingsModule {}
