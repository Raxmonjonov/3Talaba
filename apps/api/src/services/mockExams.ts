import { prisma } from "../config/prisma.js";
import { serveQuestion, getQuestionRow, gradeAnswer, type ServedQuestion } from "./questions.js";

function pick(locale: "uz" | "en", uz: string, en: string): string {
  return locale === "uz" ? uz : en || uz;
}

export interface MockExamListItem {
  id: string;
  slug: string;
  exam: string;
  title: string;
  description: string;
  durationMin: number;
  itemCount: number;
  maxPoints: number;
  sections: string[];
}

export interface MockExamSection {
  title: string;
  points: number;
  questions: (ServedQuestion & { points: number })[];
}

export interface MockExamDetail extends Omit<MockExamListItem, "sections"> {
  sections: MockExamSection[];
}

export async function listMockExams(locale: "uz" | "en"): Promise<MockExamListItem[]> {
  const exams = await prisma.mockExam.findMany({
    orderBy: { exam: "asc" },
    include: {
      items: {
        select: { section: true, points: true },
      },
    },
  });

  return exams.map((e) => {
    const sections = [...new Set(e.items.map((i) => i.section))];
    return {
      id: e.id,
      slug: e.slug,
      exam: e.exam,
      title: pick(locale, e.titleUz, e.titleEn),
      description: pick(locale, e.descriptionUz, e.descriptionEn),
      durationMin: e.durationMin,
      itemCount: e.items.length,
      maxPoints: e.items.reduce((sum, i) => sum + i.points, 0),
      sections,
    };
  });
}

export async function getMockExam(
  slug: string,
  locale: "uz" | "en"
): Promise<MockExamDetail | null> {
  const exam = await prisma.mockExam.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { section: "asc" },
        include: {
          question: {
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
          },
        },
      },
    },
  });
  if (!exam) return null;

  const bySection = new Map<string, MockExamSection>();
  for (const item of exam.items) {
    let section = bySection.get(item.section);
    if (!section) {
      section = { title: item.section, points: 0, questions: [] };
      bySection.set(item.section, section);
    }
    section.points += item.points;
    section.questions.push({
      ...serveQuestion(item.question, locale),
      points: item.points,
    });
  }

  return {
    id: exam.id,
    slug: exam.slug,
    exam: exam.exam,
    title: pick(locale, exam.titleUz, exam.titleEn),
    description: pick(locale, exam.descriptionUz, exam.descriptionEn),
    durationMin: exam.durationMin,
    itemCount: exam.items.length,
    maxPoints: exam.items.reduce((sum, i) => sum + i.points, 0),
    sections: [...bySection.values()],
  };
}

/** Grades one mock-exam answer. Only questions belonging to the exam are accepted. */
export async function gradeMockAnswer(
  slug: string,
  questionId: string,
  given: string,
  locale: "uz" | "en"
): Promise<{ correct: boolean; explanation?: string; expected?: string; points: number } | null> {
  const item = await prisma.mockExamItem.findFirst({
    where: { mockExam: { slug }, questionId },
    select: { points: true },
  });
  if (!item) return null;

  const row = await getQuestionRow(questionId);
  if (!row) return null;

  const graded = gradeAnswer(row, given, locale);
  return { ...graded, points: item.points };
}

export interface MockExamSectionResult {
  title: string;
  score: number;
  maxScore: number;
  correct: number;
  total: number;
}

export interface MockExamAttemptResult {
  id: string;
  mockExamSlug: string;
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  sections: MockExamSectionResult[];
  finishedAt: string;
}

