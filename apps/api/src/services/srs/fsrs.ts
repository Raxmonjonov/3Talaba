/**
 * FSRS (Free Spaced Repetition Scheduler) тАФ v4.5 algoritmi.
 *
 * Nima uchun SM-2 emas:
 *  1. SM-2 `easeFactor` ni har bir muvaffaqiyatsizlikda qo'lda pasaytiradi va
 *     kelgusi intervalni oldindan bashorat qilolmaydi тАФ bitta "qiyin" javob
 *     keyingi 10 kunlik intervalni bir zumda buzadi.
 *  2. FSRS kvart qiymatli "qiyinlik" (D) va "mustaqamlik" (S) orqali
 *     individual kartaning xotira egri chizig'ini modellashtiradi:
 *     R(t, S) = (1 + FACTOR┬╖t/D)^DECAY, DECAY = -0.5
 *  3. To'g'ri eslab qolish ehtimolini (R) hisoblab, "kechiktirilgan" (lapse)
 *     javobni oddiy noto'g'ri javobdan farqlaydi тАФ bu bizning dars oqimidagi
 *     "xatolar daftarini qayta berish" logikasiga to'g'ri mos keladi.
 *
 * Barcha funksiyalar sof тАФ `tests/unit/fsrs.test.ts` da tekshiriladi.
 */

export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export const GRADE_LABELS: Record<Grade, 'again' | 'hard' | 'good' | 'easy'> = {
  0: 'again',
  1: 'again',
  2: 'hard',
  3: 'good',
  4: 'good',
  5: 'easy',
};

export type CardState = 0 | 1 | 2 | 3; // 0=NEW 1=LEARNING 2=REVIEW 3=RELEARNING

export type FsrsCard = {
  stability: number;
  difficulty: number;
  dueAt: Date;
  lastReviewAt: Date | null;
  state: CardState;
  reps: number;
  lapses: number;
};

export type Params = {
  /** xotira barqarorligi (kun) */
  initialStability: number;
  initialDifficulty: number;
  /** S va D ni o'zgartirish koeffitsiyentlari */
  w: number[];
};

export const DEFAULT_PARAMS: Params = {
  initialStability: 0.4,
  initialDifficulty: 5,
  w: [
    0.40255, 1.18385, 3.173, 15.69105, // initial
    7.1949, 0.5345, 1.4604, 0.0046, 1.54575, // stability
    0.6652, 1.953, -2.1362, -0.1233, 0.1747, // difficulty
  ],
};

const DECAY = -0.5;
const FACTOR = 19 / 81;
const MIN_STABILITY = 0.01;
const MAX_STABILITY = 36500;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;
const LEARNING_STEPS_MIN = 1; // daqiqa

export function createCard(now: Date = new Date()): FsrsCard {
  return {
    stability: 0,
    difficulty: 0,
    dueAt: now,
    lastReviewAt: null,
    state: 0,
    reps: 0,
    lapses: 0,
  };
}

/** Kelgusi qo'shimcha kechikishni bashorat qiladi (arqali modelni zaytiradi). */
export function forgettingCurve(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  const days = Math.max(0, elapsedDays);
  return Math.pow(1 + (FACTOR * days) / Math.max(stability, MIN_STABILITY), DECAY);
}

/** Xotira barqarorligini va qiyinlikni yangilaydi. */
function nextStability(
  difficulty: number,
  stability: number,
  retrievability: number,
  grade: Grade,
  params: Params,
): number {
  const w = params.w;
  const hardPenalty = grade === 2 ? w[6] : 1;
  const easyBonus = grade === 5 ? w[7] : 1;

  const growth =
    Math.exp(w[4]) *
    (11 - difficulty) *
    stability ** -w[5] *
    (Math.exp(w[8] * (1 - retrievability)) - 1) *
    hardPenalty *
    easyBonus;

  // Birinchi takrorlash (stability = 0) uchun alohida formula
  if (stability === 0) {
    return clamp(
      Math.exp(w[0]) * (11 - difficulty) * stabilityInitScale(grade, w),
      MIN_STABILITY,
      MAX_STABILITY,
    );
  }

  return clamp(stability * growth, MIN_STABILITY, MAX_STABILITY);
}

function stabilityInitScale(grade: Grade, w: number[]): number {
  switch (grade) {
    case 0:
    case 1:
      return w[1];
    case 2:
      return w[2];
    case 3:
      return w[3];
    case 4:
      return w[3];
    case 5:
      return w[4];
    default:
      return w[3];
  }
}

function nextDifficulty(difficulty: number, grade: Grade, params: Params): number {
  const w = params.w;
  const delta =
    -w[6] * (grade - 3) + (w[7] * (grade === 3 ? 1 : 0)) + w[8] * Math.sin(w[9] * (difficulty + 1));

  const next = difficulty + delta * (10 - difficulty) / 9;
  return clamp(next, MIN_DIFFICULTY, MAX_DIFFICULTY);
}

