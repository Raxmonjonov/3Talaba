import { Request, Response } from "express";
import { z } from "zod";
import {
  listCourses,
  getCourse,
  getLesson,
  skillMap,
  enroll,
  completeLesson,
} from "../services/catalog.js";
import { reviewSummary, listDueReviews, recordAnswer, nextDueReviewId } from "../services/reviews.js";
import { buildItemPool, nextPracticeQuestion, serveQuestion, gradeAnswer, getQuestionRow } from "../services/questions.js";
import { listMockExams, getMockExam, gradeMockAnswer } from "../services/mockExams.js";
import { awardSlug, evaluateLater } from "../services/achievements.js";
import { prisma } from "../config/prisma.js";
import {
  initialState,
  selectNextItem,
  applyAnswer,
  thetaToLevel,
  thetaToScaled,
  planModeForLevel,
  type PlacementState,
} from "../services/placement.js";

function userId(req: Request): string | null {
  return (req as any).user?.userId ?? null;
}

function localeOf(req: Request): "uz" | "en" {
  return ((req as any).user?.locale ?? req.query.locale) === "en" ? "en" : "uz";
}

async function loadPlacementState(uid: string): Promise<PlacementState | null> {
  const row = await prisma.placementSession.findUnique({ where: { userId: uid } });
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.state) as PlacementState;
    if (typeof parsed?.theta !== "number" || !Array.isArray(parsed.answered)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function savePlacementState(uid: string, state: PlacementState): Promise<void> {
  const data = { state: JSON.stringify(state), updatedAt: new Date() };
  await prisma.placementSession.upsert({
    where: { userId: uid },
    create: { userId: uid, ...data },
    update: data,
  });
}

export async function getCourses(req: Request, res: Response) {
  const subject = (req.query.subject as string) || null;
  res.json(await listCourses(subject, localeOf(req)));
}

export async function getCourseDetail(req: Request, res: Response) {
  const course = await getCourse(
    req.params.slug,
    localeOf(req),
    (req as any).user?.userId
  );
  if (!course) return res.status(404).json({ message: "Kurs topilmadi" });
  res.json(course);
}

export async function getLessonDetail(req: Request, res: Response) {
  const lesson = await getLesson(
    req.params.slug,
    localeOf(req),
    (req as any).user?.userId
  );
  if (!lesson) return res.status(404).json({ message: "Dars topilmadi" });
  res.json(lesson);
}

/** Marks the lesson done and awards its XP (idempotent). */
export async function completeLessonAction(req: Request, res: Response) {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const result = await completeLesson(uid, req.params.slug);
  if (!result) return res.status(404).json({ message: "Dars topilmadi" });
  res.json(result);
}

export async function getSkills(req: Request, res: Response) {
  const uid = userId(req);
  res.json(await skillMap(uid ?? "", localeOf(req)));
}

export async function enrollCourse(req: Request, res: Response) {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await enroll(uid, req.params.slug);
    if (!result) return res.status(404).json({ message: "Kurs topilmadi" });
    res.json(result);
  } catch {
    res.status(400).json({ message: "Kursni yozib bo'lmadi" });
  }
}

// ── Adaptive placement (Rasch IRT) ──────────────────────────────────────────

/** Starts (or resumes) an adaptive diagnostic and serves the next item. */
export async function startPlacement(req: Request, res: Response) {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const subject = (req.query.subject as string) || null;
  const restart = req.query.restart === "1";
  const pool = await buildItemPool(subject);
  if (pool.length === 0) return res.status(503).json({ message: "Savol bazasi bo'sh" });

  let state: PlacementState;
  let resumed = false;
  if (!restart) {
    const existing = await loadPlacementState(uid);
    // Resume only when the unfinished session matches the requested subject,
    // otherwise a mixed-pool diagnostic would bleed into a subject drill.
    if (
      existing &&
      !existing.finished &&
      existing.answered.length > 0 &&
      (existing.subject ?? null) === subject
    ) {
      state = existing;
      resumed = true;
    } else {
      state = initialState(subject);
      await savePlacementState(uid, state);
    }
  } else {
    state = initialState(subject);
    await savePlacementState(uid, state);
  }

  const item = selectNextItem(state, pool);
  if (!item) return res.status(503).json({ message: "Savol tanlab bo'lmadi" });

  const row = await getQuestionRow(item.id);
  res.json({
    question: row ? serveQuestion(row, localeOf(req)) : null,
    answered: state.answered.length,
    finished: false,
    resumed,
    subject: state.subject ?? null,
  });
}

const answerSchema = z.object({
  questionId: z.string().min(1),
  given: z.string().min(1),
  ms: z.number().int().min(0).max(3_600_000).optional(),
});

