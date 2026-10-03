/**
 * Seed natijasini bazadan tekshiradi.
 * Ishga tushirish:  npx tsx prisma/seed/verify.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [skills, questions, options, courses, modules, lessons, blocks, mocks, parents] = await Promise.all([
    prisma.skill.count(),
    prisma.question.count(),
    prisma.questionOption.count(),
    prisma.course.count(),
    prisma.module.count(),
    prisma.lesson.count(),
    prisma.lessonBlock.count(),
    prisma.mockExam.count(),
    prisma.skill.count({ where: { parentId: { not: null } } }),
  ]);

  console.log('Bazadagi holat:');
  console.log('  skilllar        ', skills, `(${parents} ta ota skill'ga bog'langan)`);
  console.log('  savollar        ', questions);
  console.log('  variantlar      ', options);
  console.log('  kurslar         ', courses);
  console.log('  modullar        ', modules);
  console.log('  darslar         ', lessons);
  console.log('  bloklar         ', blocks);
  console.log('  namuna imtihonlar', mocks);

  // Har bir savolning kamida bitta to'g'ri variant borligi
  const missing = await prisma.question.findMany({
    where: { options: { none: { isCorrect: true } } },
    select: { id: true, prompt: true },
  });
  if (missing.length) {
    console.log('\n  ! to‘g‘ri varianti yo‘q savollar:', missing.length);
  }

  // Skill bo'yicha savollar
  const bySkill = await prisma.skill.findMany({
    where: { questions: { some: {} } },
    orderBy: { slug: 'asc' },
    select: { slug: true, _count: { select: { questions: true } } },
  });
  console.log('\nSkill bo‘yicha savollar:');
  for (const s of bySkill) console.log(`  ${s.slug.padEnd(26)} ${s._count.questions}`);

  // Namuna imtihon bo'limlari to'ldirilganmi
  console.log('\nNamuna imtihon bo‘limlari:');
  for (const m of await prisma.mockExam.findMany({ orderBy: { slug: 'asc' } })) {
    const sections = m.sections as Array<{ title: { uz: string }; questionIds: string[]; points: number }>;
    console.log(`  ${m.slug}`);
    for (const s of sections) {
      console.log(`    ${s.title.uz.padEnd(28)} ${s.questionIds.length} savol / ${s.points} ball`);
    }
  }

  // Bir imtihon ichida bir savol ikki bo'limda takrorlanmasligi kerak.
  console.log('\nTakrorlanuvchi savollar (bir imtihon ichida):');
  let dupTotal = 0;
  for (const m of await prisma.mockExam.findMany({ orderBy: { slug: 'asc' } })) {
    const sections = m.sections as Array<{ title: { uz: string }; questionIds: string[] }>;
    const seen = new Map<string, string[]>();
    for (const s of sections) {
      for (const id of s.questionIds) {
        seen.set(id, [...(seen.get(id) ?? []), s.title.uz]);
      }
    }
    const dups = [...seen.entries()].filter(([, titles]) => titles.length > 1);
    dupTotal += dups.length;
    console.log(`  ${m.slug}: ${dups.length === 0 ? 'toza' : `${dups.length} ta takror`}`);
    for (const [id, titles] of dups) console.log(`    ${id.slice(0, 8)}… — ${titles.join(' | ')}`);
  }
  if (dupTotal > 0) console.log(`\n  ! jami ${dupTotal} ta takrorlangan savol bor`);

  // Baza va kelib chiqish (seed) savollari orasida ID to'g'rlashuvi
  console.log('\nKurs tuzilmasi:');
  for (const c of await prisma.course.findMany({ orderBy: { order: 'asc' }, include: { modules: { orderBy: { order: 'asc' }, include: { _count: { select: { lessons: true } } } } } })) {
    const t = c.title as { uz: string };
    const total = c.modules.reduce((n, m) => n + m._count.lessons, 0);
    console.log(`  ${t.uz} — ${c.modules.length} modul, ${total} dars`);
    for (const m of c.modules) {
      const mt = m.title as { uz: string };
      console.log(`    ${mt.uz} — ${m._count.lessons} dars`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());