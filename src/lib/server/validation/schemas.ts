import { z } from 'zod';

/** Umumiy primitivlar — barcha sxemalar shularni ishlatadi. */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, 'Pochta juda qisqa')
  .max(254, 'Pochta juda uzun')
  .email('Pochta noto‘g‘ri');

export const cuidSchema = z.string().min(10).max(64).regex(/^[a-z0-9]+$/i, 'ID noto‘g‘ri');

export const localeSchema = z.enum(['uz', 'en']);

export const genderSchema = z.enum(['FEMALE', 'MALE', 'OTHER']);

export const examSchema = z.enum(['SAT', 'IELTS', 'ACADEMIC_ENGLISH', 'NONE']);

export const levelSchema = z.coerce.number().int().min(0).max(5);

export const addressFormSchema = z.enum(['FORMAL', 'WARM']);

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Sana YYYY-MM-DD ko‘rinishida bo‘lishi kerak');

/** 0–100 oralig'idagi foiz. */
export const percentSchema = z.coerce.number().min(0).max(100);

/** Erkin matn, uzunlik cheklovi bilan (AI prompt'ga uzatiladigan maydonlar uchun qisqa). */
export const shortTextSchema = (max = 500) => z.string().trim().max(max);

// ── Auth ────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: shortTextSchema(80).min(2, 'Ism juda qisqa'),
  email: emailSchema,
  password: z.string().min(8, 'Parol kamida 8 ta belgi').max(200),
  gender: genderSchema.optional(),
  birthDate: isoDateSchema.optional(),
  currentGrade: shortTextSchema(60).optional(),
  targetExam: examSchema.default('SAT'),
  targetScore: z.coerce.number().int().min(200).max(1600).optional(),
  targetCountries: z.array(shortTextSchema(60)).max(10).default([]),
  targetUni: shortTextSchema(120).optional(),
  motivation: shortTextSchema(1000).optional(),
  locale: localeSchema.default('uz'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Rozilik berish shart' }) }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10).max(200),
    password: z.string().min(8).max(200),
  })
  .refine((data) => data.password.length >= 8, { message: 'Parol kamida 8 ta belgi' });

// ── Placement ───────────────────────────────────────────────────────────────

export const placementStartSchema = z.object({
  /** Qayta boshlash uchun oldingi urinishni tashlash */
  restart: z.coerce.boolean().default(false),
});

export const placementAnswerSchema = z.object({
  attemptId: cuidSchema,
  questionId: cuidSchema,
  chosen: z.union([z.string(), z.array(z.string()), z.number()]),
  responseTimeMs: z.coerce.number().int().min(0).max(3_600_000).default(0),
});

export const placementFinishSchema = z.object({ attemptId: cuidSchema });

// ── Chat ────────────────────────────────────────────────────────────────────

export const chatMessageSchema = z.object({
  sessionId: cuidSchema.optional(),
  kind: z.enum(['LESSON', 'ONBOARDING', 'ERROR_REVIEW', 'MOCK_REVIEW', 'FREE_CHAT']),
  content: z.string().trim().min(1, 'Bo‘sh xabar').max(4000),
});

export const onboardingFinishSchema = z.object({});

// ── Sessiya ─────────────────────────────────────────────────────────────────

export const sessionStartSchema = z.object({
  lessonId: cuidSchema,
  plannedBlockId: cuidSchema.optional(),
  mode: z.enum(['STANDARD', 'SPRINT']).default('STANDARD'),
});

export const sessionTickSchema = z.object({
  sessionId: cuidSchema,
  /** Klient o'tgan vaqt (soniya) — server umumiy vaqtni o'zi ham hisoblaydi */
  deltaSec: z.coerce.number().int().min(0).max(3600).default(0),
});

export const sessionPauseSchema = z.object({ sessionId: cuidSchema });

export const sessionResumeSchema = z.object({ sessionId: cuidSchema });

export const sessionEndSchema = z.object({ sessionId: cuidSchema });

export const stepCompleteSchema = z.object({
  sessionId: cuidSchema,
  stepId: cuidSchema,
  result: z.record(z.unknown()).default({}),
});

// ── Quiz / xatolar ──────────────────────────────────────────────────────────

export const quizAnswerSchema = z.object({
  sessionId: cuidSchema,
  questionId: cuidSchema,
  chosen: z.union([z.string(), z.array(z.string()), z.number()]),
  confidence: z.coerce.number().int().min(0).max(3).default(1),
  reasonGuess: z.enum(['UNKNOWN', 'CARELESS', 'CONCEPT', 'TIME']).optional(),
});

