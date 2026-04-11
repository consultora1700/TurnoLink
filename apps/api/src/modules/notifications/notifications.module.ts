import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { WhatsAppService } from './whatsapp.service';
import { BookingEventsListener } from './booking-events.listener';
import { OrderEventsListener } from './order-events.listener';
import { LoyaltyEmailListener } from './loyalty-events.listener';
import { EmailNotificationsService } from './email-notifications.service';
import { EmailProcessor } from './email.processor';
import { PushModule } from '../push/push.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [ConfigModule, PushModule, forwardRef(() => ReviewsModule)],
  providers: [
    NotificationsService,
    EmailService,
    WhatsAppService,
    BookingEventsListener, // Listens to booking events
    OrderEventsListener, // Listens to order events (e-commerce)
    LoyaltyEmailListener, // Listens to loyalty events (points, tiers, sorteos)
    EmailProcessor, // BullMQ worker for email jobs
    EmailNotificationsService,
  ],
  exports: [NotificationsService, EmailNotificationsService],
})
export class NotificationsModule {}
