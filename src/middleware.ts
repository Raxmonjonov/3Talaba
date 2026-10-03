import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  resolveLocale,
  type Locale,
} from '@/lib/i18n/config';

/**
 * Middleware barchamizga tegishli ikki vazifani bajaradi:
 *
 * 1. **Til** — `/` so'rovi cookie yoki `Accept-Language` asosida `/{til}` ga
 *    yo'naltiriladi. Tilga kirish mumkin bo'lgan sahifalar `/{locale}/...`.
 * 2. **Kirish nazorati** — o'quvchi zonasi (`/app`, `/onboarding`) autentifikatsiya
 *    talab qiladi; `/app/admin` faqat admin uchun.
 *
 * Edge runtime'da ishlaydi — shuning uchun Prisma ishlatilmaydi, sessiya
 * `next-auth/jwt` orqali tokendan o'qiladi (faqat o'qish uchun).
 */

/** Autentifikatsiya talab qilinadigan prefikslar. */
const PROTECTED_PREFIXES = ['/app', '/onboarding'];

/** Faqat admin uchun. */
const ADMIN_PREFIXES = ['/app/admin'];

/** Kirish sahifasiga yuborilganda qaytish uchun. */
const RETURN_TO_COOKIE = '3talab_return_to';

function localeFromHeader(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  // "uz-UZ,uz;q=0.9,en;q=0.8" → ["uz", "en"]
  const candidates = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag?.trim().toLowerCase() ?? '', quality: q ? Number(q) : 1 };
    })
    .filter((c) => c.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const candidate of candidates) {
    const base = candidate.tag.split('-')[0] ?? '';
    if ((LOCALES as readonly string[]).includes(base)) return base as Locale;
  }
  return DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Statik fayllar va API — tegilmaydi
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sw.js') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0] ?? '';

  // Til belgilanmagan yoki noto'g'ri bo'lsa — aniq belgilanadigan URL ga o'tkazamiz.
  if (!LOCALES.includes(first as Locale)) {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = resolveLocale(cookieLocale ?? localeFromHeader(request.headers.get('accept-language')));

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    const response = NextResponse.redirect(url);
    if (!cookieLocale) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
    return response;
  }

  const locale = first as Locale;
  const pathWithoutLocale = `/${segments.slice(1).join('/')}`;

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`),
  );

  if (!needsAuth) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    // Secure prefix cookie nomi muxalliq uchun tekshiriladi
    secureCookie:
      request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production',
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-3talab.session-token'
        : '3talab.session-token',
  });

  if (!token?.id) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('next', `${pathWithoutLocale}`);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(RETURN_TO_COOKIE, `${pathWithoutLocale}`, {
      path: '/',
      maxAge: 60 * 5,
      sameSite: 'lax',
    });
    return response;
  }

  // Admin zona
  const needsAdmin = ADMIN_PREFIXES.some(
    (prefix) => pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`),
  );
  if (needsAdmin && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL(`/${locale}/app/dashboard`, request.url));
  }

  // Onboarding tugamagan foydalanuvchilarni avval oqimga yuboramiz.
  const isOnboardingArea = pathWithoutLocale.startsWith('/onboarding');
  if (!isOnboardingArea && pathWithoutLocale.startsWith('/app') && token.onboarded === false) {
    return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url));
  }

  // Onboarding tugagan foydalanuvchi oqimga qayta kirmasin
  if (isOnboardingArea && token.onboarded === true) {
    return NextResponse.redirect(new URL(`/${locale}/app/dashboard`, request.url));
  }

  const response = NextResponse.next();
  response.headers.set('x-3talab-locale', locale);
  return response;
}

export const config = {
  matcher: [
    /*
     * Barcha yo'llar, lekin quyidagilar chiqariladi:
     * - statik fayllar (ichida nuqta bor)
     * - /api
     */
    '/((?!api|_next/static|_next/image|icons|favicon.ico|manifest.webmanifest|sw.js).*)',
  ],
};

export { RETURN_TO_COOKIE };