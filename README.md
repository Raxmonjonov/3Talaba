# Flux

Next.js (App Router), TypeScript, Tailwind CSS v4 va Prisma + PostgreSQL asosida noldan qurilgan toza asos.

> Oldingi v1 kodi `archive/v1` git branchida saqlangan.

## Ishga tushirish

```bash
npm install
npm run db:generate
npm run dev
```

## PostgreSQL ulash

`.env` faylida `DATABASE_URL` ni PostgreSQL manziliga yangilang (`.env.example` namunasiga qarang), so'ng:

```bash
npm run db:push
# yoki migratsiya bilan:
npm run db:migrate
```

## Tekshiruvlar

```bash
npm run typecheck
npm run test
npm run build
```
