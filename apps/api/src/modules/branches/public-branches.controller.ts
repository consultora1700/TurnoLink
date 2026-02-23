import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { BranchesService } from './branches.service';
import { BookingsService } from '../bookings/bookings.service';

@ApiTags('public')
@Controller('public/tenants')
export class PublicBranchesController {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly prisma: PrismaService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Public()
  @Get(':slug/branches')
  @ApiOperation({ summary: 'Obtener sucursales activas de un negocio' })
  async getPublicBranches(@Param('slug') slug: string) {
    const tenant = await this.getTenantBySlug(slug);
    return this.branchesService.getPublicBranches(tenant.id);
  }

  @Public()
  @Get(':slug/branches/:branchSlug')
  @ApiOperation({ summary: 'Obtener una sucursal por slug' })
  async getPublicBranch(
    @Param('slug') slug: string,
    @Param('branchSlug') branchSlug: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);
    return this.branchesService.findBySlug(tenant.id, branchSlug);
  }

  @Public()
  @Get(':slug/branches/:branchSlug/services')
  @ApiOperation({ summary: 'Obtener servicios de una sucursal' })
  async getPublicBranchServices(
    @Param('slug') slug: string,
    @Param('branchSlug') branchSlug: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);
    return this.branchesService.getPublicBranchServices(tenant.id, branchSlug);
  }

  @Public()
  @Get(':slug/branches/:branchSlug/employees')
  @ApiOperation({ summary: 'Obtener empleados de una sucursal (opcionalmente filtrado por servicio)' })
  async getPublicBranchEmployees(
    @Param('slug') slug: string,
    @Param('branchSlug') branchSlug: string,
    @Query('serviceId') serviceId?: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);
    return this.branchesService.getPublicBranchEmployees(tenant.id, branchSlug, serviceId);
  }

  @Public()
  @Get(':slug/branches/:branchSlug/availability')
  @ApiOperation({ summary: 'Obtener disponibilidad de una sucursal' })
  async getPublicBranchAvailability(
    @Param('slug') slug: string,
    @Param('branchSlug') branchSlug: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId?: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);
    const branch = await this.branchesService.findBySlug(tenant.id, branchSlug);

    return this.bookingsService.getAvailability(tenant.id, date, serviceId, branch.id);
  }

  private async getTenantBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug, status: 'ACTIVE' },
    });

    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return tenant;
  }
}