export const reviewCardGradeSchema = z.object({
  cardId: cuidSchema,
  grade: z.coerce.number().int().min(0).max(5),
  elapsedMs: z.coerce.number().int().min(0).max(3_600_000).default(0),
});

// ── Reja ────────────────────────────────────────────────────────────────────

export const regeneratePlanSchema = z.object({
  reason: z.enum(['SICK', 'EXAM', 'TRAVEL', 'OTHER']),
  shiftDays: z.coerce.number().int().min(0).max(30).default(0),
  /** Rejani boshqarib turish vaqtini o'zgartirish */
  dailyGoalMinutes: z.coerce.number().int().min(15).max(480).optional(),
  studyDays: z.array(z.coerce.number().int().min(0).max(6)).min(1).max(7).optional(),
});

// ── Sozlamalar ──────────────────────────────────────────────────────────────

export const updatePreferencesSchema = z.object({
  nickname: shortTextSchema(40).nullable().optional(),
  nicknameEnabled: z.coerce.boolean().optional(),
  addressForm: addressFormSchema.optional(),
  soundEnabled: z.coerce.boolean().optional(),
  matrixIntroEnabled: z.coerce.boolean().optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
  reduceMotion: z.coerce.boolean().optional(),
  fontScale: z.coerce.number().min(0.9).max(1.3).optional(),
  dailyGoalMinutes: z.coerce.number().int().min(15).max(480).optional(),
  sessionBlockMinutes: z.coerce.number().int().min(5).max(120).optional(),
  breakMinutes: z.coerce.number().int().min(1).max(30).optional(),
  breakRemindersEnabled: z.coerce.boolean().optional(),
  bedtimeReminder: z.coerce.boolean().optional(),
  bedtimeReminderAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  leaderboardVisible: z.coerce.boolean().optional(),
  showScoreProjection: z.coerce.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: shortTextSchema(80).min(2).optional(),
  currentGrade: shortTextSchema(60).nullable().optional(),
  targetExam: examSchema.optional(),
  targetScore: z.coerce.number().int().min(200).max(1600).nullable().optional(),
  targetCountries: z.array(shortTextSchema(60)).max(10).optional(),
  targetUni: shortTextSchema(120).nullable().optional(),
  motivation: shortTextSchema(1000).nullable().optional(),
  timezone: z.string().min(3).max(64).optional(),
});

// ── Maxfiylik ───────────────────────────────────────────────────────────────

export const exportRequestSchema = z.object({ format: z.enum(['json']).default('json') });

export const deleteAccountSchema = z.object({
  confirm: z.literal('O‘CHIR', { errorMap: () => ({ message: '“O‘CHIR” deb yozing' }) }),
  reason: shortTextSchema(300).optional(),
});

export const guardianInviteSchema = z.object({
  guardianEmail: emailSchema,
  scope: z.enum(['PROGRESS_ONLY', 'FULL']).default('PROGRESS_ONLY'),
});

export const guardianRedeemSchema = z.object({ code: z.string().trim().min(6).max(20) });

// ── Admin ───────────────────────────────────────────────────────────────────

export const adminUserRoleSchema = z.object({
  userId: cuidSchema,
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
});

export const adminPromptSchema = z.object({
  key: z.string().trim().min(2).max(60),
  name: shortTextSchema(120),
  body: z.string().trim().min(20, 'Prompt juda qisqa').max(20_000),
  isActive: z.coerce.boolean().default(true),
});

export const adminQuestionSchema = z.object({
  id: cuidSchema.optional(),
  skillId: cuidSchema,
  type: z.enum([
    'MCQ_SINGLE',
    'MCQ_MULTI',
    'NUMERIC',
    'SHORT_TEXT',
    'ORDERING',
    'MATCHING',
    'ESSAY',
  ]),
  prompt: z.object({ uz: z.string().min(1), en: z.string().min(1) }),
  passage: z.object({ uz: z.string().optional(), en: z.string().optional() }).optional(),
  difficulty: z.coerce.number().min(-3).max(3),
  estimatedSeconds: z.coerce.number().int().min(10).max(900).default(60),
  isActive: z.coerce.boolean().default(true),
  options: z
    .array(
      z.object({
        label: z.object({ uz: z.string().min(1), en: z.string().min(1) }),
        isCorrect: z.coerce.boolean(),
        explanation: z.object({ uz: z.string().optional(), en: z.string().optional() }).optional(),
      }),
    )
    .max(10)
    .default([]),
});

export const adminStatsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});