import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { WhatsAppService } from './whatsapp.service';
import { BookingEventsListener } from './booking-events.listener';
import { EmailNotificationsService } from './email-notifications.service';
import { PushModule } from '../push/push.module';

@Module({
  imports: [ConfigModule, PushModule],
  providers: [
    NotificationsService,
    EmailService,
    WhatsAppService,
    BookingEventsListener, // Listens to booking events
    EmailNotificationsService,
  ],
  exports: [NotificationsService, EmailNotificationsService],
})
export class NotificationsModule {}
