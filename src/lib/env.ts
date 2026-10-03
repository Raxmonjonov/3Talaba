import { z } from 'zod';

/**
 * Muhit o'zgaruvchilarini bitta joyda tekshirish.
 *
 * Muhim: `serverEnv` faqat serverda import qilinishi kerak (`server-only` guard
 * `src/lib/server/*` da). `publicEnv` `NEXT_PUBLIC_` prefiksi bilan `NEXT_PUBLIC_APP_URL` kabi
 * qiymatlarni o'zi ichiga oladi va klientda ham xavfsiz.
 */

const emptyToUndefined = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL talab qilinadi')
    .refine((v) => v.startsWith('postgresql'), 'DATABASE_URL postgresql:// bilan boshlanishi kerak'),

  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET kamida 16 belgi bo\'lishi kerak'),
  AUTH_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  AUTH_TRUST_HOST: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  GOOGLE_CLIENT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  GOOGLE_CLIENT_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),

  ANTHROPIC_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  AI_MODEL: z.string().default('claude-sonnet-4-5'),
  AI_PROVIDER: z.enum(['anthropic', 'test-mock']).default('anthropic'),

  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().optional()),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  RATE_LIMIT_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  ADMIN_SEED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  ADMIN_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
  ADMIN_PASSWORD: z.preprocess(emptyToUndefined, z.string().min(12).optional()),

  BEDTIME_REMINDER: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'BEDTIME_REMINDER "HH:MM" ko\'rinishida bo\'lishi kerak')
    .default('23:00'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/** Server muhitini tekshirilgan shaklda qaytaradi (natijani keshlaydi). */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Muhit o'zgaruvchilari noto'g'ri:\n${details}`);
  }

  cached = parsed.data;
  return cached;
}

/** Testlarda muhitni almashtirish uchun. */
export function resetEnvCache(): void {
  cached = null;
}

export const isProd = (): boolean => getServerEnv().NODE_ENV === 'production';
export const isTest = (): boolean => getServerEnv().NODE_ENV === 'test';