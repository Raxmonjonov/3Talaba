/**
 * 3Talaba Campus — Kriptografik Ma'lumotlarni Shifrlash Dvigateli (At-Rest Encryption)
 *
 * Arxitektura:
 * 1. Tasodifiy IV bilan haqiqiy autentifikatsiyalangan shifrlash: AES-256-GCM (96-bit CSPRNG IV + 128-bit Auth Tag)
 *    Format: `enc:v1:<iv_b64url>:<tag_b64url>:<ciphertext_b64url>`
 * 2. Qidiriladigan maydonlar (masalan, `User.phone`) uchun deterministik autentifikatsiyalangan shifrlash:
 *    AES-256-GCM-SIV uslubida (HMAC-SHA256 sintetik IV + AES-256-GCM Auth Tag)
 *    Format: `enc:det1:<siv_b64url>:<tag_b64url>:<ciphertext_b64url>`
 * 3. Kalitlarni ajratish (Key Separation): HKDF-SHA256 orqali master kalitdan alohida sub-kalitlar olinadi.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
} from "node:crypto";

const ENC_RANDOM_PREFIX = "enc:v1:";
const ENC_DET_PREFIX = "enc:det1:";
const HKDF_SALT = "3talaba-campus-kdf-salt-2026-v1";

interface DerivedKeys {
  randomAesKey: Buffer;
  detAesKey: Buffer;
  detMacKey: Buffer;
}

let cachedMasterSecret: string | null = null;
let cachedKeys: DerivedKeys | null = null;

function resolveMasterSecret(): string {
  const dedicated = process.env.DATA_ENCRYPTION_KEY?.trim();
  if (dedicated && dedicated.length >= 16) {
    return dedicated;
  }

  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
  if (nextAuthSecret && nextAuthSecret.length >= 16) {
    return nextAuthSecret;
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    // Serverless preview yoki fallback holatida tizim to'xtab qolmasligi, lekin xavfsiz ishlashi uchun
    // xabar berib zaxira kalitdan foydalanadi (production serverda DATA_ENCRYPTION_KEY tavsiya etiladi)
    return "3talaba-campus-prod-fallback-master-key-change-in-env-2026";
  }

  return "3talaba-campus-local-dev-encryption-master-key-2026";
}

function getDerivedKeys(): DerivedKeys {
  const secret = resolveMasterSecret();
  if (cachedKeys && cachedMasterSecret === secret) {
    return cachedKeys;
  }

  const randomAesKey = Buffer.from(
    hkdfSync("sha256", secret, HKDF_SALT, "3talaba:aes-256-gcm:random:v1", 32),
  );
  const detAesKey = Buffer.from(
    hkdfSync("sha256", secret, HKDF_SALT, "3talaba:aes-256-gcm:det-enc:v1", 32),
  );
  const detMacKey = Buffer.from(
    hkdfSync("sha256", secret, HKDF_SALT, "3talaba:hmac-sha256:det-siv:v1", 32),
  );

  cachedMasterSecret = secret;
  cachedKeys = { randomAesKey, detAesKey, detMacKey };
  return cachedKeys;
}

export function isEncryptedPayload(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value.startsWith(ENC_RANDOM_PREFIX) || value.startsWith(ENC_DET_PREFIX))
  );
}

/**
 * Har safar yangi 96-bit tasodifiy IV bilan AES-256-GCM da shifrlaydi.
 * Bir xil matn ikki marta shifrlanganda ikki xil shifrmatn hosil bo'ladi.
 */
