import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumSeeded } from "@/lib/curriculum/ensure-seeded";
import { SEED_BADGES, SEED_CURRICULUM } from "@/lib/curriculum/seed-content";
import {
  buildLeaderboard,
  buildWeeklyAndMonthlySeries,
  calculateGoalDistance,
  calculateLevelInfo,
  type SubjectMasteryItem,
} from "@/lib/gamification/progress-engine";

function buildGuestProgressPayload(name = "Bo'lajak Talaba") {
  const xpTotal = 240;
  const dailyMinutes = 60;
  const levelInfo = calculateLevelInfo(xpTotal, "MALE");
  const goalDistance = calculateGoalDistance({
    targetUniversity: "Top 100 Grant Universitetlari",
    targetSatScore: 1500,
    targetIeltsScore: 7.5,
    estimatedSat: 1240,
    estimatedIelts: 6.5,
    xpTotal,
    completedLessonsCount: 3,
  });
  const subjectMastery: SubjectMasteryItem[] = SEED_CURRICULUM.map((subj, idx) => ({
    slug: subj.slug,
    nameUz: subj.nameUz,
    color: subj.color,
    masteryPct: Math.min(88, 52 + idx * 8),
    attemptsCount: 6,
    correctCount: 5,
    statusLabelUz: idx < 2 ? "A'lo o'zlashtirilgan" : "Barqaror o'sishda",
  }));
  const { weeklySeries, monthlySeries } = buildWeeklyAndMonthlySeries({
    xpTotal,
    dailyMinutes,
    attemptsCount: 18,
    correctCount: 15,
  });
  const badges = SEED_BADGES.map((b, idx) => ({
    slug: b.slug,
    titleUz: b.titleUz,
    descriptionUz: b.descriptionUz,
    icon: b.icon,
    xpBonus: b.xpBonus,
    unlocked: idx < 2,
    earnedAt: idx < 2 ? new Date().toISOString() : null,
  }));
  const leaderboard = buildLeaderboard({
    userName: name,
    gender: "MALE",
    region: "Toshkent sh.",
    targetUniversity: goalDistance.targetUniversity,
    xpTotal,
    streakDays: 4,
  });

  return {
    student: {
      name,
      gender: "MALE" as const,
      honorific: name.split(" ")[0] || "Talaba",
      region: "Toshkent sh.",
      dailyMinutes,
    },
    levelInfo,
    streak: {
      currentStreak: 4,
      longestStreak: 7,
      freezeCount: 1,
    },
    goalDistance,
    subjectMastery,
    weeklySeries,
    monthlySeries,
    badges,
    leaderboard,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id.startsWith("serverless-")) {
      return NextResponse.json(buildGuestProgressPayload(session?.user?.name ?? "Bo'lajak Talaba"));
    }

    await ensureCurriculumSeeded();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        streak: true,
        badges: { include: { badge: true } },
        attempts: { include: { question: { include: { subject: true } } } },
        placementResults: { orderBy: { createdAt: "desc" }, take: 1 },
        dailyPlans: { orderBy: { updatedAt: "desc" }, take: 1 },
      },
    });

    const subjects = await prisma.subject.findMany({
      orderBy: { order: "asc" },
    });

    const allBadges = await prisma.badge.findMany();

    const gender: "FEMALE" | "MALE" =
      user?.profile?.gender === "FEMALE" ? "FEMALE" : "MALE";
    const honorific = user?.name?.split(" ")[0] || "Aziz o'quvchi";
    const xpTotal = user?.profile?.xpTotal ?? 50;
    const dailyMinutes =
      user?.dailyPlans?.[0]?.selectedMinutes ??
      user?.profile?.dailyGoalMinutes ??
      60;

    // 1. Daraja va XP ma'lumoti
    const levelInfo = calculateLevelInfo(xpTotal, gender);

    // 2. Diagnostika ballarini o'qish
    const latestPlacement = user?.placementResults?.[0];
    let estimatedSat = 1020;
    let estimatedIelts = 5.5;
    if (latestPlacement?.subjectScoresJson) {
      try {
        const parsed = JSON.parse(latestPlacement.subjectScoresJson) as {
          estimatedSat?: number;
          estimatedIelts?: number;
        };
        if (parsed.estimatedSat) estimatedSat = parsed.estimatedSat;
        if (parsed.estimatedIelts) estimatedIelts = parsed.estimatedIelts;
      } catch {
        // Standart qiymatlar qoladi
      }
    }

    const totalAttempts = user?.attempts?.length ?? 0;
    const correctAttempts =
      user?.attempts?.filter((a) => a.isCorrect).length ?? 0;

    // 3. Maqsadli OTM va ballgacha masofa
    const goalDistance = calculateGoalDistance({
      targetUniversity: user?.profile?.targetUniversity,
      targetSatScore: user?.profile?.targetSatScore,
      targetIeltsScore: user?.profile?.targetIeltsScore,
      estimatedSat,
      estimatedIelts,
      xpTotal,
      completedLessonsCount: Math.max(1, Math.floor(totalAttempts / 3)),
    });

    // 4. Fanlar bo'yicha o'zlashtirish (Subject Mastery)
    const subjectMastery: SubjectMasteryItem[] = subjects.map((subj, idx) => {
      const subjAttempts =
        user?.attempts?.filter((a) => a.question.subjectId === subj.id) ?? [];
      const subjCorrect = subjAttempts.filter((a) => a.isCorrect).length;

      const rawPct =
        subjAttempts.length > 0
          ? Math.round((subjCorrect / subjAttempts.length) * 100)
          : Math.min(85, 38 + idx * 9 + Math.floor(xpTotal / 25));

      const masteryPct = Math.max(20, Math.min(100, rawPct));
      const statusLabelUz =
        masteryPct >= 80
          ? "A'lo o'zlashtirilgan"
          : masteryPct >= 55
            ? "Barqaror o'sishda"
            : "Mustahkamlash kerak";

      return {
        slug: subj.slug,
        nameUz: subj.nameUz,
        color: subj.color,
        masteryPct,
        attemptsCount: subjAttempts.length,
        correctCount: subjCorrect,
        statusLabelUz,
      };
    });

    // 5. Haftalik va Oylik grafiklar
    const { weeklySeries, monthlySeries } = buildWeeklyAndMonthlySeries({
      xpTotal,
      dailyMinutes,
      attemptsCount: totalAttempts,
      correctCount: correctAttempts,
    });

    // 6. Nishonlar (Badges) vitrinasi
    const earnedMap = new Map(
      (user?.badges ?? []).map((ub) => [ub.badge.slug, ub.earnedAt])
    );

    // Ilk Qadam nishoni har bir ro'yxatdan o'tgan o'quvchida ochiq bo'ladi
    const badgesList = allBadges.map((b) => {
      const earnedAt = earnedMap.get(b.slug);
      const unlocked = Boolean(earnedAt) || b.slug === "first-step";
      return {
        slug: b.slug,
        titleUz: b.titleUz,
        descriptionUz: b.descriptionUz,
        icon: b.icon,
        xpBonus: b.xpBonus,
        unlocked,
        earnedAt: earnedAt ?? (b.slug === "first-step" ? user?.createdAt : null),
      };
    });

    // 7. Streak kalendari
    const currentStreak = Math.max(1, user?.streak?.currentStreak ?? 1);
    const longestStreak = Math.max(currentStreak, user?.streak?.longestStreak ?? 1);
    const freezeCount = user?.streak?.freezeCount ?? 1;

    // 8. Reyting (Leaderboard)
    const leaderboard = buildLeaderboard({
      userName: user?.name ?? "O'quvchi",
      gender,
      region: user?.profile?.region ?? "Toshkent sh.",
      targetUniversity: goalDistance.targetUniversity,
      xpTotal,
      streakDays: currentStreak,
    });

    return NextResponse.json({
      student: {
        name: user?.name ?? "O'quvchi",
        gender,
        honorific,
        region: user?.profile?.region ?? "Toshkent sh.",
        dailyMinutes,
      },
      levelInfo,
      streak: {
        currentStreak,
        longestStreak,
        freezeCount,
      },
      goalDistance,
      subjectMastery,
      weeklySeries,
      monthlySeries,
      badges: badgesList,
      leaderboard,
    });
  } catch {
    return NextResponse.json(buildGuestProgressPayload());
  }
}
