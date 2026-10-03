import 'server-only';

import { prisma } from '@/lib/server/db';
import { getServerEnv } from '@/lib/env';

type Bucket = { count: number; resetAt: number };

/**
 * Rate limiting.
 *
 * Bir jarayon ichida — xotira (tez), bir nechta instance ishga tushganda —
 * `RateLimitBucket` jadvali (ulashilgan). DB har bir so'rovda yozish kerak
 * bo'lgani uchun `RATE_LIMIT_ENABLED=false` bilan o'chirilishi mumkin
 * (masalan, faqat proxy-level limiting qo'yilgan holatda).
 */
const memory = new Map<string, Bucket>();

export type RateLimitRule = {
  /** Oynaning uzunligi (ms) */
  windowMs: number;
  /** Oynada ruxsat etilgan so'rovlar soni */
  limit: number;
};

export const RULES = {
  login: { windowMs: 15 * 60_000, limit: 5 },
  register: { windowMs: 60 * 60_000, limit: 3 },
  passwordReset: { windowMs: 60 * 60_000, limit: 3 },
  chat: { windowMs: 60_000, limit: 30 },
  placement: { windowMs: 60 * 60_000, limit: 40 },
  sessionTick: { windowMs: 60_000, limit: 120 },
  general: { windowMs: 60_000, limit: 120 },
} satisfies Record<string, RateLimitRule>;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export async function rateLimit(
  key: string,
  rule: RateLimitRule,
): Promise<RateLimitResult> {
  if (!getServerEnv().RATE_LIMIT_ENABLED) {
    return { allowed: true, remaining: rule.limit, resetAt: Date.now() + rule.windowMs };
  }

  const bucketKey = `${key}`;

  if (process.env.RATE_LIMIT_STORE === 'db') {
    return rateLimitDb(bucketKey, rule);
  }
  return rateLimitMemory(bucketKey, rule);
}

function rateLimitMemory(key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  const bucket = memory.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + rule.windowMs };
    memory.set(key, fresh);
    return { allowed: true, remaining: rule.limit - 1, resetAt: fresh.resetAt };
  }

  bucket.count += 1;
  const allowed = bucket.count <= rule.limit;
  return { allowed, remaining: Math.max(0, rule.limit - bucket.count), resetAt: bucket.resetAt };
}

async function rateLimitDb(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const now = Date.now();
  try {
    const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });

    if (!bucket || bucket.windowStart.getTime() + rule.windowMs <= now) {
      await prisma.rateLimitBucket.upsert({
        where: { key },
        create: { key, windowStart: new Date(now), count: 1 },
        update: { windowStart: new Date(now), count: 1 },
      });
      return { allowed: true, remaining: rule.limit - 1, resetAt: now + rule.windowMs };
    }

    const count = bucket.count + 1;
    await prisma.rateLimitBucket.update({ where: { key }, data: { count } });

    const resetAt = bucket.windowStart.getTime() + rule.windowMs;
    return {
      allowed: count <= rule.limit,
      remaining: Math.max(0, rule.limit - count),
      resetAt,
    };
  } catch {
    // DB ishlamasa — xotiraga qaytamiz (availability > strictness)
    return rateLimitMemory(key, rule);
  }
}

/** Oynalar tugagach xotira tozalanadi (server uzoq vaqt ishlasa o'smaydi). */
export function pruneMemoryStore(): void {
  const now = Date.now();
  for (const [key, bucket] of memory.entries()) {
    if (bucket.resetAt <= now) memory.delete(key);
  }
}