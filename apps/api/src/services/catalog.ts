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

/** One course with its full module/lesson tree and per-lesson completion. */
export async function getCourse(
  slug: string,
  locale: "uz" | "en",
  userId?: string
) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { _count: { select: { blocks: true } } },
          },
        },
      },
    },
  });

  if (!course) return null;

  const completed = userId
    ? new Set(
        (
          await prisma.lessonCompletion.findMany({
            where: {
              userId,
              lesson: { module: { courseId: course.id } },
            },
            select: { lesson: { select: { slug: true } } },
          })
        ).map((c) => c.lesson.slug)
      )
    : new Set<string>();

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );

  return {
    slug: course.slug,
    subject: course.subject,
    title: pick(locale, course.titleUz, course.titleEn),
    description: pick(locale, course.descriptionUz, course.descriptionEn),
    moduleCount: course.modules.length,
    lessonCount: totalLessons,
    completedCount: completed.size,
    progressPct:
      totalLessons > 0 ? Math.round((completed.size / totalLessons) * 100) : 0,
    modules: course.modules.map((m) => ({
      slug: m.slug,
      title: pick(locale, m.titleUz, m.titleEn),
      description: pick(locale, m.descriptionUz, m.descriptionEn),
      levelRange: m.levelRange,
      lessons: m.lessons.map((l) => ({
        ...toLessonRef(l, course.slug, m.slug, locale),
        completed: completed.has(l.slug),
      })),
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

/** Lesson detail including its teaching blocks and completion state. */
export async function getLesson(
  slug: string,
  locale: "uz" | "en",
  userId?: string
) {
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: {
      blocks: { orderBy: { order: "asc" } },
      module: { include: { course: true } },
      completions: userId
        ? { where: { userId }, select: { completedAt: true, xpAwarded: true } }
        : false,
    },
  });

  if (!lesson) return null;

  const completion =
    userId && Array.isArray(lesson.completions) ? lesson.completions[0] : null;

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
    completed: Boolean(completion),
    completedAt: completion?.completedAt?.toISOString() ?? null,
    blocks: lesson.blocks.map((b) => ({
      kind: b.kind,
      title: pick(locale, b.titleUz, b.titleEn),
      minMinutes: b.minMinutes,
      content: pick(locale, b.contentUz, b.contentEn),
      skills: parseJsonArray(b.skills),
    })),
  };
}

/**
 * Marks a lesson done, awards its XP once, and bumps today's progress.
 * Idempotent: a second call returns alreadyDone without double-counting.
 */
export async function completeLesson(userId: string, slug: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    select: { id: true, xpReward: true, module: { select: { courseId: true } } },
  });
  if (!lesson) return null;

  const existing = await prisma.lessonCompletion.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
  });
  if (existing) {
    return {
      lessonSlug: slug,
      alreadyDone: true,
      xpAwarded: existing.xpAwarded,
      xpTotal: (
        await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } })
      )?.xp ?? 0,
    };
  }

  const xp = lesson.xpReward;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.$transaction([
    prisma.lessonCompletion.create({
      data: { userId, lessonId: lesson.id, xpAwarded: xp },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xp } },
    }),
    prisma.progress.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, minutes: 0, completed: 1 },
      update: { completed: { increment: 1 } },
    }),
  ]);

  // Recompute enrollment progressPct from completed / total lessons.
  const [courseLessons, done] = await Promise.all([
    prisma.lesson.count({
      where: { module: { courseId: lesson.module.courseId } },
    }),
    prisma.lessonCompletion.count({
      where: {
        userId,
        lesson: { module: { courseId: lesson.module.courseId } },
      },
    }),
  ]);
  const pct = courseLessons > 0 ? Math.round((done / courseLessons) * 100) : 0;
  await prisma.enrollment.updateMany({
    where: { userId, courseId: lesson.module.courseId },
    data: {
      progressPct: pct,
      ...(pct >= 100 ? { completedAt: new Date() } : {}),
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });

  return {
    lessonSlug: slug,
    alreadyDone: false,
    xpAwarded: xp,
    xpTotal: user?.xp ?? 0,
    enrollmentPct: pct,
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