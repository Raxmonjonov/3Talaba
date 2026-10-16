import { prisma } from "../config/prisma.js";

/** Hard cap on a single reflection so a runaway paste cannot bloat the row. */
export const MAX_REFLECTION_CHARS = 2000;

/**
 * Trims surrounding whitespace and clamps the length. An empty result means
 * "no reflection" (the note is cleared).
 */
export function normalizeReflectionBody(body: string): string {
  return body.trim().slice(0, MAX_REFLECTION_CHARS);
}

export interface Reflection {
  questionId: string;
  body: string;
  updatedAt: Date;
}

async function questionExists(questionId: string): Promise<boolean> {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  return Boolean(question);
}

/** The student's self-explanation for one question, or null when none exists. */
export async function getReflection(
  userId: string,
  questionId: string
): Promise<Reflection | null> {
  const note = await prisma.questionNote.findUnique({
    where: { userId_questionId: { userId, questionId } },
    select: { body: true, updatedAt: true },
  });
  return note ? { questionId, ...note } : null;
}

/**
 * Upserts the self-explanation. An empty body clears it so students can delete
 * a draft. `null` means the question is unknown.
 */
export async function saveReflection(
  userId: string,
  questionId: string,
  body: string
): Promise<Reflection | null> {
  if (!(await questionExists(questionId))) return null;

  const clean = normalizeReflectionBody(body);
  if (!clean) {
    await prisma.questionNote.deleteMany({ where: { userId, questionId } });
    return { questionId, body: "", updatedAt: new Date() };
  }

  const note = await prisma.questionNote.upsert({
    where: { userId_questionId: { userId, questionId } },
    create: { userId, questionId, body: clean },
    update: { body: clean },
    select: { body: true, updatedAt: true },
  });
  return { questionId, ...note };
}

/** Self-explanations for a set of questions, keyed by question id. */
export async function reflectionsFor(
  userId: string,
  questionIds: string[]
): Promise<Map<string, string>> {
  if (questionIds.length === 0) return new Map();
  const rows = await prisma.questionNote.findMany({
    where: { userId, questionId: { in: questionIds } },
    select: { questionId: true, body: true },
  });
  return new Map(rows.map((row) => [row.questionId, row.body]));
}