/** Grades one placement item and returns the next one (or the final result). */
export async function answerPlacement(req: Request, res: Response) {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const state = await loadPlacementState(uid);
  if (!state || state.finished) {
    return res.status(400).json({ message: "Placement boshlanmagan" });
  }

  try {
    const { questionId, given } = answerSchema.parse(req.body);
    const row = await getQuestionRow(questionId);
    if (!row) return res.status(404).json({ message: "Savol topilmadi" });

    const { correct, explanation } = gradeAnswer(row, given, localeOf(req));
    // Subject lives on the saved session — the web client never re-sends it.
    const pool = await buildItemPool(state.subject ?? null);
    const item = pool.find((p) => p.id === questionId);
    if (!item) return res.status(404).json({ message: "Savol topilmadi" });

    const next = applyAnswer(state, item, correct);

    if (next.finished) {
      const rawLevel = thetaToLevel(next.theta);
      const level = rawLevel * 2; // map the 0-5 Rasch level onto the 0-10 scale
      await prisma.user.update({ where: { id: uid }, data: { currentLevel: level } });
      await prisma.placementSession.delete({ where: { userId: uid } }).catch(() => {});
      await awardSlug(uid, "placement_done");
      evaluateLater(uid);
      return res.json({
        finished: true,
        correct,
        explanation,
        theta: next.theta,
        scaled: thetaToScaled(next.theta),
        rawLevel,
        currentLevel: level,
        planMode: planModeForLevel(rawLevel),
        answered: next.answered.length,
        correctCount: next.history.filter((h) => h.correct).length,
      });
    }

    await savePlacementState(uid, next);
    const nextItem = selectNextItem(next, pool);
    const nextRow = nextItem ? await getQuestionRow(nextItem.id) : null;

    res.json({
      finished: false,
      correct,
      explanation,
      answered: next.answered.length,
      question: nextRow ? serveQuestion(nextRow, localeOf(req)) : null,
    });
  } catch (err) {
    const message =
      err instanceof z.ZodError ? err.errors[0]?.message || "Javob noto'g'ri" : "Javobni qayta ishlab bo'lmadi";
    res.status(400).json({ message });
  }
}

// ── Adaptive practice ───────────────────────────────────────────────────────

/** Serves the next drill question near the student's current level. */
export async function getPracticeQuestion(req: Request, res: Response) {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const subject = (req.query.subject as string) || null;
  const skill = (req.query.skill as string) || null;
  const review = req.query.review === "1";
  const exclude = String(req.query.exclude ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Review mode: serve the oldest due FSRS card instead of a new drill item.
  if (review) {
    const dueId = await nextDueReviewId(uid, exclude);
    if (!dueId) return res.status(404).json({ message: "Navbatdagi savol yo'q" });
    const row = await getQuestionRow(dueId);
    if (!row) return res.status(404).json({ message: "Savol topilmadi" });
    res.json({ question: serveQuestion(row, localeOf(req)), mode: "review" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { currentLevel: true },
  });

  const row = await nextPracticeQuestion(user?.currentLevel ?? 0, subject, exclude, skill);
  if (!row) return res.status(404).json({ message: "Savol topilmadi" });

  res.json({ question: serveQuestion(row, localeOf(req)), mode: "drill" });
}

/** Grades a practice answer and schedules its spaced review. */
export async function submitPractice(req: Request, res: Response) {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { questionId, given, ms } = answerSchema.parse(req.body);
    const row = await getQuestionRow(questionId);
    if (!row) return res.status(404).json({ message: "Savol topilmadi" });

    const { correct, explanation, expected } = gradeAnswer(row, given, localeOf(req));
    const review = await recordAnswer({ userId: uid, questionId, given, correct, ms });

    // Bump the level on a streak of correct answers, never downward.
    if (correct) {
      await prisma.user.updateMany({
        where: { id: uid, currentLevel: { lt: 10 } },
        data: { currentLevel: { increment: 1 } },
      });
    }

    evaluateLater(uid);

    res.json({ correct, explanation, expected, review });
  } catch {
    res.status(400).json({ message: "Javobni qayta ishlab bo'lmadi" });
  }
}

// ── Spaced repetition ───────────────────────────────────────────────────────

export async function getReviews(req: Request, res: Response) {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const [due, summary] = await Promise.all([listDueReviews(uid), reviewSummary(uid)]);
  res.json({ due, summary });
}

// ── Mock exams ──────────────────────────────────────────────────────────────

export async function getMockExamList(req: Request, res: Response) {
  res.json(await listMockExams(localeOf(req)));
}

export async function getMockExamDetail(req: Request, res: Response) {
  const exam = await getMockExam(req.params.slug, localeOf(req));
  if (!exam) return res.status(404).json({ message: "Imtihon topilmadi" });
  res.json(exam);
}

const mockAnswerSchema = z.object({
  questionId: z.string().min(1),
  given: z.string().min(1),
  ms: z.number().int().min(0).max(3_600_000).optional(),
});

export async function answerMockExam(req: Request, res: Response) {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { questionId, given, ms } = mockAnswerSchema.parse(req.body);
    const graded = await gradeMockAnswer(req.params.slug, questionId, given, localeOf(req));
    if (!graded) return res.status(404).json({ message: "Savol topilmadi" });

    // Mock answers feed the same spaced-repetition queue as practice drills.
    await recordAnswer({ userId: uid, questionId, given, correct: graded.correct, ms });
    if (graded.correct) {
      await prisma.user.updateMany({
        where: { id: uid, currentLevel: { lt: 10 } },
        data: { currentLevel: { increment: 1 } },
      });
    }
    evaluateLater(uid);

    res.json({
      correct: graded.correct,
      explanation: graded.explanation,
      expected: graded.expected,
      points: graded.points,
    });
  } catch {
    res.status(400).json({ message: "Javobni qayta ishlab bo'lmadi" });
  }
}