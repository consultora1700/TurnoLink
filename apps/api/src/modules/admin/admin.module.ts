import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminKeyGuard } from './guards/admin-key.guard';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AdminController],
  providers: [AdminService, AdminKeyGuard, AuditLogInterceptor],
  exports: [AdminService],
})
export class AdminModule {}
