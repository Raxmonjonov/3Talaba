import type { XpReason } from '@prisma/client';

/**
 * XP, level va streak mantiqi.
 *
 * **Qaror: level formulasi `100 · n^1.35`.**
 * Oddiy chiziqli formula (100 XP/level) dastlab juda tez, keyin juda sekin
 * bo'ladi. Eksponent 1.35 boshlang'ich tez o'sishni va keyingi bosqichlarda
 * sekin o'sishni beradi — dasturlashda bu "danıştı" hissi uchun muhim.
 */

/** Boshlang'ich (daraja 1 dan) XP. */
export const XP_BASE = 100;
export const LEVEL_EXPONENT = 1.35;

/** XP manbalari — bitta o'chish o'rniga. Talablar §8. */
export const XP_VALUES: Record<XpReason, number> = {
  ONBOARDING: 30,
  LESSON_BLOCK: 10,
  QUIZ: 15,
  SESSION_COMPLETE: 25,
  MOCK_EXAM: 50,
  SRS_REVIEW: 5,
  ACHIEVEMENT: 0, // nishon XP'si `Achievement.xp` dan olinadi
  STREAK_BONUS: 5,
  ERROR_FIXED: 10,
};

/** Level uchun kerakli jami XP (kumulative). */
export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level));
  return Math.round(XP_BASE * Math.pow(n, LEVEL_EXPONENT));
}

/** Jami XP → level. */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp && level < 100) level += 1;
  return level;
}

export type LevelProgress = {
  level: number;
  currentXp: number;
  intoLevel: number;
  neededForNext: number;
  percent: number;
};

export function levelProgress(totalXp: number): LevelProgress {
  const safeXp = Math.max(0, Math.round(totalXp));
  const level = levelFromXp(safeXp);
  const floor = level === 1 ? 0 : xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const intoLevel = safeXp - floor;
  const neededForNext = Math.max(1, ceil - floor);
  return {
    level,
    currentXp: safeXp,
    intoLevel,
    neededForNext,
    percent: Math.min(100, Math.round((intoLevel / neededForNext) * 1000) / 10),
  };
}

/** Kunlik streak uchun minimal oqish (daqiqa) — "bugun oz o'qigan" deb hisoblanmasligi uchun. */
export const STREAK_MIN_MINUTES = 10;

/**
 * Streak yangilanishi.
 *
 * **Muhim qaror:** streak buzilsa jazolamaydi. Avvalgi "muzlatish"
 * (freeze) imkoniyati ishlatiladi (foydalanuvchi hali kelmagan deb
 * o'ylab qoladi), keyin esa streak faqat reset bo'ladi — hech qanday
 * XP yo'qotilmaydi, xato yoki aybdorlik ko'rsatilmaydi.
 */
export type StreakState = {
  current: number;
  longest: number;
  lastStudyDate: string | null; // YYYY-MM-DD
  freezes: number;
  freezeUsedDates: string[];
  totalDays: number;
};

export type StreakOutcome = {
  next: StreakState;
  /** Foydalanuvchiga ko'rsatiladigan xabar (ixtiyoriy) */
  message: 'CONTINUED' | 'SAME_DAY' | 'FROZEN' | 'RESTARTED' | 'RESET';
  bonusXp: number;
};

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const diff = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(diff / 86_400_000);
}

/** Kelgusi kun uchun streak bonusi (5, 10, 15 ... — 30 kunda to'xtaydi). */
export function streakBonus(streak: number): number {
  if (streak < 3) return 0;
  return Math.min(15, Math.floor(streak / 3) * 5);
}

export function updateStreak(
  state: StreakState,
  studyDate: Date,
  options: { today?: Date } = {},
): StreakOutcome {
  const today = options.today ?? studyDate;
  const key = dayKey(studyDate);
  const last = state.lastStudyDate;

  // Kelajakdagi sana (soat xatosi yoki import) — e'tiborsiz qoldiriladi.
  if (dayKey(today) < key) {
    return { next: state, message: 'RESET', bonusXp: 0 };
  }

  // Bir kunda bir necha marta o'qilishi mumkin — hech narsa o'zgarmaydi.
  if (last === key) {
    return { next: state, message: 'SAME_DAY', bonusXp: 0 };
  }

  if (last && daysBetween(key, last) < 0) {
    return { next: state, message: 'RESET', bonusXp: 0 };
  }

  const gap = last ? daysBetween(key, last) : Infinity;
  const next: StreakState = { ...state, freezeUsedDates: [...state.freezeUsedDates] };

  if (gap === 1) {
    next.current = state.current + 1;
    next.longest = Math.max(state.longest, next.current);
    next.totalDays = state.totalDays + 1;
    next.lastStudyDate = key;
    return { next, message: 'CONTINUED', bonusXp: streakBonus(next.current) };
  }

  // 2+kun o'tkazib yuborilgan: muzdatiq bormi?
  if (gap > 1 && last !== null && state.freezes >= gap - 1) {
    next.freezes = state.freezes - (gap - 1);
    next.freezeUsedDates.push(...missingDates(last, key));
    next.current = state.current + (gap - 1) + 1;
    next.longest = Math.max(state.longest, next.current);
    next.totalDays = state.totalDays + 1;
    next.lastStudyDate = key;
    return { next, message: 'FROZEN', bonusXp: streakBonus(next.current) };
  }

  // Muzdatiq yo'q — jazosiz restart.
  next.current = 1;
  next.longest = Math.max(state.longest, 1);
  next.totalDays = state.totalDays + 1;
  next.lastStudyDate = key;
  return { next, message: 'RESTARTED', bonusXp: 0 };
}

function missingDates(last: string, current: string): string[] {
  const result: string[] = [];
  const start = Date.parse(`${last}T00:00:00Z`);
  const end = Date.parse(`${current}T00:00:00Z`);
  for (let t = start + 86_400_000; t < end; t += 86_400_000) {
    result.push(new Date(t).toISOString().slice(0, 10));
  }
  return result;
}

export function emptyStreak(): StreakState {
  return { current: 0, longest: 0, lastStudyDate: null, freezes: 2, freezeUsedDates: [], totalDays: 0 };
}