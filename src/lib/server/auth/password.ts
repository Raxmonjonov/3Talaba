import 'server-only';

import argon2 from 'argon2';

/**
 * Parol xeshlash — Argon2id (OWASP birinchi tavsiya).
 *
 * sozlamalar: memoryCost 64 MB, timeCost 3, parallelism 4.
 * Bu serverda ~100 ms davom etadi — brute-force himoyasi uchun yetarli,
 * lekin foydalanuvchi sezmaydi.
 */
const ARGON_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON_OPTIONS);
}

/** Xatolikni yashirmaslik uchun `false` qaytaradi (timing-safe argon2.verify). */
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export function passwordProblem(plain: string): string | null {
  if (plain.length < 8) return 'password_too_short';
  if (plain.length > 200) return 'password_too_long';
  if (!/[A-Za-z\u0400-\u04FF]/.test(plain)) return 'password_needs_letter';
  if (!/[0-9]/.test(plain)) return 'password_needs_digit';
  if (/^(.)\1+$/.test(plain)) return 'password_too_simple';
  return null;
}

/** Kuchsiz parollar ro'yxati (eng ko'p ishlatiladigan 100 ta dan bir nechasi). */
const WEAK = new Set([
  'password',
  'password1',
  '12345678',
  '123456789',
  'qwertyui',
  'qwerty123',
  'iloveyou',
  'admin123',
  'welcome1',
  '1234567890',
  'letmein1',
  'football',
  'princess',
  'sunshine',
  'charlie1',
  'shadow1',
  'michael1',
  '12345678a',
]);

export function isCommonPassword(plain: string): boolean {
  return WEAK.has(plain.toLowerCase());
}