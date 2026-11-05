import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";
import { SEED_CURRICULUM } from "@/lib/curriculum/seed-content";
import { getHonorificTitle } from "@/lib/validations/auth";

const attemptQuestionSchema = z.object({
  questionId: z.string(),
  givenAnswer: z.string(),
  timeSpentSec: z.number().int().min(0).max(600).default(15),
});

function buildSeedQuestionsFallback(subjectSlug?: string | null, difficultyParam?: string | null) {
  const subjects = SEED_CURRICULUM.map((s, idx) => ({
    id: `seed-subj-${idx}`,
    slug: s.slug,
    nameUz: s.nameUz,
  }));
  const allQuestions = SEED_CURRICULUM.flatMap((s) =>
    s.topic.lesson.questions.map((q, qIdx) => ({
      id: `seed-q-${s.topic.lesson.slug}-${qIdx}`,
      subjectSlug: s.slug,
      subjectNameUz: s.nameUz,
      topicTitleUz: s.topic.titleUz,
      difficulty: q.difficulty,
      promptUz: q.promptUz,
      passageUz: q.passageUz ?? null,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanationUz: q.explanationUz,
      hints: q.hints,
    })),
  );
  const filtered = allQuestions.filter((q) => {
    if (subjectSlug && subjectSlug !== "all" && q.subjectSlug !== subjectSlug) return false;
    if (difficultyParam && difficultyParam !== "all" && q.difficulty !== Number(difficultyParam)) return false;
    return true;
  });
  return { subjects, questions: filtered };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subjectSlug = searchParams.get("subject");
  const difficultyParam = searchParams.get("difficulty");

  try {
    await ensureCurriculumSeeded();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id.startsWith("serverless-")) {
      const [subjects, questions] = await Promise.all([
        prisma.subject.findMany({ orderBy: { order: "asc" } }).catch(() => []),
        prisma.question
          .findMany({
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
            take: 60,
          })
          .catch(() => []),
      ]);

      const fallback = questions.length === 0 ? buildSeedQuestionsFallback(subjectSlug, difficultyParam) : null;

      return NextResponse.json(
        {
          honorific: "Bo'lajak Talaba",
          profile: null,
          subjects: fallback ? fallback.subjects : subjects,
          questions: fallback
            ? fallback.questions
            : questions.map((q) => ({
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
        },
        {
          headers: {
            "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
            "Netlify-CDN-Cache-Control":
              "public, durable, s-maxage=60, stale-while-revalidate=300",
            "Netlify-Vary":
              "query=subject|difficulty, cookie=next-auth.session-token|__Secure-next-auth.session-token",
          },
        },
      );
    }

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
  } catch {
    const fallback = buildSeedQuestionsFallback(subjectSlug, difficultyParam);
    return NextResponse.json({
      honorific: "Bo'lajak Talaba",
      profile: null,
      subjects: fallback.subjects,
      questions: fallback.questions,
    });
  }
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
