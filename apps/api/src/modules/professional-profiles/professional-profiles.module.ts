import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PublicProfessionalProfilesController } from './public-professional-profiles.controller';
import { BrowseProfessionalProfilesController } from './browse-professional-profiles.controller';
import { PublicBrowseProfilesController } from './public-browse-profiles.controller';
import { SelfProfessionalProfilesController } from './self-professional-profiles.controller';
import { ProfessionalProfilesService } from './professional-profiles.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [
    PublicProfessionalProfilesController,
    BrowseProfessionalProfilesController,
    PublicBrowseProfilesController,
    SelfProfessionalProfilesController,
  ],
  providers: [ProfessionalProfilesService],
  exports: [ProfessionalProfilesService],
})
export class ProfessionalProfilesModule {}
