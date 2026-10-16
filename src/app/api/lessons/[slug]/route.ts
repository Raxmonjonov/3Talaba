import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";
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

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  await ensureCurriculumSeeded();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const { slug } = await context.params;

  const [profile, lesson, allLessons] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
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
    return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
  }

  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson =
    allLessons[(currentIdx + 1) % allLessons.length] ?? allLessons[0];

  return NextResponse.json({
    honorific: getHonorificTitle(profile?.gender),
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
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  await ensureCurriculumSeeded();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const { slug } = await context.params;
  const body: unknown = await req.json();
  const parsed = completeLessonSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Javoblar to'g'ri yuborilmadi" }, { status: 400 });
  }

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

    await prisma.attempt.create({
      data: {
        userId: session.user.id,
        questionId: q.id,
        lessonId: lesson.id,
        givenAnswer: ans.givenAnswer.toUpperCase(),
        isCorrect,
        timeSpentSec: ans.timeSpentSec,
      },
    });

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

  // Nishonlarni (Badges) tekshirish va berish
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
          userId: session.user.id,
          badgeId: badge.id,
        },
      },
    });

    if (!existing) {
      await prisma.userBadge.create({
        data: {
          userId: session.user.id,
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
    where: { userId: session.user.id },
    data: {
      xpTotal: { increment: totalXpAwarded },
    },
  });

  const newLevel = Math.max(1, Math.floor(updatedProfile.xpTotal / 200) + 1);
  if (newLevel !== updatedProfile.levelNumber) {
    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { levelNumber: newLevel },
    });
  }

  await prisma.xPEvent.create({
    data: {
      userId: session.user.id,
      amount: totalXpAwarded,
      reason: "LESSON_COMPLETE",
    },
  });

  // Kunlik rejani (DailyPlan) yangilash
  const todayKey = new Date().toISOString().slice(0, 10);
  await prisma.dailyPlan.upsert({
    where: {
      userId_dateKey: {
        userId: session.user.id,
        dateKey: todayKey,
      },
    },
    update: {
      completedMinutes: { increment: lesson.estMinutes },
      isCompleted: true,
    },
    create: {
      userId: session.user.id,
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
}
