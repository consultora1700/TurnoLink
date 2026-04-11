import { Module } from '@nestjs/common';
import { EmployeePortalController } from './employee-portal.controller';
import { EmployeePortalService } from './employee-portal.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, NotificationsModule, AuthModule],
  controllers: [EmployeePortalController],
  providers: [EmployeePortalService],
  exports: [EmployeePortalService],
})
export class EmployeePortalModule {}
