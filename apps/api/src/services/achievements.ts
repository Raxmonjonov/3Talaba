import { prisma } from "../config/prisma.js";

export type AchievementTier = "bronze" | "silver" | "gold";

export interface AchievementStats {
  currentLevel: number;
  totalMinutes: number;
  activeDays: number;
  totalCompleted: number;
  sessions: number;
  answers: number;
  lessonsDone: number;
}

export interface AchievementDef {
  slug: string;
  tier: AchievementTier;
  title: { uz: string; en: string; ru: string };
  description: { uz: string; en: string; ru: string };
  /**
   * Event-only medals are never inferred from counters — a trigger has to call
   * `awardSlug` at the moment they are earned (placement completion, …).
   */
  eventOnly?: boolean;
  check(stats: AchievementStats): boolean;
}

/** Fixed catalog: order is the display order on the medal shelf. */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    slug: "first_steps",
    tier: "bronze",
    title: {
      uz: "Birinchi qadam",
      en: "First steps",
      ru: "Первый шаг",
    },
    description: {
      uz: "Birinchi o‘quv sessiyangizni boshladingiz.",
      en: "You started your first study session.",
      ru: "Вы начали первую учебную сессию.",
    },
    check: (s) => s.sessions >= 1,
  },
  {
    slug: "placement_done",
    tier: "bronze",
    eventOnly: true,
    title: {
      uz: "Daraja aniqlandi",
      en: "Level placed",
      ru: "Уровень определён",
    },
    description: {
      uz: "Diagnostik testni yakunladingiz va darajangiz belgilandi.",
      en: "You finished the diagnostic and your level was set.",
      ru: "Вы прошли диагностический тест и получили уровень.",
    },
    check: () => false,
  },
  {
    slug: "level_3",
    tier: "bronze",
    title: {
      uz: "Poydevor",
      en: "Foundation",
      ru: "Основа",
    },
    description: {
      uz: "3-darajaga yetdingiz.",
      en: "You reached level 3.",
      ru: "Вы достигли 3 уровня.",
    },
    check: (s) => s.currentLevel >= 3,
  },
  {
    slug: "level_6",
    tier: "silver",
    title: {
      uz: "O‘rta bosqich",
      en: "Mid-level",
      ru: "Средний уровень",
    },
    description: {
      uz: "6-darajaga yetdingiz.",
      en: "You reached level 6.",
      ru: "Вы достигли 6 уровня.",
    },
    check: (s) => s.currentLevel >= 6,
  },
  {
    slug: "level_10",
    tier: "gold",
    title: {
      uz: "Yuqori cho‘qqi",
      en: "Peak",
      ru: "Вершина",
    },
    description: {
      uz: "10-darajaga yetdingiz — maximum.",
      en: "You reached level 10 — the top.",
      ru: "Вы достигли 10 уровня — максимум.",
    },
    check: (s) => s.currentLevel >= 10,
  },
  {
    slug: "time_60",
    tier: "bronze",
    title: {
      uz: "Bir soat",
      en: "One hour",
      ru: "Час",
    },
    description: {
      uz: "Jami 60 daqiqa o‘qidingiz — birinchi soat to‘ldi.",
      en: "You studied for 60 minutes in total.",
      ru: "Вы занимались 60 минут суммарно.",
    },
    check: (s) => s.totalMinutes >= 60,
  },
  {
    slug: "time_300",
    tier: "silver",
    title: {
      uz: "Besh soat",
      en: "Five hours",
      ru: "Пять часов",
    },
    description: {
      uz: "Jami 5 soat o‘qidingiz.",
      en: "You studied for 5 hours in total.",
      ru: "Вы занимались 5 часов суммарно.",
    },
    check: (s) => s.totalMinutes >= 300,
  },
  {
    slug: "time_1000",
    tier: "gold",
    title: {
      uz: "Mehnatsevar",
      en: "Hard worker",
      ru: "Трудяга",
    },
    description: {
      uz: "Jami 1000 daqiqadan ortiq o‘qidingiz.",
      en: "You studied for more than 1000 minutes.",
      ru: "Вы занимались более 1000 минут.",
    },
    check: (s) => s.totalMinutes >= 1000,
  },
  {
    slug: "active_7",
    tier: "silver",
    title: {
      uz: "Haftalik ritm",
      en: "Weekly rhythm",
      ru: "Недельный ритм",
    },
    description: {
      uz: "7 ta faol kun — odat shakllandi.",
      en: "7 active days — the habit is forming.",
      ru: "7 активных дней — привычка формируется.",
    },
    check: (s) => s.activeDays >= 7,
  },
  {
    slug: "questions_50",
    tier: "bronze",
    title: {
      uz: "Ellik savol",
      en: "Fifty questions",
      ru: "Пятьдесят вопросов",
    },
    description: {
      uz: "50 ta savolga javob berdingiz.",
      en: "You answered 50 questions.",
      ru: "Вы ответили на 50 вопросов.",
    },
    check: (s) => s.answers >= 50 || s.totalCompleted >= 50,
  },
  {
    slug: "questions_200",
    tier: "silver",
    title: {
      uz: "Ikki yuz savol",
      en: "Two hundred questions",
      ru: "Двести вопросов",
    },
    description: {
      uz: "200 ta savolga javob berdingiz.",
      en: "You answered 200 questions.",
      ru: "Вы ответили на 200 вопросов.",
    },
    check: (s) => s.answers >= 200 || s.totalCompleted >= 200,
  },
  {
    slug: "lessons_1",
    tier: "bronze",
    title: {
      uz: "Birinchi dars",
      en: "First lesson",
      ru: "Первый урок",
    },
    description: {
      uz: "Birinchi katalog darsini yakunladingiz.",
      en: "You finished your first catalog lesson.",
      ru: "Вы завершили свой первый урок.",
    },
    check: (s) => s.lessonsDone >= 1,
  },
  {
    slug: "lessons_5",
    tier: "silver",
    title: {
      uz: "Besh dars",
      en: "Five lessons",
      ru: "Пять уроков",
    },
    description: {
      uz: "5 ta darsni yakunladingiz — sur’at bor.",
      en: "You finished 5 lessons — keep the pace.",
      ru: "Вы завершили 5 уроков — темп есть.",
    },
    check: (s) => s.lessonsDone >= 5,
  },
  {
    slug: "lessons_10",
    tier: "gold",
    title: {
      uz: "O‘n dars",
      en: "Ten lessons",
      ru: "Десять уроков",
    },
    description: {
      uz: "10 ta darsni yakunladingiz — katta yo‘l bosildi.",
      en: "You finished 10 lessons — a real stretch.",
      ru: "Вы завершили 10 уроков — уже немало.",
    },
    check: (s) => s.lessonsDone >= 10,
  },
];

