import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailNotificationsService } from '../notifications/email-notifications.service';
import { ProfessionalProfilesService } from '../professional-profiles/professional-profiles.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailNotificationsService: EmailNotificationsService,
    private readonly professionalProfilesService: ProfessionalProfilesService,
  ) {}

  async findAll(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
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

    await this.emailNotificationsService.sendEmployeeWelcomeEmail(
      employee.email,
      employee.name,
      tenant.name,
      tenant.slug,
      profileToken,
    );

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { welcomeEmailSentAt: new Date() },
    });

    this.logger.log(`Welcome email sent to employee ${employee.name} (${employee.email}) with profile token`);
  }

  /**
   * Get services assigned to an employee.
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

    return employeeServices.map((es) => es.service);
  }

  /**
   * Update services assigned to an employee (bulk).
   */
  async updateEmployeeServices(tenantId: string, employeeId: string, serviceIds: string[]) {
    await this.findById(tenantId, employeeId);

    // Verify all services belong to tenant
    if (serviceIds.length > 0) {
      const services = await this.prisma.service.findMany({
        where: { id: { in: serviceIds }, tenantId },
      });

      if (services.length !== serviceIds.length) {
        throw new NotFoundException('Algunos servicios no fueron encontrados');
      }
    }

    // Delete existing assignments and create new ones
    await this.prisma.$transaction(async (tx) => {
      await tx.employeeService.deleteMany({
        where: { employeeId },
      });

      if (serviceIds.length > 0) {
        await tx.employeeService.createMany({
          data: serviceIds.map((serviceId) => ({
            employeeId,
            serviceId,
          })),
        });
      }
    });

    return this.getEmployeeServices(tenantId, employeeId);
  }
}
