import { Module, forwardRef } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PublicBookingsController } from './public-bookings.controller';
import { SchedulesModule } from '../schedules/schedules.module';
import { CustomersModule } from '../customers/customers.module';
import { ServicesModule } from '../services/services.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    SchedulesModule,
    CustomersModule,
    ServicesModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [BookingsController, PublicBookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
