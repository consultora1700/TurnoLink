import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CdnController } from './cdn.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [MediaController, CdnController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
