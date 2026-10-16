import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";

const createOrUpdateQuestionSchema = z.object({
  id: z.string().optional(),
  subjectSlug: z.string().min(1),
  difficulty: z.number().int().min(1).max(4),
  promptUz: z.string().min(10, "Savol matni kamida 10 ta belgidan iborat bo'lsin"),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanationUz: z.string().min(10, "Tushuntirish matni kamida 10 ta belgidan iborat bo'lsin"),
  hintUz: z.string().optional(),
});

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    await ensureCurriculumSeeded();

    const [users, subjects, lessons, questions, attempts] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
        include: { profile: true, streak: true },
      }),
      prisma.subject.findMany({
        orderBy: { order: "asc" },
        include: { topics: true },
      }),
      prisma.lesson.findMany({
        include: { topic: { include: { subject: true } } },
      }),
      prisma.question.findMany({
        orderBy: { createdAt: "desc" },
        take: 40,
        include: { subject: true, topic: true },
      }),
      prisma.attempt.findMany(),
    ]);

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const avgAccuracyPct =
      totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 82;
    const totalPlatformXp = users.reduce(
      (sum, u) => sum + (u.profile?.xpTotal ?? 50),
      0
    );

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalSubjects: subjects.length,
        totalLessons: lessons.length,
        totalQuestions: questions.length,
        totalAttempts,
        avgAccuracyPct,
        totalPlatformXp,
      },
      subjects: subjects.map((s) => ({
        id: s.id,
        slug: s.slug,
        nameUz: s.nameUz,
        defaultTopicId: s.topics[0]?.id ?? null,
        defaultTopicTitle: s.topics[0]?.titleUz ?? s.nameUz,
      })),
      questions: questions.map((q) => {
        let parsedOptions: Array<{ id: string; text: string }> = [];
        try {
          parsedOptions = JSON.parse(q.optionsJson) as Array<{
            id: string;
            text: string;
          }>;
        } catch {
          parsedOptions = [];
        }
        return {
          id: q.id,
          subjectSlug: q.subject.slug,
          subjectNameUz: q.subject.nameUz,
          topicTitleUz: q.topic?.titleUz ?? "Umumiy mavzu",
          difficulty: q.difficulty,
          promptUz: q.promptUz,
          options: parsedOptions,
          correctAnswer: q.correctAnswer,
          explanationUz: q.explanationUz,
        };
      }),
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        gender: u.profile?.gender ?? "FEMALE",
        honorific: u.profile?.gender === "FEMALE" ? "Malikam" : "Shag'zodam",
        region: u.profile?.region ?? "Toshkent sh.",
        grade: u.profile?.grade ?? "10-sinf",
        xpTotal: u.profile?.xpTotal ?? 50,
        streakDays: u.streak?.currentStreak ?? 1,
        guardianShareCode: u.guardianShareCode,
      })),
      lessons: lessons.map((l) => ({
        id: l.id,
        slug: l.slug,
        titleUz: l.titleUz,
        subjectNameUz: l.topic.subject.nameUz,
        topicTitleUz: l.topic.titleUz,
        estMinutes: l.estMinutes,
        xpReward: l.xpReward,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Admin panel ma'lumotlarini yuklashda xatolik" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }

    const body = await request.json();
    const parsed = createOrUpdateQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Savol ma'lumotlari to'liq emas", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const subject = await prisma.subject.findUnique({
      where: { slug: data.subjectSlug },
      include: { topics: { include: { lessons: true } } },
    });

    if (!subject) {
      return NextResponse.json({ error: "Tanlangan fan topilmadi" }, { status: 404 });
    }

    const defaultTopic = subject.topics[0];
    const defaultLesson = defaultTopic?.lessons[0];

    const optionsJson = JSON.stringify([
      { id: "A", text: data.optionA },
      { id: "B", text: data.optionB },
      { id: "C", text: data.optionC },
      { id: "D", text: data.optionD },
    ]);

    const hintsJson = JSON.stringify([
      data.hintUz?.trim() ||
        "Savol shartidagi kalit so'zlar va bog'liqlikka e'tibor qarating.",
    ]);

    if (data.id) {
      const updated = await prisma.question.update({
        where: { id: data.id },
        data: {
          subjectId: subject.id,
          topicId: defaultTopic?.id ?? null,
          lessonId: defaultLesson?.id ?? null,
          difficulty: data.difficulty,
          promptUz: data.promptUz,
          optionsJson,
          correctAnswer: data.correctAnswer,
          explanationUz: data.explanationUz,
          hintsJson,
        },
        include: { subject: true, topic: true },
      });

      return NextResponse.json({
        message: "Savol muvaffaqiyatli tahrirlandi",
        question: {
          id: updated.id,
          subjectSlug: updated.subject.slug,
          subjectNameUz: updated.subject.nameUz,
          topicTitleUz: updated.topic?.titleUz ?? "Umumiy mavzu",
          difficulty: updated.difficulty,
          promptUz: updated.promptUz,
          options: JSON.parse(updated.optionsJson),
          correctAnswer: updated.correctAnswer,
          explanationUz: updated.explanationUz,
        },
      });
    }

    const created = await prisma.question.create({
      data: {
        subjectId: subject.id,
        topicId: defaultTopic?.id ?? null,
        lessonId: defaultLesson?.id ?? null,
        difficulty: data.difficulty,
        promptUz: data.promptUz,
        optionsJson,
        correctAnswer: data.correctAnswer,
        explanationUz: data.explanationUz,
        hintsJson,
        isPlacement: false,
      },
      include: { subject: true, topic: true },
    });

    return NextResponse.json({
      message: "Yangi savol bankka muvaffaqiyatli qo'shildi",
      question: {
        id: created.id,
        subjectSlug: created.subject.slug,
        subjectNameUz: created.subject.nameUz,
        topicTitleUz: created.topic?.titleUz ?? "Umumiy mavzu",
        difficulty: created.difficulty,
        promptUz: created.promptUz,
        options: JSON.parse(created.optionsJson),
        correctAnswer: created.correctAnswer,
        explanationUz: created.explanationUz,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Savolni saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
