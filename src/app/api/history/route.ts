import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";

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
  } catch (error) {
    console.error("GET /api/history error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
