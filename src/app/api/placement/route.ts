import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { placementSubmissionSchema } from "@/lib/validations/onboarding";
import {
  PLACEMENT_QUESTION_BANK,
  evaluatePlacementTest,
} from "@/lib/curriculum/placement-engine";
import { getHonorificTitle } from "@/lib/validations/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id.startsWith("serverless-")) {
      return NextResponse.json({
        honorific: session?.user?.name?.split(" ")[0] || "Bo'lajak Talaba",
        profile: {
          targetSatScore: 1500,
          targetIeltsScore: 7.5,
          targetUniversity: "Top 100 Grant Universitetlari",
          xpTotal: 200,
        },
        latestResult: null,
        questionBank: PLACEMENT_QUESTION_BANK,
      });
    }

    const [profile, latestResult] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: session.user.id } }),
      prisma.placementResult.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      honorific: getHonorificTitle(profile?.gender),
      profile,
      latestResult: latestResult
        ? {
            ...latestResult,
            subjectScores: JSON.parse(latestResult.subjectScoresJson || "{}"),
            strengths: JSON.parse(latestResult.strengthsJson || "[]"),
            weaknesses: JSON.parse(latestResult.weaknessesJson || "[]"),
          }
        : null,
      questionBank: PLACEMENT_QUESTION_BANK,
    });
  } catch {
    return NextResponse.json({
      honorific: "Bo'lajak Talaba",
      profile: {
        targetSatScore: 1500,
        targetIeltsScore: 7.5,
        targetUniversity: "Top 100 Grant Universitetlari",
        xpTotal: 200,
      },
      latestResult: null,
      questionBank: PLACEMENT_QUESTION_BANK,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = placementSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Javoblar to'liq yuborilmadi" },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id.startsWith("serverless-")) {
      const evaluation = evaluatePlacementTest({
        answers: parsed.data.answers,
        speakingComfort: parsed.data.speakingComfort,
        writingExperience: parsed.data.writingExperience,
        honorific: session?.user?.name?.split(" ")[0] || "Bo'lajak Talaba",
      });
      return NextResponse.json({
        result: {
          id: `guest-placement-${Date.now()}`,
          ...evaluation,
          createdAt: new Date().toISOString(),
        },
        xpAwarded: 100,
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    const honorific = getHonorificTitle(profile?.gender);
    const evaluation = evaluatePlacementTest({
      answers: parsed.data.answers,
      speakingComfort: parsed.data.speakingComfort,
      writingExperience: parsed.data.writingExperience,
      honorific,
    });

    const savedResult = await prisma.placementResult.create({
      data: {
        userId: session.user.id,
        overallLevel: evaluation.overallLevel,
        scorePercent: evaluation.scorePercent,
        estimatedSat: evaluation.estimatedSat,
        estimatedIelts: evaluation.estimatedIelts,
        subjectScoresJson: JSON.stringify(evaluation.subjectScores),
        strengthsJson: JSON.stringify(evaluation.strengths),
        weaknessesJson: JSON.stringify(evaluation.weaknesses),
        writingSpeakingAdvice: evaluation.writingSpeakingAdvice,
      },
    });

    const isFirstPlacement = !profile?.placementDone;

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        currentLevel: evaluation.overallLevel,
        placementDone: true,
        ...(isFirstPlacement
          ? {
              xpTotal: { increment: 100 },
              levelNumber: 2,
            }
          : {}),
      },
    });

    if (isFirstPlacement) {
      await prisma.xPEvent.create({
        data: {
          userId: session.user.id,
          amount: 100,
          reason: "PLACEMENT_DONE",
        },
      });
    }

    return NextResponse.json({
      result: {
        id: savedResult.id,
        ...evaluation,
        createdAt: savedResult.createdAt,
      },
      xpAwarded: isFirstPlacement ? 100 : 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Saralash testi natijasini hisoblashda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
