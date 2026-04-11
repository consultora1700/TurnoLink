import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_FEATURES_KEY, REQUIRED_FEATURES_MODE_KEY } from '../decorators/require-feature.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Global guard that enforces feature-based access control.
 *
 * If a handler or controller is decorated with @RequireFeature('slug'),
 * this guard checks that the tenant's subscription plan includes those features.
 *
 * The subscription (with plan) must already be attached to request by SubscriptionGuard.
 * If no @RequireFeature is set, the guard passes through (no restriction).
 *
 * Execution order in APP_GUARD chain:
 *   ThrottlerGuard → JwtAuthGuard → TenantGuard → SubscriptionGuard → FeatureGuard
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  private readonly logger = new Logger(FeatureGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Public routes skip feature check
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Get required features — check handler first, then class
    const requiredFeatures = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_FEATURES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @RequireFeature → no restriction
    if (!requiredFeatures || requiredFeatures.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admins bypass feature checks
    if (user?.role === 'SUPER_ADMIN') return true;

    // Get subscription from request (attached by SubscriptionGuard)
    const subscription = request.subscription;
    if (!subscription?.plan) {
      this.logger.warn(
        `Feature check failed: no subscription/plan on request for tenant ${user?.tenantId}`,
      );
      throw new ForbiddenException({
        statusCode: 403,
        error: 'FEATURE_NOT_AVAILABLE',
        message: 'Tu plan actual no incluye esta funcionalidad. Mejorá tu plan para acceder.',
      });
    }

    // Trial period → full access to all features so the user can evaluate everything
    if (subscription.status === 'TRIALING') {
      return true;
    }

    // Parse plan features
    let planFeatures: string[] = [];
    try {
      planFeatures =
        typeof subscription.plan.features === 'string'
          ? JSON.parse(subscription.plan.features)
          : Array.isArray(subscription.plan.features)
            ? subscription.plan.features
            : [];
    } catch {
      this.logger.error(
        `Failed to parse plan features for plan ${subscription.plan.id}`,
      );
      planFeatures = [];
    }

    // Check mode: 'any' (OR) vs default 'all' (AND)
    const mode = this.reflector.getAllAndOverride<string>(
      REQUIRED_FEATURES_MODE_KEY,
      [context.getHandler(), context.getClass()],
    ) || 'all';

    if (mode === 'any') {
      // At least ONE required feature must be present
      const hasAny = requiredFeatures.some((f) => planFeatures.includes(f));
      if (!hasAny) {
        this.logger.debug(
          `Tenant ${user?.tenantId} blocked: needs any of [${requiredFeatures.join(', ')}]`,
        );
        throw new ForbiddenException({
          statusCode: 403,
          error: 'FEATURE_NOT_AVAILABLE',
          message: 'Tu plan actual no incluye esta funcionalidad. Mejorá tu plan para acceder.',
        });
      }
    } else {
      // ALL required features must be present
      const missing = requiredFeatures.filter((f) => !planFeatures.includes(f));
      if (missing.length > 0) {
        this.logger.debug(
          `Tenant ${user?.tenantId} blocked: missing features [${missing.join(', ')}]`,
        );
        throw new ForbiddenException({
          statusCode: 403,
          error: 'FEATURE_NOT_AVAILABLE',
          message: 'Tu plan actual no incluye esta funcionalidad. Mejorá tu plan para acceder.',
          missingFeatures: missing,
        });
      }
    }

    return true;
  }
}
