/**
 * Prisma `Json` ustunlaridagi `{ uz, en }` matnlarni xavfsiz o'qish yordamchilari.
 *
 * `Json` maydoni `string | number | boolean | JsonObject | JsonArray` bo'lgani uchun
 * to'g'ridan-to'g'ri `.uz` ga murojaat qilish type xatosi beradi. Bu yordamchilar
 * `unknown` qabul qiladi va ishlatilgan joyda tilga qarab matn qaytaradi.
 */

/** i18n JSON qiymati taxmin qilinadigan tuzilma */
export type L10n = { uz: string; en: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * JSON qiymatdan `{ uz, en }` obyektini ajratib oladi.
 * Noto'g'ri yoki bo'sh qiymatda `null` qaytaradi.
 */
export function asL10n(value: unknown): L10n | null {
  if (!isRecord(value)) return null;

  const uz = value.uz;
  const en = value.en;

  if (typeof uz === 'string' && typeof en === 'string') return { uz, en };
  if (typeof uz === 'string') return { uz, en: uz };
  if (typeof en === 'string') return { uz: en, en };
  return null;
}

/**
 * JSON qiymatdan tilga mos matnni oladi.
 * `uz` yo'q bo'lsa `en`, `en` yo'q bo'lsa `uz` ishlatiladi.
 * Ikkalasi ham bo'sh bo'lsa `fallback` (standart `''`) qaytaradi.
 */
export function readL10n(
  value: unknown,
  locale: 'uz' | 'en',
  fallback = '',
): string {
  const pair = asL10n(value);
  if (!pair) return fallback;

  const primary = pair[locale];
  if (primary.trim()) return primary;

  const secondary = locale === 'uz' ? pair.en : pair.uz;
  return secondary.trim() ? secondary : fallback;
}

/** JSON qiymat matn bo'lishi uchun tekshiriladi (masalan, `title`) */
export function l10nOrSlug(value: unknown, slug: string, locale: 'uz' | 'en'): string {
  const text = readL10n(value, locale);
  return text || slug;
}