interface Bucket {
  tokens: number;
  lastRefill: number;
}

const MAX_BUCKETS = 10_000;
const buckets = new Map<string, Bucket>();

/**
 * Yuqori oqim (High-Traffic) va DDoS hujumlarida xotira to'lib qolmaydigan (Bounded LRU)
 * tezkor Token-Bucket Rate Limiter.
 */
export function checkRateLimit(
  key: string,
  maxRequests = 30,
  windowMs = 60_000,
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.lastRefill >= windowMs) {
    if (!existing && buckets.size >= MAX_BUCKETS) {
      // Eng eski kalitni O(1) vaqtda tozalab, RAM to'lishining oldini olamiz
      const oldestKey = buckets.keys().next().value;
      if (oldestKey !== undefined) {
        buckets.delete(oldestKey);
      }
    }
    buckets.set(key, { tokens: maxRequests - 1, lastRefill: now });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSec: 0 };
  }

  if (existing.tokens <= 0) {
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - existing.lastRefill)) / 1000));
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  existing.tokens -= 1;
  return { allowed: true, remaining: existing.tokens, retryAfterSec: 0 };
}
