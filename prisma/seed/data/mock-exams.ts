import type { SeedMockExam } from '../types';

/**
 * Namuna imtihonlar.
 *
 * Har bir bo'lim `skill` + `count` orqali bog'lanadi; `count` o'sha skill'dagi
 * savollar sonidan ko'p bo'lmasligi kerak (seed'da tekshiriladi).
 * Savol tanlash `prisma/seed.ts` ichida skill bo'yicha deterministik tartibda
 * amalga oshiriladi, shuning uchun har urinishda bir xil bo'lim to'ldiriladi.
 */
export const MOCK_EXAMS: SeedMockExam[] = [
  {
    slug: 'sat-full-mock-1',
    exam: 'SAT',
    title: ['SAT to‘liq namuna 1', 'SAT Full Mock 1'],
    description: [
      'To‘liq SAT imtihoni tuzilishi: 2 ta matematika bo‘limi va 2 ta o‘qish-yozish bo‘limi.',
      'Full SAT structure: two math sections and two reading and writing sections.',
    ],
    durationMin: 145,
    sections: [
      { title: ['Matematika — mos emas', 'Math — No Calculator'], skill: 'sat-algebra', count: 10, points: 10 },
      { title: ['Matematika — kalkulyator', 'Math — Calculator'], skill: 'sat-data', count: 10, points: 10 },
      { title: ['O‘qish', 'Reading'], skill: 'sat-reading', count: 12, points: 12 },
      { title: ['Lug‘at va grammatika', 'Vocabulary and Grammar'], skill: 'sat-vocab', count: 8, points: 8 },
    ],
  },
  {
    slug: 'sat-full-mock-2',
    exam: 'SAT',
    title: ['SAT to‘liq namuna 2', 'SAT Full Mock 2'],
    description: [
      'Ikkinchi to‘liq namuna — mustaqil ishlash uchun, qiyinroq bo‘limlar bilan.',
      'A second full mock for independent practice, built from the harder items.',
    ],
    durationMin: 145,
    sections: [
      { title: ['Matematika — mos emas', 'Math — No Calculator'], skill: 'sat-advanced', count: 8, points: 8 },
      { title: ['Matematika — kalkulyator', 'Math — Calculator'], skill: 'sat-algebra', count: 10, points: 10 },
      { title: ['O‘qish va yozish', 'Reading and Writing'], skill: 'sat-writing', count: 8, points: 8 },
      { title: ['Lug‘at', 'Vocabulary'], skill: 'sat-vocab', count: 8, points: 8 },
    ],
  },
  {
    slug: 'ielts-academic-mock-1',
    exam: 'IELTS',
    title: ['IELTS Academic namuna 1', 'IELTS Academic Mock 1'],
    description: [
      'Academic format: 4 ta listening bo‘limi, reading, Task 1 va Task 2.',
      'Academic format: listening, reading, Task 1 and Task 2.',
    ],
    durationMin: 155,
    sections: [
      { title: ['Listening', 'Listening'], skill: 'ielts-listening', count: 8, points: 8 },
      { title: ['Reading', 'Reading'], skill: 'ielts-reading', count: 8, points: 8 },
      { title: ['Writing Task 1', 'Writing Task 1'], skill: 'ielts-writing', count: 5, points: 5 },
      { title: ['Writing Task 2', 'Writing Task 2'], skill: 'ielts-writing', count: 3, points: 3 },
    ],
  },
  {
    slug: 'ielts-academic-mock-2',
    exam: 'IELTS',
    title: ['IELTS Academic namuna 2', 'IELTS Academic Mock 2'],
    description: [
      'Ikkinchi Academic namuna, speaking baholash bilan.',
      'A second Academic mock, including speaking assessment.',
    ],
    durationMin: 165,
    sections: [
      { title: ['Listening', 'Listening'], skill: 'ielts-listening', count: 8, points: 8 },
      { title: ['Reading', 'Reading'], skill: 'ielts-reading', count: 8, points: 8 },
      { title: ['Writing', 'Writing'], skill: 'ielts-writing', count: 8, points: 8 },
      { title: ['Speaking', 'Speaking'], skill: 'ielts-speaking', count: 8, points: 8 },
    ],
  },
  {
    slug: 'academic-english-mock-1',
    exam: 'ACADEMIC_ENGLISH',
    title: ['Akademik ingliz tili namuna', 'Academic English Mock'],
    description: [
      'Grammatika, lug‘at va o‘qish uslubini birga tekshiruvchi test.',
      'A combined test of grammar, vocabulary and reading style.',
    ],
    durationMin: 60,
    sections: [
      { title: ['Grammatika', 'Grammar'], skill: 'academic-grammar', count: 12, points: 12 },
      { title: ['Lug‘at', 'Vocabulary'], skill: 'academic-vocabulary', count: 12, points: 12 },
      { title: ['O‘qish uslubi', 'Reading Style'], skill: 'academic-reading-style', count: 7, points: 7 },
    ],
  },
];