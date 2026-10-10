import { prisma } from "../config/prisma.js";
import type { Item } from "./placement.js";

export interface ServedQuestion {
  id: string;
  skill: string;
  type: string;
  prompt: string;
  passage?: string;
  /** Options without the `correct`/`accepts` flags — answers never leave the server. */
  options: { label: string }[];
  difficulty: number;
  seconds?: number;
}

/** Map the stored -3..+3 difficulty onto the Rasch scale (-3..+3). */
function toRaschDifficulty(difficulty: number): number {
  return Math.max(-3, Math.min(3, difficulty));
}

/** Deterministic shuffle so a retry does not repeat the same order. */
function shuffled<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let state = seed || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface RawOption {
  label?: { uz?: string; en?: string } | string;
  accepts?: string[];
  correct?: boolean;
}

function labelFor(option: RawOption, locale: "uz" | "en"): string {
  if (typeof option.label === "string") return option.label;
  return option.label?.[locale] ?? option.label?.uz ?? "";
}

export function serveQuestion(row: any, locale: "uz" | "en"): ServedQuestion {
  let parsed: RawOption[] = [];
  try {
    parsed = JSON.parse(row.options) as RawOption[];
  } catch {
    parsed = [];
  }

  return {
    id: row.id,
    skill: row.skillSlug,
    type: row.type,
    prompt: locale === "uz" ? row.promptUz : row.promptEn,
    passage: locale === "uz" ? row.passageUz ?? undefined : row.passageEn ?? undefined,
    options: parsed.map((o) => ({
      label: labelFor(o, locale),
    })),
    difficulty: row.difficulty,
    seconds: row.seconds ?? undefined,
  };
}

/** Checks an answer server-side. Returns whether it was right and why. */
export function gradeAnswer(
  row: any,
  given: string,
  locale: "uz" | "en"
): { correct: boolean; explanation?: string; expected?: string } {
  let parsed: RawOption[] = [];
  try {
    parsed = JSON.parse(row.options) as RawOption[];
  } catch {
    parsed = [];
  }

  const isChoice = row.type === "MCQ_SINGLE" || row.type === "MCQ_MULTI";
  if (!isChoice) {
    // Web clients may still send an option index for free-text chips; resolve it.
    let answerText = given.trim();
    if (/^\d+$/.test(answerText)) {
      const idx = Number(answerText);
      if (Number.isInteger(idx) && idx >= 0 && idx < parsed.length) {
        answerText = labelFor(parsed[idx], locale);
      }
    }
    const normalized = answerText.trim().toLowerCase();
    const target = parsed[0];
    const accepted = (target?.accepts ?? []).map((a) => a.trim().toLowerCase());
    const correct =
      accepted.length > 0
        ? accepted.includes(normalized)
        : normalized === labelFor(target, locale).trim().toLowerCase();
    return {
      correct,
      expected: target ? labelFor(target, locale) : undefined,
    };
  }

  const chosen = given.split(",").map((s) => s.trim()).filter(Boolean);
  const correctFlags = parsed.map((o) => Boolean(o.correct));
  const correctIndexes = correctFlags
    .map((c, i) => (c ? i : -1))
    .filter((i) => i >= 0);

  const correct =
    chosen.length === correctIndexes.length &&
    correctIndexes.every((i) => chosen.includes(String(i)));

  const firstCorrect = parsed.find((o) => o.correct);
  return {
    correct,
    explanation: firstCorrect
      ? locale === "uz"
        ? "To'g'ri javob shu edi."
        : "That was the correct answer."
      : undefined,
    expected: firstCorrect ? labelFor(firstCorrect, locale) : undefined,
  };
}

/** Builds the adaptive item pool, optionally narrowed to one subject. */
export async function buildItemPool(subject?: string | null): Promise<Item[]> {
  const rows = await prisma.question.findMany({
    where: subject
      ? { skill: { subject } }
      : undefined,
    select: { id: true, difficulty: true, skillSlug: true },
    orderBy: { id: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    difficulty: toRaschDifficulty(r.difficulty),
    skillId: r.skillSlug,
  }));
}

export async function getQuestionRow(id: string) {
  return prisma.question.findUnique({
    where: { id },
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
}

/**
 * Picks the next practice question near the student's current ability.
 * Used for the drill loop where Rasch state is not carried across sessions.
 */
export async function nextPracticeQuestion(
  level: number,
  subject: string | null,
  exclude: string[],
  skill: string | null = null
): Promise<any | null> {
  // Map the 0-10 level onto the Rasch range so level 0 really is easiest.
  const target = Math.max(-3, Math.min(3, (level - 5) * 0.6));
  const all = await prisma.question.findMany({
    where: {
      ...(subject ? { skill: { subject } } : {}),
      ...(skill ? { skillSlug: skill } : {}),
      ...(exclude.length ? { id: { notIn: exclude } } : {}),
    },
    select: { id: true, difficulty: true },
  });

  if (all.length === 0) return null;

  const scored = all
    .map((q) => ({ q, dist: Math.abs(q.difficulty - target) }))
    .sort((a, b) => a.dist - b.dist);

  // Slight rotation through equally-close items avoids repeats.
  const pool = scored.slice(0, Math.min(8, scored.length));
  const pick = pool[exclude.length % pool.length];
  return getQuestionRow(pick.q.id);
}

export { shuffled };