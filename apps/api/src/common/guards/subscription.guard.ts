import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SKIP_SUBSCRIPTION_CHECK_KEY } from '../decorators/skip-subscription-check.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if subscription check should be skipped
    const skipCheck = this.reflector.getAllAndOverride<boolean>(SKIP_SUBSCRIPTION_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipCheck) return true;

    // Public routes don't need subscription check
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admins bypass subscription check
    if (user?.role === 'SUPER_ADMIN') return true;

    const tenantId = user?.tenantId;
    if (!tenantId) return true; // No tenant = let other guards handle

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'NO_SUBSCRIPTION',
        message: 'No tenés una suscripción activa. Elegí un plan para continuar.',
      });
    }

    // Check trial expiration
    if (subscription.status === 'TRIALING' && subscription.trialEndAt) {
      if (new Date() > subscription.trialEndAt) {
        throw new ForbiddenException({
          statusCode: 403,
          error: 'TRIAL_EXPIRED',
          message: 'Tu período de prueba terminó. Elegí un plan para seguir usando TurnoLink.',
        });
      }
    }

    // Check ACTIVE subscription period expiration (skip free plan with "forever" dates)
    if (subscription.status === 'ACTIVE' && subscription.currentPeriodEnd) {
      const isFree = subscription.plan.slug === 'gratis';
      const isExpired = !isFree && new Date() > subscription.currentPeriodEnd;

      if (isExpired) {
        // Grace period: 3 days after expiration still allow access
        const graceDays = 3;
        const graceEnd = new Date(subscription.currentPeriodEnd);
        graceEnd.setDate(graceEnd.getDate() + graceDays);

        if (new Date() > graceEnd) {
          throw new ForbiddenException({
            statusCode: 403,
            error: 'SUBSCRIPTION_EXPIRED',
            message: 'Tu suscripción venció. Renová tu plan para seguir usando TurnoLink.',
          });
        }
        // Within grace period — allow but could show warning on frontend
      }
    }

    // Active or valid trial → OK
    if (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING') {
      request.subscription = subscription;
      return true;
    }

    // For inactive subscriptions (PAST_DUE, CANCELLED, EXPIRED):
    // Allow GET (read-only) requests so users can still view their data.
    // Block write operations (POST, PUT, PATCH, DELETE).
    const method = request.method?.toUpperCase();
    const isReadOnly = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';

    if (isReadOnly) {
      request.subscription = subscription;
      return true;
    }

    // PAST_DUE — subscription period expired, needs payment
    if (subscription.status === 'PAST_DUE') {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'SUBSCRIPTION_PAST_DUE',
        message: 'Tu suscripción tiene un pago pendiente. Regularizá el pago para seguir operando.',
      });
    }

    // CANCELLED, EXPIRED, etc.
    throw new ForbiddenException({
      statusCode: 403,
      error: 'SUBSCRIPTION_INACTIVE',
      message: 'Tu suscripción no está activa. Reactivá tu plan para continuar.',
    });
  }
}