export function encryptField(plaintext: string | null | undefined): string | null | undefined {
  if (plaintext === null || plaintext === undefined || plaintext === "") {
    return plaintext;
  }
  if (isEncryptedPayload(plaintext)) {
    return plaintext;
  }

  const { randomAesKey } = getDerivedKeys();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", randomAesKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENC_RANDOM_PREFIX}${iv.toString("base64url")}:${authTag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

/**
 * Qidiruv (`WHERE phone = ...`) ishlashi kerak bo'lgan maxfiy maydonlar uchun
 * deterministik AES-256-GCM shifrlash (HMAC-SHA256 sintetik IV bilan).
 */
export function encryptDeterministic(
  plaintext: string | null | undefined,
  context = "default",
): string | null | undefined {
  if (plaintext === null || plaintext === undefined || plaintext === "") {
    return plaintext;
  }
  if (isEncryptedPayload(plaintext)) {
    return plaintext;
  }

  const { detAesKey, detMacKey } = getDerivedKeys();
  const siv = createHmac("sha256", detMacKey)
    .update(`${context}:${plaintext}`, "utf8")
    .digest()
    .subarray(0, 12);

  const cipher = createCipheriv("aes-256-gcm", detAesKey, siv);
  cipher.setAAD(Buffer.from(context, "utf8"));
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENC_DET_PREFIX}${siv.toString("base64url")}:${authTag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

/**
 * `enc:v1:...` yoki `enc:det1:...` shifrmatnni AES-256-GCM orqali haqiqiyligini (Auth Tag)
 * tekshirib ochadi. Agar shifrmatn buzilgan (tampered) bo'lsa, xato qaytaradi (`strict = true`)
 * yoki xavfsiz tarzda rad etadi. Eski shifrlanmagan yozuvlarni o'zgarishsiz qaytaradi.
 */
export function decryptField(
  payload: string | null | undefined,
  options?: { context?: string; strict?: boolean },
): string | null | undefined {
  if (payload === null || payload === undefined || payload === "") {
    return payload;
  }

  if (payload.startsWith(ENC_RANDOM_PREFIX)) {
    const raw = payload.slice(ENC_RANDOM_PREFIX.length);
    const parts = raw.split(":");
    if (parts.length !== 3) {
      if (options?.strict) throw new Error("Shifrlangan ma'lumot formati buzilgan");
      return "[SHIFRLANGAN]";
    }

    try {
      const [ivB64, tagB64, ctB64] = parts as [string, string, string];
      const iv = Buffer.from(ivB64, "base64url");
      const authTag = Buffer.from(tagB64, "base64url");
      const ciphertext = Buffer.from(ctB64, "base64url");
      if (iv.length !== 12 || authTag.length !== 16) {
        throw new Error("IV yoki AuthTag uzunligi noto'g'ri");
      }

      const { randomAesKey } = getDerivedKeys();
      const decipher = createDecipheriv("aes-256-gcm", randomAesKey, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return decrypted.toString("utf8");
    } catch (err) {
      if (options?.strict) {
        throw err instanceof Error ? err : new Error("Shifrni ochishda rad etildi");
      }
      return "[SHIFRLANGAN]";
    }
  }

  if (payload.startsWith(ENC_DET_PREFIX)) {
    const raw = payload.slice(ENC_DET_PREFIX.length);
    const parts = raw.split(":");
    if (parts.length !== 3) {
      if (options?.strict) throw new Error("Deterministik shifr formati buzilgan");
      return "[SHIFRLANGAN]";
    }

    try {
      const [sivB64, tagB64, ctB64] = parts as [string, string, string];
      const siv = Buffer.from(sivB64, "base64url");
      const authTag = Buffer.from(tagB64, "base64url");
      const ciphertext = Buffer.from(ctB64, "base64url");
      if (siv.length !== 12 || authTag.length !== 16) {
        throw new Error("SIV yoki AuthTag uzunligi noto'g'ri");
      }

      const context = options?.context ?? "default";
      const { detAesKey } = getDerivedKeys();
      const decipher = createDecipheriv("aes-256-gcm", detAesKey, siv);
      decipher.setAAD(Buffer.from(context, "utf8"));
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return decrypted.toString("utf8");
    } catch (err) {
      if (options?.strict) {
        throw err instanceof Error ? err : new Error("Deterministik shifr rad etildi");
      }
      return "[SHIFRLANGAN]";
    }
  }

  // Eski (legacy) shifrlanmagan matn — teskari moslik (backward compatibility)
  return payload;
}

// ============================================================================
// PRISMA AVTOMATIK MAYDON SHIFRLASH XARITASI (Transparent At-Rest Encryption)
// ============================================================================

type FieldEncryptionRule =
  | { mode: "random" }
  | { mode: "deterministic"; context: string };

export const PRISMA_ENCRYPTED_FIELDS: Record<string, Record<string, FieldEncryptionRule>> = {
  User: {
    phone: { mode: "deterministic", context: "User.phone" },
  },
  Profile: {
    region: { mode: "random" },
    targetUniversity: { mode: "random" },
    targetCountry: { mode: "random" },
  },
  ChatMessage: {
    content: { mode: "random" },
    metadataJson: { mode: "random" },
  },
  Attempt: {
    givenAnswer: { mode: "random" },
    aiFeedback: { mode: "random" },
  },
  PlacementResult: {
    writingSpeakingAdvice: { mode: "random" },
    strengthsJson: { mode: "random" },
    weaknessesJson: { mode: "random" },
    subjectScoresJson: { mode: "random" },
  },
  DailyPlan: {
    tasksJson: { mode: "random" },
  },
};

const RELATION_MODEL_MAP: Record<string, Record<string, string>> = {
  User: {
    profile: "Profile",
    attempts: "Attempt",
    placementResults: "PlacementResult",
    dailyPlans: "DailyPlan",
    chatSessions: "ChatSession",
  },
  Profile: {
    user: "User",
  },
  ChatSession: {
    user: "User",
    messages: "ChatMessage",
  },
  ChatMessage: {
    session: "ChatSession",
  },
  Attempt: {
    user: "User",
  },
  PlacementResult: {
    user: "User",
  },
  DailyPlan: {
    user: "User",
  },
};

/**
 * Prisma `data` obyektidagi maxfiy maydonlarni (va ichki `create`/`update`/`upsert` bog'lamalarini)
 * bazaga yozishdan oldin avtomatik AES-256-GCM da shifrlaydi.
 */
export function encryptPrismaWriteData(
  modelName: string,
  data: unknown,
): unknown {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map((item) => encryptPrismaWriteData(modelName, item));
  }

  const record = data as Record<string, unknown>;
  const modelRules = PRISMA_ENCRYPTED_FIELDS[modelName] ?? {};
  const relationMap = RELATION_MODEL_MAP[modelName] ?? {};
  const out: Record<string, unknown> = { ...record };

  for (const [key, value] of Object.entries(record)) {
    const rule = modelRules[key];
    if (rule) {
      if (typeof value === "string") {
        out[key] =
          rule.mode === "deterministic"
            ? encryptDeterministic(value, rule.context)
            : encryptField(value);
      } else if (
        value &&
        typeof value === "object" &&
        "set" in (value as Record<string, unknown>) &&
        typeof (value as { set?: unknown }).set === "string"
      ) {
        const rawSet = (value as { set: string }).set;
        out[key] = {
          ...(value as Record<string, unknown>),
          set:
            rule.mode === "deterministic"
              ? encryptDeterministic(rawSet, rule.context)
              : encryptField(rawSet),
        };
      }
      continue;
    }

    const nestedModel = relationMap[key];
    if (nestedModel && value && typeof value === "object") {
      const relObj = { ...(value as Record<string, unknown>) };
      for (const op of ["create", "update", "createMany"]) {
        if (op in relObj && relObj[op] && typeof relObj[op] === "object") {
          if (op === "createMany" && "data" in (relObj[op] as Record<string, unknown>)) {
            relObj[op] = {
              ...(relObj[op] as Record<string, unknown>),
              data: encryptPrismaWriteData(
                nestedModel,
                (relObj[op] as { data: unknown }).data,
              ),
            };
          } else {
            relObj[op] = encryptPrismaWriteData(nestedModel, relObj[op]);
          }
        }
      }
      if ("upsert" in relObj && relObj.upsert && typeof relObj.upsert === "object") {
        const up = relObj.upsert as Record<string, unknown>;
        relObj.upsert = {
          ...up,
          ...(up.create ? { create: encryptPrismaWriteData(nestedModel, up.create) } : {}),
          ...(up.update ? { update: encryptPrismaWriteData(nestedModel, up.update) } : {}),
        };
      }
      out[key] = relObj;
    }
  }

  return out;
}

/**
 * Prisma `where` filtrlaridagi deterministik shifrlangan maydonlarni (masalan, `User.phone`)
 * qidiruv vaqtida avtomatik shifrlangan qiymatga o'giradi.
 */
export function encryptPrismaWhereFilter(
  modelName: string,
  where: unknown,
): unknown {
  if (!where || typeof where !== "object") return where;
  if (Array.isArray(where)) {
    return where.map((item) => encryptPrismaWhereFilter(modelName, item));
  }

  const record = where as Record<string, unknown>;
  const modelRules = PRISMA_ENCRYPTED_FIELDS[modelName] ?? {};
  const out: Record<string, unknown> = { ...record };

  for (const [key, value] of Object.entries(record)) {
    if (key === "OR" || key === "AND" || key === "NOT") {
      out[key] = encryptPrismaWhereFilter(modelName, value);
      continue;
    }

    const rule = modelRules[key];
    if (rule && rule.mode === "deterministic") {
      if (typeof value === "string") {
        out[key] = encryptDeterministic(value, rule.context);
      } else if (
        value &&
        typeof value === "object" &&
        typeof (value as { equals?: unknown }).equals === "string"
      ) {
        out[key] = {
          ...(value as Record<string, unknown>),
          equals: encryptDeterministic(
            (value as { equals: string }).equals,
            rule.context,
          ),
        };
      }
    }
  }

  return out;
}

/**
 * Bazadan o'qilgan natijani (shu jumladan ichki `include`/`select` bog'lamalarini)
 * ilova kodi uchun shaffof ravishda deshifrlaydi.
 */
export function decryptPrismaResult<T>(modelName: string, result: T): T {
  if (!result || typeof result !== "object") return result;
  if (Array.isArray(result)) {
    return result.map((item) => decryptPrismaResult(modelName, item)) as unknown as T;
  }
  if (result instanceof Date) return result;

  const record = result as Record<string, unknown>;
  const modelRules = PRISMA_ENCRYPTED_FIELDS[modelName] ?? {};
  const relationMap = RELATION_MODEL_MAP[modelName] ?? {};
  const out: Record<string, unknown> = { ...record };

  for (const [key, value] of Object.entries(record)) {
    const rule = modelRules[key];
    if (rule && typeof value === "string") {
      out[key] = decryptField(value, {
        context: rule.mode === "deterministic" ? rule.context : undefined,
      });
      continue;
    }

    const nestedModel = relationMap[key];
    if (nestedModel && value && typeof value === "object") {
      out[key] = decryptPrismaResult(nestedModel, value);
    }
  }

  return out as T;
}
