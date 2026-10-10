import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { buildTutorMessages, TutorMessage } from "../services/tutor.js";
import {
  EngineState,
  initialState,
  nextTurn,
} from "../services/engine.js";
import { evaluateLater } from "../services/achievements.js";

const chatSchema = z.object({
  sessionId: z.string().uuid("Sessiya topilmadi"),
  message: z.string().min(1, "Xabar bo'sh bo'lmasin").max(4000),
});

function parseState(raw: string | null): EngineState {
  if (!raw) return initialState();
  try {
    const parsed = JSON.parse(raw) as Partial<EngineState>;
    return {
      lessonId: parsed.lessonId ?? null,
      stepIndex: parsed.stepIndex ?? 0,
      streak: parsed.streak ?? 0,
      misses: parsed.misses ?? 0,
      awaitingNextTopic: parsed.awaitingNextTopic ?? false,
    };
  } catch {
    return initialState();
  }
}

const startSchema = z.object({
  /** Catalog lesson slug to open with this session. */
  lessonSlug: z.string().min(1).optional(),
});

export async function startSession(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  let lessonSlug: string | undefined;
  try {
    lessonSlug = startSchema.parse(req.body ?? {}).lessonSlug;
  } catch {
    // Empty body from the dashboard is fine.
  }

  let lessonId: string | undefined;
  let title: string | undefined;
  if (lessonSlug) {
    const lesson = await prisma.lesson.findUnique({
      where: { slug: lessonSlug },
      select: { id: true, titleUz: true, titleEn: true, module: { select: { course: { select: { subject: true } } } } },
    });
    if (lesson) {
      lessonId = lesson.id;
      title = lesson.titleUz || lesson.titleEn;
    }
  }

  const session = await prisma.session.create({
    data: {
      userId,
      lessonId: lessonId ?? null,
      title: title ?? null,
      engineState: JSON.stringify(initialState()),
    },
    select: { id: true, startedAt: true, title: true, lessonId: true },
  });

  evaluateLater(userId);

  res.status(201).json(session);
}

export async function chat(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { sessionId, message } = chatSchema.parse(req.body);

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
      select: { id: true, engineState: true },
    });
    if (!session) {
      return res.status(404).json({ message: "Sessiya topilmadi" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    await prisma.message.create({
      data: { userId, sessionId, role: "user", content: message },
    });

    const history = await prisma.message.findMany({
      where: { sessionId, userId },
      orderBy: { createdAt: "asc" },
      take: 40,
    });

    const address = user.preferredTitle || user.firstName;
    const state = parseState(session.engineState);

    const context = {
      firstName: user.firstName,
      preferredTitle: user.preferredTitle,
      currentLevel: user.currentLevel,
      gender: user.gender,
      target: user.target,
      focusMode: user.focusMode,
      softConfirm: user.softConfirm,
    };

    const messages = buildTutorMessages(
      context,
      history.map(
        (m) => ({ role: m.role as TutorMessage["role"], content: m.content })
      )
    );

    // The local engine is the primary, always-available path. The AI model
    // is used to enrich it when a key is configured and the request succeeds.
    const local = nextTurn(state, message, user.currentLevel, address);
    let reply = local.reply;
    let usedAI = false;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      const enriched = await callModel(messages);
      if (enriched) {
        reply = enriched;
        usedAI = true;
      }
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { engineState: JSON.stringify(local.state) },
    });

    const assistantMessage = await prisma.message.create({
      data: { userId, sessionId, role: "assistant", content: reply },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    res.json({
      message: assistantMessage,
      engine: { lessonId: local.state.lessonId, usedAI },
    });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.errors[0]?.message || "Xabar noto'g'ri"
        : "Xabar yuborishda xatolik";
    res.status(400).json({ message });
  }
}

async function callModel(messages: TutorMessage[]): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:5173",
          "X-Title": "3Talab",
        },
        body: JSON.stringify({
          model:
            process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free",
          messages,
          temperature: 0.3,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) return null;

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content && content.length > 0 ? content : null;
  } catch {
    return null;
  }
}

export async function listSessions(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: 20,
    select: { id: true, title: true, startedAt: true, endedAt: true },
  });

  res.json(sessions);
}

export async function getSession(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const session = await prisma.session.findFirst({
    where: { id: req.params.id, userId },
    select: {
      id: true,
      title: true,
      startedAt: true,
      lessonId: true,
      lesson: { select: { slug: true, titleUz: true, titleEn: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });

  if (!session) return res.status(404).json({ message: "Sessiya topilmadi" });

  res.json(session);
}

export async function endSession(req: Request, res: Response) {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const minutes = Number(req.body?.minutes ?? 0);
  const safeMinutes = Number.isFinite(minutes)
    ? Math.max(0, Math.min(600, Math.round(minutes)))
    : 0;

  const owned = await prisma.session.findFirst({
    where: { id: req.params.id, userId },
    select: { id: true },
  });
  if (!owned) return res.status(404).json({ message: "Sessiya topilmadi" });

  const session = await prisma.session.update({
    where: { id: owned.id },
    data: { endedAt: new Date(), totalMinutes: safeMinutes },
    select: { id: true, endedAt: true, totalMinutes: true },
  });

  res.json(session);
}