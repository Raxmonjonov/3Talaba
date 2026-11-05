import { PrismaClient } from "@prisma/client";
import {
  decryptPrismaResult,
  encryptPrismaWhereFilter,
  encryptPrismaWriteData,
} from "@/lib/security/encryption";

const WRITE_ACTIONS = new Set([
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
]);

const WHERE_ACTIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "count",
]);

const READ_RESULT_ACTIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "create",
  "update",
  "upsert",
]);

function createEncryptedPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Bazadagi barcha maxfiy foydalanuvchi maydonlarini AES-256-GCM orqali shaffof shifrlash / deshifrlash
  client.$use(async (params, next) => {
    const model = params.model;
    if (!model) {
      return next(params);
    }

    if (WHERE_ACTIONS.has(params.action) && params.args?.where) {
      params.args.where = encryptPrismaWhereFilter(model, params.args.where);
    }

    if (WRITE_ACTIONS.has(params.action) && params.args) {
      if (params.action === "upsert") {
        if (params.args.create) {
          params.args.create = encryptPrismaWriteData(model, params.args.create);
        }
        if (params.args.update) {
          params.args.update = encryptPrismaWriteData(model, params.args.update);
        }
      } else if (params.args.data !== undefined) {
        params.args.data = encryptPrismaWriteData(model, params.args.data);
      }
    }

    const result = await next(params);

    if (READ_RESULT_ACTIONS.has(params.action) && result !== null && result !== undefined) {
      return decryptPrismaResult(model, result);
    }

    return result;
  });

  return client;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createEncryptedPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
