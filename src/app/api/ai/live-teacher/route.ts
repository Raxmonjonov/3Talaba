import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";
import { checkAIRateLimit } from "@/lib/ai";
import { getHonorificTitle } from "@/lib/validations/auth";
import {
  buildLiveTeacherPrompt,
  createLiveEphemeralToken,
  getLiveTeacherConfig,
  isLiveTeacherConfigured,
  type LiveTeacherExample,
  type LiveTeacherQuestion,
} from "@/lib/ai/live-teacher";

export const dynamic = "force-dynamic";

const liveTeacherSchema = z.object({
  slug: z.string().min(1),
  stage: z.enum(["THEORY", "EXAMPLES", "EXERCISES", "ANALYSIS"]).optional(),
  questionIndex: z.number().int().min(0).max(200).optional(),
});

export async function POST(req: Request) {
  if (!isLiveTeacherConfigured()) {
    return NextResponse.json(
      {
        error:
          "Talaba AI jonli ovozi sozlanmagan. GEMINI_API_KEY muhit o'zgaruvchisini qo'shing.",
      },
      { status: 503 },
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const rate = checkAIRateLimit(session.user.id, 12);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Juda ko'p urinish. ${rate.retryAfterSec} soniyadan so'ng qayta urinib ko'ring.` },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "So'rov formati noto'g'ri" }, { status: 400 });
  }

  const parsed = liveTeacherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dars ma'lumotlari noto'g'ri" }, { status: 400 });
  }

  await ensureCurriculumSeeded();

  const { slug, stage, questionIndex } = parsed.data;

  const [profile, lesson] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.lesson.findUnique({
      where: { slug },
      include: {
        topic: { include: { subject: true } },
        questions: { orderBy: { difficulty: "asc" } },
      },
    }),
  ]);

  if (!lesson) {
    return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
  }

  const examples = JSON.parse(lesson.examplesJson || "[]") as LiveTeacherExample[];
  const questions: LiveTeacherQuestion[] = lesson.questions.map((q) => ({
    promptUz: q.promptUz,
    passageUz: q.passageUz,
    options: JSON.parse(q.optionsJson || "[]") as Array<{ id: string; text: string }>,
    correctAnswer: q.correctAnswer,
    explanationUz: q.explanationUz,
    hints: JSON.parse(q.hintsJson || "[]") as string[],
  }));

  const systemPrompt = buildLiveTeacherPrompt(
    {
      titleUz: lesson.titleUz,
      summaryUz: lesson.summaryUz,
      theoryMarkdown: lesson.theoryMarkdown,
      examples,
      questions,
      estMinutes: lesson.estMinutes,
      subjectNameUz: lesson.topic.subject.nameUz,
      topicTitleUz: lesson.topic.titleUz,
    },
    {
      honorific: getHonorificTitle(profile?.gender),
      level: profile?.currentLevel || profile?.selfAssessedLevel || "BEGINNER",
      grade: profile?.grade,
      targetUniversity: profile?.targetUniversity,
    },
    {
      stage,
      questionIndex,
      totalQuestions: questions.length,
    },
  );

  try {
    const { token, expiresAt } = await createLiveEphemeralToken();
    const config = getLiveTeacherConfig();

    return NextResponse.json(
      {
        token,
        expiresAt,
        wsUrl: config.wsUrl,
        model: `models/${config.model}`,
        voice: config.voice,
        systemPrompt,
        lesson: {
          slug: lesson.slug,
          titleUz: lesson.titleUz,
          questionCount: questions.length,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Talaba AI jonli sessiyasini boshlab bo'lmadi.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
