import { Prisma } from '@prisma/client';

/**
 * Models that support soft delete
 */
const SOFT_DELETE_MODELS = new Set([
  'Employee',
  'Service',
  'ServiceCategory',
  'Customer',
]);

/**
 * Prisma middleware for soft delete functionality
 *
 * This middleware:
 * 1. Converts delete operations to soft deletes (sets deletedAt)
 * 2. Automatically filters out soft-deleted records in queries
 *
 * @example
 * ```typescript
 * // In PrismaService constructor:
 * this.$use(softDeleteMiddleware);
 * ```
 */
export const softDeleteMiddleware: Prisma.Middleware = async (params, next) => {
  const model = params.model;

  // Only apply to soft-delete enabled models
  if (!model || !SOFT_DELETE_MODELS.has(model)) {
    return next(params);
  }

  // Handle delete operations
  if (params.action === 'delete') {
    // Convert delete to update with deletedAt
    params.action = 'update';
    params.args['data'] = { deletedAt: new Date() };
    return next(params);
  }

  // Handle deleteMany operations
  if (params.action === 'deleteMany') {
    // Convert deleteMany to updateMany with deletedAt
    params.action = 'updateMany';
    if (params.args.data !== undefined) {
      params.args.data['deletedAt'] = new Date();
    } else {
      params.args['data'] = { deletedAt: new Date() };
    }
    return next(params);
  }

  // Handle find operations - filter out soft-deleted records
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    // Change to findFirst to allow filtering
    params.action = 'findFirst';
    params.args.where = {
      ...params.args.where,
      deletedAt: null,
    };
    return next(params);
  }

  if (params.action === 'findMany') {
    // Exclude soft-deleted records unless explicitly requested
    if (!params.args) {
      params.args = {};
    }
    if (!params.args.where) {
      params.args.where = {};
    }
    // Only add filter if not explicitly querying deleted records
    if (params.args.where.deletedAt === undefined) {
      params.args.where.deletedAt = null;
    }
    return next(params);
  }

  // Handle count operations
  if (params.action === 'count') {
    if (!params.args) {
      params.args = {};
    }
    if (!params.args.where) {
      params.args.where = {};
    }
    if (params.args.where.deletedAt === undefined) {
      params.args.where.deletedAt = null;
    }
    return next(params);
  }

  // Handle aggregate operations
  if (params.action === 'aggregate') {
    if (!params.args) {
      params.args = {};
    }
    if (!params.args.where) {
      params.args.where = {};
    }
    if (params.args.where.deletedAt === undefined) {
      params.args.where.deletedAt = null;
    }
    return next(params);
  }

  return next(params);
};

/**
 * Helper type for models with soft delete
 */
export interface SoftDeleteFields {
  deletedAt: Date | null;
}
