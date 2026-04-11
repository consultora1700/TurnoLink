import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailNotificationsService } from '../notifications/email-notifications.service';
import { ProfessionalProfilesService } from '../professional-profiles/professional-profiles.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { getTermsForTenant } from '@common/utils/rubro-terms';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailNotificationsService: EmailNotificationsService,
    private readonly professionalProfilesService: ProfessionalProfilesService,
  ) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const take = limit || 100;
    const skip = page ? (page - 1) * take : 0;
    return this.prisma.employee.findMany({
      where: { tenantId },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      skip,
      take,
    });
  }

  async findActive(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(tenantId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    return employee;
  }

  async findDeliveryStaff(tenantId: string) {
    return this.prisma.employee.findMany({
      where: {
        tenantId,
        isDelivery: true,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        deliveryVehicle: true,
        deliveryZone: true,
        image: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, dto: CreateEmployeeDto) {
    // Get max order
    const maxOrder = await this.prisma.employee.aggregate({
      where: { tenantId },
      _max: { order: true },
    });

    const employee = await this.prisma.employee.create({
      data: {
        ...dto,
        tenantId,
        order: dto.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    });

    // Send welcome email if email provided (fire-and-forget)
    if (dto.email) {
      this.sendWelcomeEmail(employee.id, tenantId).catch((err) =>
        this.logger.error(`Failed to send welcome email for employee ${employee.id}: ${err}`),
      );
    }

    return employee;
  }

  /**
   * Update an employee with atomic tenant isolation.
   * Uses interactive transaction to ensure the record belongs to tenant before updating.
   */
  async update(tenantId: string, id: string, dto: UpdateEmployeeDto) {
    let shouldSendWelcome = false;

    const updated = await this.prisma.$transaction(async (tx) => {
      // Verify ownership atomically
      const employee = await tx.employee.findFirst({
        where: { id, tenantId },
      });

      if (!employee) {
        throw new NotFoundException('Empleado no encontrado');
      }

      // Check if email was added/changed and welcome not yet sent
      const emailChanged = dto.email && dto.email !== employee.email;
      if (emailChanged && !employee.welcomeEmailSentAt) {
        shouldSendWelcome = true;
      }

      // Safe to update - ownership verified within same transaction
      return tx.employee.update({
        where: { id },
        data: dto,
      });
    });

    // Send welcome email outside transaction (fire-and-forget)
    if (shouldSendWelcome) {
      this.sendWelcomeEmail(id, tenantId).catch((err) =>
        this.logger.error(`Failed to send welcome email for employee ${id}: ${err}`),
      );
    }

    return updated;
  }

  /**
   * Delete an employee with atomic tenant isolation.
   */
  async delete(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Verify ownership atomically
      const employee = await tx.employee.findFirst({
        where: { id, tenantId },
      });

      if (!employee) {
        throw new NotFoundException('Empleado no encontrado');
      }

      return tx.employee.delete({
        where: { id },
      });
    });
  }

  /**
   * Reorder employees with tenant isolation.
   * Uses updateMany for efficiency with tenant filtering.
   */
  async reorder(tenantId: string, employeeIds: string[]) {
    await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < employeeIds.length; index++) {
        const result = await tx.employee.updateMany({
          where: { id: employeeIds[index], tenantId },
          data: { order: index },
        });

        // Verify the employee belonged to this tenant
        if (result.count === 0) {
          throw new NotFoundException(`Empleado ${employeeIds[index]} no encontrado`);
        }
      }
    });

    return this.findAll(tenantId);
  }

  /**
   * Send welcome email to employee and mark as sent.
   * Generates a profile access token and includes it in the email.
   */
  private async sendWelcomeEmail(employeeId: string, tenantId: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee?.email || employee.welcomeEmailSentAt) {
      return;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return;
    }

    // Generate profile access token
    const profileToken = await this.professionalProfilesService.generateToken(employee.id);

    const terms = getTermsForTenant(tenant.settings);

    await this.emailNotificationsService.sendEmployeeWelcomeEmail(
      employee.email,
      employee.name,
      tenant.name,
      tenant.slug,
      profileToken,
      terms,
    );

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { welcomeEmailSentAt: new Date() },
    });

    this.logger.log(`Welcome email sent to employee ${employee.name} (${employee.email}) with profile token`);
  }

  /**
   * Get services assigned to an employee with custom pricing.
   */
  async getEmployeeServices(tenantId: string, employeeId: string) {
    await this.findById(tenantId, employeeId);

    const employeeServices = await this.prisma.employeeService.findMany({
      where: { employeeId },
      include: {
        service: true,
      },
      orderBy: {
        service: { order: 'asc' },
      },
    });

    return employeeServices.map((es) => ({
      ...es.service,
      price: Number(es.service.price),
      customPrice: es.customPrice ? Number(es.customPrice) : null,
      customDuration: es.customDuration,
      employeeServiceId: es.id,
    }));
  }

  /**
   * Update services assigned to an employee (bulk).
   * Supports simple serviceIds array (backwards-compatible) or rich objects with customPrice/customDuration.
   */
  async updateEmployeeServices(
    tenantId: string,
    employeeId: string,
    services: string[] | { serviceId: string; customPrice?: number; customDuration?: number }[],
  ) {
    await this.findById(tenantId, employeeId);

    // Normalize to rich format
    const normalized = services.map((s) =>
      typeof s === 'string'
        ? { serviceId: s, customPrice: undefined, customDuration: undefined }
        : s,
    );

    // Verify all services belong to tenant
    if (normalized.length > 0) {
      const serviceIds = normalized.map((s) => s.serviceId);
      const found = await this.prisma.service.findMany({
        where: { id: { in: serviceIds }, tenantId },
      });

      if (found.length !== serviceIds.length) {
        throw new NotFoundException('Algunos servicios no fueron encontrados');
      }
    }

    // Delete existing assignments and create new ones
    await this.prisma.$transaction(async (tx) => {
      await tx.employeeService.deleteMany({
        where: { employeeId },
      });

      if (normalized.length > 0) {
        await tx.employeeService.createMany({
          data: normalized.map((s) => ({
            employeeId,
            serviceId: s.serviceId,
            customPrice: s.customPrice != null ? new Decimal(s.customPrice) : null,
            customDuration: s.customDuration ?? null,
          })),
        });
      }
    });

    return this.getEmployeeServices(tenantId, employeeId);
  }

  /**
   * Get specialties assigned to an employee.
   */
  async getEmployeeSpecialties(tenantId: string, employeeId: string) {
    await this.findById(tenantId, employeeId);

    const employeeSpecialties = await this.prisma.employeeSpecialty.findMany({
      where: { employeeId },
      include: {
        specialty: true,
      },
      orderBy: {
        specialty: { order: 'asc' },
      },
    });

    return employeeSpecialties.map((es) => ({
      ...es.specialty,
      seniorityLevel: es.seniorityLevel,
      customRate: es.customRate ? Number(es.customRate) : null,
      employeeSpecialtyId: es.id,
    }));
  }

  /**
   * Update specialties assigned to an employee (bulk).
   */
  async updateEmployeeSpecialties(
    tenantId: string,
    employeeId: string,
    specialties: { specialtyId: string; seniorityLevel?: string; customRate?: number }[],
  ) {
    await this.findById(tenantId, employeeId);

    // Verify all specialties belong to tenant
    if (specialties.length > 0) {
      const specialtyIds = specialties.map((s) => s.specialtyId);
      const found = await this.prisma.specialty.findMany({
        where: { id: { in: specialtyIds }, tenantId },
        select: { id: true },
      });

      if (found.length !== specialtyIds.length) {
        throw new NotFoundException('Algunas especialidades no fueron encontradas');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.employeeSpecialty.deleteMany({
        where: { employeeId },
      });

      if (specialties.length > 0) {
        await tx.employeeSpecialty.createMany({
          data: specialties.map((s) => ({
            employeeId,
            specialtyId: s.specialtyId,
            seniorityLevel: s.seniorityLevel || null,
            customRate: s.customRate != null ? new Decimal(s.customRate) : null,
          })),
        });
      }
    });

    return this.getEmployeeSpecialties(tenantId, employeeId);
  }
}
