import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { PLACEMENT, scorePlacement } from "../services/curriculum.js";
import {
  awardSlug,
  evaluateLater,
} from "../services/achievements.js";
import { computeStreaks, dayKey, utcMidnightToday } from "../services/streaks.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** Returns the diagnostic questions. Answers are not included. */
export const getPlacementQuestions = asyncHandler(
  async (_req: Request, res: Response) => {
    res.json(
      PLACEMENT.map((q) => ({
        id: q.id,
        level: q.level,
        question: q.question,
        options: q.options,
      }))
    );
  }
);

const submitSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
  // check: score the answers but leave the stored level alone. The client uses
  // it for instant per-question feedback; the real submit still runs at the end.
  check: z.boolean().optional(),
});

/** Scores the diagnostic and stores the resulting level on the user. */
export const submitPlacement = asyncHandler(async (req: Request, res: Response) => {
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
});

/** Daily study minutes and completed steps for the last n days. */
export const getProgress = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const days = Math.min(90, Math.max(7, Number(req.query.days ?? 30)));
  const since = utcMidnightToday();
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const historySince = new Date(since);
  historySince.setUTCDate(historySince.getUTCDate() - 300);

  const [rows, sessionTotals, history, account] = await Promise.all([
    prisma.progress.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "asc" },
      select: { date: true, minutes: true, completed: true },
    }),
    prisma.session.findMany({
      where: { userId, startedAt: { gte: since } },
      select: { totalMinutes: true },
    }),
    prisma.progress.findMany({
      where: { userId, minutes: { gt: 0 }, date: { gte: historySince } },
      orderBy: { date: "asc" },
      select: { date: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoalMinutes: true },
    }),
  ]);

  const map = new Map<string, { minutes: number; completed: number }>();
  for (const row of rows) {
    const key = dayKey(row.date);
    map.set(key, { minutes: row.minutes, completed: row.completed });
  }

  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = dayKey(d);
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

  const active = new Set(history.map((r) => dayKey(r.date)));
  const streak = computeStreaks(active);

  // Today's minutes come from the last point of the series (built up to today).
  const todayMinutes = series[series.length - 1]?.minutes ?? 0;
  const goalMinutes = account?.dailyGoalMinutes ?? 0;

  res.json({
    series,
    totals: {
      minutes: totalMinutes,
      completed: totalCompleted,
      activeDays,
      sessions: sessionTotals.length,
    },
    streak,
    goal: {
      minutes: goalMinutes,
      todayMinutes,
      met: goalMinutes > 0 && todayMinutes >= goalMinutes,
    },
  });
});

const DAILY_MINUTES_CAP = 960;

const logSchema = z.object({
  minutes: z.number().int().min(0),
  completed: z.number().int().min(0).max(1000).optional(),
});

/** Records study time for today (UTC midnight). */
export const logProgress = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { minutes, completed = 0 } = logSchema.parse(req.body);
    const today = utcMidnightToday();

    // Cap the daily total so a flood of calls cannot inflate achievements.
    const existing = await prisma.progress.findUnique({
      where: { userId_date: { userId, date: today } },
      select: { minutes: true },
    });
    const currentMinutes = existing?.minutes ?? 0;
    const safeMinutes = Math.max(
      0,
      Math.min(minutes, DAILY_MINUTES_CAP - currentMinutes)
    );

    const record = await prisma.progress.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, minutes: safeMinutes, completed },
      update: {
        minutes: { increment: safeMinutes },
        completed: { increment: completed },
      },
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
});
