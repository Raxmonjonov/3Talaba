import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Deploy smoke test.
 *
 * `ok` — jarayon ishlamoqda. `database` — `up`, `down` yoki `skip`
 * (`DATABASE_URL` yo'q bo'lsa). Bu endpoint hech qachon xato kodi qaytarmaydi:
 * monitoring uchun 200 kerak, chunki holat `body` da ko'rinadi.
 */
export async function GET() {
  const database: 'up' | 'down' | 'skip' = await (async () => {
    if (!process.env.DATABASE_URL) return 'skip' as const;
    try {
      const { prisma } = await import('@/lib/server/db');
      await prisma.$queryRaw`SELECT 1`;
      return 'up' as const;
    } catch {
      return 'down' as const;
    }
  })();

  return NextResponse.json(
    {
      ok: true,
      service: '3talab',
      status: 'operational',
      database,
      version: process.env.npm_package_version ?? null,
      time: new Date().toISOString(),
    },
    { status: 200 },
  );
}