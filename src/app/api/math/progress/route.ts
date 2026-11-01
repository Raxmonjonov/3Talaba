import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { MATH_TOPICS } from "@/lib/curriculum/math-deep-dive";

const saveProgressSchema = z.object({
  topicSlug: z.string().min(1),
  problemId: z.string().min(1),
  isMastered: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ authenticated: false, progress: {}, xpTotal: 0 });
    }

    const [profile, mathEvents] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { xpTotal: true, levelNumber: true },
      }),
      prisma.xPEvent.findMany({
        where: {
          userId: session.user.id,
          reason: { startsWith: "MATH_" },
        },
        select: { reason: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Qayta tiklaymiz: topicSlug -> { solved: string[], masteredAt?: number }
    const progress: Record<string, { solved: string[]; masteredAt?: number }> = {};

    for (const ev of mathEvents) {
      if (ev.reason.startsWith("MATH_SOLVE:")) {
        const parts = ev.reason.split(":");
        if (parts.length >= 3) {
          const topicSlug = parts[1];
          const problemId = parts[2];
          if (!progress[topicSlug]) {
            progress[topicSlug] = { solved: [] };
          }
          if (!progress[topicSlug].solved.includes(problemId)) {
            progress[topicSlug].solved.push(problemId);
          }
        }
      } else if (ev.reason.startsWith("MATH_MASTERED:")) {
        const parts = ev.reason.split(":");
        if (parts.length >= 2) {
          const topicSlug = parts[1];
          if (!progress[topicSlug]) {
            progress[topicSlug] = { solved: [] };
          }
          progress[topicSlug].masteredAt = new Date(ev.createdAt).getTime();
        }
      }
    }

    return NextResponse.json({
      authenticated: true,
      progress,
      xpTotal: profile?.xpTotal ?? 0,
      levelNumber: profile?.levelNumber ?? 1,
    });
  } catch (error) {
    console.error("GET /api/math/progress error:", error);
    return NextResponse.json({ authenticated: false, progress: {}, xpTotal: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // Mehmon foydalanuvchi — xatolik chiqarmaymiz
      return NextResponse.json({ authenticated: false, savedLocally: true });
    }

    const body: unknown = await req.json();
    const parsed = saveProgressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    }

    const { topicSlug, problemId, isMastered } = parsed.data;

    // 1. Bu masala oldin yechilganmi?
    const solveReason = `MATH_SOLVE:${topicSlug}:${problemId}`;
    const alreadySolved = await prisma.xPEvent.findFirst({
      where: {
        userId: session.user.id,
        reason: solveReason,
      },
    });

    let xpGained = 0;

    if (!alreadySolved) {
      // Har bir yangi masalaga 15 XP
      xpGained += 15;
      await prisma.xPEvent.create({
        data: {
          userId: session.user.id,
          amount: 15,
          reason: solveReason,
        },
      });
    }

    // 2. Mavzu to'liq o'zlashtirilgan bo'lsa va avval bonus berilmagan bo'lsa
    let masteredBonus = 0;
    if (isMastered) {
      const masterReason = `MATH_MASTERED:${topicSlug}`;
      const alreadyMastered = await prisma.xPEvent.findFirst({
        where: {
          userId: session.user.id,
          reason: masterReason,
        },
      });

      if (!alreadyMastered) {
        masteredBonus = 50; // Mavzuni to'liq egallash bonusi
        xpGained += masteredBonus;
        await prisma.xPEvent.create({
          data: {
            userId: session.user.id,
            amount: masteredBonus,
            reason: masterReason,
          },
        });
      }
    }

    let updatedXpTotal = 0;
    if (xpGained > 0) {
      const updatedProfile = await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          xpTotal: { increment: xpGained },
        },
        select: { xpTotal: true },
      });
      updatedXpTotal = updatedProfile.xpTotal;
    } else {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { xpTotal: true },
      });
      updatedXpTotal = profile?.xpTotal ?? 0;
    }

    return NextResponse.json({
      authenticated: true,
      xpGained,
      xpTotal: updatedXpTotal,
      masteredBonus,
    });
  } catch (error) {
    console.error("POST /api/math/progress error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
