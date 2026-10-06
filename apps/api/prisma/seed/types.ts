/**
 * Seed ma'lumotlari uchun umumiy tiplar.
 *
 * Matnlar `{ uz, en }` ko'rinishida saqlanadi (baza `Json` maydoni).
 * Kompakt yozuv shakli — seed fayli keng bo'lib ketmasligi uchun
 * qisqartirilgan maydon nomlari ishlatilgan (`p` = prompt, `o` = options).
 */

export type L10n = { uz: string; en: string };

export type SeedQuestionType =
  | 'MCQ_SINGLE'
  | 'MCQ_MULTI'
  | 'NUMERIC'
  | 'SHORT_TEXT'
  | 'ORDERING'
  | 'MATCHING';

export type SeedOption = {
  label: L10n;
  correct?: boolean;
  /** SHORT_TEXT uchun tolerant solishtirish */
  accepts?: string[];
  explanation?: L10n;
};

export type SeedQuestion = {
  skill: string;
  type: SeedQuestionType;
  /** [uz, en] */
  p: [string, string];
  /** difficulty: -3 (eng oson) … +3 (eng qiyin) */
  d: number;
  /** o'qish uchun asosiy matn (passage) */
  passage?: [string, string];
  options?: SeedOption[];
  sec?: number;
  source?: string;
};

export type SeedBlock = {
  kind: 'STORY' | 'EXPLAIN' | 'EXAMPLE' | 'DRILL' | 'AI_CHAT' | 'QUIZ' | 'ERROR_REVIEW' | 'BREAK';
  title: [string, string];
  minMinutes: number;
  content: L10n;
  /** DRILL/QUIZ bloklari uchun savol skill'leri */
  skills?: string[];
};

export type SeedLesson = {
  slug: string;
  title: [string, string];
  summary: [string, string];
  objectives: [string, string][];
  storyAct: number;
  storyTitle?: [string, string];
  levelRange: string;
  estMinutes: number;
  xpReward: number;
  skills: string[];
  blocks: SeedBlock[];
};

export type SeedModule = {
  slug: string;
  title: [string, string];
  description: [string, string];
  levelRange: string;
  lessons: SeedLesson[];
};

export type SeedCourse = {
  slug: string;
  subject: string;
  title: [string, string];
  description: [string, string];
  modules: SeedModule[];
};

export type SeedSkill = {
  slug: string;
  subject: string;
  name: [string, string];
  parent?: string;
};

export type SeedMockExam = {
  slug: string;
  exam: 'SAT' | 'IELTS' | 'ACADEMIC_ENGLISH';
  title: [string, string];
  description: [string, string];
  durationMin: number;
  /** [skillSlug, savol soni, ball] */
  sections: { title: [string, string]; skill: string; count: number; points: number }[];
};