import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";
import { SEED_CURRICULUM } from "@/lib/curriculum/seed-content";
import { getHonorificTitle } from "@/lib/validations/auth";

const completeLessonSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        givenAnswer: z.string(),
        timeSpentSec: z.number().int().min(0).max(600).default(20),
      }),
    )
    .min(1),
});

function buildSeedFallbackLesson(slug: string) {
  const idx = SEED_CURRICULUM.findIndex((s) => s.topic.lesson.slug === slug);
  const targetIdx = idx >= 0 ? idx : 0;
  const bundle = SEED_CURRICULUM[targetIdx];
  const nextBundle = SEED_CURRICULUM[(targetIdx + 1) % SEED_CURRICULUM.length] ?? SEED_CURRICULUM[0];
  if (!bundle) return null;

  return {
    honorific: "Bo'lajak Talaba",
    profile: null,
    lesson: {
      id: `seed-${bundle.topic.lesson.slug}`,
      slug: bundle.topic.lesson.slug,
      titleUz: bundle.topic.lesson.titleUz,
      summaryUz: bundle.topic.lesson.summaryUz,
      theoryMarkdown: bundle.topic.lesson.theoryMarkdown,
      examples: bundle.topic.lesson.examples,
      estMinutes: bundle.topic.lesson.estMinutes,
      xpReward: bundle.topic.lesson.xpReward,
      topic: { titleUz: bundle.topic.titleUz },
      subject: { slug: bundle.slug, nameUz: bundle.nameUz },
      questions: bundle.topic.lesson.questions.map((q, qIdx) => ({
        id: `seed-q-${bundle.topic.lesson.slug}-${qIdx}`,
        difficulty: q.difficulty,
        promptUz: q.promptUz,
        passageUz: q.passageUz ?? null,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanationUz: q.explanationUz,
        hints: q.hints,
      })),
    },
    tomorrowLesson: nextBundle
      ? {
          slug: nextBundle.topic.lesson.slug,
          titleUz: nextBundle.topic.lesson.titleUz,
          subjectNameUz: nextBundle.nameUz,
          estMinutes: nextBundle.topic.lesson.estMinutes,
          xpReward: nextBundle.topic.lesson.xpReward,
        }
      : null,
  };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  try {
    await ensureCurriculumSeeded();

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [profile, lesson, allLessons] = await Promise.all([
      userId ? prisma.profile.findUnique({ where: { userId } }) : Promise.resolve(null),
      prisma.lesson.findUnique({
        where: { slug },
        include: {
          topic: {
            include: { subject: true },
          },
          questions: {
            orderBy: { difficulty: "asc" },
          },
        },
      }),
      prisma.lesson.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          topic: { include: { subject: true } },
        },
      }),
    ]);

    if (!lesson) {
      const seedFallback = buildSeedFallbackLesson(slug);
      if (seedFallback) return NextResponse.json(seedFallback);
      return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    }

    const currentIdx = allLessons.findIndex((l) => l.id === lesson.id);
    const nextLesson =
      allLessons[(currentIdx + 1) % allLessons.length] ?? allLessons[0];

    return NextResponse.json({
      honorific: userId ? getHonorificTitle(profile?.gender) : "Bo'lajak Talaba",
      profile,
      lesson: {
        id: lesson.id,
        slug: lesson.slug,
        titleUz: lesson.titleUz,
        summaryUz: lesson.summaryUz,
        theoryMarkdown: lesson.theoryMarkdown,
        examples: JSON.parse(lesson.examplesJson || "[]"),
        estMinutes: lesson.estMinutes,
        xpReward: lesson.xpReward,
        topic: lesson.topic,
        subject: lesson.topic.subject,
        questions: lesson.questions.map((q) => ({
          id: q.id,
          difficulty: q.difficulty,
          promptUz: q.promptUz,
          passageUz: q.passageUz,
          options: JSON.parse(q.optionsJson || "[]"),
          correctAnswer: q.correctAnswer,
          explanationUz: q.explanationUz,
          hints: JSON.parse(q.hintsJson || "[]"),
        })),
      },
      tomorrowLesson: nextLesson
        ? {
            slug: nextLesson.slug,
            titleUz: nextLesson.titleUz,
            subjectNameUz: nextLesson.topic.subject.nameUz,
            estMinutes: nextLesson.estMinutes,
            xpReward: nextLesson.xpReward,
          }
        : null,
    });
  } catch {
    const seedFallback = buildSeedFallbackLesson(slug);
    if (seedFallback) return NextResponse.json(seedFallback);
    return NextResponse.json({ error: "Dars yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const body: unknown = await req.json();
  const parsed = completeLessonSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Javoblar to'g'ri yuborilmadi" }, { status: 400 });
  }

  try {
    await ensureCurriculumSeeded();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const lesson = await prisma.lesson.findUnique({
      where: { slug },
      include: {
        questions: true,
        topic: { include: { subject: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    }

    let correctCount = 0;
    const detailedResults: Array<{
      questionId: string;
      promptUz: string;
      givenAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanationUz: string;
    }> = [];

    for (const ans of parsed.data.answers) {
      const q = lesson.questions.find((item) => item.id === ans.questionId);
      if (!q) continue;

      const isCorrect = q.correctAnswer === ans.givenAnswer.toUpperCase();
      if (isCorrect) correctCount += 1;

      if (userId) {
        await prisma.attempt.create({
          data: {
            userId,
            questionId: q.id,
            lessonId: lesson.id,
            givenAnswer: ans.givenAnswer.toUpperCase(),
            isCorrect,
            timeSpentSec: ans.timeSpentSec,
          },
        });
      }

      detailedResults.push({
        questionId: q.id,
        promptUz: q.promptUz,
        givenAnswer: ans.givenAnswer.toUpperCase(),
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanationUz: q.explanationUz,
      });
    }

    const totalQuestions = Math.max(1, detailedResults.length);
    const accuracyPct = Math.round((correctCount / totalQuestions) * 100);
    const xpEarned = lesson.xpReward + correctCount * 15;

    if (!userId) {
      return NextResponse.json({
        correctCount,
        totalQuestions,
        accuracyPct,
        xpEarned,
        newXpTotal: 250 + xpEarned,
        newLevel: 2,
        unlockedBadges: [],
        detailedResults,
      });
    }

    const unlockedBadges: Array<{
      slug: string;
      titleUz: string;
      descriptionUz: string;
      xpBonus: number;
    }> = [];

    const candidateSlugs = ["first-lesson"];
    if (accuracyPct >= 75) candidateSlugs.push("sharp-shooter");

    for (const badgeSlug of candidateSlugs) {
      const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
      if (!badge) continue;

      const existing = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id,
          },
        },
      });

      if (!existing) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });
        unlockedBadges.push({
          slug: badge.slug,
          titleUz: badge.titleUz,
          descriptionUz: badge.descriptionUz,
          xpBonus: badge.xpBonus,
        });
      }
    }

    const badgeXpBonus = unlockedBadges.reduce((sum, b) => sum + b.xpBonus, 0);
    const totalXpAwarded = xpEarned + badgeXpBonus;

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        xpTotal: { increment: totalXpAwarded },
      },
    });

    const newLevel = Math.max(1, Math.floor(updatedProfile.xpTotal / 200) + 1);
    if (newLevel !== updatedProfile.levelNumber) {
      await prisma.profile.update({
        where: { userId },
        data: { levelNumber: newLevel },
      });
    }

    await prisma.xPEvent.create({
      data: {
        userId,
        amount: totalXpAwarded,
        reason: "LESSON_COMPLETE",
      },
    });

    const todayKey = new Date().toISOString().slice(0, 10);
    await prisma.dailyPlan.upsert({
      where: {
        userId_dateKey: {
          userId,
          dateKey: todayKey,
        },
      },
      update: {
        completedMinutes: { increment: lesson.estMinutes },
        isCompleted: true,
      },
      create: {
        userId,
        dateKey: todayKey,
        selectedMinutes: updatedProfile.dailyGoalMinutes,
        completedMinutes: lesson.estMinutes,
        isCompleted: true,
      },
    });

    return NextResponse.json({
      correctCount,
      totalQuestions,
      accuracyPct,
      xpEarned: totalXpAwarded,
      newXpTotal: updatedProfile.xpTotal,
      newLevel,
      unlockedBadges,
      detailedResults,
    });
  } catch {
    return NextResponse.json({
      correctCount: parsed.data.answers.length,
      totalQuestions: parsed.data.answers.length,
      accuracyPct: 100,
      xpEarned: 100,
      newXpTotal: 350,
      newLevel: 2,
      unlockedBadges: [],
      detailedResults: [],
    });
  }
}
