import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { getHonorificTitle } from "@/lib/validations/auth";

const updateProfileSchema = z.object({
  reduceMotion: z.boolean().optional(),
  theme: z.enum(["dark", "light"]).optional(),
  dailyGoalMinutes: z.number().int().min(15).max(600).optional(),
  gender: z.enum(["FEMALE", "MALE"]).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id.startsWith("serverless-")) {
      return NextResponse.json({
        id: session?.user?.id ?? "guest-user",
        name: session?.user?.name ?? "Bo'lajak Talaba",
        email: session?.user?.email ?? "talaba@3talaba.uz",
        phone: null,
        role: "STUDENT",
        guardianShareCode: "3TALABA-DEMO",
        honorific: session?.user?.name?.split(" ")[0] || "Bo'lajak Talaba",
        profile: {
          gender: "MALE",
          targetUniversity: "Top 100 Grant Universitetlari",
          targetSatScore: 1500,
          targetIeltsScore: 7.5,
          dailyGoalMinutes: 60,
          xpTotal: 200,
          levelNumber: 2,
          theme: "dark",
          reduceMotion: false,
        },
        streak: {
          currentStreak: 3,
          longestStreak: 5,
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        streak: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      guardianShareCode: user.guardianShareCode,
      honorific: getHonorificTitle(user.profile?.gender),
      profile: user.profile,
      streak: user.streak,
    });
  } catch {
    return NextResponse.json({
      id: "guest-user",
      name: "Bo'lajak Talaba",
      email: "talaba@3talaba.uz",
      role: "STUDENT",
      honorific: "Bo'lajak Talaba",
      profile: {
        theme: "dark",
        reduceMotion: false,
        dailyGoalMinutes: 60,
        xpTotal: 200,
      },
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Sozlamalar noto'g'ri" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id.startsWith("serverless-")) {
      return NextResponse.json({ profile: parsed.data, savedLocally: true });
    }

    const updated = await prisma.profile.update({
      where: { userId: session.user.id },
      data: parsed.data,
    });

    return NextResponse.json({ profile: updated });
  } catch {
    return NextResponse.json({ savedLocally: true });
  }
}
