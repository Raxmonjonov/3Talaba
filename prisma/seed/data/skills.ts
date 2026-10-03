import type { SeedSkill } from '../types';

/**
 * Skill taxonomiyasi. Har bir skill `slug` orqali chaqiriladi —
 * savollar (`questions-*.ts`) va darslar shu kalitga bog'lanadi.
 */
export const SKILLS: SeedSkill[] = [
  // ── SAT ────────────────────────────────────────────────────────────────
  { slug: 'sat-math', subject: 'SAT', name: ['SAT Matematika', 'SAT Math'] },
  { slug: 'sat-algebra', subject: 'SAT', name: ['SAT Algebra', 'SAT Algebra'], parent: 'sat-math' },
  { slug: 'sat-advanced', subject: 'SAT', name: ['Advanced Math', 'Advanced Math'], parent: 'sat-math' },
  { slug: 'sat-data', subject: 'SAT', name: ['Data Analysis', 'Data Analysis'], parent: 'sat-math' },
  { slug: 'sat-rw', subject: 'SAT', name: ['SAT Reading & Writing', 'SAT Reading & Writing'] },
  { slug: 'sat-reading', subject: 'SAT', name: ['Reading', 'Reading'], parent: 'sat-rw' },
  { slug: 'sat-writing', subject: 'SAT', name: ['Writing', 'Writing'], parent: 'sat-rw' },
  { slug: 'sat-vocab', subject: 'SAT', name: ['Vocab & Context', 'Vocab & Context'], parent: 'sat-rw' },

  // ── IELTS ──────────────────────────────────────────────────────────────
  { slug: 'ielts-listening', subject: 'IELTS', name: ['IELTS Listening', 'IELTS Listening'] },
  { slug: 'ielts-reading', subject: 'IELTS', name: ['IELTS Reading', 'IELTS Reading'] },
  { slug: 'ielts-writing', subject: 'IELTS', name: ['IELTS Writing', 'IELTS Writing'] },
  { slug: 'ielts-speaking', subject: 'IELTS', name: ['IELTS Speaking', 'IELTS Speaking'] },

  // ── Academic English ───────────────────────────────────────────────────
  { slug: 'academic-grammar', subject: 'ACADEMIC_ENGLISH', name: ['Akademik grammatika', 'Academic Grammar'] },
  { slug: 'academic-vocabulary', subject: 'ACADEMIC_ENGLISH', name: ['Akademik lug‘at', 'Academic Vocabulary'] },
  { slug: 'academic-reading-style', subject: 'ACADEMIC_ENGLISH', name: ['Academic reading uslubi', 'Academic Reading Style'] },

  // ── Matematika ────────────────────────────────────────────────────────
  { slug: 'math-arithmetic', subject: 'MATHEMATICS', name: ['Arifmetika', 'Arithmetic'] },
  { slug: 'math-algebra', subject: 'MATHEMATICS', name: ['Algebra', 'Algebra'] },
  { slug: 'math-geometry', subject: 'MATHEMATICS', name: ['Geometriya', 'Geometry'] },
  { slug: 'math-probability', subject: 'MATHEMATICS', name: ['Ehtimollik va statistika', 'Probability & Statistics'] },
  { slug: 'math-word-problems', subject: 'MATHEMATICS', name: ['Matnli masalalar', 'Word Problems'] },

  // ── Mantiq ─────────────────────────────────────────────────────────────
  { slug: 'logic-basics', subject: 'LOGIC', name: ['Mantiq asoslari', 'Logic Basics'] },
  { slug: 'logic-patterns', subject: 'LOGIC', name: ['Ketma-ketliklar va naqshlar', 'Sequences & Patterns'], parent: 'logic-basics' },
  { slug: 'logic-conditional', subject: 'LOGIC', name: ['Shartli xulosalar', 'Conditional Reasoning'], parent: 'logic-basics' },

  // ── Yozma ish ──────────────────────────────────────────────────────────
  { slug: 'essay-structure', subject: 'WRITING', name: ['Essay tuzilmasi', 'Essay Structure'] },
  { slug: 'essay-argumentation', subject: 'WRITING', name: ['Argumentatsiya', 'Argumentation'] },

  // ── Ariza ──────────────────────────────────────────────────────────────
  { slug: 'common-app', subject: 'APPLICATIONS', name: ['Common App', 'Common App'] },
  { slug: 'ucas-statement', subject: 'APPLICATIONS', name: ['UCAS personal statement', 'UCAS Personal Statement'] },
  { slug: 'cover-letter', subject: 'APPLICATIONS', name: ['Cover letter', 'Cover Letter'] },
  { slug: 'interview', subject: 'APPLICATIONS', name: ['Suhbat (interview)', 'Interview'] },
];