import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReviewsService } from './reviews.service';
import { ReviewsController, PublicReviewsController } from './reviews.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController, PublicReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
