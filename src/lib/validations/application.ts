import { z } from "zod";

export const applicationSubmitSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ismingiz kamida 2 ta harfdan iborat bo'lishi kerak")
    .max(120, "Ism juda uzun"),
  phone: z
    .string()
    .trim()
    .min(7, "Telefon raqamini to'liq kiriting")
    .max(30, "Telefon raqami noto'g'ri")
    .refine(
      (val) => val.replace(/\D/g, "").length >= 7,
      "Telefon raqamida kamida 7 ta raqam bo'lishi kerak",
    ),
  universityRank: z.number().int().min(1).max(300),
  gradeId: z.string().min(1).max(40),
  directionId: z.string().min(1).max(60),
  completedModules: z.number().int().min(0).max(20).optional().default(0),
  currentModuleIndex: z.number().int().min(0).max(20).optional().default(0),
  questionsAsked: z.number().int().min(0).max(200).optional().default(0),
  finishTodayLesson: z.boolean().optional().default(true),
});

export const lessonProgressPatchSchema = z.object({
  currentModuleIndex: z.number().int().min(0).max(20),
  completedModules: z.number().int().min(0).max(20),
  finishTodayLesson: z.boolean().optional().default(false),
  questionsAsked: z.number().int().min(0).max(200).optional().default(0),
});

export type ApplicationSubmitInput = z.infer<typeof applicationSubmitSchema>;
