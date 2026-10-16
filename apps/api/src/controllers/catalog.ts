import { Request, Response } from "express";
import { z } from "zod";
import {
  listCourses,
  getCourse,
  getLesson,
  skillMap,
  enroll,
  completeLesson,
  listEnrollments,
} from "../services/catalog.js";
import { reviewSummary, listDueReviews, recordAnswer, nextDueReviewId } from "../services/reviews.js";
import { listMistakes } from "../services/mistakes.js";
import { calibrationSummary } from "../services/calibration.js";
import { getNote, saveNote, listNotes } from "../services/notes.js";
import { getReflection, saveReflection } from "../services/reflections.js";
import {
  listSelfQuestions,
  createSelfQuestion as createSelfQuestionService,
  deleteSelfQuestion as deleteSelfQuestionService,
} from "../services/selfQuestions.js";
import { buildItemPool, nextPracticeQuestion, serveQuestion, gradeAnswer, getQuestionRow } from "../services/questions.js";
import {
  listMockExams,
  getMockExam,
  gradeMockAnswer,
  finishMockExamFromAnswers,
  listMockExamAttempts,
  listMockExamBests,
  saveAttemptReflection,
  type MockExamSectionResult,
} from "../services/mockExams.js";
import { awardSlug, evaluateLater } from "../services/achievements.js";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  initialState,
  selectNextItem,
  applyAnswer,
  thetaToLevel,
  thetaToScaled,
  planModeForLevel,
  skillThetas,
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

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const subject = (req.query.subject as string) || null;
  res.json(
    await listCourses(subject, localeOf(req), (req as any).user?.userId)
  );
});

export const getMyEnrollments = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });
  res.json(await listEnrollments(uid, localeOf(req)));
});

export const getCourseDetail = asyncHandler(async (req: Request, res: Response) => {
  const course = await getCourse(
    req.params.slug,
    localeOf(req),
    (req as any).user?.userId
  );
  if (!course) return res.status(404).json({ message: "Kurs topilmadi" });
  res.json(course);
});

export const getLessonDetail = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await getLesson(
    req.params.slug,
    localeOf(req),
    (req as any).user?.userId
  );
  if (!lesson) return res.status(404).json({ message: "Dars topilmadi" });
  res.json(lesson);
});

/** Marks the lesson done and awards its XP (idempotent). */
export const completeLessonAction = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const result = await completeLesson(uid, req.params.slug);
  if (!result) return res.status(404).json({ message: "Dars topilmadi" });
  res.json(result);
});

// ── Lesson summaries ("konspekt") ───────────────────────────────────────────

const noteSchema = z.object({ body: z.string().max(8000) });
const reflectionSchema = z.object({ body: z.string().max(4000) });

/** The student's summary of one lesson (null when none written yet). */
export const getLessonNote = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const note = await getNote(uid, req.params.slug);
  if (note === null) return res.status(404).json({ message: "Dars topilmadi" });
  res.json({ note });
});

/** Writes or clears the student's summary of one lesson (upsert). */
export const saveLessonNote = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const { body } = noteSchema.parse(req.body);
  const note = await saveNote(uid, req.params.slug, body);
  if (note === null) return res.status(404).json({ message: "Dars topilmadi" });
  res.json({ note });
});

/** Every summary the student has written, newest first. */
export const getNotes = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const items = await listNotes(uid, localeOf(req));
  res.json({ count: items.length, items });
});

// ── Error self-explanation ("Xato tahlili") ─────────────────────────────────

/** The student's self-explanation for one question (null when none written). */
export const getQuestionReflection = asyncHandler(
  async (req: Request, res: Response) => {
    const uid = userId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const reflection = await getReflection(uid, req.params.id);
    res.json({ reflection });
  }
);

/** Writes or clears the student's error analysis for one question (upsert). */
export const saveQuestionReflection = asyncHandler(
  async (req: Request, res: Response) => {
    const uid = userId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const { body } = reflectionSchema.parse(req.body);
    const reflection = await saveReflection(uid, req.params.id, body);
    if (reflection === null) return res.status(404).json({ message: "Savol topilmadi" });
    res.json({ reflection });
  }
);

