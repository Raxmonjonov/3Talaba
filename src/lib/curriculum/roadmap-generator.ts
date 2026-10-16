import type { SkillLevelCode } from "./placement-engine";

export interface DailyTimeBreakdown {
  totalMinutes: number;
  isCustomOverTwoHours: boolean;
  theoryMinutes: number;
  practiceMinutes: number;
  aiReviewMinutes: number;
  pomodoroSessions: number;
  restBreakMinutes: number;
  dailyQuestionCount: number;
  scheduleAdviceUz: string;
}

export interface GeneratedDayTask {
  monthNumber: number; // 1..12
  weekNumber: number;  // 1..48
  dayOfWeek: number;   // 1..6 (Dushanba..Shanba)
  dayNameUz: string;
  subjectSlug: string;
  subjectNameUz: string;
  lessonSlug: string;
  titleUz: string;
  descriptionUz: string;
  taskType: "LESSON" | "PRACTICE" | "REVIEW" | "MOCK_TEST" | "WRITING";
  durationMinutes: number;
  xpReward: number;
}

export interface MonthOverview {
  monthNumber: number;
  quarterTitleUz: string;
  titleUz: string;
  focusUz: string;
  milestoneTargetUz: string;
  totalHoursInMonth: number;
}

export interface GeneratedRoadmapPlan {
  dailyMinutes: number;
  startLevel: SkillLevelCode;
  targetSummary: string;
  annualStudyHours: number;
  timeBreakdown: DailyTimeBreakdown;
  months: MonthOverview[];
  items: GeneratedDayTask[];
}

const DAY_NAMES_UZ = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
] as const;

const MONTH_TEMPLATES: Array<{
  monthNumber: number;
  quarterTitleUz: string;
  titleUz: string;
  focusUz: string;
  milestoneTargetUz: string;
}> = [
  {
    monthNumber: 1,
    quarterTitleUz: "I Chorak: Mustahkam Poydevor",
    titleUz: "1-oy: Tayanch Tushunchalar va O'qish Odati",
    focusUz: "Kasrlar, foizlar, chiziqli tenglamalar hamda ingliz tili zamonlari va asosiy akademik lug'at.",
    milestoneTargetUz: "Kunlik ritmga kirish • Fundamental 100%",
  },
  {
    monthNumber: 2,
    quarterTitleUz: "I Chorak: Mustahkam Poydevor",
    titleUz: "2-oy: Algebra Asoslari va Reading Strategiyasi",
    focusUz: "Chiziqli funksiyalar, tengsizliklar, IELTS/SAT matnlarida asosiy g'oyani (Main Idea) tez topish.",
    milestoneTargetUz: "SAT Math 550+ • IELTS Reading 6.0",
  },
  {
    monthNumber: 3,
    quarterTitleUz: "I Chorak: Mustahkam Poydevor",
    titleUz: "3-oy: Grammatik Qoliplar va Paragraf Arxitekturasi",
    focusUz: "SAT Standard English Conventions, tinish belgilari va akademik paragraf (Topic Sentence) yozish.",
    milestoneTargetUz: "I Chorak sinovi • SAT 1150+ / IELTS 6.0+",
  },
  {
    monthNumber: 4,
    quarterTitleUz: "II Chorak: Strategiya va Tezlik",
    titleUz: "4-oy: Kvadratik Funksiyalar va IELTS Listening Tuzoqlari",
    focusUz: "Parabolalar, Viet teoremasi, diskriminant hamda IELTS Listening Part 3–4 chalg'ituvchi javoblari.",
    milestoneTargetUz: "SAT Math 620+ • Listening 6.5+",
  },
  {
    monthNumber: 5,
    quarterTitleUz: "II Chorak: Strategiya va Tezlik",
    titleUz: "5-oy: Ma'lumotlar Tahlili va IELTS Writing Task 1",
    focusUz: "Statistika, ehtimollik, grafik/jadval tahlili hamda IELTS Academic Writing Task 1 hisobotlari.",
    milestoneTargetUz: "Task 1 Band 7.0 • Data Analysis 85%",
  },
  {
    monthNumber: 6,
    quarterTitleUz: "II Chorak: Strategiya va Tezlik",
    titleUz: "6-oy: Mantiqiy Dalillar (Command of Evidence) va Speaking",
    focusUz: "SAT Reading ilmiy gipotezalar tahlili va IELTS Speaking Part 2–3 ravonlik mashqlari.",
    milestoneTargetUz: "Yarim yillik marra • SAT 1320+ / IELTS 6.5–7.0",
  },
  {
    monthNumber: 7,
    quarterTitleUz: "III Chorak: Chuqurlashtirilgan Mahorat",
    titleUz: "7-oy: Geometriya, Trigonometriya va IELTS Writing Task 2",
    focusUz: "Aylana tenglamasi, uchburchaklar, trigonometriya va 250 so'zli tahliliy insholar.",
    milestoneTargetUz: "SAT Math 700+ • Writing Task 2 Band 7.0+",
  },
  {
    monthNumber: 8,
    quarterTitleUz: "III Chorak: Chuqurlashtirilgan Mahorat",
    titleUz: "8-oy: Murakkab SAT Reading & Writing va C1 Leksika",
    focusUz: "Ilmiy va tarixiy murakkab matnlar, mantiqiy o'tishlar (Transitions) va akademik kollokatsiyalar.",
    milestoneTargetUz: "SAT R&W 680+ • IELTS Reading 7.5+",
  },
  {
    monthNumber: 9,
    quarterTitleUz: "III Chorak: Chuqurlashtirilgan Mahorat",
    titleUz: "9-oy: Personal Statement va Akademik Argumentatsiya",
    focusUz: "Xorijiy universitetlar uchun Motivation Letter / Common App Essay loyihasi va tahlili.",
    milestoneTargetUz: "Tayyor Personal Statement • SAT 1420+",
  },
  {
    monthNumber: 10,
    quarterTitleUz: "IV Chorak: Imtihon Simulyatsiyasi va Qabul",
    titleUz: "10-oy: Digital SAT & IELTS To'liq Mock Tahlillari",
    focusUz: "Vaqt boshqaruvi (Time Management), 2-modul qiyin savollari va xatolar ustida ishlash.",
    milestoneTargetUz: "SAT 1480+ • IELTS 7.5+",
  },
  {
    monthNumber: 11,
    quarterTitleUz: "IV Chorak: Imtihon Simulyatsiyasi va Qabul",
    titleUz: "11-oy: Eng Qiyin (Level 4) Masalalar va Speaking Simulyatsiya",
    focusUz: "SAT 750–800 darajadagi nostandart masalalar va AI murabbiy bilan to'liq Speaking intervyular.",
    milestoneTargetUz: "SAT 1520+ • IELTS 8.0",
  },
  {
    monthNumber: 12,
    quarterTitleUz: "IV Chorak: Imtihon Simulyatsiyasi va Qabul",
    titleUz: "12-oy: Yakuniy Marra, Grant Arizalari va Imtihon G'alabasi",
    focusUz: "Yengil takrorlash, psixologik tayyorgarlik, universitet hujjatlarini yakunlash va yuqori ball.",
    milestoneTargetUz: "Maqsadli Universitet Qabuli!",
  },
];

