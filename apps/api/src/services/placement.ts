/**
 * Adaptiv daraja aniqlash (Rasch IRT + Fisher axbori).
 *
 * Model: P(correct | ╬╕, b) = 1 / (1 + e^-(╬╕ - b))   (Rasch, a = 1)
 *
 * Nima uchun Rasch (1PL), TAL (2PL) emas:
 *  1. Ta'lim muhitidagi ma'lumot kam (bitta o'quvchi = ~20 javob) тАФ 2PL ning
 *     "qiyinlik qiymati" barcha savollarda keng farq qiladi, noziklik kabi
 *     o'lchovchi a parametriga esa ma'lumot yetmaydi va overfit bo'ladi.
 *  2. Rasch bitta o'zgaruvchan (b = qiyinlik) bilan barqaror natija beradi va
 *     savol bankini qiyinlik bo'yicha to'g'ri tartiblashga imkon yaratadi.
 *  3. Natija тАФ ╬╕ (qobiliyat) va SE (ishonch), ular progress bashoratiga
 *     to'g'ridan-to'g'ri kiradi.
 *
 * Barcha funksiyalar sof (pure) тАФ `tests/unit/placement.test.ts` da tekshiriladi.
 */

export type Difficulty = number; // -3 .. +3

export type Item = {
  id: string;
  /** Rasch qiyinligi */
  difficulty: Difficulty;
  /** Savol qaysi skill'ga tegishli (mavzular bo'yicha theta hisoblash uchun) */
  skillId: string;
};

export type AnswerRecord = {
  itemId: string;
  correct: boolean;
  thetaBefore: number;
  thetaAfter: number;
  seAfter: number;
  skillId: string;
};

export type PlacementState = {
  theta: number;
  se: number;
  answered: Item[];
  history: AnswerRecord[];
  finished: boolean;
};

export type PlacementConfig = {
  minItems: number;
  maxItems: number;
  /** Bu SE chegarasiga yetganda test tugaydi */
  targetSe: number;
  /** Oquvchi javob bermayotgan holat uchun qadamlar soni */
  maxNoResponseSteps: number;
};

export const DEFAULT_CONFIG: PlacementConfig = {
  minItems: 15,
  maxItems: 25,
  targetSe: 0.32,
  maxNoResponseSteps: 4,
};

export const THETA_MIN = -3;
export const THETA_MAX = 3;

export function initialState(): PlacementState {
  return { theta: 0, se: 1, answered: [], history: [], finished: false };
}

/** Rasch ehtimollik modeli. */
export function probabilityCorrect(theta: number, difficulty: Difficulty): number {
  const p = 1 / (1 + Math.exp(-(theta - difficulty)));
  // Chegara тАФ underflow/overflow dan qat'iy himoya
  return Math.min(0.9999, Math.max(0.0001, p));
}

/** Savol axbori: I(╬╕) = P(1-P) */
export function itemInformation(theta: number, difficulty: Difficulty): number {
  const p = probabilityCorrect(theta, difficulty);
  return p * (1 - p);
}

/**
 * Fisher axbori bo'yicha eng foydali savolni tanlaydi.
 * Ishlatilmagan savollar orasidan max `itemInformation` beradigani.
 * Tenglik holatida тАФ qiyinroq savol (chUqurroq bilimni tekshiradi).
 */
export function selectNextItem(
  state: PlacementState,
  pool: readonly Item[],
): Item | null {
  const answeredIds = new Set(state.answered.map((item) => item.id));
  const candidates = pool.filter((item) => !answeredIds.has(item.id));
  if (candidates.length === 0) return null;

  let best: Item | null = null;
  let bestScore = -Infinity;

  for (const item of candidates) {
    const score = itemInformation(state.theta, item.difficulty);
    if (score > bestScore || (score === bestScore && best && item.difficulty > best.difficulty)) {
      best = item;
      bestScore = score;
    }
  }

  return best;
}

