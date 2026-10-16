import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import {
  calculateGoalDistance,
  calculateLevelInfo,
} from "@/lib/gamification/progress-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareCode = searchParams.get("code")?.trim();

    let user = null;

    if (shareCode) {
      user = await prisma.user.findUnique({
        where: { guardianShareCode: shareCode },
        include: {
          profile: true,
          streak: true,
          attempts: { include: { question: { include: { subject: true } } } },
          dailyPlans: { orderBy: { updatedAt: "desc" }, take: 1 },
        },
      });
    }

    if (!user) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            profile: true,
            streak: true,
            attempts: { include: { question: { include: { subject: true } } } },
            dailyPlans: { orderBy: { updatedAt: "desc" }, take: 1 },
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "O'quvchi ma'lumoti topilmadi. Maxsus kodni tekshiring." },
        { status: 404 }
      );
    }

    const gender: "FEMALE" | "MALE" =
      user.profile?.gender === "FEMALE" ? "FEMALE" : "MALE";
    const honorific = gender === "FEMALE" ? "Malikam" : "Shag'zodam";
    const xpTotal = user.profile?.xpTotal ?? 50;
    const dailyMinutes =
      user.dailyPlans?.[0]?.selectedMinutes ??
      user.profile?.dailyGoalMinutes ??
      60;

    const levelInfo = calculateLevelInfo(xpTotal, gender);
    const goalDistance = calculateGoalDistance({
      targetUniversity: user.profile?.targetUniversity,
      targetSatScore: user.profile?.targetSatScore,
      targetIeltsScore: user.profile?.targetIeltsScore,
      xpTotal,
      completedLessonsCount: Math.max(1, Math.floor((user.attempts?.length ?? 0) / 3)),
    });

    const totalAttempts = user.attempts?.length ?? 0;
    const correctAttempts =
      user.attempts?.filter((a) => a.isCorrect).length ?? 0;
    const accuracyPct =
      totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 82;

    return NextResponse.json({
      student: {
        name: user.name,
        gender,
        honorific,
        grade: user.profile?.grade ?? "10-sinf",
        region: user.profile?.region ?? "Toshkent sh.",
        guardianShareCode: user.guardianShareCode,
        dailyMinutes,
        reminderTime: user.profile?.reminderTime ?? "19:00",
      },
      levelInfo,
      streakDays: Math.max(1, user.streak?.currentStreak ?? 1),
      goalDistance,
      academicSummary: {
        totalAttempts,
        accuracyPct,
        weeklyPlannedHours: Number(((dailyMinutes * 6) / 60).toFixed(1)),
        teacherNoteUz: `${user.name} (${honorific}) kuniga ${dailyMinutes} daqiqalik reja asosida barqaror shug'ullanmoqda. Hozirgi o'rtacha aniqlik ${accuracyPct}% ni tashkil etadi. Ota-ona sifatida kunlik o'qish vaqtida (${user.profile?.reminderTime ?? "19:00"}) tinch muhit yaratib berishingiz va rag'batlantirishingiz tavsiya etiladi.`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Ota-ona ko'rinishi ma'lumotlarini yuklashda xatolik" },
      { status: 500 }
    );
  }
}
