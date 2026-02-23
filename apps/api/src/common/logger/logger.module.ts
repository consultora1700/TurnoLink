import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger.config';
import { AppLoggerService } from './logger.service';

/**
 * Global Logger Module
 *
 * Provides structured logging across the entire application.
 * Import this module in AppModule to enable logging everywhere.
 *
 * Features:
 * - JSON format in production for log aggregation
 * - Human-readable format in development
 * - Automatic file rotation in production
 * - Multi-tenant context support
 * - Performance timing utilities
 *
 * @example
 * ```typescript
 * // app.module.ts
 * @Module({
 *   imports: [LoggerModule],
 * })
 * export class AppModule {}
 *
 * // any.service.ts
 * @Injectable()
 * export class AnyService {
 *   constructor(private readonly logger: AppLoggerService) {
 *     this.logger.setContext('AnyService');
 *   }
 * }
 * ```
 */
@Global()
@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
  providers: [AppLoggerService],
  exports: [AppLoggerService, WinstonModule],
})
export class LoggerModule {}
