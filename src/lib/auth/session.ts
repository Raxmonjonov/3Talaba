import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { isPostgresConfigured } from "@/lib/env";

export const SESSION_COOKIE_NAME = "flux_session";
const LEGACY_SESSION_COOKIE_NAME = "3talab_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

interface StoredFallbackUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

function getSecret(): string {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "3talab-v2-dev-fallback-secret-key-2026"
  );
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;
  const derived = scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(keyHex, "hex");
  if (derived.length !== storedBuf.length) return false;
  return timingSafeEqual(derived, storedBuf);
}

export function createSessionToken(user: SessionUser): string {
  const payloadObj = {
    id: user.id,
    name: user.name,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj), "utf8").toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0) return null;
  const payloadB64 = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      id?: string;
      name?: string;
      email?: string;
      exp?: number;
    };
    if (!parsed.id || !parsed.email || !parsed.exp) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      id: parsed.id,
      name: parsed.name || "O'quvchi",
      email: parsed.email,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ??
    cookieStore.get(LEGACY_SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifySessionToken(raw);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

// ── User Persistence (PostgreSQL Primary + Local JSON Fallback) ──

async function readFallbackUsers(): Promise<StoredFallbackUser[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "users.json");
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFallbackUsers(users: StoredFallbackUser[]): Promise<void> {
  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "users.json"), JSON.stringify(users, null, 2), "utf8");
}

export async function registerUserAccount(params: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const cleanName = params.name.trim();
  const passwordHash = hashPassword(params.password);

  if (isPostgresConfigured()) {
    try {
      const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return { ok: false, error: "Bu email allaqachon ro'yxatdan o'tgan. Kirish oynasidan foydalaning." };
      }
      const created = await db.user.create({
        data: {
          name: cleanName,
          email: normalizedEmail,
          passwordHash,
        },
      });
      return {
        ok: true,
        user: {
          id: created.id,
          name: created.name ?? cleanName,
          email: created.email,
        },
      };
    } catch (err) {
      console.warn("[auth] PostgreSQL unavailable, using local fallback store:", err);
    }
  }

  const users = await readFallbackUsers();
  if (users.some((u) => u.email === normalizedEmail)) {
    return { ok: false, error: "Bu email allaqachon ro'yxatdan o'tgan. Kirish oynasidan foydalaning." };
  }

  const newUser: StoredFallbackUser = {
    id: randomUUID(),
    name: cleanName,
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  try {
    await writeFallbackUsers(users);
  } catch {
    // ignore read-only fs
  }

  return {
    ok: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  };
}

export async function authenticateUserAccount(params: {
  email: string;
  password: string;
}): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const normalizedEmail = params.email.trim().toLowerCase();

  if (isPostgresConfigured()) {
    try {
      const found = await db.user.findUnique({ where: { email: normalizedEmail } });
      if (!found || !found.passwordHash || !verifyPassword(params.password, found.passwordHash)) {
        return { ok: false, error: "Email yoki parol noto'g'ri kiritildi." };
      }
      return {
        ok: true,
        user: {
          id: found.id,
          name: found.name ?? "O'quvchi",
          email: found.email,
        },
      };
    } catch (err) {
      console.warn("[auth] PostgreSQL login fallback:", err);
    }
  }

  const users = await readFallbackUsers();
  const found = users.find((u) => u.email === normalizedEmail);
  if (!found || !verifyPassword(params.password, found.passwordHash)) {
    return { ok: false, error: "Email yoki parol noto'g'ri kiritildi." };
  }

  return {
    ok: true,
    user: {
      id: found.id,
      name: found.name,
      email: found.email,
    },
  };
}