/**
 * Kartani baholaydi va yangi holatini qaytaradi.
 * `elapsedDays` тАФ oxirgi takrorlashdan o'tgan kun (NEW kartalar uchun 0).
 */
export function reviewCard(
  card: FsrsCard,
  grade: Grade,
  now: Date = new Date(),
  params: Params = DEFAULT_PARAMS,
): FsrsCard {
  const elapsedDays = card.lastReviewAt
    ? Math.max(0, (now.getTime() - card.lastReviewAt.getTime()) / 86_400_000)
    : 0;

  const isNew = card.state === 0 || card.stability === 0;
  const retrievability = isNew ? 0 : forgettingCurve(elapsedDays, card.stability);

  let stability = card.stability;
  let difficulty = card.difficulty === 0 ? params.initialDifficulty : card.difficulty;
  let state: CardState = card.state;
  let lapses = card.lapses;
  const reps = card.reps + 1;

  // --- Lapse (eskirdi, lekin qayta eslab oldi) ---
  if (!isNew && grade <= 1 && card.state === 2) {
    lapses += 1;
    state = 3;
    stability = clamp(
      Math.max(MIN_STABILITY, nextStability(card.stability * 0.4, difficulty, retrievability, 3, params)),
      MIN_STABILITY,
      MAX_STABILITY,
    );
    difficulty = clamp(nextDifficulty(difficulty, 1, params), MIN_DIFFICULTY, MAX_DIFFICULTY);
    return {
      stability,
      difficulty,
      dueAt: addMinutes(now, LEARNING_STEPS_MIN),
      lastReviewAt: now,
      state,
      reps,
      lapses,
    };
  }

  // --- NEW / LEARNING ---
  if (isNew || card.state === 1 || card.state === 3) {
    const initialStability = grade <= 1 ? 0.4 : grade === 2 ? 1.2 : grade <= 4 ? 3.4 : 7.5;

    stability = clamp(
      grade <= 1
        ? Math.min(initialStability, card.stability || initialStability)
        : initialStability,
      MIN_STABILITY,
      MAX_STABILITY,
    );
    difficulty = clamp(nextDifficulty(difficulty, grade, params), MIN_DIFFICULTY, MAX_DIFFICULTY);

    if (grade <= 1) {
      state = card.state === 0 ? 1 : 3;
      return {
        stability,
        difficulty,
        dueAt: addMinutes(now, grade === 0 ? 1 : 6),
        lastReviewAt: now,
        state,
        reps,
        lapses,
      };
    }

    if (grade === 2) {
      return {
        stability,
        difficulty,
        dueAt: addMinutes(now, 15),
        lastReviewAt: now,
        state: card.state === 0 ? 1 : card.state,
        reps,
        lapses,
      };
    }

    // grade >= 3 тЖТ REVIEW ga o'tadi
    state = 2;
    stability = clamp(stability * (grade === 5 ? 1.6 : 1), MIN_STABILITY, MAX_STABILITY);
    return {
      stability,
      difficulty,
      dueAt: addDays(now, stability),
      lastReviewAt: now,
      state,
      reps,
      lapses,
    };
  }

  // --- REVIEW ---
  stability = nextStability(difficulty, card.stability, retrievability, grade, params);
  difficulty = clamp(nextDifficulty(difficulty, grade, params), MIN_DIFFICULTY, MAX_DIFFICULTY);
  state = 2;

  const intervalDays =
    grade <= 1
      ? Math.max(1, stability * 0.3)
      : grade === 2
        ? Math.max(1, stability * 0.6)
        : grade === 3
          ? Math.max(1, stability)
          : Math.max(2, stability * 1.35);

  return {
    stability,
    difficulty,
    dueAt: addDays(now, intervalDays),
    lastReviewAt: now,
    state,
    reps,
    lapses,
  };
}

/** Bugungi navbat: vaqti kelgan kartalar. */
export function dueCards<T extends { dueAt: Date; state: CardState }>(cards: readonly T[], now = new Date()): T[] {
  return cards.filter((card) => card.dueAt.getTime() <= now.getTime());
}

/** Navbatdagi karta sonini bashorat qiladi (reja generatori uchun). */
export function projectedLoad(cards: readonly FsrsCard[], days = 7): number[] {
  const result = Array.from({ length: days }, () => 0);
  const now = Date.now();
  for (const card of cards) {
    const diff = Math.floor((card.dueAt.getTime() - now) / 86_400_000);
    if (diff < 0) result[0] = (result[0] ?? 0) + 1;
    else if (diff < days) result[diff] = (result[diff] ?? 0) + 1;
  }
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

/** Foydalanuvchiga ko'rsatish uchun: qanchadan keyin takrorlash. */
export function humanInterval(card: FsrsCard, locale: 'uz' | 'en'): string {
  const ms = Math.max(0, card.dueAt.getTime() - Date.now());
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return locale === 'uz' ? `${minutes} daqiqa` : `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return locale === 'uz' ? `${hours} soat` : `${hours}h`;
  const days = Math.round(hours / 24);
  return locale === 'uz' ? `${days} kun` : `${days}d`;
}
