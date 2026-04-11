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
  @Get('sitemap')
  @ApiOperation({ summary: 'Get all active tenant slugs for sitemap' })
  async getSitemapSlugs() {
    const tenants = await this.prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    return tenants.map((t) => ({
      slug: t.slug,
      updatedAt: t.updatedAt.toISOString(),
    }));
  }

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
      where: { tenantId: tenant.id, isActive: true, isPubliclyVisible: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        image: true,
        specialty: true,
        bio: true,
        credentials: true,
        seniority: true,
      },
    });
  }

  @Public()
  @Get(':slug/services/:serviceId/employees')
  @ApiOperation({ summary: 'Get employees assigned to a specific service' })
  async getServiceEmployees(
    @Param('slug') slug: string,
    @Param('serviceId') serviceId: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Check if service has EmployeeService assignments
    const employeeServices = await this.prisma.employeeService.findMany({
      where: {
        serviceId,
        employee: { tenantId: tenant.id, isActive: true, isPubliclyVisible: true },
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            image: true,
            specialty: true,
            bio: true,
            credentials: true,
            seniority: true,
          },
        },
      },
      orderBy: { employee: { order: 'asc' } },
    });

    if (employeeServices.length > 0) {
      // Return only assigned employees with custom pricing
      return employeeServices.map((es) => ({
        ...es.employee,
        customPrice: es.customPrice ? Number(es.customPrice) : null,
        customDuration: es.customDuration,
      }));
    }

    // Fallback: no assignments configured → return all active employees
    return this.prisma.employee.findMany({
      where: { tenantId: tenant.id, isActive: true, isPubliclyVisible: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        image: true,
        specialty: true,
        bio: true,
        credentials: true,
        seniority: true,
      },
    });
  }

  @Public()
  @Get(':slug/employees/:employeeId/services')
  @ApiOperation({ summary: 'Get services assigned to a specific employee' })
  async getEmployeeServices(
    @Param('slug') slug: string,
    @Param('employeeId') employeeId: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Check if employee has EmployeeService assignments
    const employeeServices = await this.prisma.employeeService.findMany({
      where: {
        employeeId,
        employee: { tenantId: tenant.id, isActive: true },
        service: { isActive: true },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            mode: true,
            image: true,
            specialtyId: true,
            categoryId: true,
          },
        },
      },
      orderBy: { service: { order: 'asc' } },
    });

    if (employeeServices.length > 0) {
      return employeeServices.map((es) => ({
        ...es.service,
        price: es.service.price ? Number(es.service.price) : null,
        customPrice: es.customPrice ? Number(es.customPrice) : null,
        customDuration: es.customDuration,
      }));
    }

    // Fallback: no assignments → return all active services
    const services = await this.prisma.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        mode: true,
        image: true,
        specialtyId: true,
        categoryId: true,
      },
    });

    return services.map((s) => ({
      ...s,
      price: s.price ? Number(s.price) : null,
      customPrice: null,
      customDuration: null,
    }));
  }

  @Public()
  @Get(':slug/intake-forms/:formId')
  @ApiOperation({ summary: 'Get a public intake form by ID' })
  async getIntakeForm(
    @Param('slug') slug: string,
    @Param('formId') formId: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Negocio no encontrado');

    const form = await this.prisma.intakeForm.findFirst({
      where: { id: formId, tenantId: tenant.id, isActive: true },
    });
    if (!form) throw new NotFoundException('Formulario no encontrado');

    return {
      id: form.id,
      name: form.name,
      description: form.description,
      fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields,
    };
  }

  @Public()
  @Get(':slug/specialties')
  @ApiOperation({ summary: 'Get active specialties for a tenant' })
  async getSpecialties(@Param('slug') slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return this.prisma.specialty.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        _count: {
          select: {
            services: { where: { isActive: true } },
            employeeSpecialties: true,
          },
        },
      },
    });
  }
}
