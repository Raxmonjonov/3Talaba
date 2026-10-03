import 'server-only';

import type { AddressForm, ExamType, Gender } from '@prisma/client';

import type { Locale } from '@/lib/i18n/config';
import { prisma } from '@/lib/server/db';
import { readL10n } from '@/lib/server/json-l10n';
import { logger } from '@/lib/server/logger';
import { thetaToLabel } from '@/lib/server/analytics/projection';

import { isAiConfigured, streamChat, isMockProvider } from './client';
import { inspectUserContent, wrapUserData } from './guard';
import { mockReply } from './mock';
import {
  buildErrorReviewInstruction,
  buildTurnInstruction,
  buildTutorSystemPrompt,
  type TutorContext,
} from './prompts';
import { collectEffects, parseToolCall, TOOLS, type ParsedToolCall, type ToolEffects } from './tools';

/**
 * AI ustoz orkestratori.
 *
 * Mas'uliyatlar:
 *  1. DB dan to'liq kontekst yig'ish (profil, ko'nikma, xatolar, kartochkalar, reja).
 *  2. System prompt qatlamlarini yig'ish (6 qatlam — `prompts.ts`).
 *  3. Foydalanuvchi matnini `guard` dan o'tkazish va `<user_data>` ichida berish.
 *  4. Streaming javob (SSE orqali uzatiladi).
 *  5. Tool-call natijalarini **tekshirilgan holda** DB ga yozish.
 *  6. Xabarlarni saqlash (sahifa yangilansa ham yo'qolmasligi uchun).
 */

export type ChatKind = 'LESSON' | 'ONBOARDING' | 'ERROR_REVIEW' | 'MOCK_REVIEW' | 'FREE_CHAT';

export type ChatInput = {
  userId: string;
  locale: Locale;
  kind: ChatKind;
  content: string;
  sessionId?: string | null;
  lessonId?: string | null;
  blockTitle?: string | null;
  stepOf?: { current: number; total: number } | null;
  remainingMinutes?: number | null;
  onDelta?: (chunk: string) => void;
};

export type ChatOutput = {
  text: string;
  blocked: boolean;
  effects: ToolEffects;
  messageId: string | null;
  latencyMs: number;
  tokensIn: number | null;
  tokensOut: number | null;
};

/** Profil + progress kontekstini DB dan yig'adi. */
export async function loadTutorContext(
  userId: string,
  locale: Locale,
  extra: Partial<TutorContext> = {},
): Promise<TutorContext> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      gender: true,
      level: true,
      targetExam: true,
      targetScore: true,
      targetUni: true,
      targetCountries: true,
      motivation: true,
      preferences: {
        select: {
          nickname: true,
          nicknameEnabled: true,
          addressForm: true,
        },
      },
      tutorProfile: {
        select: {
          nickname: true,
          nicknameEnabled: true,
          addressForm: true,
          fears: true,
          studyStyle: true,
          favoriteSubjects: true,
          avoidTopics: true,
          dailyStartTime: true,
          learningPace: true,
        },
      },
      skillMasteries: {
        orderBy: { theta: 'asc' },
        take: 12,
        select: {
          theta: true,
          skill: { select: { slug: true, name: true } },
        },
      },
      errorEntries: {
        where: { status: { not: 'RESOLVED' } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { topic: true, reason: true },
      },
      _count: { select: { reviewCards: { where: { dueAt: { lte: new Date() } } } } },
      streak: { select: { current: true } },
      xpEvents: { select: { amount: true } },
    },
  });

  const labels: Record<string, { uz: string; en: string }> = {
    notStarted: { uz: 'boshlanmagan', en: 'not started' },
    beginner: { uz: 'dastlab', en: 'beginner' },
    intermediate: { uz: 'o‘rta', en: 'intermediate' },
    advanced: { uz: 'yuqori', en: 'advanced' },
    expert: { uz: 'mukammal', en: 'excellent' },
  };

  const totalXp = user.xpEvents.reduce((sum, event) => sum + event.amount, 0);
  const levelNumber = levelFromXpSafe(totalXp);

  const skillSummary = user.skillMasteries.map((item) => {
    const label = labels[thetaToLabel(item.theta)];
    return {
      name: readL10n(item.skill.name, locale, item.skill.slug),
      theta: item.theta,
      label: locale === 'uz' ? (label?.uz ?? '') : (label?.en ?? ''),
    };
  });

  const profile = user.tutorProfile;

  return {
    locale,
    name: user.name,
    gender: user.gender as Gender | null,
    addressForm: (profile?.addressForm ?? user.preferences?.addressForm ?? 'WARM') as AddressForm,
    nickname: profile?.nickname ?? user.preferences?.nickname ?? null,
    nicknameEnabled: (profile?.nicknameEnabled ?? user.preferences?.nicknameEnabled ?? true) && !extra.nicknameEnabled,

    level: user.level,
    targetExam: (user.targetExam ?? 'SAT') as ExamType,
    targetScore: user.targetScore,
    targetUni: user.targetUni,
    targetCountries: user.targetCountries,

    motivation: user.motivation,
    fears: profile?.fears ?? null,
    studyStyle: profile?.studyStyle as TutorContext['studyStyle'],
    favoriteSubjects: profile?.favoriteSubjects ?? [],
    avoidTopics: profile?.avoidTopics ?? [],
    dailyStartTime: profile?.dailyStartTime ?? '07:00',
    learningPace: (profile?.learningPace ?? 'NORMAL') as TutorContext['learningPace'],

    skillSummary,
    errorSummary: user.errorEntries.map((entry) => entry.topic),
    dueCards: user._count.reviewCards,

    streakDays: user.streak?.current ?? 0,
    levelNumber,
    todayXp: totalXp,

    ...extra,
  };
}

