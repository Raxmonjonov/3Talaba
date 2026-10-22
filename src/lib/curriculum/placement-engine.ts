export type SkillLevelCode = "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface PlacementQuestionItem {
  id: string;
  subjectSlug: "sat-math" | "sat-rw" | "ielts" | "foundation-math" | "academic-writing";
  subjectNameUz: string;
  topicTitleUz: string;
  difficulty: 1 | 2 | 3 | 4; // 1: Noldan, 2: Boshlang'ich, 3: O'rta, 4: Yuqori
  promptUz: string;
  passageUz?: string;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanationUz: string;
}

/**
 * 100% original yozilgan o'zbek tilidagi adaptiv saralash testi savollari (5 ta fan x 4 ta qiyinlik = 20 savol).
 */
export const PLACEMENT_QUESTION_BANK: PlacementQuestionItem[] = [
  // ── 1. FUNDAMENTAL MATEMATIKA (foundation-math) ────────────────────────────
  {
    id: "pm-fm-1",
    subjectSlug: "foundation-math",
    subjectNameUz: "Fundamental Matematika",
    topicTitleUz: "Kasrlar va foizlar asosi",
    difficulty: 1,
    promptUz: "Do'konda 80 000 so'mlik kitobga 25% chegirma e'lon qilindi. Kitobning yangi narxi qancha?",
    options: [
      { id: "A", text: "55 000 so'm" },
      { id: "B", text: "60 000 so'm" },
      { id: "C", text: "65 000 so'm" },
      { id: "D", text: "70 000 so'm" },
    ],
    correctAnswer: "B",
    explanationUz: "25% — bu to'rtdan bir qism (80 000 / 4 = 20 000 so'm chegirma). 80 000 - 20 000 = 60 000 so'm.",
  },
  {
    id: "pm-fm-2",
    subjectSlug: "foundation-math",
    subjectNameUz: "Fundamental Matematika",
    topicTitleUz: "Nisbat va proporsiya",
    difficulty: 2,
    promptUz: "Sinfdagi qizlar va o'g'il bolalar soni 3 : 2 nisbatda. Agar sinfda jami 30 nafar o'quvchi bo'lsa, qizlar nechta?",
    options: [
      { id: "A", text: "12 nafar" },
      { id: "B", text: "15 nafar" },
      { id: "C", text: "18 nafar" },
      { id: "D", text: "20 nafar" },
    ],
    correctAnswer: "C",
    explanationUz: "Jami bo'laklar soni 3 + 2 = 5 ta. Har bir bo'lak 30 / 5 = 6 nafarga teng. Qizlar: 3 * 6 = 18 nafar.",
  },
  {
    id: "pm-fm-3",
    subjectSlug: "foundation-math",
    subjectNameUz: "Fundamental Matematika",
    topicTitleUz: "Darajalar va ildizlar",
    difficulty: 3,
    promptUz: "Agar 2^(x + 1) = 32 bo'lsa, x ning kvadratini (x²) toping.",
    options: [
      { id: "A", text: "9" },
      { id: "B", text: "16" },
      { id: "C", text: "25" },
      { id: "D", text: "36" },
    ],
    correctAnswer: "B",
    explanationUz: "32 = 2^5 bo'lgani uchun x + 1 = 5, demak x = 4. Unda x² = 4² = 16.",
  },
  {
    id: "pm-fm-4",
    subjectSlug: "foundation-math",
    subjectNameUz: "Fundamental Matematika",
    topicTitleUz: "Mantiqiy ketma-ketlik va kombinatorika",
    difficulty: 4,
    promptUz: "5 nafar iqtidorli o'quvchidan 2 kishilik olimpiada jamoasini necha xil usulda tanlab olish mumkin?",
    options: [
      { id: "A", text: "10 xil" },
      { id: "B", text: "15 xil" },
      { id: "C", text: "20 xil" },
      { id: "D", text: "25 xil" },
    ],
    correctAnswer: "A",
    explanationUz: "Tartib muhim bo'lmagani uchun C(5, 2) = (5 * 4) / 2 = 10 xil usul.",
  },

  // ── 2. SAT MATEMATIKA (sat-math) ───────────────────────────────────────────
  {
    id: "pm-sm-1",
    subjectSlug: "sat-math",
    subjectNameUz: "SAT Matematika",
    topicTitleUz: "Chiziqli tenglamalar",
    difficulty: 1,
    promptUz: "Agar 4x - 5 = 19 bo'lsa, 2x + 3 ifodaning qiymati nechaga teng?",
    options: [
      { id: "A", text: "12" },
      { id: "B", text: "15" },
      { id: "C", text: "17" },
      { id: "D", text: "21" },
    ],
    correctAnswer: "B",
    explanationUz: "4x = 24 -> x = 6 (yoki ikkiga bo'lsak 2x = 12). Demak 2x + 3 = 12 + 3 = 15.",
  },
  {
    id: "pm-sm-2",
    subjectSlug: "sat-math",
    subjectNameUz: "SAT Matematika",
    topicTitleUz: "Chiziqli funksiyalar",
    difficulty: 2,
    promptUz: "f(x) = 3x + b chiziqli funksiya grafigi (2, 11) nuqtadan o'tadi. f(5) ning qiymatini toping.",
    options: [
      { id: "A", text: "18" },
      { id: "B", text: "20" },
      { id: "C", text: "22" },
      { id: "D", text: "25" },
    ],
    correctAnswer: "B",
    explanationUz: "11 = 3(2) + b -> b = 5. Demak f(x) = 3x + 5 va f(5) = 3(5) + 5 = 20.",
  },
  {
    id: "pm-sm-3",
    subjectSlug: "sat-math",
    subjectNameUz: "SAT Matematika",
    topicTitleUz: "Kvadrat tenglamalar va Viet teoremasi",
    difficulty: 3,
    promptUz: "x² - 9x + 14 = 0 tenglamaning ildizlari p va q bo'lsa, (p + 1)(q + 1) ko'paytmani toping.",
    options: [
      { id: "A", text: "22" },
      { id: "B", text: "24" },
      { id: "C", text: "26" },
      { id: "D", text: "28" },
    ],
    correctAnswer: "B",
    explanationUz: "(p + 1)(q + 1) = pq + (p + q) + 1. Viet teoremasiga ko'ra p + q = 9 va pq = 14. Jami: 14 + 9 + 1 = 24.",
  },
  {
    id: "pm-sm-4",
    subjectSlug: "sat-math",
    subjectNameUz: "SAT Matematika",
    topicTitleUz: "Aylana tenglamasi va geometriya",
    difficulty: 4,
    promptUz: "(x - 3)² + (y + 4)² = 25 aylana koordinata tekisligida berilgan. Aylana markazidan koordinata boshigacha (0, 0) bo'lgan masofa va radius yig'indisini toping.",
    options: [
      { id: "A", text: "8" },
      { id: "B", text: "10" },
      { id: "C", text: "12" },
      { id: "D", text: "15" },
    ],
    correctAnswer: "B",
    explanationUz: "Markaz (3, -4), uning (0,0) gacha masofasi √(3² + (-4)²) = 5. Radius ham √25 = 5. Yig'indi: 5 + 5 = 10.",
  },

  // ── 3. SAT READING & WRITING (sat-rw) ──────────────────────────────────────
  {
    id: "pm-srw-1",
    subjectSlug: "sat-rw",
    subjectNameUz: "SAT Reading & Writing",
    topicTitleUz: "Kontekstdagi so'z ma'nosi",
    difficulty: 1,
    passageUz:
      "The young astronomer carefully documented every faint star in the night sky; her notes were so _____ that future researchers could easily verify each observation.",
    promptUz: "Bo'sh joyga ma'no jihatdan eng mos keladigan inglizcha so'zni tanlang:",
    options: [
      { id: "A", text: "detailed (batafsil)" },
      { id: "B", text: "careless (e'tiborsiz)" },
      { id: "C", text: "invisible (ko'rinmas)" },
      { id: "D", text: "temporary (vaqtinchalik)" },
    ],
    correctAnswer: "A",
    explanationUz: "Keyingi tadqiqotchilar osongina tekshira olishi uchun qaydlar 'detailed' (batafsil va aniq) bo'lishi kerak.",
  },
  {
    id: "pm-srw-2",
    subjectSlug: "sat-rw",
    subjectNameUz: "SAT Reading & Writing",
    topicTitleUz: "Mantiqiy bog'lovchilar (Transitions)",
    difficulty: 2,
    passageUz:
      "Solar panels generate clean electricity during sunny afternoons. _____, storing that energy for cloudy days requires reliable battery infrastructure.",
    promptUz: "Ikki gap o'rtasidagi mantiqiy bog'lanishni eng to'g'ri ifodalovchi so'zni tanlang:",
    options: [
      { id: "A", text: "For instance," },
      { id: "B", text: "However," },
      { id: "C", text: "Similarly," },
      { id: "D", text: "Therefore," },
    ],
    correctAnswer: "B",
    explanationUz: "Birinchi gap afzallikni, ikkinchi gap esa muammoni (bulutli kunlarda saqlash) aytmoqda — qarama-qarshilik uchun 'However' tanlanadi.",
  },
  {
    id: "pm-srw-3",
    subjectSlug: "sat-rw",
    subjectNameUz: "SAT Reading & Writing",
    topicTitleUz: "Ega va kesim mosligi (Subject-Verb Agreement)",
    difficulty: 3,
    passageUz:
      "The collection of ancient Silk Road manuscripts, along with several rare astronomical maps from Samarkand, _____ currently on display at the national museum.",
    promptUz: "Grammatik qoidalarga ko'ra bo'sh joyga qaysi shakl to'g'ri keladi?",
    options: [
      { id: "A", text: "are" },
      { id: "B", text: "is" },
      { id: "C", text: "were" },
      { id: "D", text: "have been" },
    ],
    correctAnswer: "B",
    explanationUz: "Gapning bosh egasi — 'The collection' (birlikda). Vergullar orasidagi qo'shimcha izoh fe'l soniga ta'sir qilmaydi, shuning uchun 'is' to'g'ri.",
  },
  {
    id: "pm-srw-4",
    subjectSlug: "sat-rw",
    subjectNameUz: "SAT Reading & Writing",
    topicTitleUz: "Ilmiy dalilni mustahkamlash (Command of Evidence)",
    difficulty: 4,
    passageUz:
      "Botanists hypothesized that alpine plants grow shorter stems at high altitudes primarily to resist strong winds rather than due to cold temperatures alone.",
    promptUz: "Quyidagi qaysi tajriba natijasi botaniklarning gipotezasini eng kuchli tasdiqlaydi?",
    options: [
      { id: "A", text: "Baland tog'dagi o'simliklar qishda barglarini to'kishi aniqlandi." },
      {
        id: "B",
        text: "Issiqxonada sovuq haroratda, ammo shamolsiz o'stirilgan tog' o'simliklari uzun poya chiqardi; sun'iy shamol yoqilganda esa poyalari pakana bo'lib o'sdi.",
      },
      { id: "C", text: "Pasttekislikdagi o'simliklar ko'proq suv talab qilishi kuzatildi." },
      { id: "D", text: "Tog' tuprog'ida minerallar miqdori pastroq ekani o'lchandi." },
    ],
    correctAnswer: "B",
    explanationUz: "Sovuq harorat bir xil saqlanib, faqat shamol omili o'zgartirilganda poya qisqarishi gipotezani bevosita isbotlaydi.",
  },

  // ── 4. IELTS ACADEMIC (ielts) ──────────────────────────────────────────────
  {
    id: "pm-ie-1",
    subjectSlug: "ielts",
    subjectNameUz: "IELTS Academic",
    topicTitleUz: " Asosiy lug'at va grammatika",
    difficulty: 1,
    promptUz: "To'g'ri tuzilgan gapni tanlang:",
    options: [
      { id: "A", text: "She have lived in Tashkent since three years." },
      { id: "B", text: "She has lived in Tashkent for three years." },
      { id: "C", text: "She is living in Tashkent since three years." },
      { id: "D", text: "She lived in Tashkent for three years now." },
    ],
    correctAnswer: "B",
    explanationUz: "Davomiylik muddati ('three years') bilan Present Perfect ('has lived') va 'for' predlogi ishlatiladi.",
  },
  {
    id: "pm-ie-2",
    subjectSlug: "ielts",
    subjectNameUz: "IELTS Academic",
    topicTitleUz: "IELTS Reading: Paraphrasing",
    difficulty: 2,
    passageUz:
      "Passage: 'Urban green spaces significantly mitigate the heat-island effect in densely populated metropolitan areas.'",
    promptUz: "Matndagi 'mitigate' so'ziga ma'nodosh (sinonim) bo'lgan qatorni toping:",
    options: [
      { id: "A", text: "accelerate and worsen" },
      { id: "B", text: "reduce and make less severe" },
      { id: "C", text: "completely eliminate forever" },
      { id: "D", text: "measure with sensors" },
    ],
    correctAnswer: "B",
    explanationUz: "'Mitigate' — yumshatish, salbiy ta'sirini kamaytirish ('reduce / make less severe') degan ma'noni anglatadi.",
  },
  {
    id: "pm-ie-3",
    subjectSlug: "ielts",
    subjectNameUz: "IELTS Academic",
    topicTitleUz: "IELTS Reading: True / False / Not Given",
    difficulty: 3,
    passageUz:
      "Passage: 'While over 70% of university applicants prepare using digital platforms, fewer than a quarter receive individualized feedback on their academic essays.'",
    promptUz: "Statement: 'Most university applicants prefer digital platforms because they are free of charge.' Ushbu fikr matnga ko'ra qanday baholanadi?",
    options: [
      { id: "A", text: "TRUE (Matnda tasdiqlangan)" },
      { id: "B", text: "FALSE (Matnga zid)" },
      { id: "C", text: "NOT GIVEN (Bepul ekani haqida ma'lumot berilmagan)" },
      { id: "D", text: "BOTH TRUE AND FALSE" },
    ],
    correctAnswer: "C",
    explanationUz: "Matnda 70% abituriyent raqamli platformalardan foydalanishi aytilgan, ammo buning sababi 'bepul ekani' haqida hech narsa deyilmagan (NOT GIVEN).",
  },
  {
    id: "pm-ie-4",
    subjectSlug: "ielts",
    subjectNameUz: "IELTS Academic",
    topicTitleUz: "IELTS Writing Band 8+ Academic Register",
    difficulty: 4,
    promptUz: "IELTS Writing Task 2 inshosi uchun qaysi jumla eng yuqori akademik uslubda (Band 8.0+) yozilgan?",
    options: [
      { id: "A", text: "Lots of people think cars are bad for the air in big cities." },
      {
        id: "B",
        text: "A growing body of evidence suggests that prioritizing public transit substantially curbs urban carbon emissions.",
      },
      { id: "C", text: "In my opinion, buses are super good and everyone must use them." },
      { id: "D", text: "Cars make too much smoke so governments should ban all of them tomorrow." },
    ],
    correctAnswer: "B",
    explanationUz: "'A growing body of evidence suggests...', 'prioritizing public transit', 'substantially curbs' — rasmiy va aniq akademik leksika namunasidir.",
  },

  // ── 5. AKADEMIK YOZUV (academic-writing) ───────────────────────────────────
  {
    id: "pm-aw-1",
    subjectSlug: "academic-writing",
    subjectNameUz: "Akademik Yozuv",
    topicTitleUz: "Paragraf tuzilishi (Topic Sentence)",
    difficulty: 1,
    promptUz: "Akademik insho paragrafining birinchi gapi (Topic Sentence) qanday vazifani bajaradi?",
    options: [
      { id: "A", text: "Paragrafning asosiy g'oyasini aniq tanishtiradi" },
      { id: "B", text: "Barcha foydalanilgan kitoblar ro'yxatini sanaydi" },
      { id: "C", text: "Mavzuga aloqasi yo'q hazil bilan boshlaydi" },
      { id: "D", text: "Faqat savol belgisi bilan tugaydi" },
    ],
    correctAnswer: "A",
    explanationUz: "Topic Sentence o'quvchiga ushbu paragrafda qaysi asosiy fikr ochib berilishini darhol bildiradi.",
  },
  {
    id: "pm-aw-2",
    subjectSlug: "academic-writing",
    subjectNameUz: "Akademik Yozuv",
    topicTitleUz: "Thesis Statement (Asosiy da'vo)",
    difficulty: 2,
    promptUz: "Qaysi variant kuchli va bahsli 'Thesis Statement' hisoblanadi?",
    options: [
      { id: "A", text: "Ushbu inshoda men texnologiya haqida yozaman." },
      { id: "B", text: "Kompyuterlar XX asrda ixtiro qilingan." },
      {
        id: "C",
        text: "Maktablarda sun'iy intellekt murabbiylarini joriy etish qishloq va shahar o'quvchilari o'rtasidagi ta'lim tafovutini qisqartiradi.",
      },
      { id: "D", text: "Texnologiyaning yaxshi va yomon tomonlari bor." },
    ],
    correctAnswer: "C",
    explanationUz: "Kuchli Thesis Statement oddiy fakt emas, balki dalillar bilan isbotlanadigan aniq pozitsiyani ifodalaydi.",
  },
  {
    id: "pm-aw-3",
    subjectSlug: "academic-writing",
    subjectNameUz: "Akademik Yozuv",
    topicTitleUz: "Personal Statement (Motivation Letter)",
    difficulty: 3,
    promptUz: "Top xorijiy universitetlarga Personal Statement yozishda 'Show, Don't Tell' (Aytib qo'ymang, misol bilan ko'rsating) tamoyili nimani anglatadi?",
    options: [
      { id: "A", text: "Men juda mehnatkash va aqlliman deb ko'p marta yozishni" },
      {
        id: "B",
        text: "Sifatlarni quruq sanash o'rniga, aniq hayotiy loyiha yoki qiyinchilikni qanday yengib o'tganingizni hikoya orqali ko'rsatishni",
      },
      { id: "C", text: "Inshoga rasmlar va jadvallar joylashtirishni" },
      { id: "D", text: "Murakkab lug'atdagi barcha uzun so'zlarni ishlatishni" },
    ],
    correctAnswer: "B",
    explanationUz: "Qabul komissiyasi quruq maqtovni emas, nomzodning xarakterini ochib beruvchi real harakat va natijalarni qadrlaydi.",
  },
  {
    id: "pm-aw-4",
    subjectSlug: "academic-writing",
    subjectNameUz: "Akademik Yozuv",
    topicTitleUz: "Qarshi argumentni tahlil qilish (Counterargument & Rebuttal)",
    difficulty: 4,
    promptUz: "Ilmiy yoki tahliliy inshoda qarshi tomon fikrini (Counterargument) keltirib, so'ng uni dalil bilan rad etish (Rebuttal) nega muhim?",
    options: [
      { id: "A", text: "Insho so'z sonini sun'iy ravishda ko'paytirish uchun" },
      { id: "B", text: "Muallif o'z fikridan ikkilanayotganini ko'rsatish uchun" },
      {
        id: "C",
        text: "Mavzuga biryoqlama emas, chuqur tanqidiy yondashilganini ko'rsatib, asosiy argument ishonchliligini oshirish uchun",
      },
      { id: "D", text: "Xulosa yozmaslik uchun" },
    ],
    correctAnswer: "C",
    explanationUz: "Counterargument va Rebuttal muallifning akademik yetukligini va barcha nuqtai nazarlarni hisobga olganini namoyish etadi.",
  },
];

