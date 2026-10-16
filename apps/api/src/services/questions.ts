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
const poolCache = new Map<string, { items: Item[]; at: number }>();
const POOL_TTL_MS = 60_000;

export async function buildItemPool(subject?: string | null): Promise<Item[]> {
  const key = subject ?? "__all__";
  const cached = poolCache.get(key);
  if (cached && Date.now() - cached.at < POOL_TTL_MS) return cached.items;

  const rows = await prisma.question.findMany({
    where: subject
      ? { skill: { subject } }
      : undefined,
    select: { id: true, difficulty: true, skillSlug: true },
    orderBy: { id: "asc" },
  });

  const items = rows.map((r) => ({
    id: r.id,
    difficulty: toRaschDifficulty(r.difficulty),
    skillId: r.skillSlug,
  }));

  poolCache.set(key, { items, at: Date.now() });
  return items;
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
 *
 * When no explicit skill is requested, items from the same topic as the
 * previous answer are pushed to the back so consecutive drills interleave
 * across skills (a well-evidenced way to build durable, transferable recall).
 */
export async function nextPracticeQuestion(
  level: number,
  subject: string | null,
  exclude: string[],
  skill: string | string[] | null = null,
  userId: string | null = null
): Promise<any | null> {
  // Map the 0-10 level onto the Rasch range so level 0 really is easiest.
  const target = Math.max(-3, Math.min(3, (level - 5) * 0.6));
  const skillList = Array.isArray(skill)
    ? skill.filter(Boolean)
    : skill
      ? [skill]
      : [];
  const all = await prisma.question.findMany({
    where: {
      ...(subject ? { skill: { subject } } : {}),
      ...(skillList.length > 1 ? { skillSlug: { in: skillList } } : {}),
      ...(skillList.length === 1 ? { skillSlug: skillList[0] } : {}),
      ...(exclude.length ? { id: { notIn: exclude } } : {}),
    },
    select: { id: true, difficulty: true, skillSlug: true },
  });

  if (all.length === 0) return null;

  const scored = all
    .map((q) => ({ q, dist: Math.abs(q.difficulty - target) }))
    .sort((a, b) => a.dist - b.dist);

  // Interleaving only makes sense when the caller did not pin a single skill.
  const interleave = userId !== null && skillList.length === 0;

  if (!interleave) {
    // Slight rotation through equally-close items avoids repeats.
    const pool = scored.slice(0, Math.min(8, scored.length));
    const pick = pool[exclude.length % pool.length];
    return getQuestionRow(pick.q.id);
  }

  // Which topics has the student just been drilling?
  const recent = await prisma.answer.findMany({
    where: { userId },
    orderBy: { answeredAt: "desc" },
    take: 3,
    select: { question: { select: { skillSlug: true } } },
  });
  const recentSkills = recent
    .map((a) => a.question?.skillSlug)
    .filter((s): s is string => Boolean(s));
  const lastSkill = recentSkills[0] ?? null;

  // Keep selection near ability, then group the near items by skill.
  const near = scored.slice(0, Math.min(24, scored.length));
  const groups = new Map<string, typeof near>();
  for (const item of near) {
    const key = item.q.skillSlug;
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  // Rank skills by how close their best item is, then defer the last-seen
  // skill so the next question comes from a different topic when possible.
  const bySkill = [...groups.keys()].sort(
    (a, b) => groups.get(a)![0].dist - groups.get(b)![0].dist
  );
  const ordered = lastSkill
    ? [...bySkill.filter((s) => s !== lastSkill), ...bySkill.filter((s) => s === lastSkill)]
    : bySkill;
  if (ordered.length === 0) return null;

  const chosenSkill = ordered[exclude.length % ordered.length];
  const bucket = groups.get(chosenSkill)!;
  const pick = bucket[exclude.length % bucket.length];
  return getQuestionRow(pick.q.id);
}

export { shuffled };

/** Parses the JSON options blob, tolerating bad data. */
function parseOptions(row: any): RawOption[] {
  try {
    return JSON.parse(row.options) as RawOption[];
  } catch {
    return [];
  }
}

/** True when the stored question is a multiple-choice item. */
function isChoiceType(type: string): boolean {
  return type === "MCQ_SINGLE" || type === "MCQ_MULTI";
}

/**
 * The expected answer, rendered for the given locale. Choice items join every
 * flagged option; free-text items fall back to the first option (the target).
 */
export function correctAnswerLabel(row: any, locale: "uz" | "en"): string {
  const parsed = parseOptions(row);
  if (isChoiceType(row.type)) {
    const labels = parsed
      .filter((o) => o.correct)
      .map((o) => labelFor(o, locale))
      .filter(Boolean);
    if (labels.length > 0) return labels.join(", ");
  }
  return parsed[0] ? labelFor(parsed[0], locale) : "";
}

/**
 * Renders the answer a student actually gave. Choice answers arrive as
 * comma-separated indexes; free-text chips may also carry an index.
 */
export function givenAnswerLabel(row: any, given: string, locale: "uz" | "en"): string {
  const parsed = parseOptions(row);

  if (isChoiceType(row.type)) {
    const labels = given
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((token) => {
        const idx = Number(token);
        return Number.isInteger(idx) && idx >= 0 && idx < parsed.length
          ? labelFor(parsed[idx], locale)
          : token;
      })
      .filter(Boolean);
    return labels.join(", ");
  }

  const text = given.trim();
  if (/^\d+$/.test(text)) {
    const idx = Number(text);
    if (Number.isInteger(idx) && idx >= 0 && idx < parsed.length) {
      return labelFor(parsed[idx], locale);
    }
  }
  return text;
}