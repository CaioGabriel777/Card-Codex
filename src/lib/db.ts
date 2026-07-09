import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 * In development, the client is cached on `globalThis` to survive HMR reloads.
 * In production, a single instance is created.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
