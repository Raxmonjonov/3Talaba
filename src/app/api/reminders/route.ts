import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

const reminderSettingsSchema = z.object({
  reminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Vaqt HH:MM formatida bo'lishi kerak")
    .optional(),
  reduceMotion: z.boolean().optional(),
  theme: z.enum(["dark", "light"]).optional(),
  triggerTestNotification: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    const gender = user?.profile?.gender === "FEMALE" ? "FEMALE" : "MALE";
    const honorific = gender === "FEMALE" ? "Malikam" : "Shag'zodam";

    return NextResponse.json({
      name: user?.name ?? "O'quvchi",
      email: user?.email ?? "",
      honorific,
      guardianShareCode: user?.guardianShareCode ?? "",
      reminderEnabled: user?.profile?.reminderEnabled ?? true,
      reminderTime: user?.profile?.reminderTime ?? "19:00",
      dailyGoalMinutes: user?.profile?.dailyGoalMinutes ?? 60,
      reduceMotion: user?.profile?.reduceMotion ?? false,
      theme: user?.profile?.theme ?? "dark",
    });
  } catch {
    return NextResponse.json(
      { error: "Sozlamalarni yuklashda xatolik" },
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

    const body = await request.json();
    const parsed = reminderSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Noto'g'ri ma'lumot formati", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    const gender = user?.profile?.gender === "FEMALE" ? "FEMALE" : "MALE";
    const honorific = gender === "FEMALE" ? "Malikam" : "Shag'zodam";

    if (user?.profile) {
      await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          ...(data.reminderEnabled !== undefined && {
            reminderEnabled: data.reminderEnabled,
          }),
          ...(data.reminderTime !== undefined && {
            reminderTime: data.reminderTime,
          }),
          ...(data.reduceMotion !== undefined && {
            reduceMotion: data.reduceMotion,
          }),
          ...(data.theme !== undefined && { theme: data.theme }),
        },
      });
    }

    const activeTime = data.reminderTime ?? user?.profile?.reminderTime ?? "19:00";
    const dailyMinutes = user?.profile?.dailyGoalMinutes ?? 60;

    return NextResponse.json({
      saved: true,
      reminderEnabled: data.reminderEnabled ?? user?.profile?.reminderEnabled ?? true,
      reminderTime: activeTime,
      notificationPreview: data.triggerTestNotification
        ? {
            titleUz: `🔔 3Talab Kunlik O'qish Eslatmasi (${activeTime})`,
            bodyUz: `${honorific} (${user?.name ?? "O'quvchi"}), bugungi ${dailyMinutes} daqiqalik SAT & IELTS mashg'ulotingiz vaqti keldi! Kunlik Streak zanjirini davom ettiramizmi?`,
            channels: ["Web Push Bildirishnoma", `Email (${user?.email ?? "oquvchi@3talab.uz"})`],
          }
        : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Sozlamalarni saqlashda xatolik" },
      { status: 500 }
    );
  }
}
