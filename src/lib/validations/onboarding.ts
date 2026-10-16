import { z } from "zod";

export const LEVEL_LABELS: Record<
  "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  { uz: string; badge: string; desc: string }
> = {
  ZERO: {
    uz: "Noldan (Fundamental)",
    badge: "0-bosqich • Noldan",
    desc: "Hech qanday xavotirga o'rin yo'q! Eng sodda tushunchalar, kasrlar va ingliz tili alifbosi/asoslaridan boshlaymiz.",
  },
  BEGINNER: {
    uz: "Boshlang'ich",
    badge: "1-bosqich • Boshlang'ich",
    desc: "Tayanch bilimlaringiz bor. Endi tizimli grammatika, algebra va matn tahlilini mustahkamlaymiz.",
  },
  INTERMEDIATE: {
    uz: "O'rta (Mustahkam)",
    badge: "2-bosqich • O'rta",
    desc: "Yaxshi poydevorga egasiz! Asosiy e'tiborni SAT/IELTS strategiyalari va murakkab masalalarga qaratamiz.",
  },
  ADVANCED: {
    uz: "Yuqori (Ilg'or)",
    badge: "3-bosqich • Yuqori",
    desc: "Ajoyib natija! Maqsadimiz — 1500+ SAT va 8.0+ IELTS uchun eng qiyin tuzoqlarni zabt etish.",
  },
};

export const onboardingSchema = z.object({
  targetUniversity: z
    .string()
    .trim()
    .min(2, "Maqsadli universitet yoki yo'nalishni kiriting")
    .max(120),
  targetCountry: z
    .string()
    .trim()
    .min(2, "Maqsadli mamlakatni tanlang")
    .max(80),
  targetSatScore: z.coerce.number().int().min(1000).max(1600),
  targetIeltsScore: z.coerce.number().min(5.0).max(9.0),
  selfAssessedLevel: z.enum(["ZERO", "BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  strongSubjects: z.array(z.string()).default([]),
  weakSubjects: z.array(z.string()).default([]),
  learningStyle: z.enum([
    "VISUAL_PRACTICE",
    "SOCRATIC_CHAT",
    "DEEP_THEORY",
    "POMODORO_SPRINT",
  ]),
  preferredStudyTime: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
});

export const placementSubmissionSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        subjectSlug: z.string(),
        difficulty: z.number().int().min(1).max(4),
        givenAnswer: z.string(),
        timeSpentSec: z.number().int().min(0).max(600).default(15),
      }),
    )
    .min(1, "Kamida bitta savolga javob berilishi kerak"),
  speakingComfort: z.enum(["SHY", "MODERATE", "CONFIDENT"]).default("MODERATE"),
  writingExperience: z.enum(["NONE", "PARAGRAPHS", "FULL_ESSAYS"]).default("PARAGRAPHS"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type PlacementSubmissionInput = z.infer<typeof placementSubmissionSchema>;
