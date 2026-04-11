import { Module, forwardRef } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { PublicBranchesController } from './public-branches.controller';
import { BranchesService } from './branches.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BookingsModule } from '../bookings/bookings.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, forwardRef(() => BookingsModule), SubscriptionsModule],
  controllers: [BranchesController, PublicBranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
