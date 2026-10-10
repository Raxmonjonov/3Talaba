import { prisma } from "../config/prisma.js";
import {
  createCard,
  reviewCard,
  dueCards,
  projectedLoad,
  humanInterval,
  type FsrsCard,
  type Grade,
} from "./srs/fsrs.js";

/** Map a DB row into the pure FSRS shape. */
function toFsrs(row: {
  stability: number;
  difficulty: number;
  due: Date;
  state: number;
  reps: number;
  lapses: number;
  lastReviewAt: Date | null;
}): FsrsCard {
  return {
    stability: row.stability,
    difficulty: row.difficulty,
    dueAt: row.due,
    lastReviewAt: row.lastReviewAt,
    state: row.state as FsrsCard["state"],
    reps: row.reps,
    lapses: row.lapses,
  };
}

/** Convert answer correctness + speed into an FSRS grade (0..5). */
export function gradeFromResult(correct: boolean, ms: number | null | undefined): Grade {
  if (!correct) return ms != null && ms > 90_000 ? 0 : 1;

  // Fast, confident, correct answers are "easy"; slow correct ones "hard".
  if (ms == null) return 3;
  if (ms < 20_000) return 5;
  if (ms < 45_000) return 4;
  if (ms > 120_000) return 2;
  return 3;
}

/**
 * Records an answer and reschedules its review card.
 * Wrong answers come back in minutes; correct ones in days.
 */
export async function recordAnswer(params: {
  userId: string;
  questionId: string;
  given: string;
  correct: boolean;
  ms?: number | null;
}): Promise<{ grade: Grade; dueAt: Date; interval: string }> {
  const now = new Date();
  const grade = gradeFromResult(params.correct, params.ms);

  await prisma.answer.create({
    data: {
      userId: params.userId,
      questionId: params.questionId,
      given: params.given,
      correct: params.correct,
      ms: params.ms ?? null,
    },
  });

  const existing = await prisma.reviewCard.findUnique({
    where: { userId_questionId: { userId: params.userId, questionId: params.questionId } },
  });

  const before = existing ? toFsrs(existing) : createCard(now);
  const after = reviewCard(before, grade, now);

  await prisma.reviewCard.upsert({
    where: { userId_questionId: { userId: params.userId, questionId: params.questionId } },
    create: {
      userId: params.userId,
      questionId: params.questionId,
      stability: after.stability,
      difficulty: after.difficulty,
      due: after.dueAt,
      state: after.state,
      reps: after.reps,
      lapses: after.lapses,
      lastGrade: grade,
      lastReviewAt: after.lastReviewAt,
    },
    update: {
      stability: after.stability,
      difficulty: after.difficulty,
      due: after.dueAt,
      state: after.state,
      reps: after.reps,
      lapses: after.lapses,
      lastGrade: grade,
      lastReviewAt: after.lastReviewAt,
    },
  });

  return { grade, dueAt: after.dueAt, interval: humanInterval(after, "uz") };
}

/** Questions due for review, soonest first. */
export async function listDueReviews(userId: string, limit = 20) {
  const cards = await prisma.reviewCard.findMany({
    where: { userId, due: { lte: new Date() } },
    orderBy: { due: "asc" },
    take: limit,
    select: { questionId: true, due: true, stability: true, difficulty: true, reps: true, lapses: true },
  });

  return cards.map((c) => ({
    questionId: c.questionId,
    due: c.due,
    stability: Math.round(c.stability * 100) / 100,
    difficulty: Math.round(c.difficulty * 100) / 100,
    reps: c.reps,
    lapses: c.lapses,
  }));
}

/** Oldest due card id that has not already been answered this drill. */
export async function nextDueReviewId(
  userId: string,
  exclude: string[] = []
): Promise<string | null> {
  const cards = await prisma.reviewCard.findMany({
    where: {
      userId,
      due: { lte: new Date() },
      ...(exclude.length ? { questionId: { notIn: exclude } } : {}),
    },
    orderBy: { due: "asc" },
    take: 1,
    select: { questionId: true },
  });
  return cards[0]?.questionId ?? null;
}

export interface ReviewSummary {
  dueNow: number;
  totalCards: number;
  weakSkills: { skill: string; accuracy: number; attempts: number }[];
  next7Days: number[];
}

/** Dashboard payload: what to review now and where the gaps are. */
export async function reviewSummary(userId: string): Promise<ReviewSummary> {
  const cards = await prisma.reviewCard.findMany({
    where: { userId },
    select: { due: true, stability: true, difficulty: true, state: true },
  });

  const fsrsCards: FsrsCard[] = cards.map((c) => ({
    stability: c.stability,
    difficulty: c.difficulty,
    dueAt: c.due,
    lastReviewAt: null,
    state: c.state as FsrsCard["state"],
    reps: 0,
    lapses: 0,
  }));

  const dueNow = dueCards(fsrsCards).length;

  // Prisma cannot SUM a boolean, so tally per skill in JS.
  const answers = await prisma.answer.findMany({
    where: { userId },
    select: { correct: true, questionId: true },
  });

  const answeredQuestions = await prisma.question.findMany({
    where: { id: { in: answers.map((a) => a.questionId) } },
    select: { id: true, skillSlug: true },
  });
  const skillOf = new Map(answeredQuestions.map((q) => [q.id, q.skillSlug]));

  const perSkill = new Map<string, { correct: number; attempts: number }>();
  for (const a of answers) {
    const skill = skillOf.get(a.questionId);
    if (!skill) continue;
    const entry = perSkill.get(skill) ?? { correct: 0, attempts: 0 };
    entry.attempts += 1;
    if (a.correct) entry.correct += 1;
    perSkill.set(skill, entry);
  }

  const weakSkills = [...perSkill.entries()]
    .map(([skill, v]) => ({
      skill,
      accuracy: v.attempts ? v.correct / v.attempts : 0,
      attempts: v.attempts,
    }))
    .filter((s) => s.attempts >= 2)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  return {
    dueNow,
    totalCards: cards.length,
    weakSkills,
    next7Days: projectedLoad(fsrsCards, 7),
  };
}