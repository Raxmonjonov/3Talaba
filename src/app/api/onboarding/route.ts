import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/onboarding";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
    }

    const body: unknown = await req.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Ma'lumotlar to'g'ri kiritilmadi" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    const isFirstOnboarding = !existingProfile?.onboardingDone;

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        targetUniversity: data.targetUniversity,
        targetCountry: data.targetCountry,
        targetSatScore: data.targetSatScore,
        targetIeltsScore: data.targetIeltsScore,
        selfAssessedLevel: data.selfAssessedLevel,
        strongSubjectsJson: JSON.stringify(data.strongSubjects),
        weakSubjectsJson: JSON.stringify(data.weakSubjects),
        learningStyle: data.learningStyle,
        preferredStudyTime: data.preferredStudyTime,
        onboardingDone: true,
        ...(isFirstOnboarding ? { xpTotal: { increment: 50 } } : {}),
      },
      create: {
        userId: session.user.id,
        targetUniversity: data.targetUniversity,
        targetCountry: data.targetCountry,
        targetSatScore: data.targetSatScore,
        targetIeltsScore: data.targetIeltsScore,
        selfAssessedLevel: data.selfAssessedLevel,
        strongSubjectsJson: JSON.stringify(data.strongSubjects),
        weakSubjectsJson: JSON.stringify(data.weakSubjects),
        learningStyle: data.learningStyle,
        preferredStudyTime: data.preferredStudyTime,
        onboardingDone: true,
        xpTotal: 100,
      },
    });

    if (isFirstOnboarding) {
      await prisma.xPEvent.create({
        data: {
          userId: session.user.id,
          amount: 50,
          reason: "ONBOARDING_COMPLETE",
        },
      });
    }

    return NextResponse.json({
      profile: updatedProfile,
      xpAwarded: isFirstOnboarding ? 50 : 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Ma'lumotlarni saqlashda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
