import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { ALL_COURSES } from "./data/courses-index.js";
import { ALL_QUESTIONS } from "./data/questions-index.js";
import { SKILLS } from "./data/skills.js";
import { MOCK_EXAMS } from "./data/mock-exams.js";

const prisma = new PrismaClient();

/** Deterministic id so re-seeding updates instead of duplicating. */
function questionId(skillSlug: string, promptUz: string, index: number): string {
  const slug = promptUz
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${skillSlug}--${index}-${slug || "q"}`;
}

async function seedSkills() {
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      create: {
        slug: skill.slug,
        subject: skill.subject,
        nameUz: skill.name[0],
        nameEn: skill.name[1],
        parent: skill.parent ?? null,
      },
      update: {
        subject: skill.subject,
        nameUz: skill.name[0],
        nameEn: skill.name[1],
        parent: skill.parent ?? null,
      },
    });
  }
  console.log(`  skills: ${SKILLS.length}`);
}

async function seedQuestions() {
  const perSkill = new Map<string, number>();
  const known = new Set(SKILLS.map((s) => s.slug));
  let skipped = 0;

  for (const q of ALL_QUESTIONS) {
    if (!known.has(q.skill)) {
      skipped += 1;
      continue;
    }
    const index = perSkill.get(q.skill) ?? 0;
    perSkill.set(q.skill, index + 1);

    await prisma.question.upsert({
      where: { id: questionId(q.skill, q.p[0], index) },
      create: {
        id: questionId(q.skill, q.p[0], index),
        skillSlug: q.skill,
        type: q.type,
        promptUz: q.p[0],
        promptEn: q.p[1],
        difficulty: q.d,
        passageUz: q.passage?.[0] ?? null,
        passageEn: q.passage?.[1] ?? null,
        options: JSON.stringify(q.options ?? []),
        seconds: q.sec ?? null,
        source: q.source ?? null,
      },
      update: {
        promptUz: q.p[0],
        promptEn: q.p[1],
        difficulty: q.d,
        options: JSON.stringify(q.options ?? []),
      },
    });
  }

  console.log(`  questions: ${perSkill.size} skill, ${skipped} unknown skill skipped`);
}

async function seedCourses() {
  let modules = 0;
  let lessons = 0;
  let blocks = 0;

  for (const course of ALL_COURSES) {
    const courseRow = await prisma.course.upsert({
      where: { slug: course.slug },
      create: {
        slug: course.slug,
        subject: course.subject,
        titleUz: course.title[0],
        titleEn: course.title[1],
        descriptionUz: course.description[0],
        descriptionEn: course.description[1],
      },
      update: {
        titleUz: course.title[0],
        titleEn: course.title[1],
        descriptionUz: course.description[0],
        descriptionEn: course.description[1],
      },
    });

    for (const [mIndex, mod] of course.modules.entries()) {
      const moduleRow = await prisma.module.upsert({
        where: { courseId_slug: { courseId: courseRow.id, slug: mod.slug } },
        create: {
          courseId: courseRow.id,
          slug: mod.slug,
          titleUz: mod.title[0],
          titleEn: mod.title[1],
          descriptionUz: mod.description[0],
          descriptionEn: mod.description[1],
          levelRange: mod.levelRange,
          order: mIndex,
        },
        update: {
          titleUz: mod.title[0],
          titleEn: mod.title[1],
          descriptionUz: mod.description[0],
          descriptionEn: mod.description[1],
          levelRange: mod.levelRange,
          order: mIndex,
        },
      });
      modules += 1;

      for (const [lIndex, les] of mod.lessons.entries()) {
        const lessonRow = await prisma.lesson.upsert({
          where: { slug: les.slug },
          create: {
            moduleId: moduleRow.id,
            slug: les.slug,
            titleUz: les.title[0],
            titleEn: les.title[1],
            summaryUz: les.summary[0],
            summaryEn: les.summary[1],
            objectives: JSON.stringify(les.objectives),
            storyAct: les.storyAct,
            storyTitleUz: les.storyTitle?.[0] ?? null,
            storyTitleEn: les.storyTitle?.[1] ?? null,
            levelRange: les.levelRange,
            estMinutes: les.estMinutes,
            xpReward: les.xpReward,
            order: lIndex,
          },
          update: {
            titleUz: les.title[0],
            titleEn: les.title[1],
            summaryUz: les.summary[0],
            summaryEn: les.summary[1],
            objectives: JSON.stringify(les.objectives),
            storyAct: les.storyAct,
            storyTitleUz: les.storyTitle?.[0] ?? null,
            storyTitleEn: les.storyTitle?.[1] ?? null,
            levelRange: les.levelRange,
            estMinutes: les.estMinutes,
            xpReward: les.xpReward,
            order: lIndex,
          },
        });
        lessons += 1;

        for (const [bIndex, blk] of les.blocks.entries()) {
          await prisma.lessonBlock.upsert({
            where: { lessonId_order: { lessonId: lessonRow.id, order: bIndex } },
            create: {
              lessonId: lessonRow.id,
              order: bIndex,
              kind: blk.kind,
              titleUz: blk.title[0],
              titleEn: blk.title[1],
              minMinutes: blk.minMinutes,
              contentUz: blk.content.uz,
              contentEn: blk.content.en,
              skills: JSON.stringify(blk.skills ?? []),
            },
            update: {
              kind: blk.kind,
              titleUz: blk.title[0],
              titleEn: blk.title[1],
              minMinutes: blk.minMinutes,
              contentUz: blk.content.uz,
              contentEn: blk.content.en,
              skills: JSON.stringify(blk.skills ?? []),
            },
          });
          blocks += 1;
        }
      }
    }
  }

  console.log(`  courses: ${ALL_COURSES.length}, modules: ${modules}, lessons: ${lessons}, blocks: ${blocks}`);
}

async function seedMockExams() {
  let exams = 0;
  let items = 0;
  let missing = 0;

  for (const mock of MOCK_EXAMS) {
    const exam = await prisma.mockExam.upsert({
      where: { slug: mock.slug },
      create: {
        slug: mock.slug,
        exam: mock.exam,
        titleUz: mock.title[0],
        titleEn: mock.title[1],
        descriptionUz: mock.description[0],
        descriptionEn: mock.description[1],
        durationMin: mock.durationMin,
      },
      update: {
        titleUz: mock.title[0],
        titleEn: mock.title[1],
        descriptionUz: mock.description[0],
        descriptionEn: mock.description[1],
        durationMin: mock.durationMin,
      },
    });

    await prisma.mockExamItem.deleteMany({ where: { mockExamId: exam.id } });

    for (const section of mock.sections) {
      const questions = await prisma.question.findMany({
        where: { skillSlug: section.skill },
        orderBy: { difficulty: "asc" },
        take: section.count,
        select: { id: true },
      });

      if (questions.length < section.count) {
        missing += section.count - questions.length;
      }

      for (const question of questions) {
        await prisma.mockExamItem.upsert({
          where: {
            mockExamId_questionId: {
              mockExamId: exam.id,
              questionId: question.id,
            },
          },
          create: {
            mockExamId: exam.id,
            questionId: question.id,
            section: section.title[0],
            points: section.points,
          },
          update: { section: section.title[0], points: section.points },
        });
        items += 1;
      }
    }
    exams += 1;
  }

  console.log(`  mock exams: ${exams}, items: ${items}${missing ? `, ${missing} missing (skill has fewer questions)` : ""}`);
}

async function main() {
  console.log("3Talab — mazmun yuklanmoqda...\n");
  await seedSkills();
  await seedQuestions();
  await seedCourses();
  await seedMockExams();

  const [skills, questions, courses, lessons, blocks, exams] =
    await Promise.all([
      prisma.skill.count(),
      prisma.question.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.lessonBlock.count(),
      prisma.mockExam.count(),
    ]);

  console.log("\nJami bazada:");
  console.log(`  skills      ${skills}`);
  console.log(`  questions   ${questions}`);
  console.log(`  courses     ${courses}`);
  console.log(`  lessons     ${lessons}`);
  console.log(`  blocks      ${blocks}`);
  console.log(`  mock exams  ${exams}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());