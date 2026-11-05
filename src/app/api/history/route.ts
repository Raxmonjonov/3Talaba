import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";
import { SEED_CURRICULUM } from "@/lib/curriculum/seed-content";

export async function GET() {
  try {
    await ensureCurriculumSeeded();

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // 1. Agar foydalanuvchi tizimga kirgan bo'lsa, uning tugatilgan darslarini olamiz
    let completedLessonIds: string[] = [];
    if (userId) {
      const roadmapItems = await prisma.roadmapItem.findMany({
        where: {
          roadmap: { userId },
          isCompleted: true,
          lessonId: { not: null },
        },
        select: { lessonId: true },
      });
      completedLessonIds = roadmapItems.map((r) => r.lessonId as string);
    }

    // 2. Barcha darslarni to'liq nazariy matni va misollari bilan olamiz
    const lessons = await prisma.lesson.findMany({
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
        questions: {
          select: {
            id: true,
            promptUz: true,
            explanationUz: true,
            difficulty: true,
          },
        },
      },
      orderBy: [
        { topic: { subject: { order: "asc" } } },
        { topic: { order: "asc" } },
        { order: "asc" },
      ],
    });

    const formattedLessons = lessons.map((l) => {
      let parsedExamples: any[] = [];
      try {
        parsedExamples = JSON.parse(l.examplesJson || "[]");
      } catch {}

      const isCompleted = completedLessonIds.includes(l.id);

      return {
        id: l.id,
        slug: l.slug,
        titleUz: l.titleUz,
        summaryUz: l.summaryUz,
        theoryMarkdown: l.theoryMarkdown,
        examples: parsedExamples,
        estMinutes: l.estMinutes,
        xpReward: l.xpReward,
        subjectSlug: l.topic.subject.slug,
        subjectNameUz: l.topic.subject.nameUz,
        topicTitleUz: l.topic.titleUz,
        isCompleted,
        questionsCount: l.questions.length,
        questionsPreview: l.questions.slice(0, 3),
      };
    });

    return NextResponse.json({
      totalLessons: formattedLessons.length,
      completedCount: formattedLessons.filter((l) => l.isCompleted).length,
      lessons: formattedLessons,
    });
  } catch {
    const fallbackLessons = SEED_CURRICULUM.map((bundle, idx) => ({
      id: `seed-hist-${bundle.topic.lesson.slug}`,
      slug: bundle.topic.lesson.slug,
      titleUz: bundle.topic.lesson.titleUz,
      summaryUz: bundle.topic.lesson.summaryUz,
      theoryMarkdown: bundle.topic.lesson.theoryMarkdown,
      examples: bundle.topic.lesson.examples,
      estMinutes: bundle.topic.lesson.estMinutes,
      xpReward: bundle.topic.lesson.xpReward,
      subjectSlug: bundle.slug,
      subjectNameUz: bundle.nameUz,
      topicTitleUz: bundle.topic.titleUz,
      isCompleted: idx === 0,
      questionsCount: bundle.topic.lesson.questions.length,
      questionsPreview: bundle.topic.lesson.questions.slice(0, 3).map((q, qIdx) => ({
        id: `seed-hq-${idx}-${qIdx}`,
        promptUz: q.promptUz,
        explanationUz: q.explanationUz,
        difficulty: q.difficulty,
      })),
    }));

    return NextResponse.json({
      totalLessons: fallbackLessons.length,
      completedCount: 1,
      lessons: fallbackLessons,
    });
  }
}