export const PLACEMENT_SUBJECT_ORDER: Array<{
  slug: PlacementQuestionItem["subjectSlug"];
  nameUz: string;
}> = [
  { slug: "foundation-math", nameUz: "Fundamental Matematika" },
  { slug: "sat-math", nameUz: "SAT Matematika" },
  { slug: "sat-rw", nameUz: "SAT Reading & Writing" },
  { slug: "ielts", nameUz: "IELTS Academic" },
  { slug: "academic-writing", nameUz: "Akademik Yozuv" },
];

export function levelToStartingDifficulty(level?: string | null): 1 | 2 | 3 | 4 {
  switch (level) {
    case "ZERO":
      return 1;
    case "BEGINNER":
      return 2;
    case "INTERMEDIATE":
      return 3;
    case "ADVANCED":
      return 4;
    default:
      return 2;
  }
}

/**
 * Adaptiv algoritm: foydalanuvchining oxirgi javobiga qarab keyingi savol qiyinligini (+1 / -1) moslashtiradi.
 */
export function selectNextAdaptiveQuestion(params: {
  subjectSlug: PlacementQuestionItem["subjectSlug"];
  targetDifficulty: number;
  answeredIds: string[];
}): PlacementQuestionItem | null {
  const clampedDiff = Math.max(1, Math.min(4, Math.round(params.targetDifficulty)));
  const candidates = PLACEMENT_QUESTION_BANK.filter(
    (q) =>
      q.subjectSlug === params.subjectSlug && !params.answeredIds.includes(q.id),
  );

  if (candidates.length === 0) return null;

  // Eng yaqin qiyinlikdagi savolni tanlash
  candidates.sort(
    (a, b) =>
      Math.abs(a.difficulty - clampedDiff) - Math.abs(b.difficulty - clampedDiff),
  );

  return candidates[0] ?? null;
}

