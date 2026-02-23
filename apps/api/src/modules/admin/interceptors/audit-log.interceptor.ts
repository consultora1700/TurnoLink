import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../../prisma/prisma.service';
import { Request } from 'express';

export interface AuditLogMetadata {
  action: string;
  entityType: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;

    return next.handle().pipe(
      tap({
        next: async (response) => {
          try {
            // Determine action based on HTTP method
            const action = this.getActionFromMethod(request.method, methodName);
            const entityType = this.getEntityTypeFromPath(request.path);

            await this.logAction(request, action, entityType, response);
          } catch (error) {
            this.logger.error('Failed to log audit entry', error);
          }
        },
        error: async (error) => {
          try {
            const action = `${this.getActionFromMethod(request.method, methodName)}_FAILED`;
            const entityType = this.getEntityTypeFromPath(request.path);

            await this.logAction(request, action, entityType, null, 'WARNING', {
              error: error.message,
              stack: error.stack,
            });
          } catch (logError) {
            this.logger.error('Failed to log error audit entry', logError);
          }
        },
      }),
    );
  }

  private getActionFromMethod(method: string, handlerName: string): string {
    const methodMap: Record<string, string> = {
      GET: 'READ',
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    // Use handler name for more specific actions
    if (handlerName.includes('suspend')) return 'SUSPEND';
    if (handlerName.includes('reactivate')) return 'REACTIVATE';
    if (handlerName.includes('resolve')) return 'RESOLVE';
    if (handlerName.includes('extend')) return 'EXTEND_TRIAL';

    return methodMap[method] || 'UNKNOWN';
  }

  private getEntityTypeFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean);

    // Find entity type from path segments
    const entityMap: Record<string, string> = {
      tenants: 'Tenant',
      subscriptions: 'Subscription',
      payments: 'Payment',
      users: 'User',
      'audit-logs': 'AuditLog',
      alerts: 'SecurityAlert',
      security: 'Security',
    };

    for (const segment of segments) {
      if (entityMap[segment]) {
        return entityMap[segment];
      }
    }

    return 'Unknown';
  }

  private async logAction(
    request: Request,
    action: string,
    entityType: string,
    response: any,
    severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO',
    additionalDetails?: any,
  ): Promise<void> {
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || null;

    // Extract entity ID from path if present
    const pathParts = request.path.split('/');
    const entityId = this.extractEntityId(pathParts);

    // Build details object
    const details: any = {
      method: request.method,
      path: request.path,
      ...additionalDetails,
    };

    // Don't log sensitive data
    if (request.body && Object.keys(request.body).length > 0) {
      details.bodyKeys = Object.keys(request.body);
    }

    if (response && typeof response === 'object') {
      details.responseId = response.id;
    }

    await this.prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        ipAddress,
        userAgent,
        details,
        severity,
      },
    });
  }

  private getClientIp(request: Request): string {
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      const ips = (xForwardedFor as string).split(',');
      return ips[0].trim();
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }

  private extractEntityId(pathParts: string[]): string | null {
    // UUID pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    for (const part of pathParts) {
      if (uuidPattern.test(part)) {
        return part;
      }
    }

    return null;
  }
}
