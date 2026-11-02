import {
  PLACEMENT_QUESTION_BANK,
  type PlacementQuestionItem,
  type SkillLevelCode,
} from "@/lib/curriculum/placement-engine";

export type DiagnosticLevelId = "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";
export type DiagnosticGoalId = "SAT_1450" | "IELTS_75" | "COMPLEX";
export type DiagnosticCategoryId =
  | "algebra-geometry"
  | "sat-math"
  | "english-rw";
export type DiagnosticAnswerOption = "A" | "B" | "C" | "D";

export interface DiagnosticLevelOption {
  id: DiagnosticLevelId;
  label: string;
  shortLabel: string;
  description: string;
  startingDifficulty: 1 | 2 | 3 | 4;
}

export interface DiagnosticGoalOption {
  id: DiagnosticGoalId;
  label: string;
  shortLabel: string;
  description: string;
  targetSat: number;
  targetIelts: number;
}

export interface DiagnosticQuestion extends PlacementQuestionItem {
  categoryId: DiagnosticCategoryId;
  categoryLabel: string;
}

export interface DiagnosticAnswerRecord {
  question: DiagnosticQuestion;
  selected: DiagnosticAnswerOption | null;
  timeSpentSec: number;
}

export interface DiagnosticCategoryScore {
  id: DiagnosticCategoryId;
  label: string;
  shortLabel: string;
  correctCount: number;
  totalCount: number;
  percent: number;
  level: SkillLevelCode;
}

export interface RoadmapQuarter {
  quarter: string;
  months: string;
  title: string;
  focus: string;
  actions: string[];
  milestone: string;
  targetPercent: number;
}

export interface DiagnosticResult {
  levelId: DiagnosticLevelId;
  goalId: DiagnosticGoalId;
  overallPercent: number;
  correctCount: number;
  totalCount: number;
  mathPercent: number;
  englishPercent: number;
  estimatedMathSat: number;
  estimatedIelts: number;
  cefr: string;
  overallLevel: SkillLevelCode;
  categories: DiagnosticCategoryScore[];
  strengths: string[];
  weaknesses: string[];
  roadmap: RoadmapQuarter[];
}

export interface StoredDiagnosticAnswer {
  questionId: string;
  subjectSlug: string;
  difficulty: number;
  selected: DiagnosticAnswerOption | null;
  isCorrect: boolean;
  timeSpentSec: number;
}

export interface StoredDiagnosticResult {
  version: 1;
  completedAt: string;
  result: DiagnosticResult;
  answers: StoredDiagnosticAnswer[];
}

export const DIAGNOSTIC_STORAGE_KEY = "3talab_diagnostic_result_v1";
export const DIAGNOSTIC_QUESTION_COUNT = 6;

export const DIAGNOSTIC_LEVELS: DiagnosticLevelOption[] = [
  {
    id: "FOUNDATION",
    label: "Boshlang'ich (Foundation)",
    shortLabel: "Foundation",
    description:
      "Asoslarni mustahkamlashdan boshlaymiz. Savollar sodda tayanch tushunchalarga qaratiladi.",
    startingDifficulty: 2,
  },
  {
    id: "INTERMEDIATE",
    label: "O'rta (Intermediate)",
    shortLabel: "Intermediate",
    description:
      "Tayanchingiz bor. Imtihon darajasidagi savollar va strategiyalarni sinab ko'ramiz.",
    startingDifficulty: 3,
  },
  {
    id: "ADVANCED",
    label: "Yuqori (Advanced)",
    shortLabel: "Advanced",
    description:
      "Maqsad 1500+ SAT va 8.0+ IELTS. Eng qiyin tuzoqlar bilan darajangizni aniqlaymiz.",
    startingDifficulty: 4,
  },
];

