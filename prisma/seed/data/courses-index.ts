import type { SeedCourse } from '../types';

import { SAT_COURSE } from './courses/sat';
import { IELTS_COURSE } from './courses/ielts';
import { ACADEMIC_ENGLISH_COURSE } from './courses/academic-english';
import { MATHEMATICS_COURSE } from './courses/mathematics';
import { LOGIC_COURSE } from './courses/logic';
import { WRITING_COURSE } from './courses/writing';
import { APPLICATIONS_COURSE } from './courses/applications';

/** Barcha kurslar — `prisma/seed.ts` shuni import qiladi. */
export const ALL_COURSES: SeedCourse[] = [
  SAT_COURSE,
  IELTS_COURSE,
  ACADEMIC_ENGLISH_COURSE,
  MATHEMATICS_COURSE,
  LOGIC_COURSE,
  WRITING_COURSE,
  APPLICATIONS_COURSE,
];

export type { SeedCourse };