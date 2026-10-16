import { prisma } from "../config/prisma.js";
import { correctAnswerLabel, givenAnswerLabel, serveQuestion } from "./questions.js";
import { reflectionsFor } from "./reflections.js";

/** Minimal answer shape the mistake selection needs. */
export interface AnswerLite {
  questionId: string;
  given: string;
  correct: boolean;
  answeredAt: Date;
}

/**
 * Collapses an answer history (newest first) into one entry per question,
 * keeping only the questions whose most recent attempt was wrong.
 *
 * A question answered correctly since the mistake is considered resolved and
 * drops out, so the journal always reflects what is still shaky.
 */
export function latestMistakes(answers: AnswerLite[], limit: number): AnswerLite[] {
  const seen = new Set<string>();
  const out: AnswerLite[] = [];
  for (const answer of answers) {
    if (seen.has(answer.questionId)) continue;
    seen.add(answer.questionId);
    if (!answer.correct) out.push(answer);
    if (out.length >= limit) break;
  }
  return out;
}

export interface MistakeEntry {
  id: string;
  skill: string;
  skillName: string;
  type: string;
  prompt: string;
  passage?: string;
  options: { label: string }[];
  difficulty: number;
  given: string;
  correctAnswer: string;
  answeredAt: Date;
  /** The student's own error analysis ("Xato tahlili"), when written. */
  reflection?: string;
}

/** Recent unresolved mistakes, newest first, with their question content. */
export async function listMistakes(
  userId: string,
  locale: "uz" | "en",
  limit = 20
): Promise<MistakeEntry[]> {
  const history = await prisma.answer.findMany({
    where: { userId },
    orderBy: { answeredAt: "desc" },
    take: 500,
    select: { questionId: true, given: true, correct: true, answeredAt: true },
  });

  const chosen = latestMistakes(history, limit);
  if (chosen.length === 0) return [];

  const rows = await prisma.question.findMany({
    where: { id: { in: chosen.map((c) => c.questionId) } },
    select: {
      id: true,
      skillSlug: true,
      type: true,
      promptUz: true,
      promptEn: true,
      passageUz: true,
      passageEn: true,
      options: true,
      difficulty: true,
      seconds: true,
    },
  });
  const rowOf = new Map(rows.map((r) => [r.id, r]));

  const skillSlugs = [...new Set(rows.map((r) => r.skillSlug))];
  const skills = skillSlugs.length
    ? await prisma.skill.findMany({
        where: { slug: { in: skillSlugs } },
        select: { slug: true, nameUz: true, nameEn: true },
      })
    : [];
  const nameOf = new Map(
    skills.map((s) => [s.slug, locale === "en" ? s.nameEn || s.nameUz : s.nameUz || s.nameEn])
  );

  const reflections = await reflectionsFor(userId, chosen.map((c) => c.questionId));

  const out: MistakeEntry[] = [];
  for (const entry of chosen) {
    const row = rowOf.get(entry.questionId);
    if (!row) continue;
    const served = serveQuestion(row, locale);
    out.push({
      id: served.id,
      skill: served.skill,
      skillName: nameOf.get(served.skill) ?? served.skill,
      type: served.type,
      prompt: served.prompt,
      passage: served.passage,
      options: served.options,
      difficulty: served.difficulty,
      given: givenAnswerLabel(row, entry.given, locale),
      correctAnswer: correctAnswerLabel(row, locale),
      answeredAt: entry.answeredAt,
      reflection: reflections.get(served.id),
    });
  }
  return out;
}