function parseSections(raw: string | null): MockExamSectionResult[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MockExamSectionResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Rebuilds the score from answers already graded server-side during the exam.
 * The client only sends a section breakdown for display — numbers are ignored.
 */
export async function finishMockExamFromAnswers(
  userId: string,
  slug: string,
  sections: MockExamSectionResult[]
): Promise<MockExamAttemptResult | null> {
  const exam = await prisma.mockExam.findUnique({
    where: { slug },
    select: {
      id: true,
      items: { select: { questionId: true, points: true, section: true } },
    },
  });
  if (!exam) return null;

  const questionIds = exam.items.map((i) => i.questionId);
  const answers = await prisma.answer.findMany({
    where: { userId, questionId: { in: questionIds } },
    orderBy: { answeredAt: "asc" },
    select: { questionId: true, correct: true },
  });

  // Keep only the latest answer per question (retries overwrite).
  const latest = new Map<string, boolean>();
  for (const a of answers) latest.set(a.questionId, a.correct);

  const pointOf = new Map(exam.items.map((i) => [i.questionId, i.points]));
  const sectionOf = new Map(exam.items.map((i) => [i.questionId, i.section]));

  let score = 0;
  let correct = 0;
  const sectionAcc = new Map<string, { score: number; correct: number; total: number; maxScore: number }>();
  for (const [questionId, isCorrect] of latest) {
    const section = sectionOf.get(questionId) ?? "General";
    const pts = pointOf.get(questionId) ?? 0;
    const acc = sectionAcc.get(section) ?? { score: 0, correct: 0, total: 0, maxScore: 0 };
    acc.total += 1;
    acc.maxScore += pts;
    if (isCorrect) {
      acc.score += pts;
      acc.correct += 1;
      score += pts;
      correct += 1;
    }
    sectionAcc.set(section, acc);
  }

  // Include unanswered items so totals reflect the full exam.
  const answeredIds = new Set(latest.keys());
  const total = exam.items.length;
  for (const item of exam.items) {
    if (!answeredIds.has(item.questionId)) {
      const acc = sectionAcc.get(item.section) ?? { score: 0, correct: 0, total: 0, maxScore: 0 };
      acc.total += 1;
      acc.maxScore += item.points;
      sectionAcc.set(item.section, acc);
    }
  }

  const maxScore = exam.items.reduce((sum, i) => sum + i.points, 0);
  const computedSections: MockExamSectionResult[] = [...sectionAcc.entries()].map(
    ([title, v]) => ({
      title,
      score: v.score,
      maxScore: v.maxScore,
      correct: v.correct,
      total: v.total,
    })
  );

  const row = await prisma.mockExamAttempt.create({
    data: {
      userId,
      mockExamId: exam.id,
      score,
      maxScore,
      correct,
      total,
      sections: JSON.stringify(computedSections.length ? computedSections : sections),
    },
  });

  return {
    id: row.id,
    mockExamSlug: slug,
    score: row.score,
    maxScore: row.maxScore,
    correct: row.correct,
    total: row.total,
    sections: computedSections.length ? computedSections : sections,
    finishedAt: row.finishedAt.toISOString(),
  };
}

export async function listMockExamAttempts(
  userId: string,
  slug: string,
  limit = 10
): Promise<MockExamAttemptResult[]> {
  const exam = await prisma.mockExam.findUnique({ where: { slug }, select: { id: true } });
  if (!exam) return [];

  const rows = await prisma.mockExamAttempt.findMany({
    where: { userId, mockExamId: exam.id },
    orderBy: { finishedAt: "desc" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    mockExamSlug: slug,
    score: row.score,
    maxScore: row.maxScore,
    correct: row.correct,
    total: row.total,
    sections: parseSections(row.sections),
    finishedAt: row.finishedAt.toISOString(),
  }));
}

/** Best score per exam for the catalog cards. */
export async function listMockExamBests(
  userId: string
): Promise<Record<string, { score: number; maxScore: number; finishedAt: string }>> {
  const rows = await prisma.mockExamAttempt.findMany({
    where: { userId },
    orderBy: { finishedAt: "desc" },
    take: 200,
    include: { mockExam: { select: { slug: true } } },
  });

  const bests: Record<string, { score: number; maxScore: number; finishedAt: string }> = {};
  for (const row of rows) {
    const slug = row.mockExam.slug;
    const current = bests[slug];
    if (!current || row.score > current.score) {
      bests[slug] = {
        score: row.score,
        maxScore: row.maxScore,
        finishedAt: row.finishedAt.toISOString(),
      };
    }
  }
  return bests;
}
