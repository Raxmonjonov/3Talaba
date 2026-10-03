import type { ExamType } from '@prisma/client';

/**
 * Taxminiy ball bashorati (SAT / IELTS).
 *
 * **Yondashuv.** Rasmiy hisoblash (SAT: raw → scaled, IELTS: band) o'quvchining
 * faqat bitta testdan keyin emas, ko'p o'lchovlarini talab qiladi. Bizda skill
 * darajalari (θ, -3..+3) va mock imtihon natijalari bor. Shuning uchun:
 *
 *  1. Har bir **skill** uchun taxminiy ball (0..1) θ dan monoton o'zgaradi:
 *     `p = 1 / (1 + e^(-1.6·θ))`. Bu "skill ishlayaptimi" ehtimoli.
 *  2. **Skill muhimligi** — imtihon tarkibidagi ulush (SAT: Math 35%, R&W 27%,
 *     so'z lug'at egasi 38% kabi; IELTS: Listening/Speaking band 0–9).
 *  3. Natija = Σ(weight · p) · exam shkalasi + boshlang'ich offset.
 *  4. **Ishonch intervali** — skill θ larining dispersiyasidan (SE) kelib chiqadi:
 *     kam ma'lumot = keng interval. Bu "ishonchsiz bashoratni aniqlash" uchun.
 *
 * Bu **taxmin**, rasmiy natija emas — interfeysda ham shunday aytiladi.
 */

export type SkillInput = {
  theta: number;
  /** Imtihondagi maksimal ball (masalan SAT Math = 800) */
  weight: number;
};

export type ProjectionResult = {
  projectedScore: number;
  lower: number;
  upper: number;
  confidence: number;
  breakdown: { skillId: string; score: number; max: number; theta: number }[];
};

const THETA_SLOPE = 1.6;

/** θ → [0, 1] "skill ishlayaptimi" ehtimoli. */
export function skillProbability(theta: number): number {
  const bounded = Math.min(3, Math.max(-3, theta));
  return 1 / (1 + Math.exp(-THETA_SLOPE * bounded));
}

/** SAT imtihon tarkibidagi ball ulushlari. */
export const SAT_WEIGHTS: Record<string, number> = {
  'sat-math': 800,
  'sat-rw': 800,
  'sat-vocab': 400,
};

export const IELTS_WEIGHTS: Record<string, number> = {
  'ielts-listening': 9,
  'ielts-reading': 9,
  'ielts-writing': 9,
  'ielts-speaking': 9,
};

export function computeProjection(
  exam: ExamType,
  skills: readonly SkillInput[],
): ProjectionResult {
  if (skills.length === 0) {
    return {
      projectedScore: exam === 'IELTS' ? 4 : 600,
      lower: exam === 'IELTS' ? 3 : 480,
      upper: exam === 'IELTS' ? 5.5 : 720,
      confidence: 0,
      breakdown: [],
    };
  }

  const totalMax = skills.reduce((sum, skill) => sum + skill.weight, 0);
  const totalScore = skills.reduce(
    (sum, skill) => sum + skill.weight * skillProbability(skill.theta),
    0,
  );

  const ratio = totalMax === 0 ? 0 : totalScore / totalMax;

  // O'quv natijasi hech qachon mukammal emas — "to'liq" foizdan past bo'ladi.
  const practicalCap = exam === 'IELTS' ? 0.86 : 0.9;
  const normalized = Math.min(1, ratio * (1 / practicalCap) * practicalCap + ratio * 0.06);

  let projectedScore: number;
  if (exam === 'IELTS') {
    projectedScore = roundTo(normalized * 9, 0.5);
  } else if (exam === 'SAT') {
    projectedScore = roundTo(400 + normalized * 1200, 10);
  } else {
    projectedScore = roundTo(normalized * 100, 5);
  }

  // Ishonch: skill soni va θ dispersiyasiga bog'liq
  const dispersion = standardDeviation(skills.map((s) => s.theta));
  const sampleFactor = Math.min(1, skills.length / 8);
  const confidence = clamp(
    Math.round((sampleFactor * (1 - dispersion / 6) * 1000) / 10) / 10,
    0,
    100,
  );

  const spread = exam === 'IELTS' ? 1.5 : exam === 'SAT' ? 120 : 20;
  const uncertainty = spread * (1 - confidence / 100);

  const breakdown = skills.map((skill) => ({
    skillId: '',
    score: roundTo(skill.weight * skillProbability(skill.theta), exam === 'IELTS' ? 0.5 : 10),
    max: skill.weight,
    theta: Math.round(skill.theta * 100) / 100,
  }));

  return {
    projectedScore,
    lower: roundTo(projectedScore - uncertainty, exam === 'IELTS' ? 0.5 : 10),
    upper: roundTo(projectedScore + uncertainty, exam === 'IELTS' ? 0.5 : 10),
    confidence,
    breakdown,
  };
}

function standardDeviation(values: readonly number[]): number {
  if (values.length < 2) return 3;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/** θ → inson o'quvchi uchun tushunarli daraja. */
export function thetaToLabel(theta: number): 'notStarted' | 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (theta <= -1.5) return 'notStarted';
  if (theta <= -0.3) return 'beginner';
  if (theta <= 0.7) return 'intermediate';
  if (theta <= 1.6) return 'advanced';
  return 'expert';
}

/** So'nggi N kunlik o'quish statistikasi (haftalik hisobot uchun). */
export type DailyStat = {
  date: string;
  minutes: number;
  questions: number;
  correct: number;
  xp: number;
  lessonsCompleted: number;
};

export type PeriodSummary = {
  from: string;
  to: string;
  totalMinutes: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  totalXp: number;
  lessonsCompleted: number;
  activeDays: number;
  daily: DailyStat[];
  /** Oldingi davrga nisbatan o'zgarish (%) */
  minutesChange: number;
};

export function summarizePeriod(
  from: string,
  to: string,
  daily: readonly DailyStat[],
  previousMinutes: number,
): PeriodSummary {
  const totalMinutes = daily.reduce((sum, d) => sum + d.minutes, 0);
  const totalQuestions = daily.reduce((sum, d) => sum + d.questions, 0);
  const totalCorrect = daily.reduce((sum, d) => sum + d.correct, 0);
  const totalXp = daily.reduce((sum, d) => sum + d.xp, 0);
  const lessonsCompleted = daily.reduce((sum, d) => sum + d.lessonsCompleted, 0);

  const change =
    previousMinutes > 0
      ? Math.round(((totalMinutes - previousMinutes) / previousMinutes) * 100)
      : totalMinutes > 0
        ? 100
        : 0;

  return {
    from,
    to,
    totalMinutes,
    totalQuestions,
    totalCorrect,
    accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : 0,
    totalXp,
    lessonsCompleted,
    activeDays: daily.filter((d) => d.minutes > 0).length,
    daily: [...daily].sort((a, b) => a.date.localeCompare(b.date)),
    minutesChange: change,
  };
}