import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const registerSchema = z.object({
  firstName: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lsin").max(60),
  lastName: z.string().max(60).optional(),
  email: z.string().email("Email to'g'ri kiritilsin").max(120),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lsin").max(128),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  age: z.number().min(10).max(90).optional(),
  target: z.string().max(40).optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(1).max(128),
});

const publicUser = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  gender: true,
  age: true,
  target: true,
  preferredTitle: true,
  currentLevel: true,
  xp: true,
  focusMode: true,
  softConfirm: true,
} as const;

const GENDER_TITLES: Record<string, string> = {
  FEMALE: "Malikam",
  MALE: "Shag'zodam",
};

function defaultTitle(gender: string): string | null {
  return GENDER_TITLES[gender] ?? null;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const email = normalizeEmail(data.email);

    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return res.status(400).json({ message: "Bu email bilan hisob mavjud" });
    }

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || null,
        email,
        password: await hashPassword(data.password),
        gender: data.gender,
        age: data.age ?? null,
        target: data.target?.trim() || null,
        preferredTitle: defaultTitle(data.gender),
      },
      select: publicUser,
    });

    const token = signToken({
      userId: user.id,
      role: "STUDENT",
      pwdAt: Math.floor(Date.now() / 1000),
    });
    res.status(201).json({ user, token });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.errors[0]?.message || "Ma'lumot noto'g'ri"
        : "Ro'yxatdan o'tishda xatolik";
    res.status(400).json({ message });
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const email = normalizeEmail(data.email);

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
    }

    const valid = await comparePassword(data.password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      pwdAt: user.passwordChangedAt
        ? Math.floor(user.passwordChangedAt.getTime() / 1000)
        : undefined,
    });

    const { password: _password, role: _role, createdAt: _c, updatedAt: _u, ...rest } =
      user;

    res.json({ user: rest, token });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.errors[0]?.message || "Ma'lumot noto'g'ri"
        : "Kirishda xatolik";
    res.status(400).json({ message });
  }
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUser,
  });
  if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

  res.json(user);
});
