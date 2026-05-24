import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const PLATFORM_RUBROS: Record<string, { rubros: string[]; prefixes: string[] }> = {
  turnolink: {
    rubros: [
      'estetica-belleza', 'barberia', 'masajes-spa', 'salud', 'odontologia',
      'psicologia', 'nutricion', 'fitness', 'veterinaria', 'tatuajes-piercing',
      'educacion', 'consultoria', 'deportes', 'espacios', 'hospedaje',
      'alquiler', 'otro',
    ],
    prefixes: [],
  },
  colmen: {
    rubros: ['gastronomia', 'mercado', 'inmobiliarias'],
    prefixes: ['gastro-', 'mercado-'],
  },
};

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip for @Public() routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

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

    // Validate tenant rubro belongs to this platform
    const platform = this.configService.get<string>('PLATFORM') || 'turnolink';
    const allowed = PLATFORM_RUBROS[platform];
    if (allowed) {
      try {
        const settings = JSON.parse(tenant.settings || '{}');
        const rubro: string = settings.rubro || '';
        if (rubro) {
          const isAllowed =
            allowed.rubros.includes(rubro) ||
            allowed.prefixes.some((p) => rubro.startsWith(p));
          if (!isAllowed) {
            throw new ForbiddenException(
              'Este negocio no pertenece a esta plataforma',
            );
          }
        }
      } catch (e) {
        if (e instanceof ForbiddenException) throw e;
      }
    }

    // Inject tenant into request for controllers to use
    request.tenantId = user.tenantId;
    request.tenant = tenant;

    return true;
  }
}
