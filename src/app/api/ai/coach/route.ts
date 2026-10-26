import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import {
  checkAIRateLimit,
  generateAICoachResponse,
  getVariedHonorific,
  redactPersonalInfo,
  type AICoachMetadata,
  type AICoachMode,
  type StudentLevel,
} from "@/lib/ai";

const coachPostSchema = z.object({
  message: z.string().min(2, "Xabar matni juda qisqa").max(4000),
  mode: z
    .enum(["SOCRATIC_TUTOR", "FAST_SOLUTION", "STEP_BY_STEP", "TEST_ANALYZER", "ERROR_EXPLAINER", "WRITING_REVIEW", "MOTIVATION"])
    .default("SOCRATIC_TUTOR"),
  sessionId: z.string().optional(),
  lessonSlug: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedSessionId = searchParams.get("sessionId");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    const gender: "FEMALE" | "MALE" =
      user?.profile?.gender === "FEMALE" ? "FEMALE" : "MALE";
    const honorific = user?.name?.split(" ")[0] || "Aziz o'quvchi";
    const currentLevel = (user?.profile?.currentLevel ?? "BEGINNER") as StudentLevel;
    const targetUniversity =
      user?.profile?.targetUniversity ?? "Top Xalqaro Universitet";

    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const activeSession = requestedSessionId
      ? sessions.find((s) => s.id === requestedSessionId) ?? sessions[0] ?? null
      : sessions[0] ?? null;

    return NextResponse.json({
      student: {
        name: user?.name ?? "O'quvchi",
        gender,
        honorific,
        currentLevel,
        targetUniversity,
        xpTotal: user?.profile?.xpTotal ?? 50,
      },
      activeSession: activeSession
        ? {
            id: activeSession.id,
            title: activeSession.title,
            mode: activeSession.mode,
            messages: activeSession.messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              metadata: m.metadataJson
                ? (JSON.parse(m.metadataJson) as AICoachMetadata)
                : null,
              createdAt: m.createdAt,
            })),
          }
        : null,
      sessions: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        mode: s.mode,
        updatedAt: s.updatedAt,
        messageCount: s.messages.length,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "AI murabbiy ma'lumotlarini yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
    }

    const rateCheck = checkAIRateLimit(session.user.id);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `So'rovlar soni me'yordan oshdi. Iltimos, ${rateCheck.retryAfterSec} soniyadan keyin qayta urinib ko'ring.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = coachPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Xabar formati noto'g'ri", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, mode, sessionId, lessonSlug } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    const gender: "FEMALE" | "MALE" =
      user?.profile?.gender === "FEMALE" ? "FEMALE" : "MALE";
    const studentLevel = (user?.profile?.currentLevel ?? "BEGINNER") as StudentLevel;
    const targetUniversity =
      user?.profile?.targetUniversity ?? "Top Xalqaro Universitet";

    let lessonRecord = null;
    if (lessonSlug) {
      lessonRecord = await prisma.lesson.findUnique({
        where: { slug: lessonSlug },
      });
    }

    let chatSession = sessionId
      ? await prisma.chatSession.findFirst({
          where: { id: sessionId, userId: session.user.id },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        })
      : null;

    if (!chatSession) {
      const defaultTitle =
        mode === "WRITING_REVIEW"
          ? "IELTS / SAT Writing Tahlili"
          : mode === "ERROR_EXPLAINER"
            ? "Xatolarni Socratic Tahlil Qilish"
            : mode === "MOTIVATION"
              ? "Motivatsiya va Dam Olish"
              : lessonRecord
                ? `Dars: ${lessonRecord.titleUz}`
                : `Socratic Suhbat (${getVariedHonorific(gender, 0)})`;

      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          lessonId: lessonRecord?.id ?? null,
          topicId: lessonRecord?.topicId ?? null,
          mode,
          title: defaultTitle,
        },
        include: { messages: true },
      });
    }

    const turnIndex = Math.floor(chatSession.messages.length / 2);
    const { cleanText } = redactPersonalInfo(message);

    // 1. O'quvchi xabarini saqlash (shaxsiy ma'lumotlar tozalangan holda)
    const savedUserMsg = await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "USER",
        content: cleanText,
      },
    });

    // 2. AI Murabbiy javobini generatsiya qilish
    const aiResult = await generateAICoachResponse({
      userMessage: message,
      mode: mode as AICoachMode,
      gender,
      studentName: user?.name ?? "O'quvchi",
      studentLevel,
      targetUniversity,
      lessonContextTitle: lessonRecord?.titleUz,
      turnIndex,
      history: chatSession.messages.map((m) => ({
        role: m.role === "ASSISTANT" ? "ASSISTANT" : "USER",
        content: m.content,
      })),
    });

    // 3. AI javobini saqlash
    const savedAssistantMsg = await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "ASSISTANT",
        content: aiResult.reply,
        metadataJson: JSON.stringify(aiResult.metadata),
      },
    });

    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: { mode, updatedAt: new Date() },
    });

    // 4. Faollik uchun XP berish (Writing uchun +25 XP, Socratic savol uchun +10 XP)
    const xpGain = mode === "WRITING_REVIEW" ? 25 : 10;
    let updatedXp = (user?.profile?.xpTotal ?? 50) + xpGain;

    if (user?.profile) {
      const updatedProfile = await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          xpTotal: { increment: xpGain },
        },
      });
      updatedXp = updatedProfile.xpTotal;

      await prisma.xPEvent.create({
        data: {
          userId: session.user.id,
          amount: xpGain,
          reason: mode === "WRITING_REVIEW" ? "WRITING_SUBMIT" : "AI_COACH_STUDY",
        },
      });
    }

    return NextResponse.json({
      sessionId: chatSession.id,
      userMessage: {
        id: savedUserMsg.id,
        role: "USER",
        content: savedUserMsg.content,
        createdAt: savedUserMsg.createdAt,
      },
      assistantMessage: {
        id: savedAssistantMsg.id,
        role: "ASSISTANT",
        content: savedAssistantMsg.content,
        metadata: aiResult.metadata,
        createdAt: savedAssistantMsg.createdAt,
      },
      xpEarned: xpGain,
      newXpTotal: updatedXp,
    });
  } catch {
    return NextResponse.json(
      { error: "AI murabbiy javobini qayta ishlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
