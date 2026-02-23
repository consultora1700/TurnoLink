import { Module, forwardRef } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { PublicBranchesController } from './public-branches.controller';
import { BranchesService } from './branches.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [PrismaModule, forwardRef(() => BookingsModule)],
  controllers: [BranchesController, PublicBranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