const SUBJECT_ROTATION = [
  {
    slug: "sat-math",
    nameUz: "SAT Matematika",
    lessonSlug: "sat-math-linear-equations",
    baseTitle: "Algebraik tenglamalar va funksiyalar tahlili",
  },
  {
    slug: "ielts",
    nameUz: "IELTS Academic",
    lessonSlug: "ielts-reading-paraphrasing",
    baseTitle: "Reading Paraphrasing va True/False/Not Given",
  },
  {
    slug: "sat-rw",
    nameUz: "SAT Reading & Writing",
    lessonSlug: "sat-rw-transitions-evidence",
    baseTitle: "Mantiqiy bog'lovchilar va ilmiy dalillar",
  },
  {
    slug: "foundation-math",
    nameUz: "Fundamental Matematika",
    lessonSlug: "foundation-math-ratios-percents",
    baseTitle: "Nisbat, proporsiya va foizli masalalar",
  },
  {
    slug: "academic-writing",
    nameUz: "Akademik Yozuv",
    lessonSlug: "academic-writing-thesis-essay",
    baseTitle: "Thesis Statement va IELTS/Admission Essay tuzilishi",
  },
];

/**
 * Kunlik tanlangan vaqt (standart <=120 daqiqa yoki qo'lda kiritilgan >120 daqiqa)
 * bo'yicha dars, mashq, AI tahlil va tanaffus taqsimotini hisoblaydi.
 */
export function calculateDailyTimeBreakdown(dailyMinutesInput: number): DailyTimeBreakdown {
  const totalMinutes = Math.max(15, Math.min(480, Math.round(dailyMinutesInput)));
  const isCustomOverTwoHours = totalMinutes > 120;

  const theoryMinutes = Math.round(totalMinutes * 0.3);
  const practiceMinutes = Math.round(totalMinutes * 0.48);
  const aiReviewMinutes = Math.max(5, totalMinutes - theoryMinutes - practiceMinutes);

  const pomodoroSessions = Math.max(1, Math.ceil(totalMinutes / 30));
  const restBreakMinutes = isCustomOverTwoHours
    ? pomodoroSessions * 7
    : Math.max(5, (pomodoroSessions - 1) * 5);

  const dailyQuestionCount = Math.max(6, Math.round(practiceMinutes / 2.2));

  const scheduleAdviceUz = isCustomOverTwoHours
    ? `Siz kuniga ${totalMinutes} daqiqa (${(totalMinutes / 60).toFixed(1)} soat — standart 2 soatdan ko'p) intensiv rejimni tanladingiz. Charchab qolmaslik uchun bu vaqtni 2 qismga (masalan, kunduzi ${Math.round(totalMinutes * 0.5)} daq va kechqurun ${Math.round(totalMinutes * 0.5)} daq) bo'lib, har 25–30 daqiqada ${restBreakMinutes} daqiqa dam olishingiz tavsiya etiladi.`
    : `Kuniga ${totalMinutes} daqiqa — barqaror va charchatmaydigan optimal me'yor. ${pomodoroSessions} ta fokus blokda nazariya, mashq va AI tahlilini bemalol ulgurasiz.`;

  return {
    totalMinutes,
    isCustomOverTwoHours,
    theoryMinutes,
    practiceMinutes,
    aiReviewMinutes,
    pomodoroSessions,
    restBreakMinutes,
    dailyQuestionCount,
    scheduleAdviceUz,
  };
}

