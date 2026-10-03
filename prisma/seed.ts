/**
 * Prisma seed — barcha mazmunni bazaga yozadi.
 *
 * Idempotent: slug bo'yicha `upsert` ishlatiladi, shuning uchun
 * seed'ni bir necha marta ishga tushirish mumkin.
 *
 * Ishga tushirish:  npm run db:seed
 */
import { Prisma, PrismaClient, QuestionType, LessonBlockKind, Subject, ExamType } from '@prisma/client';

import { SKILLS } from './seed/data/skills';
import { ALL_QUESTIONS } from './seed/data/questions-index';
import { ALL_COURSES } from './seed/data/courses-index';
import { MOCK_EXAMS } from './seed/data/mock-exams';
import type { L10n } from './seed/types';

const prisma = new PrismaClient();

const l10n = (v: L10n): Prisma.InputJsonValue => ({ uz: v.uz, en: v.en });
const pair = (v: [string, string]): Prisma.InputJsonValue => ({ uz: v[0], en: v[1] });

function subjectOf(value: string): Subject {
  const found = Object.values(Subject).find((s) => s === value);
  if (!found) throw new Error(`Noma'lum Subject: ${value}`);
  return found;
}

function questionTypeOf(value: string): QuestionType {
  const found = Object.values(QuestionType).find((t) => t === value);
  if (!found) throw new Error(`Noma'lum QuestionType: ${value}`);
  return found;
}

function blockKindOf(value: string): LessonBlockKind {
  const found = Object.values(LessonBlockKind).find((k) => k === value);
  if (!found) throw new Error(`Noma'lum LessonBlockKind: ${value}`);
  return found;
}

function examTypeOf(value: string): ExamType {
  const found = Object.values(ExamType).find((e) => e === value);
  if (!found) throw new Error(`Noma'lum ExamType: ${value}`);
  return found;
}

async function seedSkills(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  // 1-qadam: ota-yo'qsiz skill'lar
  for (const s of SKILLS.filter((x) => !x.parent)) {
    const row = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: { subject: subjectOf(s.subject), name: l10n({ uz: s.name[0], en: s.name[1] }) },
      create: { slug: s.slug, subject: subjectOf(s.subject), name: l10n({ uz: s.name[0], en: s.name[1] }) },
      select: { id: true },
    });
    ids.set(s.slug, row.id);
  }

  // 2-qadam: ota skill'ga bog'langanlar
  for (const s of SKILLS.filter((x) => x.parent)) {
    const parentId = ids.get(s.parent!);
    if (!parentId) throw new Error(`${s.slug} uchun ota skill topilmadi: ${s.parent}`);
    const row = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: { subject: subjectOf(s.subject), name: l10n({ uz: s.name[0], en: s.name[1] }), parentId },
      create: {
        slug: s.slug,
        subject: subjectOf(s.subject),
        name: l10n({ uz: s.name[0], en: s.name[1] }),
        parentId,
      },
      select: { id: true },
    });
    ids.set(s.slug, row.id);
  }

  console.log(`  skill: ${ids.size}`);
  return ids;
}

