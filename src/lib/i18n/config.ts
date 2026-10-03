export const LOCALES = ['uz', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'uz';

export const LOCALE_COOKIE = '3talab_locale';
export const THEME_COOKIE = '3talab_theme';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Har doim `uz` — o'zbek lotin yozuvi RTL emas. Kelajakda kengaytirish uchun joy qoldirilgan. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function localeDirection(_locale: Locale): 'ltr' | 'rtl' {
  return 'ltr';
}

export const LOCALE_LABELS: Record<Locale, { native: string; english: string; flag: string }> = {
  uz: { native: "O'zbekcha", english: 'Uzbek', flag: '🇺🇿' },
  en: { native: 'English', english: 'English', flag: '🇬🇧' },
};

export const HTML_LANG: Record<Locale, string> = {
  uz: 'uz-UZ',
  en: 'en',
};