export const DIAGNOSTIC_GOALS: DiagnosticGoalOption[] = [
  {
    id: "SAT_1450",
    label: "SAT 1450+",
    shortLabel: "SAT",
    description:
      "Digital SAT Math va Reading & Writing bo'yicha 1450+ ball uchun tizimli tayyorgarlik.",
    targetSat: 1450,
    targetIelts: 7.0,
  },
  {
    id: "IELTS_75",
    label: "IELTS 7.5+",
    shortLabel: "IELTS",
    description:
      "IELTS Academic Writing, Reading, Listening va Speaking bo'yicha Band 7.5+ maqsadi.",
    targetSat: 1300,
    targetIelts: 7.5,
  },
  {
    id: "COMPLEX",
    label: "Kompleks (SAT + IELTS + Grant)",
    shortLabel: "Kompleks",
    description:
      "SAT, IELTS va xorijiy universitet granti uchun uch yo'nalishli kuchli portfolio.",
    targetSat: 1450,
    targetIelts: 7.5,
  },
];

const CATEGORY_META: Record<
  DiagnosticCategoryId,
  { label: string; shortLabel: string }
> = {
  "algebra-geometry": {
    label: "Algebra & Geometriya",
    shortLabel: "Algebra",
  },
  "sat-math": {
    label: "Digital SAT Math",
    shortLabel: "SAT Math",
  },
  "english-rw": {
    label: "IELTS / SAT English R&W",
    shortLabel: "English R&W",
  },
};

function categoryForQuestion(
  question: PlacementQuestionItem
): DiagnosticCategoryId {
  if (question.subjectSlug === "foundation-math") return "algebra-geometry";
  if (question.subjectSlug === "sat-math") return "sat-math";
  return "english-rw";
}

function withCategory(question: PlacementQuestionItem): DiagnosticQuestion {
  const categoryId = categoryForQuestion(question);
  return {
    ...question,
    categoryId,
    categoryLabel: CATEGORY_META[categoryId].label,
  };
}

function pickClosest(
  subjectSlug: PlacementQuestionItem["subjectSlug"],
  count: number,
  targetDifficulty: number
): PlacementQuestionItem[] {
  return PLACEMENT_QUESTION_BANK.filter(
    (question) => question.subjectSlug === subjectSlug
  )
    .slice()
    .sort(
      (a, b) =>
        Math.abs(a.difficulty - targetDifficulty) -
        Math.abs(b.difficulty - targetDifficulty)
    )
    .slice(0, count);
}

/**
 * 6 ta savol: 2 ta algebra/geometriya, 2 ta Digital SAT Math,
 * 2 ta IELTS/SAT English R&W. Savollar tanlangan darajaga mos qiyinlikda olinadi.
 */
