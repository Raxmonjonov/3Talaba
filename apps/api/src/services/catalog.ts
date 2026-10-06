import { prisma } from "../config/prisma.js";

export interface LessonRef {
  id: string;
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  levelRange: string;
  estMinutes: number;
  xpReward: number;
  storyTitle?: string;
  courseSlug: string;
  moduleSlug: string;
  blockCount: number;
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function pick(locale: "uz" | "en", uz: string, en: string): string {
  return locale === "uz" ? uz : en || uz;
}

/** Course catalog with module/lesson counts, filtered by subject. */
export async function listCourses(subject: string | null, locale: "uz" | "en") {
  const courses = await prisma.course.findMany({
    where: subject ? { subject } : undefined,
    orderBy: { titleUz: "asc" },
    include: {
      _count: { select: { modules: true } },
      modules: {
        orderBy: { order: "asc" },
        include: { _count: { select: { lessons: true } } },
      },
    },
  });

  return courses.map((c) => ({
    slug: c.slug,
    subject: c.subject,
    title: pick(locale, c.titleUz, c.titleEn),
    description: pick(locale, c.descriptionUz, c.descriptionEn),
    moduleCount: c.modules.length,
    lessonCount: c.modules.reduce((sum, m) => sum + m._count.lessons, 0),
  }));
}

/** One course with its full module/lesson tree. */
export async function getCourse(slug: string, locale: "uz" | "en") {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" }, include: { _count: { select: { blocks: true } } } } },
      },
    },
  });

  if (!course) return null;

  return {
    slug: course.slug,
    subject: course.subject,
    title: pick(locale, course.titleUz, course.titleEn),
    description: pick(locale, course.descriptionUz, course.descriptionEn),
    modules: course.modules.map((m) => ({
      slug: m.slug,
      title: pick(locale, m.titleUz, m.titleEn),
      description: pick(locale, m.descriptionUz, m.descriptionEn),
      levelRange: m.levelRange,
      lessons: m.lessons.map((l) => toLessonRef(l, course.slug, m.slug, locale)),
    })),
  };
}

function toLessonRef(
  l: {
    id: string;
    slug: string;
    titleUz: string;
    titleEn: string;
    summaryUz: string;
    summaryEn: string;
    objectives: string;
    levelRange: string;
    estMinutes: number;
    xpReward: number;
    storyTitleUz: string | null;
    _count: { blocks: number };
  },
  courseSlug: string,
  moduleSlug: string,
  locale: "uz" | "en"
): LessonRef {
  const raw = parseJsonArray(l.objectives);
  return {
    id: l.id,
    slug: l.slug,
    title: pick(locale, l.titleUz, l.titleEn),
    summary: pick(locale, l.summaryUz, l.summaryEn),
    // Objectives are stored as [uz, en] pairs per objective.
    objectives: raw.map((o) => {
      if (Array.isArray(o)) return pick(locale, String(o[0] ?? ""), String(o[1] ?? ""));
      return String(o);
    }),
    levelRange: l.levelRange,
    estMinutes: l.estMinutes,
    xpReward: l.xpReward,
    storyTitle: l.storyTitleUz ?? undefined,
    courseSlug,
    moduleSlug,
    blockCount: l._count.blocks,
  };
}

/** Lesson detail including its teaching blocks. */
export async function getLesson(slug: string, locale: "uz" | "en") {
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: {
      blocks: { orderBy: { order: "asc" } },
      module: { include: { course: true } },
    },
  });

  if (!lesson) return null;

  return {
    ...toLessonRef(
      {
        id: lesson.id,
        slug: lesson.slug,
        titleUz: lesson.titleUz,
        titleEn: lesson.titleEn,
        summaryUz: lesson.summaryUz,
        summaryEn: lesson.summaryEn,
        objectives: lesson.objectives,
        levelRange: lesson.levelRange,
        estMinutes: lesson.estMinutes,
        xpReward: lesson.xpReward,
        storyTitleUz: lesson.storyTitleUz,
        _count: { blocks: lesson.blocks.length },
      },
      lesson.module.course.slug,
      lesson.module.slug,
      locale
    ),
    blocks: lesson.blocks.map((b) => ({
      kind: b.kind,
      title: pick(locale, b.titleUz, b.titleEn),
      minMinutes: b.minMinutes,
      content: pick(locale, b.contentUz, b.contentEn),
      skills: parseJsonArray(b.skills),
    })),
  };
}

/** Skill tree with per-skill question counts and mastery. */
export async function skillMap(userId: string, locale: "uz" | "en") {
  const skills = await prisma.skill.findMany({
    orderBy: [{ subject: "asc" }, { slug: "asc" }],
    include: { _count: { select: { questions: true } } },
  });

  const answers = await prisma.answer.findMany({
    where: { userId },
    select: { correct: true, questionId: true },
  });
  const questions = await prisma.question.findMany({
    where: { id: { in: answers.map((a) => a.questionId) } },
    select: { id: true, skillSlug: true },
  });
  const skillOf = new Map(questions.map((q) => [q.id, q.skillSlug]));

  const tally = new Map<string, { correct: number; total: number }>();
  for (const a of answers) {
    const skill = skillOf.get(a.questionId);
    if (!skill) continue;
    const e = tally.get(skill) ?? { correct: 0, total: 0 };
    e.total += 1;
    if (a.correct) e.correct += 1;
    tally.set(skill, e);
  }

  return skills.map((s) => {
    const t = tally.get(s.slug);
    return {
      slug: s.slug,
      subject: s.subject,
      name: pick(locale, s.nameUz, s.nameEn),
      parent: s.parent,
      questionCount: s._count.questions,
      attempts: t?.total ?? 0,
      mastery: t && t.total > 0 ? t.correct / t.total : null,
    };
  });
}

/** Enroll the user in a course (idempotent). */
export async function enroll(userId: string, courseSlug: string) {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return null;

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    create: { userId, courseId: course.id },
    update: {},
  });
  return { courseSlug, enrolled: true };
}