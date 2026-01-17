import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { WhatsAppService } from './whatsapp.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [forwardRef(() => BookingsModule)],
  providers: [NotificationsService, EmailService, WhatsAppService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
