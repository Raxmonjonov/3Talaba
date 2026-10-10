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
