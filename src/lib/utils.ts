import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Locale } from '@/lib/i18n/config';

/** shadcn/us биринши услуби — klasslarni birlashtiradi va ziddiyatni hal qiladi. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Ma'lumotlar bazasidagi `{ uz, en }` tipidagi lokal matnni berilgan tilga aylantiradi.
 * `en` yo'q bo'lsa `uz` ga, u ham yo'q bo'lsa bo'sh satrga qaytadi.
 */
export function localize(value: unknown, locale: Locale): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';

  if (Array.isArray(value)) {
    return value.map((item) => localize(item, locale)).join(' ');
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const primary = record[locale];
    if (typeof primary === 'string' && primary.length > 0) return primary;
    const fallback = record.uz ?? record.en;
    if (typeof fallback === 'string') return fallback;
    return Object.keys(record)
      .sort()
      .map((key) => localize(record[key], locale))
      .join('\n');
  }

  return String(value);
}

/** `{ uz, en }` obyektini yaratish uchun yordamchi (seed va kontentda qulay). */
export function t_(uz: string, en: string): { uz: string; en: string } {
  return { uz, en };
}

/** Xavfsiz JSON parse — ishlatilgan joylarda try/catch o'rnini bosadi. */
export function safeJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** 3660 → "1 soat 1 daqiqa" / 90 → "1 daqiqa 30 sekund" */
export function formatDuration(totalSeconds: number, locale: Locale = 'uz'): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(locale === 'uz' ? `${hours} soat` : `${hours}h`);
  if (minutes > 0) parts.push(locale === 'uz' ? `${minutes} daqiqa` : `${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(locale === 'uz' ? `${secs} soniya` : `${secs}s`);

  if (parts.length === 0) return locale === 'uz' ? '0 daqiqa' : '0m';
  return parts.join(' ');
}

/** "23:05" → kechki soatni tekshirish uchun daqiqalarda */
export function parseHhMm(value: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return 23 * 60;
  const [, h, m] = match;
  return Number(h) * 60 + Number(m);
}

/** "2026-01-05" → Date (UTC midnight), timezone siljishasidan xoli */
export function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(value);
  const [, y, m, d] = match;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

/** Date → "2026-01-05" (locale'da ko'rsatish uchun, UTC asosida) */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Progress foizini 0..100 oralig'ida, bitta kasr bilan. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Deterministik "ishor" — tashqi kutubxonasiz, seed va cache kalitlari uchun. */
export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Aralashtirilgan (deterministik) element tanlash — kunlik "bugungi missiya" uchun. */
export function pickDeterministic<T>(items: readonly T[], seed: string): T | undefined {
  if (items.length === 0) return undefined;
  const index = hashString(seed) % items.length;
  return items[index];
}

/** Ismdan bosh harflar (avatar uchun). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/** Erta yoshdagilar uchun ogohlantirish (18 yoshgacha). */
export function isMinor(birthDate: Date | null | undefined, now: Date = new Date()): boolean {
  if (!birthDate) return false;
  const age =
    now.getUTCFullYear() -
    birthDate.getUTCFullYear() -
    (now.getUTCMonth() < birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() < birthDate.getUTCDate())
      ? 1
      : 0);
  return age > 0 && age < 18;
}

export function ageFrom(birthDate: Date | null | undefined, now: Date = new Date()): number | null {
  if (!birthDate) return null;
  const age =
    now.getUTCFullYear() -
    birthDate.getUTCFullYear() -
    (now.getUTCMonth() < birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() < birthDate.getUTCDate())
      ? 1
      : 0);
  return age >= 0 ? age : null;
}