/**
 * O'quvchining darajasi, maqsadi va kunlik vaqtiga asoslangan 12 oylik (48 hafta)
 * shaxsiy yo'l xaritasini generatsiya qiladi.
 */
export function generatePersonalizedRoadmap(params: {
  startLevel: SkillLevelCode;
  dailyMinutes: number;
  targetSatScore?: number | null;
  targetIeltsScore?: number | null;
  targetUniversity?: string | null;
  weakSubjects?: string[];
}): GeneratedRoadmapPlan {
  const timeBreakdown = calculateDailyTimeBreakdown(params.dailyMinutes);
  const dailyMinutes = timeBreakdown.totalMinutes;
  const satTarget = params.targetSatScore ?? 1480;
  const ieltsTarget = params.targetIeltsScore ?? 7.5;
  const uniTarget = params.targetUniversity ?? "Nufuzli Xorijiy Universitet";

  const targetSummary = `${uniTarget} • Maqsad: SAT ${satTarget}+ / IELTS ${ieltsTarget.toFixed(1)} • Kuniga ${dailyMinutes} daqiqa`;
  const annualStudyHours = Math.round((dailyMinutes * 6 * 48) / 60);

  const months: MonthOverview[] = MONTH_TEMPLATES.map((m) => ({
    ...m,
    totalHoursInMonth: Math.round((dailyMinutes * 6 * 4) / 60),
  }));

  // Zaif fanlarni ro'yxat boshiga chiqarish (ko'proq ustuvorlik berish uchun)
  const weakSet = new Set(params.weakSubjects ?? []);
  const orderedSubjects = [...SUBJECT_ROTATION].sort((a, b) => {
    const aWeak = weakSet.has(a.slug) ? -1 : 1;
    const bWeak = weakSet.has(b.slug) ? -1 : 1;
    return aWeak - bWeak;
  });

  const items: GeneratedDayTask[] = [];

  // 12 oy x 4 hafta = 48 hafta (o'quv barcha oylarni ko'ra olishi uchun har bir oyning 4 haftasi generatsiya qilinadi)
  for (let month = 1; month <= 12; month++) {
    const monthMeta = MONTH_TEMPLATES[month - 1];

    for (let weekInMonth = 1; weekInMonth <= 4; weekInMonth++) {
      const globalWeek = (month - 1) * 4 + weekInMonth;

      for (let day = 1; day <= 6; day++) {
        const subj = orderedSubjects[(globalWeek + day - 2) % orderedSubjects.length];
        const dayNameUz = DAY_NAMES_UZ[day - 1];

        let taskType: GeneratedDayTask["taskType"] = "LESSON";
        let taskPrefix = "Dars va Misol:";

        if (day === 2 || day === 4) {
          taskType = "PRACTICE";
          taskPrefix = `Adaptiv Mashq (${timeBreakdown.dailyQuestionCount} ta savol):`;
        } else if (day === 5) {
          taskType = "WRITING";
          taskPrefix = "AI Writing & Socratic Tahlil:";
        } else if (day === 6) {
          taskType = timeBreakdown.isCustomOverTwoHours ? "MOCK_TEST" : "REVIEW";
          taskPrefix = timeBreakdown.isCustomOverTwoHours
            ? "Intensiv Haftalik Sinov (Mock):"
            : "Haftalik Mustahkamlash:";
        }

        const xpReward = Math.round(30 + dailyMinutes * 0.45);

        items.push({
          monthNumber: month,
          weekNumber: globalWeek,
          dayOfWeek: day,
          dayNameUz,
          subjectSlug: subj.slug,
          subjectNameUz: subj.nameUz,
          lessonSlug: subj.lessonSlug,
          titleUz: `${taskPrefix} ${subj.nameUz} — ${subj.baseTitle}`,
          descriptionUz: `${monthMeta.titleUz} (${weekInMonth}-hafta, ${dayNameUz}): ${timeBreakdown.theoryMinutes} daq nazariya + ${timeBreakdown.practiceMinutes} daq amaliyot + ${timeBreakdown.aiReviewMinutes} daq AI murabbiy tahlili.`,
          taskType,
          durationMinutes: dailyMinutes,
          xpReward,
        });
      }
    }
  }

  return {
    dailyMinutes,
    startLevel: params.startLevel,
    targetSummary,
    annualStudyHours,
    timeBreakdown,
    months,
    items,
  };
}
