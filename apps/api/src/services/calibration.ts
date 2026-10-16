import { prisma } from "../config/prisma.js";

/** A graded answer with its self-rated confidence (1=low, 2=medium, 3=high). */
export interface RatedAnswer {
  confidence: number | null;
  correct: boolean;
}

export interface CalibrationBucket {
  level: number;
  total: number;
  correct: number;
  accuracy: number;
}

export interface CalibrationSummary {
  /** Answers that carried a confidence rating. */
  rated: number;
  /** All recorded answers (rated + unrated). */
  total: number;
  buckets: CalibrationBucket[];
  /** High-confidence mistakes — the dangerous misconceptions. */
  overconfident: number;
  /** Correct answers the student felt unsure about — worth re-drilling. */
  underconfident: number;
  /** Overall accuracy across rated answers (0..1). */
  accuracy: number;
}

/**
 * Summarises metacognitive calibration: how well a student's confidence
 * matches their actual correctness. Overconfidence (sure but wrong) is the
 * signal that matters most — those are the mistakes worth surfacing.
 */
export function summarizeCalibration(answers: RatedAnswer[]): CalibrationSummary {
  const buckets: CalibrationBucket[] = [1, 2, 3].map((level) => ({
    level,
    total: 0,
    correct: 0,
    accuracy: 0,
  }));

  let rated = 0;
  let correctRated = 0;
  let overconfident = 0;
  let underconfident = 0;

  for (const answer of answers) {
    const level = answer.confidence;
    if (level == null || level < 1 || level > 3) continue;
    rated += 1;
    if (answer.correct) correctRated += 1;

    const bucket = buckets[level - 1];
    bucket.total += 1;
    if (answer.correct) bucket.correct += 1;

    if (level === 3 && !answer.correct) overconfident += 1;
    if (level === 1 && answer.correct) underconfident += 1;
  }

  for (const bucket of buckets) {
    bucket.accuracy = bucket.total > 0 ? bucket.correct / bucket.total : 0;
  }

  return {
    rated,
    total: answers.length,
    buckets,
    overconfident,
    underconfident,
    accuracy: rated > 0 ? correctRated / rated : 0,
  };
}

/** Calibration summary built from the student's most recent answers. */
export async function calibrationSummary(
  userId: string,
  window = 300
): Promise<CalibrationSummary> {
  const rows = await prisma.answer.findMany({
    where: { userId },
    orderBy: { answeredAt: "desc" },
    take: window,
    select: { confidence: true, correct: true },
  });
  return summarizeCalibration(rows);
}
