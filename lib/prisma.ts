import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
    datasourceUrl: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
