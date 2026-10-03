import 'server-only';

import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema, type z } from 'zod';

import type { SessionUser } from '@/lib/server/auth/rbac';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/lib/server/auth/rbac';
import { logger, sanitizeError } from '@/lib/server/logger';

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    issues?: string[];
  };
};

export type ApiSuccess<T> = { ok: true; data: T };

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T> | ApiErrorBody> {
  return NextResponse.json({ ok: true as const, data }, init);
}

export function fail(
  code: string,
  message: string,
  status: number,
  issues?: string[],
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message, ...(issues ? { issues } : {}) } }, { status });
}

/**
 * Barcha xatolarni bir xil tuzilmaga keltiradi va klientga faqat xavfsiz matn yuboradi.
 */
export function handleError(error: unknown, context: string): NextResponse<ApiErrorBody> {
  if (error instanceof ZodError) {
    return fail(
      'VALIDATION_ERROR',
      'Kiritilgan ma’lumotlar to‘g‘ri emas',
      400,
      error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    );
  }
  if (error instanceof ValidationError) {
    return fail('VALIDATION_ERROR', error.message, error.issues.length ? 400 : 400, error.issues);
  }
  if (error instanceof UnauthorizedError) return fail('UNAUTHORIZED', 'Tizimga kiring', 401);
  if (error instanceof ForbiddenError) return fail('FORBIDDEN', error.message, 403);
  if (error instanceof NotFoundError) return fail('NOT_FOUND', error.message, 404);

  const safe = sanitizeError(error);
  logger().error({ err: safe, context }, 'route handler xatosi');
  return fail('INTERNAL_ERROR', 'Nimaidir noto‘g‘ri ketdi', 500);
}

/**
 * `schema` berilgan bo'lsa validatsiyadan o'tgan ma'lumot turi, aks holda `undefined`.
 * `S` `undefined` ham bo'lishi mumkin bo'lgani uchun `z.output<S>` bevosita
 * ishlatib bo'lmaydi — shuning uchun shartli tip alohida ajratiladi.
 */
export type SchemaOutput<S> = S extends ZodSchema ? z.output<S> : undefined;

export type ApiCtx<P, S extends ZodSchema | undefined> = {
  request: Request;
  params: P;
  user: SessionUser | null;
  /** `schema` berilgan bo'lsa — validatsiyadan o'tgan ma'lumot. */
  input: SchemaOutput<S>;
};

export type ApiHandler<P, S extends ZodSchema | undefined> = (
  ctx: ApiCtx<P, S>,
) => Promise<Response> | Response;

type Options<S extends ZodSchema | undefined> = {
  auth?: boolean;
  /** So'rov tanasini (yoki query) shu sxema bilan tekshirish. */
  schema?: S;
  /** CSRF tekshiruvi (GET/HEAD dan tashqari barcha methodlar uchun). */
  csrf?: boolean;
};

/**
 * Route Handler uchun yagona qatlam: autentifikatsiya, CSRF, Zod validatsiya va
 * xato boshqaruvi bir joyda. Har bir endpoint faqat o'z mantiqini yozadi.
 *
 * @example
 *   export const POST = apiHandler({ auth: true, schema: bodySchema, csrf: true },
 *     async ({ user, input }) => ok(await doThing(user!.id, input.title)));
 */
export function apiHandler<P = Record<string, string>, S extends ZodSchema | undefined = undefined>(
  options: Options<S>,
  handler: ApiHandler<P, S>,
): (request: Request, context: { params: Promise<unknown> }) => Promise<Response> {
  const { auth = true, schema, csrf = true } = options;

  return async function route(
    request: Request,
    context: { params: Promise<unknown> },
  ): Promise<Response> {
    try {
      const params = ((await context?.params) ?? ({} as P)) as P;

      if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        assertSameOrigin(request);
      }

      let user: SessionUser | null = null;
      if (auth) {
        const { getSessionUser } = await import('@/lib/server/auth/config');
        user = await getSessionUser();
        if (!user) return fail('UNAUTHORIZED', 'Tizimga kiring', 401);
      }

      let input: SchemaOutput<S> | undefined;
      if (schema) {
        const raw = await readInput(request);
        const result = schema.safeParse(raw);
        if (!result.success) {
          return fail(
            'VALIDATION_ERROR',
            'Kiritilgan ma’lumotlar to‘g‘ri emas',
            400,
            result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
          );
        }
        input = result.data as SchemaOutput<S>;
      }

      return await handler({
        request,
        params,
        user,
        // `schema` berilgan bo'lsa `input` har doim to'ldirilgan, aks holda
        // `SchemaOutput<S>` allaqachon `undefined` turiga teng.
        input: input as SchemaOutput<S>,
      });
    } catch (error) {
      return handleError(error, `${request.method} ${new URL(request.url).pathname}`);
    }
  };
}

/** POST/PATCH/PUT — JSON tanasi; GET — query parametrlari. */
async function readInput(request: Request): Promise<unknown> {
  if (['GET', 'HEAD'].includes(request.method)) {
    const url = new URL(request.url);
    return Object.fromEntries(url.searchParams.entries());
  }
  const contentType = request.headers.get('content-type') ?? '';
  const text = await request.text();
  if (text.length === 0) return {};
  if (contentType.includes('application/json') || text.startsWith('{') || text.startsWith('[')) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new ValidationError('So‘rov tanasi JSON emas');
    }
  }
  // FormData (multipart) — oddiy kalitlar shaklida tekislaymiz
  if (contentType.includes('form')) {
    const form = await request.formData();
    const out: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      out[key] = typeof value === 'string' ? value : value.name;
    }
    return out;
  }
  throw new ValidationError('Qo‘llab-quvvatlanmaydigan kontent turi');
}

/**
 * CSRF: barcha o'zgaruvchi methodlarda `Origin` boshlang'ich manzil bilan
 * mos kelishi shart. `sameSite=lax` cookie bilan birga ikki qatlamli himoya.
 * `Sec-Fetch-Site` header'ga ham qaraymiz (brauzerlar to'ldiradi).
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');

  if (fetchSite === 'same-origin' || fetchSite === 'none') return;

  if (!origin) {
    // Non-brauzer mijozlari (test, curl) — `Sec-Fetch-Site` yo'q bo'lsa o'tkazamiz,
    // lekin `Origin` bo'lsa va mos kelmasa — rad etamiz.
    return;
  }

  const requestUrl = new URL(request.url);
  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new ForbiddenError('So‘rov kelib chiqishi tekshirilmadi');
  }

  const sameHost =
    originUrl.host === requestUrl.host ||
    (process.env.NODE_ENV !== 'production' &&
      (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1'));

  if (!sameHost) {
    throw new ForbiddenError('So‘rov kelib chiqishi tekshirilmadi');
  }
}

/** Klient IP (proxy ortida `x-forwarded-for`). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? '127.0.0.1';
}