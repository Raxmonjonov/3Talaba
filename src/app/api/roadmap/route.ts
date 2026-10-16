import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import {
  generatePersonalizedRoadmap,
  calculateDailyTimeBreakdown,
} from "@/lib/curriculum/roadmap-generator";
import type { SkillLevelCode } from "@/lib/curriculum/placement-engine";
import { getHonorificTitle } from "@/lib/validations/auth";

const updateDailyTimeSchema = z.object({
  dailyMinutes: z.coerce
    .number()
    .int()
    .min(15, "Kunlik o'qish vaqti kamida 15 daqiqa bo'lishi kerak")
    .max(480, "Sog'liq uchun kunlik o'qish vaqti 480 daqiqadan (8 soatdan) oshmasligi kerak"),
});

const toggleTaskSchema = z.object({
  itemId: z.string().min(1),
  isCompleted: z.boolean(),
});

async function buildAndPersistRoadmap(userId: string, dailyMinutes: number) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const startLevel = ((profile?.currentLevel ||
    profile?.selfAssessedLevel ||
    "BEGINNER") as SkillLevelCode);

  let weakSubjects: string[] = [];
  try {
    weakSubjects = JSON.parse(profile?.weakSubjectsJson || "[]");
  } catch {
    weakSubjects = [];
  }

  const generated = generatePersonalizedRoadmap({
    startLevel,
    dailyMinutes,
    targetSatScore: profile?.targetSatScore,
    targetIeltsScore: profile?.targetIeltsScore,
    targetUniversity: profile?.targetUniversity,
    weakSubjects,
  });

  // Oldingi aktiv roadmapni yangilash yoki yangisini yaratish
  await prisma.roadmap.deleteMany({ where: { userId } });

  // Bazaga har bir oyning 1-haftasi (jami 12 oy * 6 kun = 72 ta asosiy vazifa) saqlanadi,
  // qolgan haftalar dinamik ravishda ko'rsatiladi (SQLite tezligi va tozaligi uchun)
  const itemsToPersist = generated.items.filter(
    (item) => (item.weekNumber - 1) % 4 === 0,
  );

  const createdRoadmap = await prisma.roadmap.create({
    data: {
      userId,
      dailyMinutes: generated.dailyMinutes,
      startLevel: generated.startLevel,
      targetSummary: generated.targetSummary,
      totalMonths: 12,
      totalWeeks: 48,
      status: "ACTIVE",
      items: {
        create: itemsToPersist.map((it) => ({
          monthNumber: it.monthNumber,
          weekNumber: it.weekNumber,
          dayOfWeek: it.dayOfWeek,
          titleUz: it.titleUz,
          descriptionUz: it.descriptionUz,
          taskType: it.taskType,
          durationMinutes: it.durationMinutes,
          xpReward: it.xpReward,
        })),
      },
    },
    include: {
      items: {
        orderBy: [{ monthNumber: "asc" }, { weekNumber: "asc" }, { dayOfWeek: "asc" }],
      },
    },
  });

  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyPlan = await prisma.dailyPlan.upsert({
    where: {
      userId_dateKey: {
        userId,
        dateKey: todayKey,
      },
    },
    update: {
      selectedMinutes: generated.dailyMinutes,
      tasksJson: JSON.stringify(createdRoadmap.items.slice(0, 3)),
    },
    create: {
      userId,
      dateKey: todayKey,
      selectedMinutes: generated.dailyMinutes,
      completedMinutes: 0,
      tasksJson: JSON.stringify(createdRoadmap.items.slice(0, 3)),
    },
  });

  return {
    roadmap: createdRoadmap,
    dailyPlan,
    months: generated.months,
    timeBreakdown: generated.timeBreakdown,
    annualStudyHours: generated.annualStudyHours,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  const existingRoadmap = await prisma.roadmap.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: {
      items: {
        orderBy: [{ monthNumber: "asc" }, { weekNumber: "asc" }, { dayOfWeek: "asc" }],
      },
    },
  });

  const dailyMinutes = existingRoadmap?.dailyMinutes ?? profile?.dailyGoalMinutes ?? 60;

  if (!existingRoadmap) {
    const built = await buildAndPersistRoadmap(session.user.id, dailyMinutes);
    return NextResponse.json({
      honorific: getHonorificTitle(profile?.gender),
      profile,
      ...built,
    });
  }

  const generatedMeta = generatePersonalizedRoadmap({
    startLevel: (existingRoadmap.startLevel as SkillLevelCode) || "BEGINNER",
    dailyMinutes: existingRoadmap.dailyMinutes,
    targetSatScore: profile?.targetSatScore,
    targetIeltsScore: profile?.targetIeltsScore,
    targetUniversity: profile?.targetUniversity,
  });

  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyPlan = await prisma.dailyPlan.findUnique({
    where: {
      userId_dateKey: {
        userId: session.user.id,
        dateKey: todayKey,
      },
    },
  });

  return NextResponse.json({
    honorific: getHonorificTitle(profile?.gender),
    profile,
    roadmap: existingRoadmap,
    dailyPlan,
    months: generatedMeta.months,
    timeBreakdown: calculateDailyTimeBreakdown(existingRoadmap.dailyMinutes),
    annualStudyHours: generatedMeta.annualStudyHours,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
    }

    const body: unknown = await req.json();
    const parsed = updateDailyTimeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Kunlik vaqt noto'g'ri kiritildi" },
        { status: 400 },
      );
    }

    const { dailyMinutes } = parsed.data;

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: { dailyGoalMinutes: dailyMinutes },
    });

    const built = await buildAndPersistRoadmap(session.user.id, dailyMinutes);

    return NextResponse.json({
      honorific: getHonorificTitle(updatedProfile.gender),
      profile: updatedProfile,
      ...built,
      message:
        dailyMinutes > 120
          ? `12 oylik xaritangiz kunlik ${dailyMinutes} daqiqa (${(dailyMinutes / 60).toFixed(1)} soat — maxsus intensiv rejim) ga muvaffaqiyatli moslashtirildi!`
          : `12 oylik xaritangiz kunlik ${dailyMinutes} daqiqa standart rejimga muvaffaqiyatli moslashtirildi!`,
    });
  } catch {
    return NextResponse.json(
      { error: "Yo'l xaritasini yangilashda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
    }

    const body: unknown = await req.json();
    const parsed = toggleTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ma'lumot noto'g'ri" }, { status: 400 });
    }

    const item = await prisma.roadmapItem.update({
      where: { id: parsed.data.itemId },
      data: {
        isCompleted: parsed.data.isCompleted,
        completedAt: parsed.data.isCompleted ? new Date() : null,
      },
    });

    if (parsed.data.isCompleted) {
      await prisma.profile.update({
        where: { userId: session.user.id },
        data: { xpTotal: { increment: item.xpReward } },
      });
      await prisma.xPEvent.create({
        data: {
          userId: session.user.id,
          amount: item.xpReward,
          reason: "ROADMAP_TASK_COMPLETE",
        },
      });
    }

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Vazifani yangilashda xatolik" }, { status: 500 });
  }
}
