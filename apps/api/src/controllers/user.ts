import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import {
  listAchievements,
  type AchievementLocale,
} from "../services/achievements.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const settingsSchema = z.object({
  preferredTitle: z.string().max(40).optional().nullable(),
  focusMode: z.boolean().optional(),
  softConfirm: z.boolean().optional(),
  dailyGoalMinutes: z.number().int().min(5).max(240).optional(),
});

const profileSchema = z.object({
  firstName: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lsin").max(60).optional(),
  lastName: z.string().max(60).optional().nullable(),
  email: z.string().email("Email to'g'ri kiritilsin").max(120).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  age: z.number().min(10).max(90).optional().nullable(),
  target: z.string().max(40).optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(6, "Yangi parol kamida 6 ta belgidan iborat bo'lsin").max(128),
});

const localeSchema = z.enum(["uz", "en", "ru"]);

const publicUserSelect = {
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
  dailyGoalMinutes: true,
} as const;

/** Full medal catalog with this student's earned timestamps. */
export const getAchievements = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const parsed = localeSchema.safeParse(String(req.query.locale ?? ""));
    const locale: AchievementLocale = parsed.success ? parsed.data : "uz";
    res.json(await listAchievements(userId, locale));
  } catch {
    res.status(500).json({ message: "Yutuqlar yuklanmadi" });
  }
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const data = settingsSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.preferredTitle !== undefined
          ? { preferredTitle: data.preferredTitle }
          : {}),
        ...(data.focusMode !== undefined ? { focusMode: data.focusMode } : {}),
        ...(data.softConfirm !== undefined
          ? { softConfirm: data.softConfirm }
          : {}),
        ...(data.dailyGoalMinutes !== undefined
          ? { dailyGoalMinutes: data.dailyGoalMinutes }
          : {}),
      },
      select: {
        id: true,
        preferredTitle: true,
        focusMode: true,
        softConfirm: true,
        dailyGoalMinutes: true,
        currentLevel: true,
      },
    });

    res.json(user);
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.errors[0]?.message || "Sozlama noto'g'ri"
        : "Sozlama saqlanmadi";
    res.status(400).json({ message });
  }
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const data = profileSchema.parse(req.body);

    let email: string | undefined;
    if (data.email) {
      email = normalizeEmail(data.email);
      const taken = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
        select: { id: true },
      });
      if (taken) {
        return res.status(400).json({ message: "Bu email bilan hisob mavjud" });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined ? { firstName: data.firstName.trim() } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName?.trim() || null } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.age !== undefined ? { age: data.age ?? null } : {}),
        ...(data.target !== undefined ? { target: data.target?.trim() || null } : {}),
      },
      select: publicUserSelect,
    });

    res.json(user);
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.errors[0]?.message || "Ma'lumot noto'g'ri"
        : "Profil saqlanmadi";
    res.status(400).json({ message });
  }
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const data = passwordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    const valid = await comparePassword(data.currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Joriy parol noto'g'ri" });
    }

    const now = new Date();
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: await hashPassword(data.newPassword),
        passwordChangedAt: now,
      },
    });

    // Issue a fresh token so the client is not locked out by revocation.
    const token = signToken({
      userId,
      role: user.role,
      pwdAt: Math.floor(now.getTime() / 1000),
    });

    res.json({ ok: true, token });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.errors[0]?.message || "Parol noto'g'ri"
        : "Parol o'zgartirilmadi";
    res.status(400).json({ message });
  }
});
