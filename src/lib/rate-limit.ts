interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Oddiy va tez ishlovchi Token-Bucket Rate Limiter (Auth va AI endpointlari uchun).
 */
export function checkRateLimit(
  key: string,
  maxRequests = 20,
  windowMs = 60_000,
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.lastRefill >= windowMs) {
    buckets.set(key, { tokens: maxRequests - 1, lastRefill: now });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSec: 0 };
  }

  if (existing.tokens <= 0) {
    const retryAfterSec = Math.ceil((windowMs - (now - existing.lastRefill)) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  existing.tokens -= 1;
  return { allowed: true, remaining: existing.tokens, retryAfterSec: 0 };
}
