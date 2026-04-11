import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { SubscriptionGuard } from './common/guards/subscription.guard';
import { FeatureGuard } from './common/guards/feature.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger';
import { UtilsModule } from './common/utils';
import { RedisCacheModule } from './common/cache';
import { QueueModule } from './common/queue';
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
import { VideoIntegrationModule } from './modules/video-integration/video-integration.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { PlatformModule } from './modules/platform/platform.module';
import { AdminModule } from './modules/admin/admin.module';
import { PushModule } from './modules/push/push.module';
import { ProfessionalProfilesModule } from './modules/professional-profiles/professional-profiles.module';
import { JobPostingsModule } from './modules/job-postings/job-postings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { IntakeFormsModule } from './modules/intake-forms/intake-forms.module';
import { EmployeePortalModule } from './modules/employee-portal/employee-portal.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { BrandingModule } from './modules/branding/branding.module';
import { GastroModule } from './modules/gastro/gastro.module';
import { RentalsModule } from './modules/rentals/rentals.module';
import { DevelopmentsModule } from './modules/developments/developments.module';
import { LeadsModule } from './modules/leads/leads.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SentryModule } from './common/sentry/sentry.module';
import * as path from 'path';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '..', '.env'),
    }),

    // Sentry Error Tracking (Global)
    SentryModule,

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
      maxListeners: 50,
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
        limit: 30,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 150,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 300,
      },
    ]),

    // Redis Cache (Global)
    RedisCacheModule,

    // BullMQ Queues (Global)
    QueueModule,

    // Database
    PrismaModule,

    // TurnoLink Core Modules
    AuthModule,
    UsersModule,
    TenantsModule,
    ServicesModule,
    ProductsModule,
    OrdersModule,
    BrandingModule,
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

    // Video Integration (Zoom / Google Meet)
    VideoIntegrationModule,

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

    // Job Postings (Ofertas Laborales)
    JobPostingsModule,

    // Reports & Analytics
    ReportsModule,
    FinanceModule,

    // Specialties (Profesionales)
    SpecialtiesModule,

    // Intake Forms
    IntakeFormsModule,

    // Employee Portal
    EmployeePortalModule,

    // Quotes (Presupuestos)
    QuotesModule,

    // Loyalty & Sorteos
    LoyaltyModule,

    // Gastro Salon (Dine-in, Table Sessions)
    GastroModule,

    // Rentals (Inmobiliarias)
    RentalsModule,

    // Development Projects (Pozo/Preventa)
    DevelopmentsModule,

    // CRM Leads, Señas, Garantías (Inmobiliarias)
    LeadsModule,

    // Document Templates (Inmobiliarias)
    DocumentsModule,

    // Admin Panel
    AdminModule,
  ],
  providers: [
    // Global guards — execution order matters:
    // 1. ThrottlerGuard (rate limiting)
    // 2. JwtAuthGuard (authentication — respects @Public())
    // 3. TenantGuard (tenant isolation — respects @Public())
    // 4. SubscriptionGuard (subscription status — respects @Public() & @SkipSubscriptionCheck())
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: FeatureGuard,
    },
  ],
})
export class AppModule {}
