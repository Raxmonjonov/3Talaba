import type { Achievement } from '@prisma/client';

/**
 * Nishonlar (achievements).
 *
 * Har bir nishon `criteria` JSON shaklida: `{ type, value, ... }`.
 * Tekshiruv sodda va sinxron — agregatlar allaqachon hisoblangan bo'ladi.
 * Uchqish (composite) mezonlar masalan `{ type: 'ALL', of: [...] }`.
 */

export type Criteria =
  | { type: 'STREAK'; value: number }
  | { type: 'XP_TOTAL'; value: number }
  | { type: 'LESSONS_COMPLETED'; value: number }
  | { type: 'MOCK_COMPLETED'; value: number }
  | { type: 'MOCK_SCORE'; exam: 'SAT' | 'IELTS'; value: number }
  | { type: 'ERRORS_FIXED'; value: number }
  | { type: 'CARDS_REVIEWED'; value: number }
  | { type: 'QUESTIONS_ANSWERED'; value: number }
  | { type: 'ACCURACY_ABOVE'; value: number; minAnswers: number }
  | { type: 'STUDY_MINUTES'; value: number }
  | { type: 'WEEK_COMPLETED'; value: number }
  | { type: 'LEVEL'; value: number }
  | { type: 'PLACEMENT_LEVEL'; value: number }
  | { type: 'ALL'; of: Criteria[] };

export type AchievementStats = {
  streakLongest: number;
  xpTotal: number;
  lessonsCompleted: number;
  mockCompleted: number;
  bestMockSat: number;
  bestMockIelts: number;
  errorsFixed: number;
  cardsReviewed: number;
  questionsAnswered: number;
  accuracy: number;
  studyMinutes: number;
  weeksCompleted: number;
  level: number;
  placementLevel: number;
};

export function evaluate(criteria: unknown, stats: AchievementStats): boolean {
  if (!isCriteria(criteria)) return false;

  switch (criteria.type) {
    case 'STREAK':
      return stats.streakLongest >= criteria.value;
    case 'XP_TOTAL':
      return stats.xpTotal >= criteria.value;
    case 'LESSONS_COMPLETED':
      return stats.lessonsCompleted >= criteria.value;
    case 'MOCK_COMPLETED':
      return stats.mockCompleted >= criteria.value;
    case 'MOCK_SCORE':
      return criteria.exam === 'SAT'
        ? stats.bestMockSat >= criteria.value
        : stats.bestMockIelts >= criteria.value;
    case 'ERRORS_FIXED':
      return stats.errorsFixed >= criteria.value;
    case 'CARDS_REVIEWED':
      return stats.cardsReviewed >= criteria.value;
    case 'QUESTIONS_ANSWERED':
      return stats.questionsAnswered >= criteria.value;
    case 'ACCURACY_ABOVE':
      return stats.questionsAnswered >= criteria.minAnswers && stats.accuracy >= criteria.value;
    case 'STUDY_MINUTES':
      return stats.studyMinutes >= criteria.value;
    case 'WEEK_COMPLETED':
      return stats.weeksCompleted >= criteria.value;
    case 'LEVEL':
      return stats.level >= criteria.value;
    case 'PLACEMENT_LEVEL':
      return stats.placementLevel >= criteria.value;
    case 'ALL':
      return criteria.of.every((sub) => evaluate(sub, stats));
    default:
      return false;
  }
}

function isCriteria(value: unknown): value is Criteria {
  return typeof value === 'object' && value !== null && 'type' in value;
}

export type NewAchievement = {
  achievement: Pick<Achievement, 'id' | 'code' | 'xp'>;
};

export function evaluateAll(
  achievements: readonly Pick<Achievement, 'id' | 'code' | 'xp' | 'criteria'>[],
  ownedCodes: ReadonlySet<string>,
  stats: AchievementStats,
): NewAchievement[] {
  const earned: NewAchievement[] = [];
  for (const achievement of achievements) {
    if (ownedCodes.has(achievement.code)) continue;
    if (evaluate(achievement.criteria, stats)) {
      earned.push({ achievement: { id: achievement.id, code: achievement.code, xp: achievement.xp } });
    }
  }
  return earned;
}