async function seedQuestions(skillIds: Map<string, string>): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  // Idempotentlik uchun mavjud savollar bitta so'rovda olinadi:
  // Json maydonini Prisma filtrida qidirish mumkin emas (`path` faqat Postgres).
  const existing = await prisma.question.findMany({
    select: { id: true, skillId: true, prompt: true, source: true },
  });
  const existingIdsByDbKey = new Map<string, { id: string; source: string }>();
  for (const row of existing) {
    const p = row.prompt as { uz?: string } | null;
    if (p && typeof p.uz === 'string') {
      existingIdsByDbKey.set(`${row.skillId}::${p.uz}`, { id: row.id, source: row.source });
    }
  }

  /** Seed fayllarida kelayotgan kalitlar — qolgani "eskirgan" hisoblanadi */
  const expectedDbKeys = new Set<string>();

  let createdCount = 0;
  let updatedCount = 0;

  for (const q of ALL_QUESTIONS) {
    const skillId = skillIds.get(q.skill);
    if (!skillId) throw new Error(`Savol uchun skill topilmadi: ${q.skill}`);

    const key = `${q.skill}::${q.p[0]}`;
    const dbKey = `${skillId}::${q.p[0]}`;
    expectedDbKeys.add(dbKey);
    const already = existingIdsByDbKey.get(dbKey)?.id;

    const options = (q.options ?? []).map((o, i) => ({
      order: i,
      label: l10n(o.label),
      isCorrect: o.correct === true,
      explanation: o.explanation ? l10n(o.explanation) : undefined,
      matchRules: o.accepts ? ({ accepts: o.accepts } as Prisma.InputJsonValue) : undefined,
    }));

    const scalar = {
      skillId,
      type: questionTypeOf(q.type),
      prompt: l10n({ uz: q.p[0], en: q.p[1] }),
      passage: q.passage ? l10n({ uz: q.passage[0], en: q.passage[1] }) : Prisma.JsonNull,
      difficulty: q.d,
      estimatedSeconds: q.sec ?? 60,
      source: q.source ?? 'seed',
    };

    if (already) {
      // ID saqlanishi shart: boshqa jadvallar (MockAnswer, SessionStep, ReviewLog)
      // shu ID ga bog'liq. Shuning uchun variantlar to'liq qayta yoziladi,
      // savolning o'zi esa yangilanadi — seed tahrirlari DB ga yetib boradi.
      await prisma.question.update({ where: { id: already }, data: scalar });
      await prisma.questionOption.deleteMany({ where: { questionId: already } });
      if (options.length) {
        await prisma.questionOption.createMany({
          data: options.map((o) => ({ ...o, questionId: already })),
        });
      }
      updatedCount += 1;
      ids.set(key, already);
      continue;
    }

    const created = await prisma.question.create({
      data: { ...scalar, options: options.length ? { create: options } : undefined },
      select: { id: true },
    });
    createdCount += 1;
    ids.set(key, created.id);
    existingIdsByDbKey.set(dbKey, { id: created.id, source: q.source ?? 'seed' });
  }

  // Eskirgan savollarni tozalash.
  //
  // Tabiiy kalit — o'zbekcha prompt matni. Shuning uchun prompt matni tahrirlanganda
  // (masalan tarjima tuzatilsa) eski qator "begona" bo'lib qoladi. Seed fayllarida
  // endi yo'qigan savollarni o'chiramiz, aks holda baza vaqt o'tishi bilan
  // keraksiz savollarga to'lib boradi va namuna imtihonlar eskirgan ID'larga
  // havola qiladi.
  //
  // Faqat `source: 'seed'` bo'lganlar tozalanadi — qo'lda qo'shilgan savollar
  // va ularga bog'liq foydalanuvchi javoblari saqlanib qoladi.
  const staleIds = [...existingIdsByDbKey.entries()]
    .filter(([dbKey, info]) => !expectedDbKeys.has(dbKey) && info.source === 'seed')
    .map(([, info]) => info.id);

  if (staleIds.length) {
    await prisma.question.deleteMany({ where: { id: { in: staleIds } } });
  }

  console.log(
    `  savol: ${ids.size} (yangi: ${createdCount}, yangilangan: ${updatedCount}, o'chirilgan: ${staleIds.length})`,
  );
  return ids;
}

