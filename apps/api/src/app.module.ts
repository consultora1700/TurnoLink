import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger';
import { UtilsModule } from './common/utils';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { ServicesModule } from './modules/services/services.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { TotpModule } from './modules/totp/totp.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { BranchesModule } from './modules/branches/branches.module';
import { MercadoPagoModule } from './modules/mercadopago/mercadopago.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { PlatformModule } from './modules/platform/platform.module';
import { AdminModule } from './modules/admin/admin.module';
import { PushModule } from './modules/push/push.module';
import { ProfessionalProfilesModule } from './modules/professional-profiles/professional-profiles.module';
import { ReportsModule } from './modules/reports/reports.module';
import * as path from 'path';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '..', '.env'),
    }),

    // Structured Logging (Global)
    LoggerModule,

    // Utility Services (Global)
    UtilsModule,

    // Event-driven Architecture (decouples modules)
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Task Scheduling (cron jobs)
    ScheduleModule.forRoot(),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    PrismaModule,

    // TurnoLink Core Modules
    AuthModule,
    UsersModule,
    TenantsModule,
    ServicesModule,
    BookingsModule,
    CustomersModule,
    SchedulesModule,
    EmployeesModule,
    BranchesModule,
    MediaModule,
    NotificationsModule,
    HealthModule,

    // Security
    TotpModule,
    EmailVerificationModule,

    // Payment Integration
    MercadoPagoModule,

    // Subscriptions
    SubscriptionsModule,

    // Reviews & Reputation
    ReviewsModule,

    // Platform (Admin payments for subscriptions)
    PlatformModule,

    // Push Notifications
    PushModule,

    // Professional Profiles (Fase 2)
    ProfessionalProfilesModule,

    // Reports & Analytics
    ReportsModule,

    // Admin Panel
    AdminModule,
  ],
})
export class AppModule {}
