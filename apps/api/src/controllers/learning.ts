import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { PLACEMENT, scorePlacement } from "../services/curriculum.js";
import {
  awardSlug,
  evaluateLater,
} from "../services/achievements.js";

/** Returns the diagnostic questions. Answers are not included. */
export async function getPlacementQuestions(_req: Request, res: Response) {
  res.json(
    PLACEMENT.map((q) => ({
      id: q.id,
      level: q.level,
      question: q.question,
      options: q.options,
    }))
  );
}

const submitSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0)),
  // check: score the answers but leave the stored level alone. The client uses
  // it for instant per-question feedback; the real submit still runs at the end.
  check: z.boolean().optional(),
});

/** Scores the diagnostic and stores the resulting level on the user. */
export async function submitPlacement(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { answers, check } = submitSchema.parse(req.body);
    const result = scorePlacement(answers);

    if (check) {
      res.json({ ...result, currentLevel: null, checkedOnly: true });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { currentLevel: result.level },
      select: { id: true, currentLevel: true },
    });

    // Await this one medal so the result screen can list it immediately;
    // the stat-based catalog still evaluates in the background.
    await awardSlug(userId, "placement_done");
    evaluateLater(userId);

    res.json({ ...result, currentLevel: user.currentLevel });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.errors[0]?.message || "Javoblar noto'g'ri"
        : "Natija saqlanmadi";
    res.status(400).json({ message });
  }
}

/** Daily study minutes and completed steps for the last n days. */
export async function getProgress(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const days = Math.min(90, Math.max(7, Number(req.query.days ?? 30)));
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [rows, sessionTotals] = await Promise.all([
    prisma.progress.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "asc" },
      select: { date: true, minutes: true, completed: true },
    }),
    prisma.session.findMany({
      where: { userId, startedAt: { gte: since } },
      select: { totalMinutes: true },
    }),
  ]);

  const map = new Map<string, { minutes: number; completed: number }>();
  for (const row of rows) {
    const key = row.date.toISOString().slice(0, 10);
    map.set(key, { minutes: row.minutes, completed: row.completed });
  }

  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const value = map.get(key);
    return {
      date: key,
      minutes: value?.minutes ?? 0,
      completed: value?.completed ?? 0,
    };
  });

  const totalMinutes = rows.reduce((sum, r) => sum + r.minutes, 0);
  const totalCompleted = rows.reduce((sum, r) => sum + r.completed, 0);
  const activeDays = rows.filter((r) => r.minutes > 0).length;

  res.json({
    series,
    totals: {
      minutes: totalMinutes,
      completed: totalCompleted,
      activeDays,
      sessions: sessionTotals.length,
    },
  });
}

const logSchema = z.object({
  minutes: z.number().int().min(0).max(600),
  completed: z.number().int().min(0).max(1000).optional(),
});

/** Records study time for today. */
export async function logProgress(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { minutes, completed = 0 } = logSchema.parse(req.body);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.progress.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, minutes, completed },
      update: { minutes: { increment: minutes }, completed: { increment: completed } },
      select: { date: true, minutes: true, completed: true },
    });

    evaluateLater(userId);

    res.json(record);
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.errors[0]?.message || "Ma'lumot noto'g'ri"
        : "Ma'lumot saqlanmadi";
    res.status(400).json({ message });
  }
}