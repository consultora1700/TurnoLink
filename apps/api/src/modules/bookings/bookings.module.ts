import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PublicBookingsController } from './public-bookings.controller';
import { BookingCleanupService } from './booking-cleanup.service';
import { SchedulesModule } from '../schedules/schedules.module';
import { CustomersModule } from '../customers/customers.module';
import { ServicesModule } from '../services/services.module';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';

// Note: NotificationsModule removed - communication via EventEmitter
// This breaks the circular dependency pattern

@Module({
  imports: [
    ConfigModule,
    SchedulesModule,
    CustomersModule,
    ServicesModule,
    MercadoPagoModule,
  ],
  controllers: [BookingsController, PublicBookingsController],
  providers: [BookingsService, BookingCleanupService],
  exports: [BookingsService],
})
export class BookingsModule {}
