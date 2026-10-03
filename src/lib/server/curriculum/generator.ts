import type { ExamType } from '@prisma/client';

import {
  LEVEL_THRESHOLDS,
  planModeForLevel,
  type PlanMode,
} from '@/lib/server/placement/adaptive';

/**
 * 12 oylik o'quv rejasi generatori.
 *
 * **Nima uchun deterministik (AI'siz):** reja — bu moliyaviy hisob-kitob
 * emas, balki takrorlanadigan va tekshirilishi mumkin bo'lgan joylashuv. Bir xil
 * kiritma har doim bir xil reja berishi kerak (testda ham, foydalanuvchi
 * "rejimni o‘zgartir" tugmasini bosganda ham). Shuning uchun barcha qarorlar
 * `hashString` bilan seeded, tashqi holatga bog‘liq emas.
 *
 * Faqat **kontent tanlovi** (dars sarlavhalari, AI ustozga murojaat matnlari)
 * generatsiya qilinadi — ular `[locale]` kaliti bilan keladi va DB'dan olinadi.
 */

export type LessonRef = {
  id: string;
  subject: string;
  levelRange: [number, number];
  estMinutes: number;
  skillIds: string[];
  storyAct: number;
  titleUz: string;
  titleEn: string;
};

export type MockExamRef = {
  id: string;
  exam: ExamType;
  titleUz: string;
  titleEn: string;
};

export type GeneratorInput = {
  level: number;
  targetExam: ExamType;
  targetScore: number | null;
  startDate: Date;
  totalWeeks: number;
  /** Haftaning qaysi kunlari o'qiladi (0 = yakshanba) */
  studyDays: number[];
  /** Zaif skilllar — reja ularga ustuvorlik beradi */
  weakSkills: { skillId: string; theta: number }[];
  lessons: LessonRef[];
  mockExams: MockExamRef[];
};

export type PhaseName = 'FOUNDATION' | 'BUILD' | 'STRENGTHEN' | 'SPRINT' | 'MOCKS' | 'FINAL';

export type GeneratedBlock = {
  blockType: 'LEARN' | 'PRACTICE' | 'TUTOR_CHAT' | 'QUIZ' | 'MOCK' | 'REVIEW';
  plannedMinutes: number;
  lessonId: string | null;
  mockExamId: string | null;
  titleUz: string;
  titleEn: string;
};

export type GeneratedDay = {
  dayIndex: number;
  date: Date;
  targetMinutes: number;
  isStudyDay: boolean;
  blocks: GeneratedBlock[];
};

export type GeneratedWeek = {
  index: number;
  phase: PhaseName;
  isRestWeek: boolean;
  goalUz: string;
  goalEn: string;
  focusSkillIds: string[];
  mockExamId: string | null;
  days: GeneratedDay[];
};

export type GeneratedPlan = {
  mode: PlanMode;
  daysPerWeek: number;
  minutesPerDay: number;
  blockMinutes: number;
  weeks: GeneratedWeek[];
  titleUz: string;
  titleEn: string;
};

/** Rejim bo'yicha kunlik parametrlar (talab: daraja 0 — 7×45, daraja 1–5 — 4×4 soat). */
export const MODE_PARAMS: Record<
  PlanMode,
  { daysPerWeek: number; minutesPerDay: number; blockMinutes: number }
> = {
  STARTER: { daysPerWeek: 7, minutesPerDay: 45, blockMinutes: 15 },
  STANDARD: { daysPerWeek: 4, minutesPerDay: 240, blockMinutes: 60 },
  INTENSIVE: { daysPerWeek: 4, minutesPerDay: 240, blockMinutes: 60 },
};

/** Zaif skill chegarasi — shundan past bo'lsa, "rivojlanmoqda" hisoblanadi. */
export const WEAK_SKILL_THRESHOLD = 0.2;

/** 52 haftaning fazalari. */
export const PHASE_RANGES: { phase: PhaseName; from: number; to: number }[] = [
  { phase: 'FOUNDATION', from: 1, to: 4 },
  { phase: 'BUILD', from: 5, to: 16 },
  { phase: 'STRENGTHEN', from: 17, to: 32 },
  { phase: 'SPRINT', from: 33, to: 44 },
  { phase: 'MOCKS', from: 45, to: 50 },
  { phase: 'FINAL', from: 51, to: 52 },
];

