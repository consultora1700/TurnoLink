import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { softDeleteMiddleware } from './soft-delete.middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });

    // Apply soft delete middleware
    this.$use(softDeleteMiddleware);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Find records including soft-deleted ones
   * Use this when you need to see deleted records (admin, restore, etc.)
   *
   * @example
   * ```typescript
   * const allEmployees = await this.prisma.employee.findMany({
   *   where: { deletedAt: { not: null } }
   * });
   * ```
   */

  /**
   * Restore a soft-deleted record
   */
  async restoreEmployee(id: string) {
    return this.employee.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async restoreService(id: string) {
    return this.service.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async restoreCustomer(id: string) {
    return this.customer.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async restoreServiceCategory(id: string) {
    return this.serviceCategory.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Hard delete - permanently remove a record
   * Use with caution! This bypasses soft delete.
   */
  async hardDeleteEmployee(id: string) {
    return this.$executeRaw`DELETE FROM employees WHERE id = ${id}`;
  }

  async hardDeleteService(id: string) {
    return this.$executeRaw`DELETE FROM services WHERE id = ${id}`;
  }

  async hardDeleteCustomer(id: string) {
    return this.$executeRaw`DELETE FROM customers WHERE id = ${id}`;
  }

  async hardDeleteServiceCategory(id: string) {
    return this.$executeRaw`DELETE FROM service_categories WHERE id = ${id}`;
  }

  /**
   * Clean database - only for development/testing
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
    ) as string[];

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
        }
        return Promise.resolve();
      }),
    );
  }
}
