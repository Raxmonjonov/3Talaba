import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let client: PrismaClient | null = null;

/** Lazy singleton — only connects when first query runs. */
export function getPrisma(): PrismaClient {
  if (client) return client;

  const url = process.env.DATABASE_URL || "";

  if (url.startsWith("postgres")) {
    const adapter = new PrismaPg(new Pool({ connectionString: url }));
    client = new PrismaClient({ adapter } as never);
  } else {
    client = new PrismaClient({ log: ["error"] });
  }

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

// Keep a `prisma` export for existing imports — it proxies through the
// lazy getter so importing the module never triggers a connection.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop];
  },
});