/** Har 8-haftada bitta "yengil hafta" — jazolamasdan, faqat yukni kamaytiradi. */
export function isRestWeek(index: number): boolean {
  return index % 8 === 0 && index > 4;
}

export function phaseForWeek(index: number): PhaseName {
  const found = PHASE_RANGES.find((range) => index >= range.from && index <= range.to);
  return found?.phase ?? 'BUILD';
}

/** Sakkiz haftada kamida bir marta har bir dars qaytadi (spaced repetition). */
export function repetitionIntervalDays(): number {
  return 56;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function hash(input: string): number {
  let value = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/**
 * Darslarni o'quvchi darajasiga va zaif mavzulariga qarab tartiblaydi.
 * Natijada har bir skill kamida bir marta reja ichida uchraydi.
 */
export function prioritizeLessons(
  lessons: readonly LessonRef[],
  level: number,
  weakSkillIds: readonly string[],
): LessonRef[] {
  const weak = new Set(weakSkillIds);

  return [...lessons].sort((a, b) => {
    const weakScore = scoreWeak(b, weak) - scoreWeak(a, weak);
    if (weakScore !== 0) return weakScore;

    const levelScore = levelDistance(a.levelRange, level) - levelDistance(b.levelRange, level);
    if (levelScore !== 0) return levelScore;

    return a.storyAct - b.storyAct;
  });
}

function scoreWeak(lesson: LessonRef, weak: ReadonlySet<string>): number {
  if (lesson.skillIds.length === 0) return 0;
  const hits = lesson.skillIds.filter((id) => weak.has(id)).length;
  return (hits / lesson.skillIds.length) * 10;
}

function levelDistance(range: [number, number], level: number): number {
  const [min, max] = range;
  if (level < min) return min - level;
  if (level > max) return level - max;
  return 0;
}

/** Fan bo'yicha darslarni ajratish — reja sarlavhasi va haftalik maqsad uchun. */
function subjectMatches(lesson: LessonRef, targetExam: ExamType): boolean {
  if (targetExam === 'SAT') {
    return ['SAT', 'MATHEMATICS', 'LOGIC', 'WRITING', 'APPLICATIONS', 'ACADEMIC_ENGLISH'].includes(
      lesson.subject,
    );
  }
  if (targetExam === 'IELTS') {
    return ['IELTS', 'ACADEMIC_ENGLISH', 'WRITING', 'MATHEMATICS'].includes(lesson.subject);
  }
  return ['ACADEMIC_ENGLISH', 'WRITING', 'APPLICATIONS'].includes(lesson.subject);
}

const PHASE_LABEL: Record<PhaseName, { uz: string; en: string }> = {
  FOUNDATION: { uz: 'Poydevor', en: 'Foundation' },
  BUILD: { uz: 'O‘sish', en: 'Build' },
  STRENGTHEN: { uz: 'Mustahkamlash', en: 'Strengthen' },
  SPRINT: { uz: 'Tezkorish', en: 'Sprint' },
  MOCKS: { uz: 'Mock imtihonlar', en: 'Mock exams' },
  FINAL: { uz: 'Yakun', en: 'Final stretch' },
};

export function generatePlan(input: GeneratorInput): GeneratedPlan {
  const level = clampLevel(input.level);
  const mode = planModeForLevel(level);
  const params = MODE_PARAMS[mode];

  const start = startOfUtcDay(input.startDate);
  const weakSkillIds = input.weakSkills.filter((s) => s.theta < WEAK_SKILL_THRESHOLD).map((s) => s.skillId);

  const pool = prioritizeLessons(
    input.lessons.filter((lesson) => subjectMatches(lesson, input.targetExam)),
    level,
    weakSkillIds,
  );

  // Zaif mavzularga bag‘ishlangan darslar — har 3-kunda bir marta takrorlanadi
  const weakLessons = pool.filter((lesson) =>
    lesson.skillIds.some((id) => weakSkillIds.includes(id)),
  );
  const regularLessons = pool.filter((lesson) => !weakLessons.includes(lesson));

  const allLessons = pool.length > 0 ? pool : input.lessons;
  const regular = regularLessons.length > 0 ? regularLessons : allLessons;
  const weak = weakLessons.length > 0 ? weakLessons : regular;

  const mocksForExam =
    input.mockExams.filter((mock) => mock.exam === input.targetExam) || input.mockExams;

  let regularCursor = 0;
  let weakCursor = 0;
  let globalDayCounter = 0;

  const weeks: GeneratedWeek[] = [];

  for (let weekIndex = 1; weekIndex <= input.totalWeeks; weekIndex += 1) {
    const phase = phaseForWeek(weekIndex);
    const rest = isRestWeek(weekIndex);
    const weekStart = addDays(start, (weekIndex - 1) * 7);

    const effectiveDays = rest
      ? Math.max(2, Math.min(params.daysPerWeek, 2))
      : params.daysPerWeek;

    const weekDays = sortStudyDays(input.studyDays).slice(0, effectiveDays);

    const isMockWeek = phase === 'MOCKS' || phase === 'FINAL';
    const mockExam = isMockWeek
      ? mocksForExam.length > 0
        ? mocksForExam[hash(`mock-${weekIndex}`) % mocksForExam.length] ?? null
        : null
      : null;

    const focusSkillIds = pickFocusSkills(weakSkillIds, allLessons, weekIndex, phase);

    const days: GeneratedDay[] = [];
    for (const dayIndex of weekDays) {
      const date = addDays(weekStart, dayIndex);

      const lesson = chooseLesson({
        globalDayCounter,
        weekIndex,
        regular,
        weak,
        regularCursor,
        weakCursor,
      });

      if (lesson === 'increment') {
        weakCursor += 1;
        regularCursor += 1;
      }

      const blocks = buildDayBlocks({
        mode,
        blockMinutes: params.blockMinutes,
        minutesPerDay: params.minutesPerDay,
        lesson,
        isMockDay: mockExam !== null && dayIndex === weekDays[weekDays.length - 1],
        mockExam,
        weekIndex,
      });

      days.push({
        dayIndex,
        date,
        targetMinutes: params.minutesPerDay,
        isStudyDay: true,
        blocks,
      });

      globalDayCounter += 1;
    }

    // Dam olish kunlari ham rejada ko'rinadi (jinni yo'qotmaydi)
    for (const dayIndex of [0, 1, 2, 3, 4, 5, 6]) {
      if (days.some((day) => day.dayIndex === dayIndex)) continue;
      days.push({
        dayIndex,
        date: addDays(weekStart, dayIndex),
        targetMinutes: 0,
        isStudyDay: false,
        blocks: [],
      });
    }

    days.sort((a, b) => a.dayIndex - b.dayIndex);

    weeks.push({
      index: weekIndex,
      phase,
      isRestWeek: rest,
      goalUz: buildGoalUz(phase, rest, focusSkillIds, allLessons, level),
      goalEn: buildGoalEn(phase, rest, allLessons, level),
      focusSkillIds,
      mockExamId: mockExam?.id ?? null,
      days,
    });
  }

  return {
    mode,
    daysPerWeek: params.daysPerWeek,
    minutesPerDay: params.minutesPerDay,
    blockMinutes: params.blockMinutes,
    weeks,
    titleUz: buildTitleUz(level, input.targetExam, start),
    titleEn: `12-month ${input.targetExam} plan · level ${level}`,
  };
}

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  return Math.min(5, Math.max(0, Math.round(level)));
}

/** Standart: dushanba, chorshanba, juma, shanba (0 = yakshanba). */
export function defaultStudyDays(level: number): number[] {
  return level <= 0 ? [0, 1, 2, 3, 4, 5, 6] : [1, 3, 5, 6];
}

function sortStudyDays(days: readonly number[]): number[] {
  const unique = [...new Set(days.map((d) => Math.min(6, Math.max(0, d))))].sort((a, b) => a - b);
  return unique.length > 0 ? unique : [1, 3, 5, 6];
}

type ChooseArgs = {
  globalDayCounter: number;
  weekIndex: number;
  regular: readonly LessonRef[];
  weak: readonly LessonRef[];
  regularCursor: number;
  weakCursor: number;
};

/**
 * Har 3-oqim kunda zaif mavzu darslari, qolganida — oddiy navbat.
 * Bu "har dars bir marta, keyin takrorlanadi" tamoyilini buzmaydi, lekin
 * zaif mavzularni har haftada kamida bir marta ko'rsatadi.
 */
function chooseLesson(args: ChooseArgs): LessonRef | 'increment' {
  const { globalDayCounter, regular, weak } = args;
  if (regular.length === 0 && weak.length === 0) return 'increment';

  const useWeak = weak.length > 0 && globalDayCounter % 3 === 0;
  const list = useWeak ? weak : regular.length > 0 ? regular : weak;
  const cursor = useWeak ? args.weakCursor : args.regularCursor;

  return list[cursor % list.length] as LessonRef;
}

function buildDayBlocks(args: {
  mode: PlanMode;
  blockMinutes: number;
  minutesPerDay: number;
  lesson: LessonRef | 'increment';
  isMockDay: boolean;
  mockExam: MockExamRef | null;
  weekIndex: number;
}): GeneratedBlock[] {
  const { mode, blockMinutes, minutesPerDay, lesson, isMockDay, mockExam, weekIndex } = args;
  const lessonId = lesson === 'increment' ? null : lesson.id;
  const titleUz = lesson === 'increment' ? 'Erkin o‘qish' : lesson.titleUz;
  const titleEn = lesson === 'increment' ? 'Free study' : lesson.titleEn;

  if (mode === 'STARTER') {
    return [
      {
        blockType: 'LEARN',
        plannedMinutes: blockMinutes,
        lessonId,
        mockExamId: null,
        titleUz: `Yangi mavzu: ${titleUz}`,
        titleEn: `New topic: ${titleEn}`,
      },
      {
        blockType: 'PRACTICE',
        plannedMinutes: blockMinutes,
        lessonId,
        mockExamId: null,
        titleUz: 'Oddiy mashq',
        titleEn: 'Simple practice',
      },
      {
        blockType: 'REVIEW',
        plannedMinutes: blockMinutes,
        lessonId,
        mockExamId: null,
        titleUz: 'Avvalgi kunlarni takrorlash',
        titleEn: 'Repeat previous days',
      },
    ];
  }

  const blocks: GeneratedBlock[] = [
    {
      blockType: 'LEARN',
      plannedMinutes: blockMinutes,
      lessonId,
      mockExamId: null,
      titleUz: `Dars: ${titleUz}`,
      titleEn: `Lesson: ${titleEn}`,
    },
    {
      blockType: 'PRACTICE',
      plannedMinutes: blockMinutes,
      lessonId,
      mockExamId: null,
      titleUz: 'Mashq va misollar',
      titleEn: 'Drill and examples',
    },
    {
      blockType: 'TUTOR_CHAT',
      plannedMinutes: blockMinutes,
      lessonId,
      mockExamId: null,
      titleUz: 'AI ustoz bilan suhbat',
      titleEn: 'Chat with the AI tutor',
    },
  ];

  if (isMockDay && mockExam) {
    blocks.push({
      blockType: 'MOCK',
      plannedMinutes: blockMinutes,
      lessonId,
      mockExamId: mockExam.id,
      titleUz: `Mock imtihon: ${mockExam.titleUz}`,
      titleEn: `Mock exam: ${mockExam.titleEn}`,
    });
  } else if (weekIndex % 4 === 0) {
    blocks.push({
      blockType: 'REVIEW',
      plannedMinutes: blockMinutes,
      lessonId,
      mockExamId: null,
      titleUz: 'Xatolar va kartochkalarni takrorlash',
      titleEn: 'Review mistakes and cards',
    });
  } else {
    blocks.push({
      blockType: 'QUIZ',
      plannedMinutes: blockMinutes,
      lessonId,
      mockExamId: null,
      titleUz: 'Mini-quiz',
      titleEn: 'Mini-quiz',
    });
  }

  // Rejimga qarab kunlik vaqtni to'liq ishlatish
  const used = blocks.reduce((sum, block) => sum + block.plannedMinutes, 0);
  if (used < minutesPerDay) {
    const last = blocks[blocks.length - 1];
    if (last) last.plannedMinutes += minutesPerDay - used;
  }

  return blocks;
}

function pickFocusSkills(
  weakSkillIds: readonly string[],
  lessons: readonly LessonRef[],
  weekIndex: number,
  phase: PhaseName,
): string[] {
  if (weakSkillIds.length === 0) {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const lesson of lessons) {
      for (const skillId of lesson.skillIds) {
        if (!seen.has(skillId)) {
          seen.add(skillId);
          result.push(skillId);
        }
        if (result.length >= 3) return result;
      }
    }
    return result;
  }

  const count = phase === 'FOUNDATION' ? 2 : 3;
  const offset = (weekIndex * count) % weakSkillIds.length;
  return Array.from({ length: Math.min(count, weakSkillIds.length) }, (_, i) => {
    return weakSkillIds[(offset + i) % weakSkillIds.length] as string;
  });
}

