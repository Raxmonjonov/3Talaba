import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, getHonorificTitle } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rate = checkRateLimit(`register:${ip}`, 10, 60_000);

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Juda ko'p urinish. Iltimos, ${rate.retryAfterSec} soniyadan so'ng qayta urinib ko'ring.`,
        },
        { status: 429 },
      );
    }

    const body: unknown = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Ma'lumotlar to'g'ri kiritilmadi" },
        { status: 400 },
      );
    }

    const { name, gender, age, grade, region, email, phone, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email manzili bilan allaqachon ro'yxatdan o'tilgan" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const todayKey = new Date().toISOString().slice(0, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "STUDENT",
        profile: {
          create: {
            gender,
            age,
            grade,
            region,
            xpTotal: 50, // Ro'yxatdan o'tgani uchun birinchi rag'batlantiruvchi XP
            levelNumber: 1,
          },
        },
        streak: {
          create: {
            currentStreak: 1,
            longestStreak: 1,
            lastActiveDate: todayKey,
            HistoryJson: JSON.stringify([todayKey]),
          },
        },
        xpEvents: {
          create: {
            amount: 50,
            reason: "FIRST_STEP_REGISTER",
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          gender,
          honorific: getHonorificTitle(gender),
        },
        message: `Xush kelibsiz, ${getHonorificTitle(gender)}! Sizga dastlabki +50 XP taqdim etildi.`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[register] Ro'yxatdan o'tishda xatolik:", error);
    return NextResponse.json(
      { error: "Serverda kutilmagan xatolik yuz berdi. Qayta urinib ko'ring." },
      { status: 500 },
    );
  }
}
