import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('public')
@Controller('public/tenants')
export class PublicTenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get public tenant info by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlugPublic(slug);
  }

  @Public()
  @Get(':slug/employees')
  @ApiOperation({ summary: 'Get active employees for a tenant' })
  async getEmployees(@Param('slug') slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return this.prisma.employee.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        image: true,
        specialty: true,
        bio: true,
      },
    });
  }
}
