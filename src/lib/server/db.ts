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

let realClient: PrismaClient | null = null;

function resolveClient(): PrismaClient {
  if (!realClient) {
    realClient = globalThis.__3talabPrisma ?? createClient();
    if (process.env.NODE_ENV !== 'production') {
      globalThis.__3talabPrisma = realClient;
    }
  }
  return realClient;
}

/**
 * Klient faqat birinchi ishlatilishda yaratiladi.
 *
 * `next build` paytida route modullari import qilinadi, lekin so'rov
 * bajarilmaydi. Shu sababli `DATABASE_URL` yo'q bo'lsa ham build
 * muvaffaqiyatli o'tishi uchun klient darhol emas, kerak bo'lganda
 * yaratiladi.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const value = Reflect.get(resolveClient() as object, property, receiver);
    return typeof value === 'function' ? value.bind(resolveClient()) : value;
  },
});

export type { PrismaClient } from '@prisma/client';