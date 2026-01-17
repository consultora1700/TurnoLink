import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  // Services CRUD
  async create(tenantId: string, createServiceDto: CreateServiceDto) {
    const maxOrder = await this.prisma.service.aggregate({
      where: { tenantId },
      _max: { order: true },
    });

    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        tenantId,
        order: (maxOrder._max.order || 0) + 1,
      },
    });
  }

  async findAll(tenantId: string, includeInactive = false) {
    return this.prisma.service.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        category: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, tenantId },
      include: { category: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(tenantId: string, id: string, updateServiceDto: UpdateServiceDto) {
    await this.findById(tenantId, id);

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
      include: { category: true },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);

    // Check if service has bookings
    const bookingsCount = await this.prisma.booking.count({
      where: { serviceId: id },
    });

    if (bookingsCount > 0) {
      // Soft delete by deactivating
      return this.prisma.service.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.service.delete({ where: { id } });
  }

  async reorder(tenantId: string, serviceIds: string[]) {
    const updates = serviceIds.map((id, index) =>
      this.prisma.service.update({
        where: { id },
        data: { order: index + 1 },
      }),
    );

    await this.prisma.$transaction(updates);
    return this.findAll(tenantId, true);
  }

  // Categories CRUD
  async createCategory(tenantId: string, createCategoryDto: CreateCategoryDto) {
    const maxOrder = await this.prisma.serviceCategory.aggregate({
      where: { tenantId },
      _max: { order: true },
    });

    return this.prisma.serviceCategory.create({
      data: {
        ...createCategoryDto,
        tenantId,
        order: (maxOrder._max.order || 0) + 1,
      },
    });
  }

  async findAllCategories(tenantId: string) {
    return this.prisma.serviceCategory.findMany({
      where: { tenantId },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async updateCategory(tenantId: string, id: string, name: string) {
    const category = await this.prisma.serviceCategory.findFirst({
      where: { id, tenantId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.serviceCategory.update({
      where: { id },
      data: { name },
    });
  }

  async deleteCategory(tenantId: string, id: string) {
    const category = await this.prisma.serviceCategory.findFirst({
      where: { id, tenantId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Remove category from services (don't delete services)
    await this.prisma.service.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    return this.prisma.serviceCategory.delete({ where: { id } });
  }
}
