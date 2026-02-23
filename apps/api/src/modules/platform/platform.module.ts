import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlatformService } from './platform.service';
import { PlatformController } from './platform.controller';
import { PlatformWebhookController } from './platform-webhook.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [PrismaModule, ConfigModule, NotificationsModule],
  controllers: [PlatformController, PlatformWebhookController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