async function seedCourses(skillIds: Map<string, string>) {
  let lessonCount = 0;
  let blockCount = 0;

  for (const [courseIndex, course] of ALL_COURSES.entries()) {
    const courseRow = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: pair(course.title),
        description: pair(course.description),
        subject: subjectOf(course.subject),
        order: courseIndex,
      },
      create: {
        slug: course.slug,
        title: pair(course.title),
        description: pair(course.description),
        subject: subjectOf(course.subject),
        order: courseIndex,
      },
    });

    for (const [moduleIndex, mod] of course.modules.entries()) {
      const moduleRow = await prisma.module.upsert({
        where: { courseId_slug: { courseId: courseRow.id, slug: mod.slug } },
        update: {
          title: pair(mod.title),
          description: mod.description ? pair(mod.description) : undefined,
          subject: subjectOf(course.subject),
          order: moduleIndex,
          levelRange: mod.levelRange,
        },
        create: {
          courseId: courseRow.id,
          slug: mod.slug,
          title: pair(mod.title),
          description: mod.description ? pair(mod.description) : undefined,
          subject: subjectOf(course.subject),
          order: moduleIndex,
          levelRange: mod.levelRange,
        },
      });

      for (const [lessonIndex, lesson] of mod.lessons.entries()) {
        const skillSlugs = lesson.skills.filter((s) => skillIds.has(s));

        const lessonRow = await prisma.lesson.upsert({
          where: { slug: lesson.slug },
          update: {
            moduleId: moduleRow.id,
            title: pair(lesson.title),
            summary: pair(lesson.summary),
            objectives: lesson.objectives.map((o) => pair(o)),
            storyAct: lesson.storyAct,
            storyTitle: lesson.storyTitle ? pair(lesson.storyTitle) : undefined,
            levelRange: lesson.levelRange,
            estMinutes: lesson.estMinutes,
            xpReward: lesson.xpReward,
            skillIds: skillSlugs,
          },
          create: {
            moduleId: moduleRow.id,
            slug: lesson.slug,
            title: pair(lesson.title),
            summary: pair(lesson.summary),
            objectives: lesson.objectives.map((o) => pair(o)),
            storyAct: lesson.storyAct,
            storyTitle: lesson.storyTitle ? pair(lesson.storyTitle) : undefined,
            levelRange: lesson.levelRange,
            estMinutes: lesson.estMinutes,
            xpReward: lesson.xpReward,
            skillIds: skillSlugs,
          },
        });
        lessonCount += 1;

        // Bloklar: `@@unique([lessonId, order])` bo'lgani uchun avval tozalash
        await prisma.lessonBlock.deleteMany({ where: { lessonId: lessonRow.id } });

        for (const [blockIndex, block] of lesson.blocks.entries()) {
          const blockSkillId = block.skills?.[0] ? skillIds.get(block.skills[0]) : undefined;
          await prisma.lessonBlock.create({
            data: {
              lessonId: lessonRow.id,
              order: blockIndex,
              kind: blockKindOf(block.kind),
              title: pair(block.title),
              content: l10n(block.content),
              minMinutes: block.minMinutes,
              skillId: blockSkillId,
            },
          });
          blockCount += 1;
        }

        void lessonIndex;
      }
    }
  }

  console.log(`  kurs: ${ALL_COURSES.length}, modul: ${ALL_COURSES.reduce((n, c) => n + c.modules.length, 0)}, dars: ${lessonCount}, blok: ${blockCount}`);
}

async function seedMockExams(skillIds: Map<string, string>, questionIds: Map<string, string>) {
  // skill -> savol idlari (o‘sish tartibida)
  const bySkill = new Map<string, string[]>();
  for (const [key, id] of questionIds) {
    const skill = key.split('::')[0];
    const list = bySkill.get(skill) ?? [];
    list.push(id);
    bySkill.set(skill, list);
  }

  for (const mock of MOCK_EXAMS) {
    const sections: Prisma.InputJsonValue[] = [];
    const missing: string[] = [];

    // Bir imtihonda bir savol ikki bo'limda takrorlanmasligi kerak. Buning uchun
    // har bir skill uchun imtihon darajasidagi kursor saqlanadi: masalan IELTS
    // Writing Task 1 va Task 2 bir xil skill ishlatadi va Task 1 olgan savollar
    // Task 2 ga qaytadan berilmaydi.
    const cursor = new Map<string, number>();

    for (const [i, section] of mock.sections.entries()) {
      const pool = bySkill.get(section.skill) ?? [];
      const start = cursor.get(section.skill) ?? 0;
      const picked = pool.slice(start, start + section.count);
      cursor.set(section.skill, start + picked.length);

      if (picked.length < section.count) {
        missing.push(`${section.skill}: ${picked.length}/${section.count}`);
      }

      sections.push({
        key: `s${i + 1}`,
        title: { uz: section.title[0], en: section.title[1] },
        skillSlug: section.skill,
        questionIds: picked,
        points: section.points,
        skillIds: skillIds.get(section.skill) ? [skillIds.get(section.skill)!] : [],
      });
    }

    await prisma.mockExam.upsert({
      where: { slug: mock.slug },
      update: {
        title: pair(mock.title),
        description: pair(mock.description),
        exam: examTypeOf(mock.exam),
        durationMin: mock.durationMin,
        sections,
      },
      create: {
        slug: mock.slug,
        title: pair(mock.title),
        description: pair(mock.description),
        exam: examTypeOf(mock.exam),
        durationMin: mock.durationMin,
        sections,
      },
    });

    console.log(`  imtihon: ${mock.slug}${missing.length ? ` (to'ldirilmagan bo'limlar: ${missing.join(', ')})` : ''}`);
  }
}

async function main() {
  console.log('Seed boshlandi...');
  const skillIds = await seedSkills();
  const questionIds = await seedQuestions(skillIds);
  await seedCourses(skillIds);
  await seedMockExams(skillIds, questionIds);
  console.log('Seed yakunlandi.');
}

main()
  .catch((e) => {
    console.error('Seed xatosi:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());