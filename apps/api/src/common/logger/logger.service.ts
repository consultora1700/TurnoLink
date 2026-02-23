import { Injectable, Inject, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * Structured log metadata interface
 */
export interface LogMetadata {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Application Logger Service
 *
 * Provides structured logging with context for multi-tenant application.
 * Uses Winston for log management with JSON format in production.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(private readonly logger: AppLoggerService) {
 *     this.logger.setContext('MyService');
 *   }
 *
 *   async doSomething(tenantId: string) {
 *     this.logger.log('Processing request', { tenantId, action: 'doSomething' });
 *   }
 * }
 * ```
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService {
  private context = 'Application';

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  /**
   * Set the context for this logger instance
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * Log info level message
   */
  log(message: string, meta?: LogMetadata): void {
    this.logger.info(message, { context: this.context, ...meta });
  }

  /**
   * Log error level message
   */
  error(message: string, trace?: string, meta?: LogMetadata): void {
    this.logger.error(message, { context: this.context, trace, ...meta });
  }

  /**
   * Log warning level message
   */
  warn(message: string, meta?: LogMetadata): void {
    this.logger.warn(message, { context: this.context, ...meta });
  }

  /**
   * Log debug level message
   */
  debug(message: string, meta?: LogMetadata): void {
    this.logger.debug(message, { context: this.context, ...meta });
  }

  /**
   * Log verbose level message
   */
  verbose(message: string, meta?: LogMetadata): void {
    this.logger.verbose(message, { context: this.context, ...meta });
  }

  /**
   * Log HTTP request/response
   */
  http(message: string, meta?: LogMetadata): void {
    this.logger.http(message, { context: this.context, ...meta });
  }

  /**
   * Log with performance timing
   */
  logWithTiming<T>(
    message: string,
    fn: () => T | Promise<T>,
    meta?: LogMetadata,
  ): T | Promise<T> {
    const start = Date.now();
    const result = fn();

    if (result instanceof Promise) {
      return result.then((value) => {
        this.log(message, { ...meta, duration: Date.now() - start });
        return value;
      }).catch((error) => {
        this.error(message, error.stack, { ...meta, duration: Date.now() - start });
        throw error;
      });
    }

    this.log(message, { ...meta, duration: Date.now() - start });
    return result;
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: string): AppLoggerService {
    const childLogger = new AppLoggerService(this.logger);
    childLogger.setContext(`${this.context}:${additionalContext}`);
    return childLogger;
  }

  /**
   * Log tenant-specific action
   */
  logTenantAction(
    action: string,
    tenantId: string,
    meta?: Omit<LogMetadata, 'tenantId' | 'action'>,
  ): void {
    this.log(`Tenant action: ${action}`, { tenantId, action, ...meta });
  }

  /**
   * Log security event (audit)
   */
  logSecurityEvent(
    event: string,
    userId: string,
    meta?: Omit<LogMetadata, 'userId'>,
  ): void {
    this.warn(`Security event: ${event}`, { userId, securityEvent: true, ...meta });
  }

  /**
   * Log database operation
   */
  logDbOperation(
    operation: string,
    model: string,
    duration?: number,
    meta?: LogMetadata,
  ): void {
    this.debug(`DB: ${operation} on ${model}`, {
      dbOperation: operation,
      model,
      duration,
      ...meta
    });
  }
}
