import { prisma } from "../config/prisma.js";

/** Hard caps so a runaway paste cannot bloat a row. */
export const MAX_PROMPT_CHARS = 500;
export const MAX_ANSWER_CHARS = 2000;

export interface NormalizedSelfQuestion {
  prompt: string;
  answer: string;
}

/**
 * Trims and clamps a student-written question. Both fields are required, so an
 * empty prompt or answer yields null (the caller rejects it).
 */
export function normalizeSelfQuestion(
  prompt: string,
  answer: string
): NormalizedSelfQuestion | null {
  const cleanPrompt = prompt.trim().slice(0, MAX_PROMPT_CHARS);
  const cleanAnswer = answer.trim().slice(0, MAX_ANSWER_CHARS);
  if (!cleanPrompt || !cleanAnswer) return null;
  return { prompt: cleanPrompt, answer: cleanAnswer };
}

export interface SelfQuestionItem {
  id: string;
  prompt: string;
  answer: string;
  lessonSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function lessonIdBySlug(slug: string): Promise<string | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    select: { id: true },
  });
  return lesson?.id ?? null;
}

/** Every self-written question, newest first. */
export async function listSelfQuestions(
  userId: string
): Promise<SelfQuestionItem[]> {
  const rows = await prisma.selfQuestion.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      prompt: true,
      answer: true,
      createdAt: true,
      updatedAt: true,
      lesson: { select: { slug: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    prompt: row.prompt,
    answer: row.answer,
    lessonSlug: row.lesson?.slug ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Stores a new self-written question. `null` means the input was empty or the
 * optional lesson slug did not resolve.
 */
export async function createSelfQuestion(
  userId: string,
  input: { prompt: string; answer: string; lessonSlug?: string | null }
): Promise<SelfQuestionItem | null> {
  const clean = normalizeSelfQuestion(input.prompt, input.answer);
  if (!clean) return null;

  let lessonId: string | null = null;
  if (input.lessonSlug) {
    lessonId = await lessonIdBySlug(input.lessonSlug);
    if (!lessonId) return null;
  }

  const row = await prisma.selfQuestion.create({
    data: {
      userId,
      lessonId,
      prompt: clean.prompt,
      answer: clean.answer,
    },
    select: {
      id: true,
      prompt: true,
      answer: true,
      createdAt: true,
      updatedAt: true,
      lesson: { select: { slug: true } },
    },
  });

  return {
    id: row.id,
    prompt: row.prompt,
    answer: row.answer,
    lessonSlug: row.lesson?.slug ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Deletes one of the student's own questions. False when it is not theirs. */
export async function deleteSelfQuestion(
  userId: string,
  id: string
): Promise<boolean> {
  const result = await prisma.selfQuestion.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