function levelFromXpSafe(totalXp: number): number {
  let level = 1;
  while (level < 100 && Math.round(100 * Math.pow(level + 1, 1.35)) <= totalXp) level += 1;
  return level;
}

/**
 * Asosiy suhbat oqimi. Bloklangan xabar yumshoq qaytariladi va saqlanadi.
 */
export async function chat(input: ChatInput): Promise<ChatOutput> {
  const started = Date.now();

  // ── 1. Guard ────────────────────────────────────────────────────────────
  const verdict = inspectUserContent(input.content);

  if (verdict.blocked) {
    const reply =
      input.locale === 'uz' ? verdict.softReplyUz : verdict.softReplyEn;

    await prisma.chatMessage.create({
      data: {
        userId: input.userId,
        sessionId: input.sessionId ?? null,
        role: 'user',
        kind: input.kind,
        content: input.content.slice(0, 1000),
        blocked: true,
      },
    });

    const saved = await prisma.chatMessage.create({
      data: {
        userId: input.userId,
        sessionId: input.sessionId ?? null,
        role: 'assistant',
        kind: input.kind,
        content: reply,
      },
    });

    return {
      text: reply,
      blocked: true,
      effects: emptyToolEffects(),
      messageId: saved.id,
      latencyMs: Date.now() - started,
      tokensIn: null,
      tokensOut: null,
    };
  }

  // ── 2. Kontekst va prompt ───────────────────────────────────────────────
  const ctx = await loadTutorContext(input.userId, input.locale, {
    lessonTitle: input.lessonId ?? null,
    blockTitle: input.blockTitle ?? null,
    stepOf: input.stepOf ?? null,
    remainingMinutes: input.remainingMinutes ?? null,
    isOnboarding: input.kind === 'ONBOARDING',
  });

  const history = await loadHistory(input.userId, input.sessionId);
  const turnVariant = history.filter((m) => m.role === 'user').length;

  let system = buildTutorSystemPrompt(ctx);
  system += `\n\n${buildTurnInstruction(turnVariant, input.locale)}`;

  if (input.kind === 'ERROR_REVIEW' && ctx.errorSummary.length > 0) {
    system += `\n\n${buildErrorReviewInstruction(ctx.errorSummary[0] as string, input.locale)}`;
  }

  // ── 3. AI chaqiruvi ─────────────────────────────────────────────────────
  await prisma.chatMessage.create({
    data: {
      userId: input.userId,
      sessionId: input.sessionId ?? null,
      role: 'user',
      kind: input.kind,
      content: input.content,
    },
  });

  const messages = [
    ...history,
    { role: 'user' as const, content: wrapUserData(verdict.safeContent) },
  ];

  const parsedCalls: ParsedToolCall[] = [];

  if (isAiConfigured()) {
    const result = await streamChat({
      system,
      messages,
      tools: input.kind === 'ONBOARDING' ? [] : TOOLS,
      temperature: input.kind === 'ONBOARDING' ? 0.7 : 0.6,
      maxTokens: input.kind === 'ONBOARDING' ? 900 : 1400,
      onText: input.onDelta,
      onToolUse: (name, toolInput) => {
        const parsed = parseToolCall(name, toolInput);
        if (parsed) parsedCalls.push(parsed);
      },
    });

    const effects = await applyEffects(input.userId, collectEffects(parsedCalls));

    const saved = await prisma.chatMessage.create({
      data: {
        userId: input.userId,
        sessionId: input.sessionId ?? null,
        role: 'assistant',
        kind: input.kind,
        content: result.text,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        model: isMockProvider() ? 'mock' : process.env.AI_MODEL ?? null,
        latencyMs: result.latencyMs,
      },
    });

    return {
      text: result.text,
      blocked: false,
      effects,
      messageId: saved.id,
      latencyMs: Date.now() - started,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
    };
  }

  // ── 4. Kalit yo'q — foydalanuvchini bezak qilmaymiz, ochiq aytamiz ───────
  logger().warn({ userId: input.userId }, 'ANTHROPIC_API_KEY yo\'q — fallback javob');
  const fallback = mockReply(input.kind === 'ONBOARDING' ? 'ONBOARDING' : 'LESSON', turnVariant);
  input.onDelta?.(fallback);

  const saved = await prisma.chatMessage.create({
    data: {
      userId: input.userId,
      sessionId: input.sessionId ?? null,
      role: 'assistant',
      kind: input.kind,
      content: fallback,
    },
  });

  return {
    text: fallback,
    blocked: false,
    effects: emptyToolEffects(),
    messageId: saved.id,
    latencyMs: Date.now() - started,
    tokensIn: null,
    tokensOut: null,
  };
}