function buildGoalUz(
  phase: PhaseName,
  rest: boolean,
  focusSkillIds: readonly string[],
  lessons: readonly LessonRef[],
  level: number,
): string {
  if (rest) return 'Yengil hafta: faqat takrorlash va dam olish. Orqaga qaytmaydi.';

  const label = PHASE_LABEL[phase].uz;
  const weakCount = focusSkillIds.length;

  switch (phase) {
    case 'FOUNDATION':
      return `${label} fazasi: asosiy tushunchalarni mustahkamlash.${weakCount > 0 ? ' Zaif mavzularga ustuvorlik.' : ''}`;
    case 'BUILD':
      return `${label} fazasi: yangi mavzular + har kuni mashq.`;
    case 'STRENGTHEN':
      return `${label} fazasi: xatolarni kamaytirish, mustaqil ishlash.`;
    case 'SPRINT':
      return `${label} fazasi: tezlik va aniqlik. Vaqtni to‘g‘ri taqsimlash.`;
    case 'MOCKS':
      return `${label} fazasi: haftalik mock imtihonlar va tahlil.`;
    case 'FINAL':
      return `${label}: imtihonga tayyorlik, faqat ishonchli takrorlash.`;
    default:
      return lessons.length > 0 ? `${label} fazasi (daraja ${level}).` : `${label} fazasi.`;
  }
}

