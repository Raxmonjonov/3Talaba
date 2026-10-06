import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";

const router = Router();

const settingsSchema = z.object({
  preferredTitle: z.string().max(40).optional().nullable(),
  focusMode: z.boolean().optional(),
  softConfirm: z.boolean().optional(),
  currentLevel: z.number().int().min(0).max(10).optional(),
});

router.get("/me", requireAuth, async (req, res) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      gender: true,
      age: true,
      target: true,
      preferredTitle: true,
      currentLevel: true,
      focusMode: true,
      softConfirm: true,
      locale: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
  res.json({ user });
});

router.patch("/settings", requireAuth, async (req, res) => {
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
        ...(data.currentLevel !== undefined
          ? { currentLevel: data.currentLevel }
          : {}),
      },
      select: {
        id: true,
        preferredTitle: true,
        focusMode: true,
        softConfirm: true,
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

export default router;