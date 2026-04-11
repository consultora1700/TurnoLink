import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateSpecialtyDto) {
    // Check slug uniqueness within tenant
    const existing = await this.prisma.specialty.findUnique({
      where: { tenantId_slug: { tenantId, slug: dto.slug } },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una especialidad con el slug "${dto.slug}"`);
    }

    const maxOrder = await this.prisma.specialty.aggregate({
      where: { tenantId },
      _max: { order: true },
    });

    return this.prisma.specialty.create({
      data: {
        ...dto,
        tenantId,
        order: dto.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    });
  }

  async findAll(tenantId: string, includeInactive = false) {
    return this.prisma.specialty.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        _count: {
          select: {
            services: true,
            employeeSpecialties: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const specialty = await this.prisma.specialty.findFirst({
      where: { id, tenantId },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        employeeSpecialties: {
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
        },
      },
    });

    if (!specialty) {
      throw new NotFoundException('Especialidad no encontrada');
    }

    // Serialize employee specialties (customRate is Decimal)
    return {
      ...specialty,
      employeeSpecialties: specialty.employeeSpecialties.map((es) => ({
        ...es,
        customRate: es.customRate ? Number(es.customRate) : null,
      })),
    };
  }

  async update(tenantId: string, id: string, dto: UpdateSpecialtyDto) {
    return this.prisma.$transaction(async (tx) => {
      const specialty = await tx.specialty.findFirst({
        where: { id, tenantId },
      });

      if (!specialty) {
        throw new NotFoundException('Especialidad no encontrada');
      }

      // Check slug uniqueness if changing
      if (dto.slug && dto.slug !== specialty.slug) {
        const existing = await tx.specialty.findUnique({
          where: { tenantId_slug: { tenantId, slug: dto.slug } },
        });

        if (existing) {
          throw new ConflictException(`Ya existe una especialidad con el slug "${dto.slug}"`);
        }
      }

      return tx.specialty.update({
        where: { id },
        data: dto,
      });
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const specialty = await tx.specialty.findFirst({
        where: { id, tenantId },
      });

      if (!specialty) {
        throw new NotFoundException('Especialidad no encontrada');
      }

      // Check if specialty has services
      const servicesCount = await tx.service.count({
        where: { specialtyId: id },
      });

      if (servicesCount > 0) {
        // Soft delete
        return tx.specialty.update({
          where: { id },
          data: { isActive: false },
        });
      }

      return tx.specialty.delete({ where: { id } });
    });
  }

  async reorder(tenantId: string, specialtyIds: string[]) {
    await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < specialtyIds.length; index++) {
        const result = await tx.specialty.updateMany({
          where: { id: specialtyIds[index], tenantId },
          data: { order: index + 1 },
        });

        if (result.count === 0) {
          throw new NotFoundException(`Especialidad ${specialtyIds[index]} no encontrada`);
        }
      }
    });

    return this.findAll(tenantId, true);
  }

  // --- Employee-Specialty management ---

  async getEmployeesBySpecialty(tenantId: string, specialtyId: string) {
    await this.findByIdSimple(tenantId, specialtyId);

    const employeeSpecialties = await this.prisma.employeeSpecialty.findMany({
      where: { specialtyId },
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
            isActive: true,
          },
        },
      },
    });

    return employeeSpecialties.map((es) => ({
      employeeId: es.employee.id,
      employee: es.employee,
      seniorityLevel: es.seniorityLevel,
      customRate: es.customRate ? Number(es.customRate) : null,
    }));
  }

  async updateEmployeeSpecialties(
    tenantId: string,
    specialtyId: string,
    employees: { employeeId: string; seniorityLevel?: string; customRate?: number }[],
  ) {
    await this.findByIdSimple(tenantId, specialtyId);

    // Verify all employees belong to tenant
    if (employees.length > 0) {
      const employeeIds = employees.map((e) => e.employeeId);
      const found = await this.prisma.employee.findMany({
        where: { id: { in: employeeIds }, tenantId },
        select: { id: true },
      });

      if (found.length !== employeeIds.length) {
        throw new NotFoundException('Algunos empleados no fueron encontrados');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.employeeSpecialty.deleteMany({
        where: { specialtyId },
      });

      if (employees.length > 0) {
        await tx.employeeSpecialty.createMany({
          data: employees.map((e) => ({
            employeeId: e.employeeId,
            specialtyId,
            seniorityLevel: e.seniorityLevel || null,
            customRate: e.customRate ? new Decimal(e.customRate) : null,
          })),
        });
      }
    });

    return this.getEmployeesBySpecialty(tenantId, specialtyId);
  }

  private async findByIdSimple(tenantId: string, id: string) {
    const specialty = await this.prisma.specialty.findFirst({
      where: { id, tenantId },
    });

    if (!specialty) {
      throw new NotFoundException('Especialidad no encontrada');
    }

    return specialty;
  }
}