// ── Self-generated questions ("Mening savollarim") ──────────────────────────

const selfQuestionSchema = z.object({
  prompt: z.string().max(2000),
  answer: z.string().max(4000),
  lessonSlug: z.string().max(200).optional().nullable(),
});

/** Every question the student has written for themselves, newest first. */
export const getSelfQuestions = asyncHandler(
  async (req: Request, res: Response) => {
    const uid = userId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const items = await listSelfQuestions(uid);
    res.json({ count: items.length, items });
  }
);

/** Stores a new self-written question (generation effect). */
export const createSelfQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const uid = userId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const input = selfQuestionSchema.parse(req.body);
    const item = await createSelfQuestionService(uid, input);
    if (item === null) {
      return res.status(400).json({ message: "Savol matni bo‘sh" });
    }
    res.status(201).json({ item });
  }
);

/** Deletes one of the student's own questions. */
export const deleteSelfQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const uid = userId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const ok = await deleteSelfQuestionService(uid, req.params.id);
    if (!ok) return res.status(404).json({ message: "Savol topilmadi" });
    res.json({ ok: true });
  }
);

export const getSkills = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  res.json(await skillMap(uid ?? "", localeOf(req)));
});

export const enrollCourse = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await enroll(uid, req.params.slug);
    if (!result) return res.status(404).json({ message: "Kurs topilmadi" });
    res.json(result);
  } catch {
    res.status(400).json({ message: "Kursni yozib bo'lmadi" });
  }
});

// ── Adaptive placement (Rasch IRT) ──────────────────────────────────────────

/** Starts (or resumes) an adaptive diagnostic and serves the next item. */
export const startPlacement = asyncHandler(async (req: Request, res: Response) => {
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
});

const answerSchema = z.object({
  questionId: z.string().min(1),
  given: z.string().min(1).max(500),
  ms: z.number().int().min(0).max(3_600_000).optional(),
  // Self-rated confidence before grading: 1=low, 2=medium, 3=high.
  confidence: z.number().int().min(1).max(3).optional(),
});

/** Grades one placement item and returns the next one (or the final result). */
export const answerPlacement = asyncHandler(async (req: Request, res: Response) => {
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

      // Per-skill snapshot from the same history the overall theta used.
      const perSkill = skillThetas(next.history);
      const skillSlugs = Object.keys(perSkill);
      const skillsMeta = skillSlugs.length
        ? await prisma.skill.findMany({
            where: { slug: { in: skillSlugs } },
            select: { slug: true, nameUz: true, nameEn: true },
          })
        : [];
      const nameOf = new Map(
        skillsMeta.map((s) => [
          s.slug,
          localeOf(req) === "en" ? s.nameEn || s.nameUz : s.nameUz || s.nameEn,
        ])
      );
      const correctBySkill = new Map<string, { correct: number; total: number }>();
      for (const h of next.history) {
        const entry = correctBySkill.get(h.skillId) ?? { correct: 0, total: 0 };
        entry.total += 1;
        if (h.correct) entry.correct += 1;
        correctBySkill.set(h.skillId, entry);
      }

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
        skills: skillSlugs
          .map((slug) => {
            const tally = correctBySkill.get(slug) ?? { correct: 0, total: 0 };
            return {
              slug,
              name: nameOf.get(slug) ?? slug,
              correct: tally.correct,
              total: tally.total,
              accuracy: tally.total > 0 ? tally.correct / tally.total : 0,
            };
          })
          .sort((a, b) => a.accuracy - b.accuracy),
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
});

// ── Adaptive practice ───────────────────────────────────────────────────────

