import { PrismaClient } from '../generated/prisma';

export { PrismaClient };
export type { Prisma } from '../generated/prisma';

// Singleton instance
let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}
