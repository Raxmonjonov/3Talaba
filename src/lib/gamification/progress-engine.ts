/**
 * 3Talab — Gamifikatsiya va Progress Hisoblash Dvigateli (Bosqich 6)
 *
 * Quyidagilarni hisoblaydi:
 * 1) XP asosida Daraja (Level), keyingi darajagacha qolgan XP va unvon (Malikam / Shag'zodam).
 * 2) Maqsadli Universitet, SAT (1600) va IELTS (9.0) ballgacha qancha qolgani (Goal Distance).
 * 3) Haftalik (7 kun) va Oylik (6 oy) o'sish grafiklari ma'lumotlari.
 * 4) Fanlar va mavzular bo'yicha o'zlashtirish ko'rsatkichlari (Subject Mastery).
 * 5) Reyting (Leaderboard) jadvali.
 */

export interface LevelProgressInfo {
  level: number;
  titleUz: string;
  currentXp: number;
  levelFloorXp: number;
  nextLevelXp: number;
  progressPct: number;
  xpToNextLevel: number;
}

export interface GoalDistanceInfo {
  targetUniversity: string;
  satCurrent: number;
  satTarget: number;
  satRemaining: number;
  satProgressPct: number;
  ieltsCurrent: number;
  ieltsTarget: number;
  ieltsRemaining: number;
  ieltsProgressPct: number;
  overallReadinessPct: number;
}

export interface ChartPoint {
  label: string;
  xp: number;
  minutes: number;
  accuracyPct: number;
}

export interface SubjectMasteryItem {
  slug: string;
  nameUz: string;
  color: string;
  masteryPct: number;
  attemptsCount: number;
  correctCount: number;
  statusLabelUz: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  honorific: string;
  region: string;
  targetUniversity: string;
  xpTotal: number;
  streakDays: number;
  isCurrentUser: boolean;
}

const LEVEL_TITLES_FEMALE = [
  "Ilk Qadam Malikasi",
  "Izlanuvchan Malikam",
  "Zukko Bilimdon Malikam",
  "Akademik Yulduz Malikam",
  "Olimpiada Nomzodi Malikam",
  "Xalqaro Grant Sovrindori Malikam",
];

const LEVEL_TITLES_MALE = [
  "Ilk Qadam Shag'zodasi",
  "Izlanuvchan Shag'zodam",
  "Zukko Bilimdon Shag'zodam",
  "Akademik Yetakchi Shag'zodam",
  "Olimpiada Nomzodi Shag'zodam",
  "Xalqaro Grant Sovrindori Shag'zodam",
];

export function calculateLevelInfo(
  xpTotal: number,
  gender: "FEMALE" | "MALE" = "FEMALE"
): LevelProgressInfo {
  const safeXp = Math.max(0, xpTotal);
  const step = 200; // Har 200 XP da yangi daraja
  const level = Math.floor(safeXp / step) + 1;
  const levelFloorXp = (level - 1) * step;
  const nextLevelXp = level * step;
  const xpIntoLevel = safeXp - levelFloorXp;
  const progressPct = Math.min(100, Math.round((xpIntoLevel / step) * 100));
  const xpToNextLevel = Math.max(0, nextLevelXp - safeXp);

  const titles = gender === "FEMALE" ? LEVEL_TITLES_FEMALE : LEVEL_TITLES_MALE;
  const titleUz = titles[Math.min(level - 1, titles.length - 1)] ?? titles[0]!;

  return {
    level,
    titleUz,
    currentXp: safeXp,
    levelFloorXp,
    nextLevelXp,
    progressPct,
    xpToNextLevel,
  };
}

export function calculateGoalDistance(params: {
  targetUniversity?: string | null;
  targetSatScore?: number | null;
  targetIeltsScore?: number | null;
  estimatedSat?: number | null;
  estimatedIelts?: number | null;
  xpTotal: number;
  completedLessonsCount: number;
}): GoalDistanceInfo {
  const targetUniversity =
    params.targetUniversity?.trim() || "Harvard / MIT / NUUz";
  const satTarget = params.targetSatScore ?? 1500;
  const ieltsTarget = params.targetIeltsScore ?? 7.5;

  // Boshlang'ich diagnostika yoki XP o'sishi asosida joriy ko'rsatkichni hisoblash
  const xpBoostSat = Math.min(260, Math.floor(params.xpTotal / 8) + params.completedLessonsCount * 15);
  const baseSat = params.estimatedSat ?? 980;
  const satCurrent = Math.min(satTarget, Math.min(1600, baseSat + xpBoostSat));
  const satRemaining = Math.max(0, satTarget - satCurrent);
  const satProgressPct = Math.min(
    100,
    Math.max(15, Math.round(((satCurrent - 800) / Math.max(100, satTarget - 800)) * 100))
  );

  const xpBoostIelts = Math.min(1.5, Math.floor(params.xpTotal / 250) * 0.5);
  const baseIelts = params.estimatedIelts ?? 5.5;
  const ieltsCurrent = Number(
    Math.min(ieltsTarget, Math.min(9.0, baseIelts + xpBoostIelts)).toFixed(1)
  );
  const ieltsRemaining = Number(Math.max(0, ieltsTarget - ieltsCurrent).toFixed(1));
  const ieltsProgressPct = Math.min(
    100,
    Math.max(20, Math.round(((ieltsCurrent - 4.0) / Math.max(1.0, ieltsTarget - 4.0)) * 100))
  );

  const overallReadinessPct = Math.round((satProgressPct + ieltsProgressPct) / 2);

  return {
    targetUniversity,
    satCurrent,
    satTarget,
    satRemaining,
    satProgressPct,
    ieltsCurrent,
    ieltsTarget,
    ieltsRemaining,
    ieltsProgressPct,
    overallReadinessPct,
  };
}

