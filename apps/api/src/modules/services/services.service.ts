import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { CacheService } from '../../common/cache';

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Convert Prisma Decimal to number for JSON serialization
   */
  private serializeService<T extends { price: Decimal; images?: string; variations?: string }>(service: T): T & { price: number; images: string[]; variations: unknown[] } {
    let parsedImages: string[] = [];
    try {
      parsedImages = service.images ? JSON.parse(service.images as string) : [];
    } catch { parsedImages = []; }
    let parsedVariations: unknown[] = [];
    try {
      parsedVariations = service.variations ? JSON.parse(service.variations as string) : [];
      // Sanitize: remove empty groups and options
      parsedVariations = (parsedVariations as any[])
        .filter((g: any) => g.label?.trim() && Array.isArray(g.options))
        .map((g: any) => ({ ...g, options: (g.options || []).filter((o: any) => o.name?.trim()) }))
        .filter((g: any) => g.options.length > 0);
    } catch { parsedVariations = []; }
    return {
      ...service,
      price: Number(service.price),
      images: parsedImages,
      variations: parsedVariations,
      packOriginalPrice: (service as any).packOriginalPrice != null ? Number((service as any).packOriginalPrice) : null,
      promoPrice: (service as any).promoPrice != null ? Number((service as any).promoPrice) : null,
    };
  }

  private serializeServices<T extends { price: Decimal }>(services: T[]): (T & { price: number })[] {
    return services.map(s => this.serializeService(s));
  }

  // Services CRUD
  async create(tenantId: string, createServiceDto: CreateServiceDto) {
    const maxOrder = await this.prisma.service.aggregate({
      where: { tenantId },
      _max: { order: true },
    });

    const { images, variations, packCheckIn, packCheckOut, promoStartDate, promoEndDate, ...rest } = createServiceDto;
    const service = await this.prisma.service.create({
      data: {
        ...rest,
        images: images ? JSON.stringify(images) : '[]',
        variations: variations || '[]',
        tenantId,
        order: (maxOrder._max.order || 0) + 1,
        packCheckIn: packCheckIn ? new Date(packCheckIn) : null,
        packCheckOut: packCheckOut ? new Date(packCheckOut) : null,
        promoStartDate: promoStartDate ? new Date(promoStartDate) : null,
        promoEndDate: promoEndDate ? new Date(promoEndDate) : null,
      },
    });

    await this.cacheService.invalidateTenantServices(tenantId);
    return this.serializeService(service);
  }

  async findAll(tenantId: string, includeInactive = false, skipCache = false) {
    // Cache only for public-facing queries (not admin panel)
    if (!includeInactive && !skipCache) {
      const cached = await this.cacheService.getTenantServices(tenantId);
      if (cached) return cached;
    }

    const services = await this.prisma.service.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        category: true,
        specialty: true,
      },
      orderBy: { order: 'asc' },
    });

    const result = this.serializeServices(services);

    // Only populate cache for non-admin queries
    if (!includeInactive && !skipCache) {
      await this.cacheService.setTenantServices(tenantId, result);
    }

    return result;
  }

  async findById(tenantId: string, id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, tenantId },
      include: { category: true, specialty: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.serializeService(service);
  }

  /**
   * Update a service with atomic tenant isolation.
   * Uses interactive transaction to ensure the record belongs to tenant before updating.
   */
  async update(tenantId: string, id: string, updateServiceDto: UpdateServiceDto) {
    const updated = await this.prisma.$transaction(async (tx) => {
      // Verify ownership atomically
      const service = await tx.service.findFirst({
        where: { id, tenantId },
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      // Safe to update - ownership verified within same transaction
      const { images, variations, packCheckIn, packCheckOut, promoStartDate, promoEndDate, ...rest } = updateServiceDto;
      const data: Record<string, unknown> = { ...rest };
      if (images !== undefined) {
        data.images = JSON.stringify(images);
      }
      if (variations !== undefined) {
        data.variations = variations;
      }
      if (packCheckIn !== undefined) data.packCheckIn = packCheckIn ? new Date(packCheckIn) : null;
      if (packCheckOut !== undefined) data.packCheckOut = packCheckOut ? new Date(packCheckOut) : null;
      if (promoStartDate !== undefined) data.promoStartDate = promoStartDate ? new Date(promoStartDate) : null;
      if (promoEndDate !== undefined) data.promoEndDate = promoEndDate ? new Date(promoEndDate) : null;
      return tx.service.update({
        where: { id },
        data,
        include: { category: true },
      });
    });

    await this.cacheService.invalidateTenantServices(tenantId);
    return this.serializeService(updated);
  }

  /**
   * Delete a service with atomic tenant isolation.
   * Soft deletes if service has bookings, hard deletes otherwise.
   */
  async delete(tenantId: string, id: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      // Verify ownership atomically
      const service = await tx.service.findFirst({
        where: { id, tenantId },
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      // Check if service has bookings
      const bookingsCount = await tx.booking.count({
        where: { serviceId: id },
      });

      if (bookingsCount > 0) {
        // Soft delete by deactivating
        return tx.service.update({
          where: { id },
          data: { isActive: false },
        });
      }

      return tx.service.delete({ where: { id } });
    });

    await this.cacheService.invalidateTenantServices(tenantId);
    return this.serializeService(result);
  }

  /**
   * Reorder services with tenant isolation.
   * Uses updateMany for efficiency with tenant filtering.
   */
  async reorder(tenantId: string, serviceIds: string[]) {
    // Use a transaction to ensure all updates succeed or none
    await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < serviceIds.length; index++) {
        const result = await tx.service.updateMany({
          where: { id: serviceIds[index], tenantId },
          data: { order: index + 1 },
        });

        // Verify the service belonged to this tenant
        if (result.count === 0) {
          throw new NotFoundException(`Service ${serviceIds[index]} not found`);
        }
      }
    });

    // findAll already serializes services
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
    const categories = await this.prisma.serviceCategory.findMany({
      where: { tenantId },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Serialize services within categories
    return categories.map(category => ({
      ...category,
      services: this.serializeServices(category.services),
    }));
  }

  /**
   * Update category with atomic tenant isolation.
   */
  async updateCategory(tenantId: string, id: string, name: string) {
    return this.prisma.$transaction(async (tx) => {
      const category = await tx.serviceCategory.findFirst({
        where: { id, tenantId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return tx.serviceCategory.update({
        where: { id },
        data: { name },
      });
    });
  }

  // --- Service-Employee management ---

  /**
   * Get employees assigned to a service with custom pricing.
   */
  async getServiceEmployees(tenantId: string, serviceId: string) {
    await this.findById(tenantId, serviceId);

    const employeeServices = await this.prisma.employeeService.findMany({
      where: { serviceId },
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
            isPubliclyVisible: true,
          },
        },
      },
      orderBy: {
        employee: { order: 'asc' },
      },
    });

    return employeeServices.map((es) => ({
      ...es.employee,
      customPrice: es.customPrice ? Number(es.customPrice) : null,
      customDuration: es.customDuration,
    }));
  }

  /**
   * Delete category with atomic tenant isolation.
   * Removes category reference from services before deletion.
   */
  async deleteCategory(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const category = await tx.serviceCategory.findFirst({
        where: { id, tenantId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Remove category from services (don't delete services)
      await tx.service.updateMany({
        where: { categoryId: id, tenantId },
        data: { categoryId: null },
      });

      return tx.serviceCategory.delete({ where: { id } });
    });
  }
}