/** Serves the next drill question near the student's current level. */
export const getPracticeQuestion = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const subject = (req.query.subject as string) || null;
  const skillParam = (req.query.skill as string) || (req.query.skills as string) || null;
  const skills = skillParam
    ? skillParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
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

  const row = await nextPracticeQuestion(
    user?.currentLevel ?? 0,
    subject,
    exclude,
    skills,
    uid
  );
  if (!row) return res.status(404).json({ message: "Savol topilmadi" });

  res.json({ question: serveQuestion(row, localeOf(req)), mode: "drill" });
});

/** Grades a practice answer and schedules its spaced review. */
export const submitPractice = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { questionId, given, ms, confidence } = answerSchema.parse(req.body);
    const row = await getQuestionRow(questionId);
    if (!row) return res.status(404).json({ message: "Savol topilmadi" });

    const { correct, explanation, expected } = gradeAnswer(row, given, localeOf(req));
    const review = await recordAnswer({ userId: uid, questionId, given, correct, ms, confidence });

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
});

// ── Spaced repetition ───────────────────────────────────────────────────────

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const [due, summary] = await Promise.all([listDueReviews(uid), reviewSummary(uid)]);
  res.json({ due, summary });
});

// ── Mistake journal (error analysis) ────────────────────────────────────────

/** Recent mistakes the student has not since answered correctly. */
export const getMistakes = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
  const items = await listMistakes(uid, localeOf(req), limit);
  res.json({ count: items.length, items });
});

// ── Metacognitive calibration ───────────────────────────────────────────────

/** How well the student's confidence matches their actual correctness. */
export const getCalibration = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  res.json(await calibrationSummary(uid));
});

// ── Mock exams ──────────────────────────────────────────────────────────────

export const getMockExamList = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  const exams = await listMockExams(localeOf(req));
  if (!uid) return res.json(exams);

  const bests = await listMockExamBests(uid);
  res.json(
    exams.map((exam) => ({
      ...exam,
      bestScore: bests[exam.slug]?.score ?? null,
      bestMaxScore: bests[exam.slug]?.maxScore ?? null,
    }))
  );
});

export const getMockExamDetail = asyncHandler(async (req: Request, res: Response) => {
  const exam = await getMockExam(req.params.slug, localeOf(req));
  if (!exam) return res.status(404).json({ message: "Imtihon topilmadi" });
  res.json(exam);
});

const mockAnswerSchema = z.object({
  questionId: z.string().min(1),
  given: z.string().min(1).max(500),
  ms: z.number().int().min(0).max(3_600_000).optional(),
});

export const answerMockExam = asyncHandler(async (req: Request, res: Response) => {
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
});

const mockSectionResultSchema = z.object({
  title: z.string().min(1).max(120),
  score: z.number().int().min(0),
  maxScore: z.number().int().min(0),
  correct: z.number().int().min(0),
  total: z.number().int().min(0),
});

const mockFinishSchema = z.object({
  /** Client-supplied breakdown kept for display; authoritative score is recomputed. */
  sections: z.array(mockSectionResultSchema).max(50).optional(),
});

export const finishMockExamAction = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });

  try {
    const body = mockFinishSchema.parse(req.body ?? {});
    const sections: MockExamSectionResult[] = body.sections ?? [];
    const attempt = await finishMockExamFromAnswers(uid, req.params.slug, sections);
    if (!attempt) return res.status(404).json({ message: "Imtihon topilmadi" });

    evaluateLater(uid);
    res.json(attempt);
  } catch {
    res.status(400).json({ message: "Natijani saqlab bo'lmadi" });
  }
});

export const getMockExamAttempts = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });
  res.json(await listMockExamAttempts(uid, req.params.slug));
});

/** Saves the student's post-exam reflection ("exam wrapper") on an attempt. */
export const saveMockExamReflection = asyncHandler(
  async (req: Request, res: Response) => {
    const uid = userId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const { body } = reflectionSchema.parse(req.body);
    const reflection = await saveAttemptReflection(uid, req.params.id, body);
    if (reflection === null) return res.status(404).json({ message: "Urinish topilmadi" });
    res.json({ reflection });
  }
);