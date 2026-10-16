import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";
import { getHonorificTitle } from "@/lib/validations/auth";

const attemptQuestionSchema = z.object({
  questionId: z.string(),
  givenAnswer: z.string(),
  timeSpentSec: z.number().int().min(0).max(600).default(15),
});

export async function GET(req: Request) {
  await ensureCurriculumSeeded();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subjectSlug = searchParams.get("subject");
  const difficultyParam = searchParams.get("difficulty");

  const [profile, subjects, questions] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.subject.findMany({ orderBy: { order: "asc" } }),
    prisma.question.findMany({
      where: {
        ...(subjectSlug && subjectSlug !== "all"
          ? { subject: { slug: subjectSlug } }
          : {}),
        ...(difficultyParam && difficultyParam !== "all"
          ? { difficulty: Number(difficultyParam) }
          : {}),
      },
      include: {
        subject: true,
        topic: true,
      },
      orderBy: [{ subjectId: "asc" }, { difficulty: "asc" }],
    }),
  ]);

  return NextResponse.json({
    honorific: getHonorificTitle(profile?.gender),
    profile,
    subjects,
    questions: questions.map((q) => ({
      id: q.id,
      subjectSlug: q.subject.slug,
      subjectNameUz: q.subject.nameUz,
      topicTitleUz: q.topic.titleUz,
      difficulty: q.difficulty,
      promptUz: q.promptUz,
      passageUz: q.passageUz,
      options: JSON.parse(q.optionsJson || "[]"),
      correctAnswer: q.correctAnswer,
      explanationUz: q.explanationUz,
      hints: JSON.parse(q.hintsJson || "[]"),
    })),
  });
}

export async function POST(req: Request) {
  await ensureCurriculumSeeded();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = attemptQuestionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
  });

  if (!question) {
    return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });
  }

  const isCorrect =
    question.correctAnswer === parsed.data.givenAnswer.toUpperCase();

  await prisma.attempt.create({
    data: {
      userId: session.user.id,
      questionId: question.id,
      givenAnswer: parsed.data.givenAnswer.toUpperCase(),
      isCorrect,
      timeSpentSec: parsed.data.timeSpentSec,
    },
  });

  const xpAwarded = isCorrect ? question.difficulty * 10 : 5;

  const updatedProfile = await prisma.profile.update({
    where: { userId: session.user.id },
    data: { xpTotal: { increment: xpAwarded } },
  });

  await prisma.xPEvent.create({
    data: {
      userId: session.user.id,
      amount: xpAwarded,
      reason: isCorrect ? "CORRECT_ANSWER" : "PRACTICE_ATTEMPT",
    },
  });

  return NextResponse.json({
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanationUz: question.explanationUz,
    xpAwarded,
    xpTotal: updatedProfile.xpTotal,
  });
}