const CATALOG_BY_SLUG = new Map(ACHIEVEMENTS.map((def) => [def.slug, def]));

export type AchievementLocale = "uz" | "en" | "ru";

export interface AchievementView {
  slug: string;
  tier: AchievementTier;
  title: string;
  description: string;
  earnedAt: string | null;
}

/** All-time counters that drive the stat-based medals. */
export async function achievementStats(userId: string): Promise<AchievementStats> {
  const [user, progressAgg, activeDays, sessions, answers, lessonsDone] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { currentLevel: true },
      }),
      prisma.progress.aggregate({
        where: { userId },
        _sum: { minutes: true, completed: true },
      }),
      prisma.progress.count({ where: { userId, minutes: { gt: 0 } } }),
      prisma.session.count({ where: { userId } }),
      prisma.answer.count({ where: { userId } }),
      prisma.lessonCompletion.count({ where: { userId } }),
    ]);

  return {
    currentLevel: user?.currentLevel ?? 0,
    totalMinutes: progressAgg._sum.minutes ?? 0,
    totalCompleted: progressAgg._sum.completed ?? 0,
    activeDays,
    sessions,
    answers,
    lessonsDone,
  };
}

/**
 * Awards every stat-based medal the student has just qualified for.
 * Event-only medals are left alone — triggers call `awardSlug` for those.
 */
export async function evaluateAchievements(
  userId: string,
): Promise<{ earned: string[]; newlyEarned: string[] }> {
  const [stats, existing] = await Promise.all([
    achievementStats(userId),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { slug: true },
    }),
  ]);

  const earnedSet = new Set(existing.map((row) => row.slug));
  const toAward = ACHIEVEMENTS.filter(
    (def) => !def.eventOnly && !earnedSet.has(def.slug) && def.check(stats),
  ).map((def) => def.slug);

  if (toAward.length > 0) {
    // SQLite's client has no createMany(skipDuplicates); a plain create is
    // safe here because `toAward` was just filtered against `earnedSet`.
    for (const slug of toAward) {
      try {
        await prisma.userAchievement.create({ data: { userId, slug } });
        earnedSet.add(slug);
      } catch {
        // Unique violation: another request awarded it first — still earned.
        earnedSet.add(slug);
      }
    }
  }

  return { earned: [...earnedSet], newlyEarned: toAward };
}

/** Awards a single medal once. Returns true when this call created the row. */
export async function awardSlug(userId: string, slug: string): Promise<boolean> {
  if (!CATALOG_BY_SLUG.has(slug)) return false;
  try {
    await prisma.userAchievement.create({ data: { userId, slug } });
    return true;
  } catch {
    return false;
  }
}

/** Fire-and-forget wrappers so request handlers never wait on medals. */
export function awardLater(userId: string, slug: string): void {
  void awardSlug(userId, slug).catch(() => {
    /* a missed medal must not fail the request */
  });
}

export function evaluateLater(userId: string): void {
  void evaluateAchievements(userId).catch(() => {
    /* same */
  });
}

/** Re-evaluates, then returns the full catalog with earned timestamps. */
export async function listAchievements(
  userId: string,
  locale: AchievementLocale = "uz",
): Promise<AchievementView[]> {
  await evaluateAchievements(userId);

  const rows = await prisma.userAchievement.findMany({
    where: { userId },
    select: { slug: true, earnedAt: true },
  });
  const earnedAtBySlug = new Map(rows.map((row) => [row.slug, row.earnedAt]));

  return ACHIEVEMENTS.map((def) => ({
    slug: def.slug,
    tier: def.tier,
    title: def.title[locale],
    description: def.description[locale],
    earnedAt: earnedAtBySlug.get(def.slug)?.toISOString() ?? null,
  }));
}
