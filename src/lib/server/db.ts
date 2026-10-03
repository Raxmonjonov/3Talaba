import 'server-only';

import { PrismaClient } from '@prisma/client';

import { getServerEnv } from '@/lib/env';

/**
 * Prisma klienti.
 *
 * `globalThis` ga saqlanadi — Next.js dev rejimida modul qayta yuklanganda
 * ulanishlar soni oshmasligi uchun (Prisma o'zi ham shuni tavsiya qiladi).
 */

declare global {
  var __3talabPrisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const env = getServerEnv();
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : env.NODE_ENV === 'test'
          ? ['error']
          : ['error'],
    datasources: { db: { url: env.DATABASE_URL } },
  });
}

export const prisma: PrismaClient = globalThis.__3talabPrisma ?? createClient();

if (getServerEnv().NODE_ENV !== 'production') {
  globalThis.__3talabPrisma = prisma;
}

export type { PrismaClient } from '@prisma/client';