function emptyToolEffects(): ToolEffects {
  return { mastery: [], errors: [], cards: [], breaks: [], levelUps: [], finish: null };
}

/** So'nggi 20 ta xabar (onni so'rovlardan tashqari). */
async function loadHistory(
  userId: string,
  sessionId: string | null | undefined,
): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
  const rows = await prisma.chatMessage.findMany({
    where: {
      userId,
      ...(sessionId ? { sessionId } : {}),
      blocked: false,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { role: true, content: true },
  });

  return rows
    .reverse()
    .filter((row): row is { role: 'user' | 'assistant'; content: string } =>
      row.role === 'user' || row.role === 'assistant',
    )
    .map((row) => ({
      role: row.role,
      // Xabarlar ham izolyatsiya ichida beriladi — suhbat tarixi ham
      // "ma'lumot" sifatida qaralishi kerak.
      content: wrapUserData(row.content),
    }));
}

/**
 * Tool-call natijalarini DB ga yozadi.
 * Barcha yozuvlar `transaction` ichida — yarim qolgan holat bo'lmaydi.
 */
export async function applyEffects(userId: string, effects: ToolEffects): Promise<ToolEffects> {
  const applied: ToolEffects = emptyToolEffects();

  if (
    effects.mastery.length === 0 &&
    effects.errors.length === 0 &&
    effects.cards.length === 0
  ) {
    return applied;
  }

  await prisma.$transaction(async (tx) => {
    for (const mastery of effects.mastery) {
      const skill = await tx.skill.findFirst({
        where: { OR: [{ name: { path: ['uz'], equals: mastery.topic } }, { slug: mastery.topic }] },
        select: { id: true },
      });
      if (!skill) continue;

      const current = await tx.skillMastery.findUnique({
        where: { userId_skillId: { userId, skillId: skill.id } },
        select: { theta: true, samples: true },
      });

      // Verdict → theta o'zgarishi (sezilarli, lekin juda katta emas)
      const delta =
        mastery.verdict === 'understood' ? 0.35 : mastery.verdict === 'partial' ? 0.12 : -0.15;

      const nextTheta = clampTheta((current?.theta ?? 0) + delta);

      await tx.skillMastery.upsert({
        where: { userId_skillId: { userId, skillId: skill.id } },
        create: {
          userId,
          skillId: skill.id,
          theta: nextTheta,
          confidence: 0.3,
          samples: (current?.samples ?? 0) + 1,
          attempts: (current?.samples ?? 0) + 1,
          correctCount: mastery.verdict === 'understood' ? 1 : 0,
          lastSeenAt: new Date(),
        },
        update: {
          theta: nextTheta,
          samples: { increment: 1 },
          attempts: { increment: 1 },
          correctCount: { increment: mastery.verdict === 'understood' ? 1 : 0 },
          confidence: Math.min(1, (current?.samples ?? 0) / 20),
          lastSeenAt: new Date(),
        },
      });

      applied.mastery.push(mastery);
    }

    for (const error of effects.errors) {
      await tx.errorEntry.create({
        data: {
          userId,
          topic: error.topic,
          userAnswer: { text: error.userAnswer },
          correctAnswer: { text: error.correctAnswer },
          reason: error.reason,
          status: 'OPEN',
        },
      });
      applied.errors.push(error);
    }

    for (const card of effects.cards) {
      await tx.reviewCard.create({
        data: {
          userId,
          kind: card.kind,
          front: card.front,
          back: card.back,
          note: card.note ?? null,
          dueAt: new Date(),
        },
      });
      applied.cards.push(card);
    }
  });

  return applied;
}

function clampTheta(value: number): number {
  return Math.min(3, Math.max(-3, value));
}