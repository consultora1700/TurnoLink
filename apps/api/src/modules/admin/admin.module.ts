import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CrossPlatformService } from './cross-platform.service';
import { AdminKeyGuard } from './guards/admin-key.guard';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

@Module({
  imports: [PrismaModule, ConfigModule, forwardRef(() => AuthModule)],
  controllers: [AdminController],
  providers: [AdminService, CrossPlatformService, AdminKeyGuard, AuditLogInterceptor],
  exports: [AdminService, CrossPlatformService, AdminKeyGuard],
})
export class AdminModule {}
