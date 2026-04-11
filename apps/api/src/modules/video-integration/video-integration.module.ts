import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { VideoIntegrationService } from './video-integration.service';
import { VideoIntegrationController } from './video-integration.controller';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [VideoIntegrationController],
  providers: [VideoIntegrationService],
  exports: [VideoIntegrationService],
})
export class VideoIntegrationModule {}
