import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProfessionalProfilesModule } from '../professional-profiles/professional-profiles.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { SchedulesModule } from '../schedules/schedules.module';

@Module({
  imports: [PrismaModule, NotificationsModule, ProfessionalProfilesModule, SubscriptionsModule, SchedulesModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
