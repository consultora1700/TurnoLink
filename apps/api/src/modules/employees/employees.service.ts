import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.employee.create({
      data: {
        ...dto,
        tenantId,
        order: dto.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateEmployeeDto) {
    await this.findById(tenantId, id);

    return this.prisma.employee.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);

    return this.prisma.employee.delete({
      where: { id },
    });
  }

  async reorder(tenantId: string, employeeIds: string[]) {
    const updates = employeeIds.map((id, index) =>
      this.prisma.employee.update({
        where: { id },
        data: { order: index },
      })
    );

    await this.prisma.$transaction(updates);

    return this.findAll(tenantId);
  }
}
