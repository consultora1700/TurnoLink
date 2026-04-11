import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PushModule } from '../push/push.module';
import { JobPostingsService } from './job-postings.service';
import { JobPostingsBusinessController } from './job-postings-business.controller';
import { JobPostingsProfessionalController } from './job-postings-professional.controller';

@Module({
  imports: [PrismaModule, NotificationsModule, PushModule],
  controllers: [
    JobPostingsBusinessController,
    JobPostingsProfessionalController,
  ],
  providers: [JobPostingsService],
  exports: [JobPostingsService],
})
export class JobPostingsModule {}