function buildGoalEn(phase: PhaseName, rest: boolean, lessons: readonly LessonRef[], level: number): string {
  if (rest) return 'Light week: revision and rest only. You will not lose ground.';
  const label = PHASE_LABEL[phase].en;
  switch (phase) {
    case 'FOUNDATION':
      return `${label}: solidify the core concepts.`;
    case 'BUILD':
      return `${label}: new topics plus daily practice.`;
    case 'STRENGTHEN':
      return `${label}: reduce mistakes, work independently.`;
    case 'SPRINT':
      return `${label}: speed and accuracy, smart time allocation.`;
    case 'MOCKS':
      return `${label}: weekly mock exams and analysis.`;
    case 'FINAL':
      return `${label}: exam readiness, confident revision only.`;
    default:
      return lessons.length > 0 ? `${label} phase (level ${level}).` : `${label} phase.`;
  }
}

function buildTitleUz(level: number, exam: ExamType, start: Date): string {
  const year = start.getUTCFullYear();
  const monthUz = [
    'yanvar',
    'fevral',
    'mart',
    'aprel',
    'may',
    'iyun',
    'iyul',
    'avgust',
    'sentabr',
    'oktabr',
    'noyabr',
    'dekabr',
  ][start.getUTCMonth()];
  const examName = exam === 'IELTS' ? 'IELTS' : exam === 'SAT' ? 'SAT' : 'Academic English';
  return `${examName} — 12 oylik reja (daraja ${level}, ${monthUz} ${year})`;
}

/** Reja oxirini hisoblash (start + 52 hafta). */
export function planEndDate(startDate: Date, totalWeeks: number): Date {
  return addDays(startOfUtcDay(startDate), totalWeeks * 7);
}

export { LEVEL_THRESHOLDS };