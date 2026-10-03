import 'server-only';

import pino from 'pino';

import { getServerEnv } from '@/lib/env';

/**
 * Strukturaviy logger. Ishlab chiqarishda JSON, rivojlanishda chiroyli.
 * Hech qachon API kaliti yoki parol kabi maxfiy qiymatlarni logga yozmaymiz —
 * `redact` ro'yxati va `sanitizeError()` shu uchun.
 */
function createLogger(): pino.Logger {
  const env = getServerEnv();

  return pino({
    level: env.LOG_LEVEL,
    redact: {
      paths: [
        'password',
        'passwordHash',
        '*.password',
        '*.passwordHash',
        'apiKey',
        '*.apiKey',
        'ANTHROPIC_API_KEY',
        'token',
        '*.token',
        'headers.authorization',
        'headers.cookie',
      ],
      censor: '[REDACTED]',
    },
    ...(env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
          },
        }
      : {}),
  });
}

let cached: pino.Logger | null = null;

export function logger(): pino.Logger {
  if (!cached) cached = createLogger();
  return cached;
}

/**
 * Xato matnidan maxfiy ma'lumotlarni (API kaliti, token) olib tashlaydi.
 * AI va autentifikatsiya xatolarini klientga qaytarishdan oldin har doim shu
 * funksiya orqali o'tkaziladi.
 */
export function sanitizeError(error: unknown): string {
  const raw =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === 'string'
        ? error
        : JSON.stringify(error ?? {});

  const env = getServerEnv();
  const secrets = [env.ANTHROPIC_API_KEY, env.AUTH_SECRET, env.GOOGLE_CLIENT_SECRET].filter(
    (v): v is string => typeof v === 'string' && v.length >= 8,
  );

  let out = raw.replace(/sk-ant-[A-Za-z0-9_-]+/g, '[REDACTED]');
  for (const secret of secrets) {
    out = out.split(secret).join('[REDACTED]');
  }
  return out;
}