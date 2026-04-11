import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    if (!dsn) {
      this.logger.warn('SENTRY_DSN not configured — error tracking disabled');
      return;
    }

    Sentry.init({
      dsn,
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // Don't send expected errors (4xx)
        if (event.contexts?.response?.status_code &&
            (event.contexts.response.status_code as number) < 500) {
          return null;
        }
        return event;
      },
    });

    this.logger.log('Sentry error tracking initialized');
  }

  captureException(error: Error, context?: Record<string, unknown>) {
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, level);
  }
}
