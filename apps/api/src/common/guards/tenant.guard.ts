import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admins can access everything
    if (user?.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check if user has a tenant
    if (!user?.tenantId) {
      throw new ForbiddenException('User is not associated with any business');
    }

    // Get full tenant object
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant) {
      throw new ForbiddenException('Business not found');
    }

    // Inject tenant into request for controllers to use
    request.tenantId = user.tenantId;
    request.tenant = tenant;

    return true;
  }
}
