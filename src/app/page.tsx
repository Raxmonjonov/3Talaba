import { redirect } from 'next/navigation';

import { DEFAULT_LOCALE } from '@/lib/i18n/config';

/**
 * Middleware `/` ni `/{locale}` ga yo'naltiradi. Bu sahifa faqat
 * middleware ishga tushmagan holatlar (masalan, statik render prefetch)
 * uchun zaxira sifatida qo'yiladi.
 */
export default function RootPage(): never {
  redirect(`/${DEFAULT_LOCALE}`);
}