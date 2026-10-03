import type { SeedQuestion } from '../types';

import { SAT_QUESTIONS } from './questions-sat';
import { IELTS_QUESTIONS } from './questions-ielts';
import { ACADEMIC_QUESTIONS } from './questions-academic';
import { MATH_QUESTIONS } from './questions-math';
import { LOGIC_QUESTIONS } from './questions-logic';
import { WRITING_APPLICATION_QUESTIONS } from './questions-writing';
import { EXTRA_QUESTIONS } from './questions-extra';

/** Barcha savollar bitta ro'yxatda — `prisma/seed.ts` shuni import qiladi. */
export const ALL_QUESTIONS: SeedQuestion[] = [
  ...SAT_QUESTIONS,
  ...IELTS_QUESTIONS,
  ...ACADEMIC_QUESTIONS,
  ...MATH_QUESTIONS,
  ...LOGIC_QUESTIONS,
  ...WRITING_APPLICATION_QUESTIONS,
  ...EXTRA_QUESTIONS,
];

export type { SeedQuestion };