/** Eap / SFIisher тАФ bitta javobdan keyingi ╬╕ va SE. */
export function updateAbility(
  theta: number,
  se: number,
  difficulty: Difficulty,
  correct: boolean,
): { theta: number; se: number } {
  const p = probabilityCorrect(theta, difficulty);
  const score = correct ? 1 : 0;

  // Rasch: Fisher scoring funksiyasi = (u - P) / (a * P(1-P))
  const gradient = score - p; // a = 1
  const info = p * (1 - p);

  const newTheta = clamp(theta + gradient, THETA_MIN, THETA_MAX);

  // Fisher axbori yig'iladi тЖТ SE pasayadi
  const newInfo = info + 1 / (se * se);
  const newSe = clamp(1 / Math.sqrt(newInfo), 0.05, 3);

  return { theta: newTheta, se: newSe };
}

/** Bir javobni qayta ishlash тАФ yangi holatni qaytaradi (mutatsiyasiz). */
export function applyAnswer(
  state: PlacementState,
  item: Item,
  correct: boolean,
  config: PlacementConfig = DEFAULT_CONFIG,
): PlacementState {
  const updated = updateAbility(state.theta, state.se, item.difficulty, correct);

  const record: AnswerRecord = {
    itemId: item.id,
    correct,
    thetaBefore: state.theta,
    thetaAfter: updated.theta,
    seAfter: updated.se,
    skillId: item.skillId,
  };

  const answeredCount = state.answered.length + 1;
  const seReached = updated.se <= config.targetSe && answeredCount >= config.minItems;
  const maxReached = answeredCount >= config.maxItems;

  return {
    theta: updated.theta,
    se: updated.se,
    answered: [...state.answered, item],
    history: [...state.history, record],
    finished: seReached || maxReached,
  };
}

/**
 * Mavzular bo'yicha theta тАФ reja generatori shu asosda zaif mavzularni
 * boshidan rejalashtiradi. Rasch'da bitta savol sezilarli darajada
 * noziklik bermaydi, shuning uchun har bir skill uchun alohida yengil
 * eksponensial siljish (shrinkage) bilan hisoblanadi.
 */
export function skillThetas(history: readonly AnswerRecord[]): Record<string, number> {
  const grouped = new Map<string, { correct: number; total: number; difficultySum: number }>();

  for (const item of history) {
    const entry = grouped.get(item.skillId) ?? { correct: 0, total: 0, difficultySum: 0 };
    entry.total += 1;
    if (item.correct) entry.correct += 1;
    grouped.set(item.skillId, entry);
  }

  const result: Record<string, number> = {};
  for (const [skillId, entry] of grouped.entries()) {
    const accuracy = entry.correct / entry.total;
    // [-1, 1] oraliqida o'xshashlik тЖТ logit тЖТ [-3, 3]
    const bounded = Math.min(0.98, Math.max(0.02, accuracy));
    const raw = Math.log(bounded / (1 - bounded));
    // Kam javobda haddan tashqari ishonchni oldini olish uchun siqish
    const shrinkage = entry.total / (entry.total + 3);
    result[skillId] = clamp(raw * shrinkage, THETA_MIN, THETA_MAX);
  }
  return result;
}

/**
 * ╬╕ тЖТ daraja 0..5.
 * Chegaralar seed bankdagi kalibratsiyadan olingan
 * (docs/placement-calibration.md). `uz` va `en` nomlari `LEVEL_NAMES` da.
 */
export const LEVEL_THRESHOLDS = [-1.2, -0.35, 0.35, 1.0, 1.7] as const;

export function thetaToLevel(theta: number): number {
  let level = 0;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (theta >= threshold) level += 1;
  }
  return Math.min(5, level);
}

/** Masshtablangan ball (400тАУ1600) тАФ progress grafiklarida uchun. */
export function thetaToScaled(theta: number): number {
  return Math.round(400 + ((theta - THETA_MIN) / (THETA_MAX - THETA_MIN)) * 1200);
}

export function levelToTheta(level: number): number {
  const clamped = Math.min(5, Math.max(0, level));
  const lower = clamped === 0 ? THETA_MIN : (LEVEL_THRESHOLDS[clamped - 1] as number);
  const upper = clamped === 5 ? 1.7 : (LEVEL_THRESHOLDS[clamped] as number);
  return (lower + upper) / 2;
}

/** Daraja bo'yicha reja rejimi. */
export type PlanMode = 'STARTER' | 'STANDARD' | 'INTENSIVE';

export function planModeForLevel(level: number): PlanMode {
  if (level <= 0) return 'STARTER';
  if (level <= 3) return 'STANDARD';
  return 'INTENSIVE';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
