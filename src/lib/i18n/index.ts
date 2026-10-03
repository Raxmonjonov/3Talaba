import { DEFAULT_LOCALE, type Locale } from './config';
import { en } from './dictionaries/en';
import { uz, type Dictionary } from './dictionaries/uz';
import type { DictPath } from './types';

export type { Dictionary } from './dictionaries/uz';
export type { DictPath } from './types';

/**
 * Lug'atlar statik ma'lumot — maxfiy emas, shuning uchun server va klient
 * komponentlarida bir xil foydalaniladi (`t()` sof funksiya).
 */
const DICTIONARIES: Record<Locale, Dictionary> = { uz, en };

/** Til bo'yicha lug'atni oladi. `uz` — standart. */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Nuqta bilan ko'rsatilgan kalitni oladi va `{placeholder}` larni almashtiradi.
 * Kalit turi `DictPath` orqali cheklangan — noto'g'ri kalit build xatosi beradi.
 *
 * @example t(dict, 'dashboard.level', { n: 4 }) // "Level 4"
 */
export function t<K extends DictPath<Dictionary>>(
  dict: Dictionary,
  path: K,
  vars?: Record<string, string | number>,
): string {
  const raw = resolve(dict, path);
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

function resolve(dict: Dictionary, path: string): string {
  let current: unknown = dict;
  for (const part of path.split('.')) {
    if (current === null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : path;
}