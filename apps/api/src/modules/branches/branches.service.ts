import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            branchServices: true,
            branchEmployees: true,
          },
        },
      },
    });
  }

  async findActive(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId },
      include: {
        schedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            branchServices: true,
            branchEmployees: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Sucursal no encontrada');
    }

    return branch;
  }

  async findBySlug(tenantId: string, slug: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { tenantId, slug, isActive: true },
      include: {
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Sucursal no encontrada');
    }

    return branch;
  }

  async create(tenantId: string, dto: CreateBranchDto) {
    // Check if slug already exists for this tenant
    const existing = await this.prisma.branch.findFirst({
      where: { tenantId, slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Ya existe una sucursal con ese slug');
    }

    // Get max order
    const maxOrder = await this.prisma.branch.aggregate({
      where: { tenantId },
      _max: { order: true },
    });

    // If this is the first branch or isMain is true, ensure it's the main one
    const branchCount = await this.prisma.branch.count({ where: { tenantId } });
    const shouldBeMain = branchCount === 0 || dto.isMain === true;

    // If this will be main, unset other main branches
    if (shouldBeMain) {
      await this.prisma.branch.updateMany({
        where: { tenantId, isMain: true },
        data: { isMain: false },
      });
    }

    return this.prisma.branch.create({
      data: {
        ...dto,
        tenantId,
        isMain: shouldBeMain,
        order: dto.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateBranchDto) {
    return this.prisma.$transaction(async (tx) => {
      const branch = await tx.branch.findFirst({
        where: { id, tenantId },
      });

      if (!branch) {
        throw new NotFoundException('Sucursal no encontrada');
      }

      // If changing slug, check it doesn't already exist
      if (dto.slug && dto.slug !== branch.slug) {
        const existing = await tx.branch.findFirst({
          where: { tenantId, slug: dto.slug, id: { not: id } },
        });
        if (existing) {
          throw new ConflictException('Ya existe una sucursal con ese slug');
        }
      }

      // If setting as main, unset other main branches
      if (dto.isMain === true && !branch.isMain) {
        await tx.branch.updateMany({
          where: { tenantId, isMain: true, id: { not: id } },
          data: { isMain: false },
        });
      }

      return tx.branch.update({
        where: { id },
        data: dto,
      });
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const branch = await tx.branch.findFirst({
        where: { id, tenantId },
      });

      if (!branch) {
        throw new NotFoundException('Sucursal no encontrada');
      }

      return tx.branch.delete({
        where: { id },
      });
    });
  }

  async reorder(tenantId: string, branchIds: string[]) {
    await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < branchIds.length; index++) {
        const result = await tx.branch.updateMany({
          where: { id: branchIds[index], tenantId },
          data: { order: index },
        });

        if (result.count === 0) {
          throw new NotFoundException(`Sucursal ${branchIds[index]} no encontrada`);
        }
      }
    });

    return this.findAll(tenantId);
  }

  // ==================== BRANCH SERVICES ====================

  async getBranchServices(tenantId: string, branchId: string) {
    await this.findById(tenantId, branchId);

    return this.prisma.branchService.findMany({
      where: { branchId },
      include: {
        service: true,
      },
      orderBy: {
        service: { order: 'asc' },
      },
    });
  }

  async assignServiceToBranch(
    tenantId: string,
    branchId: string,
    serviceId: string,
    priceOverride?: number,
  ) {
    await this.findById(tenantId, branchId);

    // Verify service belongs to tenant
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, tenantId },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Check if already assigned
    const existing = await this.prisma.branchService.findUnique({
      where: { branchId_serviceId: { branchId, serviceId } },
    });

    if (existing) {
      // Update price override
      return this.prisma.branchService.update({
        where: { id: existing.id },
        data: { priceOverride, isActive: true },
        include: { service: true },
      });
    }

    return this.prisma.branchService.create({
      data: {
        branchId,
        serviceId,
        priceOverride,
      },
      include: { service: true },
    });
  }

  async removeServiceFromBranch(tenantId: string, branchId: string, serviceId: string) {
    await this.findById(tenantId, branchId);

    const branchService = await this.prisma.branchService.findUnique({
      where: { branchId_serviceId: { branchId, serviceId } },
    });

    if (!branchService) {
      throw new NotFoundException('Servicio no asignado a esta sucursal');
    }

    return this.prisma.branchService.delete({
      where: { id: branchService.id },
    });
  }

  async bulkAssignServicesToBranch(
    tenantId: string,
    branchId: string,
    serviceIds: string[],
  ) {
    await this.findById(tenantId, branchId);

    // Verify all services belong to tenant
    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds }, tenantId },
    });

    if (services.length !== serviceIds.length) {
      throw new NotFoundException('Algunos servicios no fueron encontrados');
    }

    // Remove all existing assignments
    await this.prisma.branchService.deleteMany({
      where: { branchId },
    });

    // Create new assignments
    if (serviceIds.length > 0) {
      await this.prisma.branchService.createMany({
        data: serviceIds.map((serviceId) => ({
          branchId,
          serviceId,
        })),
      });
    }

    return this.getBranchServices(tenantId, branchId);
  }

  // ==================== BRANCH EMPLOYEES ====================

  async getBranchEmployees(tenantId: string, branchId: string) {
    await this.findById(tenantId, branchId);

    return this.prisma.branchEmployee.findMany({
      where: { branchId, isActive: true },
      include: {
        employee: true,
      },
      orderBy: {
        employee: { order: 'asc' },
      },
    });
  }

  async assignEmployeeToBranch(tenantId: string, branchId: string, employeeId: string) {
    await this.findById(tenantId, branchId);

    // Verify employee belongs to tenant
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // Check if already assigned
    const existing = await this.prisma.branchEmployee.findUnique({
      where: { branchId_employeeId: { branchId, employeeId } },
    });

    if (existing) {
      return this.prisma.branchEmployee.update({
        where: { id: existing.id },
        data: { isActive: true },
        include: { employee: true },
      });
    }

    return this.prisma.branchEmployee.create({
      data: {
        branchId,
        employeeId,
      },
      include: { employee: true },
    });
  }

  async removeEmployeeFromBranch(tenantId: string, branchId: string, employeeId: string) {
    await this.findById(tenantId, branchId);

    const branchEmployee = await this.prisma.branchEmployee.findUnique({
      where: { branchId_employeeId: { branchId, employeeId } },
    });

    if (!branchEmployee) {
      throw new NotFoundException('Empleado no asignado a esta sucursal');
    }

    return this.prisma.branchEmployee.delete({
      where: { id: branchEmployee.id },
    });
  }

  async bulkAssignEmployeesToBranch(
    tenantId: string,
    branchId: string,
    employeeIds: string[],
  ) {
    await this.findById(tenantId, branchId);

    // Verify all employees belong to tenant
    const employees = await this.prisma.employee.findMany({
      where: { id: { in: employeeIds }, tenantId },
    });

    if (employees.length !== employeeIds.length) {
      throw new NotFoundException('Algunos empleados no fueron encontrados');
    }

    // Remove all existing assignments
    await this.prisma.branchEmployee.deleteMany({
      where: { branchId },
    });

    // Create new assignments
    if (employeeIds.length > 0) {
      await this.prisma.branchEmployee.createMany({
        data: employeeIds.map((employeeId) => ({
          branchId,
          employeeId,
        })),
      });
    }

    return this.getBranchEmployees(tenantId, branchId);
  }

  // ==================== BRANCH SCHEDULES ====================

  async getBranchSchedules(tenantId: string, branchId: string) {
    await this.findById(tenantId, branchId);

    return this.prisma.branchSchedule.findMany({
      where: { branchId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateBranchSchedules(
    tenantId: string,
    branchId: string,
    schedules: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isActive: boolean;
    }>,
  ) {
    await this.findById(tenantId, branchId);

    // Delete existing schedules
    await this.prisma.branchSchedule.deleteMany({
      where: { branchId },
    });

    // Create new schedules
    if (schedules.length > 0) {
      await this.prisma.branchSchedule.createMany({
        data: schedules.map((schedule) => ({
          branchId,
          ...schedule,
        })),
      });
    }

    return this.getBranchSchedules(tenantId, branchId);
  }

  // ==================== BRANCH BLOCKED DATES ====================

  async getBranchBlockedDates(tenantId: string, branchId: string) {
    await this.findById(tenantId, branchId);

    return this.prisma.branchBlockedDate.findMany({
      where: { branchId },
      orderBy: { date: 'asc' },
    });
  }

  async addBranchBlockedDate(
    tenantId: string,
    branchId: string,
    date: Date,
    reason?: string,
  ) {
    await this.findById(tenantId, branchId);

    return this.prisma.branchBlockedDate.create({
      data: {
        branchId,
        date,
        reason,
      },
    });
  }

  async removeBranchBlockedDate(tenantId: string, branchId: string, blockedDateId: string) {
    await this.findById(tenantId, branchId);

    const blockedDate = await this.prisma.branchBlockedDate.findFirst({
      where: { id: blockedDateId, branchId },
    });

    if (!blockedDate) {
      throw new NotFoundException('Fecha bloqueada no encontrada');
    }

    return this.prisma.branchBlockedDate.delete({
      where: { id: blockedDateId },
    });
  }

  // ==================== PUBLIC METHODS ====================

  async getPublicBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ isMain: 'desc' }, { order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        isMain: true,
      },
    });
  }

  async getPublicBranchServices(tenantId: string, branchSlug: string) {
    const branch = await this.findBySlug(tenantId, branchSlug);

    const branchServices = await this.prisma.branchService.findMany({
      where: { branchId: branch.id, isActive: true },
      include: {
        service: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        service: { order: 'asc' },
      },
    });

    // Transform to include price override
    return branchServices.map((bs) => ({
      ...bs.service,
      price: bs.priceOverride ?? bs.service.price,
      originalPrice: bs.service.price,
      hasPriceOverride: bs.priceOverride !== null,
    }));
  }

  async getPublicBranchEmployees(
    tenantId: string,
    branchSlug: string,
    serviceId?: string,
  ) {
    const branch = await this.findBySlug(tenantId, branchSlug);

    const where: any = {
      branchId: branch.id,
      isActive: true,
      employee: { isActive: true },
    };

    const branchEmployees = await this.prisma.branchEmployee.findMany({
      where,
      include: {
        employee: {
          include: {
            employeeServices: serviceId
              ? {
                  where: { serviceId },
                }
              : true,
          },
        },
      },
      orderBy: {
        employee: { order: 'asc' },
      },
    });

    // If serviceId provided, filter to only employees who can do that service
    if (serviceId) {
      return branchEmployees
        .filter((be) => be.employee.employeeServices.length > 0)
        .map((be) => be.employee);
    }

    return branchEmployees.map((be) => be.employee);
  }
}