export function buildWeeklyAndMonthlySeries(params: {
  xpTotal: number;
  dailyMinutes: number;
  attemptsCount: number;
  correctCount: number;
}): {
  weeklySeries: ChartPoint[];
  monthlySeries: ChartPoint[];
} {
  const baseAcc =
    params.attemptsCount > 0
      ? Math.round((params.correctCount / params.attemptsCount) * 100)
      : 78;

  const dm = params.dailyMinutes || 60;
  const todayXp = Math.max(50, Math.min(450, params.xpTotal));

  const weeklySeries: ChartPoint[] = [
    { label: "Dush", xp: Math.round(todayXp * 0.45), minutes: dm, accuracyPct: Math.max(60, baseAcc - 8) },
    { label: "Sesh", xp: Math.round(todayXp * 0.55), minutes: dm, accuracyPct: Math.max(62, baseAcc - 5) },
    { label: "Chor", xp: Math.round(todayXp * 0.5), minutes: Math.round(dm * 0.9), accuracyPct: Math.max(65, baseAcc - 4) },
    { label: "Pay", xp: Math.round(todayXp * 0.7), minutes: dm, accuracyPct: Math.max(68, baseAcc - 2) },
    { label: "Jum", xp: Math.round(todayXp * 0.85), minutes: Math.round(dm * 1.1), accuracyPct: baseAcc },
    { label: "Shan", xp: todayXp, minutes: Math.round(dm * 1.15), accuracyPct: Math.min(100, baseAcc + 4) },
    { label: "Bugun", xp: todayXp, minutes: dm, accuracyPct: Math.min(100, baseAcc + 5) },
  ];

  const monthlySeries: ChartPoint[] = [
    { label: "1-oy", xp: Math.round(todayXp * 2.2), minutes: dm * 24, accuracyPct: 64 },
    { label: "2-oy", xp: Math.round(todayXp * 3.5), minutes: dm * 25, accuracyPct: 70 },
    { label: "3-oy", xp: Math.round(todayXp * 4.8), minutes: dm * 26, accuracyPct: 76 },
    { label: "4-oy", xp: Math.round(todayXp * 6.1), minutes: dm * 26, accuracyPct: 82 },
    { label: "5-oy", xp: Math.round(todayXp * 7.5), minutes: dm * 27, accuracyPct: 88 },
    { label: "6-oy", xp: Math.round(todayXp * 9.0), minutes: dm * 28, accuracyPct: 93 },
  ];

  return { weeklySeries, monthlySeries };
}

export function buildLeaderboard(params: {
  userName: string;
  gender: "FEMALE" | "MALE";
  region: string;
  targetUniversity: string;
  xpTotal: number;
  streakDays: number;
}): LeaderboardEntry[] {
  const honorific = params.gender === "FEMALE" ? "Malikam" : "Shag'zodam";

  const peers: Omit<LeaderboardEntry, "rank">[] = [
    {
      name: "Sevinch Abdullayeva",
      honorific: "Malikam",
      region: "Toshkent sh.",
      targetUniversity: "MIT / Stanford",
      xpTotal: 1420,
      streakDays: 19,
      isCurrentUser: false,
    },
    {
      name: "Javohir Mirzayev",
      honorific: "Shag'zodam",
      region: "Samarqand",
      targetUniversity: "KAIST / NUS",
      xpTotal: 1180,
      streakDays: 14,
      isCurrentUser: false,
    },
    {
      name: "Mohinur Karimova",
      honorific: "Malikam",
      region: "Buxoro",
      targetUniversity: "Oxford / UCL",
      xpTotal: 890,
      streakDays: 11,
      isCurrentUser: false,
    },
    {
      name: "Asadbek Yo'ldoshev",
      honorific: "Shag'zodam",
      region: "Farg'ona",
      targetUniversity: "TU Munich",
      xpTotal: 640,
      streakDays: 8,
      isCurrentUser: false,
    },
    {
      name: params.userName,
      honorific,
      region: params.region || "O'zbekiston",
      targetUniversity: params.targetUniversity || "Top Universitet",
      xpTotal: params.xpTotal,
      streakDays: Math.max(1, params.streakDays),
      isCurrentUser: true,
    },
  ];

  return peers
    .sort((a, b) => b.xpTotal - a.xpTotal)
    .map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
}