export function selectDiagnosticQuestions(
  levelId: DiagnosticLevelId
): DiagnosticQuestion[] {
  const level = DIAGNOSTIC_LEVELS.find((item) => item.id === levelId);
  const startingDifficulty = level?.startingDifficulty ?? 3;

  const algebra = pickClosest("foundation-math", 2, startingDifficulty);
  const satMath = pickClosest("sat-math", 2, startingDifficulty);
  const satReading = pickClosest("sat-rw", 1, startingDifficulty);
  const ielts = pickClosest("ielts", 1, startingDifficulty);

  const ordered: PlacementQuestionItem[] = [
    algebra[0],
    satMath[0],
    ielts[0],
    algebra[1],
    satMath[1],
    satReading[0],
  ].filter((question): question is PlacementQuestionItem => Boolean(question));

  return ordered.slice(0, DIAGNOSTIC_QUESTION_COUNT).map(withCategory);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function percentFromLevel(percent: number): SkillLevelCode {
  if (percent < 32) return "ZERO";
  if (percent < 58) return "BEGINNER";
  if (percent < 82) return "INTERMEDIATE";
  return "ADVANCED";
}

function weightedPercent(records: DiagnosticAnswerRecord[]): number {
  if (records.length === 0) return 0;
  const maximum = records.reduce(
    (total, record) => total + record.question.difficulty,
    0
  );
  if (maximum === 0) return 0;
  const earned = records.reduce(
    (total, record) =>
      total +
      (record.selected === record.question.correctAnswer
        ? record.question.difficulty
        : 0),
    0
  );
  return Math.round((earned / maximum) * 100);
}

function cefrFromPercent(percent: number): string {
  if (percent >= 88) return "C1";
  if (percent >= 70) return "B2";
  if (percent >= 50) return "B1";
  if (percent >= 30) return "A2";
  return "A1";
}

function goalById(goalId: DiagnosticGoalId): DiagnosticGoalOption {
  return (
    DIAGNOSTIC_GOALS.find((goal) => goal.id === goalId) ?? DIAGNOSTIC_GOALS[0]
  );
}

function buildRoadmap(
  categories: DiagnosticCategoryScore[],
  goalId: DiagnosticGoalId,
  mathPercent: number,
  englishPercent: number
): RoadmapQuarter[] {
  const goal = goalById(goalId);
  const sorted = categories.slice().sort((a, b) => a.percent - b.percent);
  const weakest = sorted[0] ?? categories[0];
  const middle = sorted[1] ?? weakest;
  const strongest = sorted[2] ?? middle;

  const firstTarget = Math.min(100, weakest.percent + 24);
  const secondTarget = Math.min(100, middle.percent + 24);
  const thirdTarget = Math.min(100, Math.round((mathPercent + englishPercent) / 2) + 18);

  const quarterOneActions = [
    `${weakest.label} bo'yicha 20 ta mikro-darsni ketma-ket o'tish`,
    "Har kuni 25 daqiqa Talaba AI bilan Sokratik mashq qilish",
    "Xatolar daftarini yuritish va har hafta xatolar naqshini tahlil qilish",
  ];

  const quarterTwoActions = [
    `${middle.label} bo'yicha imtihon formatidagi 30 ta mashq`,
    goalId === "IELTS_75"
      ? "Haftada 2 marta Writing Task 1/2 va Speaking mock topshirish"
      : "Haftada 2 marta Digital SAT Math va R&W bo'limlarini alohida mashq qilish",
    "Vaqt boshqaruvi: har bir savol uchun maqsadli soniya belgilash",
  ];

  const quarterThreeActions = [
    "Har 2 haftada bitta to'liq mok imtihon topshirish",
    "Har bir mokdan keyin xatolar tahlilini AI Murabbiy bilan muhokama qilish",
    `${strongest.label} bo'yicha natijani 85%+ darajada ushlab turish`,
  ];

  const quarterFourActions =
    goalId === "SAT_1450"
      ? [
          "Haftada 2 marta to'liq Digital SAT mok: Math + R&W",
          "Eng qiyin savollar banki va vaqt bosimi ostida mashq",
          `Maqsad: SAT ${goal.targetSat}+ ball`,
        ]
      : goalId === "IELTS_75"
        ? [
            "Haftada 2 marta to'liq IELTS mok: Listening, Reading, Writing, Speaking",
            "Writing va Speaking javoblarini Band 8.0 mezonlari bo'yicha tekshirish",
            `Maqsad: IELTS ${goal.targetIelts.toFixed(1)}+ band`,
          ]
        : [
            "SAT va IELTS moklarini parallel rejimda topshirish",
            "Personal Statement va grant motivatsion xatini AI bilan sayqallash",
            `Maqsad: SAT ${goal.targetSat}+ va IELTS ${goal.targetIelts.toFixed(1)}+`,
          ];

  return [
    {
      quarter: "1-chorak",
      months: "1–3 oy",
      title: `Poydevor: ${weakest.label}`,
      focus: "Bo'shliqlarni yopish va asosiy qoidalarni mustahkamlash",
      actions: quarterOneActions,
      milestone: `${weakest.label} bo'yicha ${firstTarget}% natijaga chiqish`,
      targetPercent: firstTarget,
    },
    {
      quarter: "2-chorak",
      months: "4–6 oy",
      title: `Imtihon texnikasi: ${middle.label}`,
      focus: "Format bilan tanishish va strategik mashqlar",
      actions: quarterTwoActions,
      milestone: `${middle.label} bo'yicha ${secondTarget}% natijaga chiqish`,
      targetPercent: secondTarget,
    },
    {
      quarter: "3-chorak",
      months: "7–9 oy",
      title: "Mok imtihonlar va vaqt boshqaruvi",
      focus: "To'liq imtihon sharoitida barqaror natijani shakllantirish",
      actions: quarterThreeActions,
      milestone: `Umumiy natijani ${thirdTarget}% dan yuqoriga ko'tarish`,
      targetPercent: thirdTarget,
    },
    {
      quarter: "4-chorak",
      months: "10–12 oy",
      title: `Maqsad sari sprint: ${goal.label}`,
      focus: "Yakuniy sayqal, moklar va ariza hujjatlari",
      actions: quarterFourActions,
      milestone: `${goal.label} maqsadiga erishish`,
      targetPercent: 100,
    },
  ];
}

export function createDiagnosticResult(
  levelId: DiagnosticLevelId,
  goalId: DiagnosticGoalId,
  answers: DiagnosticAnswerRecord[]
): DiagnosticResult {
  const categoryIds: DiagnosticCategoryId[] = [
    "algebra-geometry",
    "sat-math",
    "english-rw",
  ];

  const categories: DiagnosticCategoryScore[] = categoryIds.map((categoryId) => {
    const records = answers.filter(
      (record) => record.question.categoryId === categoryId
    );
    const correctCount = records.filter(
      (record) => record.selected === record.question.correctAnswer
    ).length;
    const percent = weightedPercent(records);
    return {
      id: categoryId,
      label: CATEGORY_META[categoryId].label,
      shortLabel: CATEGORY_META[categoryId].shortLabel,
      correctCount,
      totalCount: records.length,
      percent,
      level: percentFromLevel(percent),
    };
  });

  const mathRecords = answers.filter(
    (record) =>
      record.question.categoryId === "algebra-geometry" ||
      record.question.categoryId === "sat-math"
  );
  const englishRecords = answers.filter(
    (record) => record.question.categoryId === "english-rw"
  );

  const mathPercent = weightedPercent(mathRecords);
  const englishPercent = weightedPercent(englishRecords);
  const overallPercent = weightedPercent(answers);
  const correctCount = answers.filter(
    (record) => record.selected === record.question.correctAnswer
  ).length;

  const estimatedMathSat =
    Math.round(clamp(380 + mathPercent * 4.2, 380, 800) / 10) * 10;
  const estimatedIelts = Number(
    clamp(4.0 + englishPercent * 0.045, 4.0, 8.5).toFixed(1)
  );
  const cefr = cefrFromPercent(englishPercent);

  const strengths = categories
    .filter((category) => category.percent >= 60)
    .map((category) => `${category.label} (${category.percent}%)`);
  const weaknesses = categories
    .filter((category) => category.percent < 60)
    .map((category) => `${category.label} (${category.percent}%)`);

  if (strengths.length === 0) {
    strengths.push("O'rganishga bo'lgan kuchli ishtiyoq va mantiqiy tafakkur");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Murakkab imtihon vaqt boshqaruvi (Time Management)");
  }

  return {
    levelId,
    goalId,
    overallPercent,
    correctCount,
    totalCount: answers.length,
    mathPercent,
    englishPercent,
    estimatedMathSat,
    estimatedIelts,
    cefr,
    overallLevel: percentFromLevel(overallPercent),
    categories,
    strengths,
    weaknesses,
    roadmap: buildRoadmap(categories, goalId, mathPercent, englishPercent),
  };
}

export function goalByIdSafe(goalId: DiagnosticGoalId): DiagnosticGoalOption {
  return goalById(goalId);
}

export function saveDiagnosticResult(
  result: DiagnosticResult,
  answers: DiagnosticAnswerRecord[]
): StoredDiagnosticResult | null {
  if (typeof window === "undefined") return null;

  const stored: StoredDiagnosticResult = {
    version: 1,
    completedAt: new Date().toISOString(),
    result,
    answers: answers.map((record) => ({
      questionId: record.question.id,
      subjectSlug: record.question.subjectSlug,
      difficulty: record.question.difficulty,
      selected: record.selected,
      isCorrect: record.selected === record.question.correctAnswer,
      timeSpentSec: Math.round(record.timeSpentSec),
    })),
  };

  try {
    window.localStorage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify(stored));
    return stored;
  } catch {
    return null;
  }
}

export function loadDiagnosticResult(): StoredDiagnosticResult | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDiagnosticResult>;
    if (parsed.version !== 1 || !parsed.result) return null;
    return parsed as StoredDiagnosticResult;
  } catch {
    return null;
  }
}
