import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL || "";

  // Postgres (Netlify Database / Neon / any pg URL) → use the pg adapter
  // so Prisma works inside serverless functions.
  if (url.startsWith("postgres")) {
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter } as never);
  }

  // SQLite (local dev) → default engine.
  return new PrismaClient({ log: ["error"] });
}

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
