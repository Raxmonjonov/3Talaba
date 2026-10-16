import { prisma } from "@/lib/prisma";
import { SEED_CURRICULUM, SEED_BADGES } from "./seed-content";
import { PLACEMENT_QUESTION_BANK } from "./placement-engine";

let seededInMemoryFlag = false;

/**
 * Fanlar, mavzular, darslar, savollar banki va nishonlar bazada mavjudligini
 * idempotent tarzda ta'minlaydi.
 */
export async function ensureCurriculumSeeded() {
  if (seededInMemoryFlag) return;

  const existingSubjectCount = await prisma.subject.count();
  if (existingSubjectCount >= SEED_CURRICULUM.length) {
    seededInMemoryFlag = true;
    return;
  }

  // 1. Nishonlarni (Badges) yaratish
  for (const badge of SEED_BADGES) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {
        titleUz: badge.titleUz,
        descriptionUz: badge.descriptionUz,
        icon: badge.icon,
        xpBonus: badge.xpBonus,
        conditionType: badge.conditionType,
        conditionValue: badge.conditionValue,
      },
      create: badge,
    });
  }

  // 2. Fanlar -> Mavzular -> Darslar -> Dars Savollari
  for (const subj of SEED_CURRICULUM) {
    const createdSubject = await prisma.subject.upsert({
      where: { slug: subj.slug },
      update: {
        nameUz: subj.nameUz,
        descriptionUz: subj.descriptionUz,
        icon: subj.icon,
        color: subj.color,
        order: subj.order,
      },
      create: {
        slug: subj.slug,
        nameUz: subj.nameUz,
        descriptionUz: subj.descriptionUz,
        icon: subj.icon,
        color: subj.color,
        order: subj.order,
      },
    });

    const createdTopic = await prisma.topic.upsert({
      where: { slug: subj.topic.slug },
      update: {
        titleUz: subj.topic.titleUz,
        descriptionUz: subj.topic.descriptionUz,
        level: subj.topic.level,
        estHours: subj.topic.estHours,
      },
      create: {
        subjectId: createdSubject.id,
        slug: subj.topic.slug,
        titleUz: subj.topic.titleUz,
        descriptionUz: subj.topic.descriptionUz,
        level: subj.topic.level,
        estHours: subj.topic.estHours,
        order: 1,
      },
    });

    const lessonData = subj.topic.lesson;
    const createdLesson = await prisma.lesson.upsert({
      where: { slug: lessonData.slug },
      update: {
        titleUz: lessonData.titleUz,
        summaryUz: lessonData.summaryUz,
        theoryMarkdown: lessonData.theoryMarkdown,
        examplesJson: JSON.stringify(lessonData.examples),
        estMinutes: lessonData.estMinutes,
        xpReward: lessonData.xpReward,
      },
      create: {
        topicId: createdTopic.id,
        slug: lessonData.slug,
        titleUz: lessonData.titleUz,
        summaryUz: lessonData.summaryUz,
        theoryMarkdown: lessonData.theoryMarkdown,
        examplesJson: JSON.stringify(lessonData.examples),
        estMinutes: lessonData.estMinutes,
        xpReward: lessonData.xpReward,
        order: 1,
      },
    });

    for (const q of lessonData.questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        update: {
          promptUz: q.promptUz,
          passageUz: q.passageUz ?? null,
          difficulty: q.difficulty,
          optionsJson: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanationUz: q.explanationUz,
          hintsJson: JSON.stringify(q.hints),
        },
        create: {
          id: q.id,
          subjectId: createdSubject.id,
          topicId: createdTopic.id,
          lessonId: createdLesson.id,
          type: "MCQ",
          difficulty: q.difficulty,
          promptUz: q.promptUz,
          passageUz: q.passageUz ?? null,
          optionsJson: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanationUz: q.explanationUz,
          hintsJson: JSON.stringify(q.hints),
          isPlacement: false,
        },
      });
    }

    // Placement savollarini ham Savollar Bankiga (Question jadvaliga) qo'shish
    const placementQuestionsForSubj = PLACEMENT_QUESTION_BANK.filter(
      (pq) => pq.subjectSlug === subj.slug,
    );

    for (const pq of placementQuestionsForSubj) {
      await prisma.question.upsert({
        where: { id: pq.id },
        update: {
          promptUz: pq.promptUz,
          passageUz: pq.passageUz ?? null,
          difficulty: pq.difficulty,
          optionsJson: JSON.stringify(pq.options),
          correctAnswer: pq.correctAnswer,
          explanationUz: pq.explanationUz,
          isPlacement: true,
        },
        create: {
          id: pq.id,
          subjectId: createdSubject.id,
          topicId: createdTopic.id,
          type: "MCQ",
          difficulty: pq.difficulty,
          promptUz: pq.promptUz,
          passageUz: pq.passageUz ?? null,
          optionsJson: JSON.stringify(pq.options),
          correctAnswer: pq.correctAnswer,
          explanationUz: pq.explanationUz,
          hintsJson: JSON.stringify([
            "Savol shartini diqqat bilan qayta o'qing va chalg'ituvchi variantlarni chiqarib tashlang.",
          ]),
          isPlacement: true,
        },
      });
    }
  }

  seededInMemoryFlag = true;
}