export interface EvaluatedPlacementSummary {
  overallLevel: SkillLevelCode;
  scorePercent: number;
  estimatedSat: number;
  estimatedIelts: number;
  subjectScores: Record<
    string,
    {
      nameUz: string;
      scorePercent: number;
      level: SkillLevelCode;
      correctCount: number;
      totalCount: number;
    }
  >;
  strengths: string[];
  weaknesses: string[];
  writingSpeakingAdvice: string;
}

export function evaluatePlacementTest(params: {
  answers: Array<{
    questionId: string;
    subjectSlug: string;
    difficulty: number;
    givenAnswer: string;
  }>;
  speakingComfort?: "SHY" | "MODERATE" | "CONFIDENT";
  writingExperience?: "NONE" | "PARAGRAPHS" | "FULL_ESSAYS";
  honorific?: string;
}): EvaluatedPlacementSummary {
  const honorific = params.honorific ?? "Aziz o'quvchi";

  const subjectStats: Record<
    string,
    {
      nameUz: string;
      weightedEarned: number;
      weightedMax: number;
      correctCount: number;
      totalCount: number;
    }
  > = {};

  for (const subj of PLACEMENT_SUBJECT_ORDER) {
    subjectStats[subj.slug] = {
      nameUz: subj.nameUz,
      weightedEarned: 0,
      weightedMax: 0,
      correctCount: 0,
      totalCount: 0,
    };
  }

  let totalWeightedEarned = 0;
  let totalWeightedMax = 0;

  for (const ans of params.answers) {
    const q = PLACEMENT_QUESTION_BANK.find((item) => item.id === ans.questionId);
    const weight = q ? q.difficulty : Math.max(1, Math.min(4, ans.difficulty));
    const isCorrect = q
      ? q.correctAnswer === ans.givenAnswer.toUpperCase()
      : false;

    const bucket = subjectStats[ans.subjectSlug] ?? {
      nameUz: ans.subjectSlug,
      weightedEarned: 0,
      weightedMax: 0,
      correctCount: 0,
      totalCount: 0,
    };

    bucket.totalCount += 1;
    bucket.weightedMax += weight;
    totalWeightedMax += weight;

    if (isCorrect) {
      bucket.correctCount += 1;
      bucket.weightedEarned += weight;
      totalWeightedEarned += weight;
    }

    subjectStats[ans.subjectSlug] = bucket;
  }

  const scorePercent =
    totalWeightedMax > 0
      ? Math.round((totalWeightedEarned / totalWeightedMax) * 100)
      : 0;

  const pctToLevel = (pct: number): SkillLevelCode => {
    if (pct < 32) return "ZERO";
    if (pct < 58) return "BEGINNER";
    if (pct < 82) return "INTERMEDIATE";
    return "ADVANCED";
  };

  const overallLevel = pctToLevel(scorePercent);

  const subjectScores: EvaluatedPlacementSummary["subjectScores"] = {};
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const [slug, stat] of Object.entries(subjectStats)) {
    const pct =
      stat.weightedMax > 0
        ? Math.round((stat.weightedEarned / stat.weightedMax) * 100)
        : 35;
    const lvl = pctToLevel(pct);
    subjectScores[slug] = {
      nameUz: stat.nameUz,
      scorePercent: pct,
      level: lvl,
      correctCount: stat.correctCount,
      totalCount: stat.totalCount,
    };

    if (pct >= 65) {
      strengths.push(stat.nameUz);
    } else {
      weaknesses.push(stat.nameUz);
    }
  }

  if (strengths.length === 0) {
    strengths.push("O'rganishga bo'lgan kuchli ishtiyoq va mantiqiy tafakkur");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Murakkab imtihon vaqt boshqaruvi (Time Management)");
  }

  const estimatedSat = Math.min(
    1560,
    Math.max(860, 880 + Math.round(scorePercent * 6.6)),
  );
  const estimatedIelts = Number(
    Math.min(8.5, Math.max(4.5, 4.5 + (scorePercent / 100) * 3.8)).toFixed(1),
  );

  const speakingNote =
    params.speakingComfort === "SHY"
      ? "Speaking bo'yicha tortinchoqlikni yengish uchun kuniga 10 daqiqa AI murabbiy bilan ovozli/matnli qisqa savol-javob mashqlarini rejangizga qo'shdik."
      : params.speakingComfort === "CONFIDENT"
        ? "Speakingda o'zingizga ishonchingiz yuqori! Asosiy urg'uni C1 darajadagi idiomatik iboralar va Part 3 chuqur tahlilga qaratamiz."
        : "Speaking ko'nikmangizni Part 2 kartochkalari va mantiqiy bog'lovchilar bilan Band 7.5+ darajaga olib chiqamiz.";

  const writingNote =
    params.writingExperience === "NONE"
      ? "Writingni mutlaqo noldan — avval aniq gap va paragraf (Topic Sentence) qurishdan boshlaymiz."
      : params.writingExperience === "FULL_ESSAYS"
        ? "Insho yozish tajribangiz bor ekan! AI murabbiy har hafta Task 1 va Task 2 ishlaringizni Band 8.0 mezonlari bo'yicha tekshirib boradi."
        : "Paragraf yozishdan to'liq 250 so'zli akademik insho va Personal Statement strukturasiga bosqichma-bosqich o'tamiz.";

  const writingSpeakingAdvice = `Aziz ${honorific}, diagnostika natijangizga ko'ra: ${writingNote} ${speakingNote}`;

  return {
    overallLevel,
    scorePercent,
    estimatedSat,
    estimatedIelts,
    subjectScores,
    strengths,
    weaknesses,
    writingSpeakingAdvice,
  };
}
