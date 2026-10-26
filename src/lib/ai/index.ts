/**
 * 3Talab — Provayder-Agnostik AI Murabbiy Qatlami (/lib/ai)
 *
 * Qo'llab-quvvatlanadigan provayderlar (.env orqali):
 * - AI_PROVIDER="gemini"     (GEMINI_API_KEY)
 * - AI_PROVIDER="claude"     (ANTHROPIC_API_KEY)
 * - AI_PROVIDER="openrouter" (OPENROUTER_API_KEY)
 * - AI_PROVIDER="local"      (Kalitsiz ham to'liq ishlaydigan Socratic O'zbek AI dvigateli)
 *
 * 6 ta yangilangan ta'lim metodi (AI Murabbiy uslublari):
 * 1) SOCRATIC_TUTOR: Socratic savol-javob — o'quvchini mustaqil fikrlashga yo'naltiradi.
 * 2) FAST_SOLUTION: SAT/IELTS tezkor shortcut (Lifehack) usuli — vaqtni 3 barobar tejovchi usullar.
 * 3) STEP_BY_STEP: Qadamma-qadam to'liq akademik yechim — formulalar va qoidalarning batafsil tahlili.
 * 4) TEST_ANALYZER: Test va xatolar diagnostikasi — tuzoqlar va chalg'ituvchi variantlarni fosh etish.
 * 5) WRITING_REVIEW: IELTS Task 1/2 va Akademik insholar tahlili.
 * 6) MOTIVATION: Pomodoro tanaffus, ruhiy rag'bat va charchoqni yengish.
 */

export type AICoachMode =
  | "SOCRATIC_TUTOR"
  | "FAST_SOLUTION"
  | "STEP_BY_STEP"
  | "TEST_ANALYZER"
  | "ERROR_EXPLAINER" // eski sessiyalar bilan moslik uchun
  | "WRITING_REVIEW"
  | "MOTIVATION";

export type StudentLevel = "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface WritingRubricBreakdown {
  estimatedBand: string;
  wordCount: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  strengthsUz: string[];
  improvementsUz: string[];
  socraticRewriteChallengeUz: string;
}

export interface AICoachMetadata {
  providerUsed: "gemini" | "claude" | "openrouter" | "local";
  mode: AICoachMode;
  honorificUsed: string;
  socraticStep: "GUIDING_QUESTION" | "STEP_BY_STEP" | "WRITING_FEEDBACK" | "WELLNESS_CARE";
  safetyBlocked?: boolean;
  fatigueDetected?: boolean;
  offTopicRedirected?: boolean;
  writingRubric?: WritingRubricBreakdown;
}

export interface AICoachRequest {
  userMessage: string;
  mode: AICoachMode;
  gender: "FEMALE" | "MALE";
  studentName?: string;
  studentLevel?: StudentLevel;
  targetUniversity?: string;
  lessonContextTitle?: string;
  turnIndex?: number;
  history?: Array<{ role: "USER" | "ASSISTANT"; content: string }>;
}

export interface AICoachResponse {
  reply: string;
  metadata: AICoachMetadata;
}

// ── 1. Hurmatli murojaat variatsiyalari ──────────────────────────────────────
const GENERAL_WARM_ADDRESSES = [
  "Aziz o'quvchi",
  "Bilimdon do'stim",
  "Zukko o'quvchi",
  "Bo'lajak talaba",
  "Intiluvchan do'stim",
] as const;

export function getVariedHonorific(
  gender: "FEMALE" | "MALE",
  turnIndex = 0,
  studentName?: string
): string {
  if (studentName && studentName.trim()) {
    return studentName.trim().split(" ")[0];
  }
  const safeIdx = Math.abs(turnIndex) % GENERAL_WARM_ADDRESSES.length;
  return GENERAL_WARM_ADDRESSES[safeIdx] ?? "Aziz o'quvchi";
}

// ── 2. Shaxsiy ma'lumotlarni (PII) tozalash ──────────────────────────────────
export function redactPersonalInfo(text: string): {
  cleanText: string;
  hadPII: boolean;
} {
  let cleanText = text;
  let hadPII = false;

  const cardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  const passportRegex = /\b[A-Z]{2}\s?\d{7}\b/gi;
  const phoneRegex = /(?:\+998|998)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g;

  if (cardRegex.test(cleanText) || passportRegex.test(cleanText) || phoneRegex.test(cleanText)) {
    hadPII = true;
    cleanText = cleanText
      .replace(cardRegex, "[MAXFIY_RAQAM]")
      .replace(passportRegex, "[PASPORT_YASHIRILDI]")
      .replace(phoneRegex, "[TELEFON_YASHIRILDI]");
  }

  return { cleanText, hadPII };
}

// ── 3. Bolalar xavfsizligi, charchoq va mavzudan chiqish detektori ───────────
const UNSAFE_KEYWORDS = [
  "qurol",
  "portlash",
  "giyohvand",
  "narkotik",
  "qimor",
  "kazino",
  "18+",
  "porno",
  "o'zimni o'ldir",
  "suiqasd",
  "spirtli",
  "alkogol",
  "sigaret",
  "so'kinish",
  "haqorat",
];

const FATIGUE_KEYWORDS = [
  "charchadim",
  "charchab ketdim",
  "boshim og'riyapti",
  "boshim og'riydi",
  "kallam ishlamayapti",
  "uyqum kelyapti",
  "motivatsiyam yo'q",
  "tushkunlik",
  "taslim bo'laman",
  "eplay olmayapman",
];

const OFF_TOPIC_KEYWORDS = [
  "kino ko'ramizmi",
  "futbol haqida",
  "ob-havo qanday",
  "sevgi haqida",
  "manga tavsiya qil",
  "o'yin o'ynaylik",
  "tiktok",
  "instagram",
];

export function analyzeStudentSignal(text: string): {
  isUnsafe: boolean;
  isFatigued: boolean;
  isOffTopic: boolean;
  matchedCategory?: string;
} {
  const lower = text.toLowerCase();

  for (const kw of UNSAFE_KEYWORDS) {
    if (lower.includes(kw)) {
      return { isUnsafe: true, isFatigued: false, isOffTopic: false, matchedCategory: "SAFETY" };
    }
  }

  for (const kw of FATIGUE_KEYWORDS) {
    if (lower.includes(kw)) {
      return { isUnsafe: false, isFatigued: true, isOffTopic: false, matchedCategory: "FATIGUE" };
    }
  }

  for (const kw of OFF_TOPIC_KEYWORDS) {
    if (lower.includes(kw)) {
      return { isUnsafe: false, isFatigued: false, isOffTopic: true, matchedCategory: "OFF_TOPIC" };
    }
  }

  return { isUnsafe: false, isFatigued: false, isOffTopic: false };
}

// ── 4. Rate Limiting ────────────────────────────────────────────────────────
const aiRateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function checkAIRateLimit(
  userId: string,
  limitPerMinute = 15
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const windowMs = 60_000;
  const existing = aiRateLimitMap.get(userId);

  if (!existing || now - existing.windowStart > windowMs) {
    aiRateLimitMap.set(userId, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (existing.count >= limitPerMinute) {
    const retryAfterSec = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

// ── 5. IELTS Academic Writing Tahlilchisi ────────────────────────────────────
export function evaluateAcademicWriting(
  text: string,
  honorific: string,
  level: StudentLevel = "BEGINNER"
): { reply: string; rubric: WritingRubricBreakdown } {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;

  const academicConnectors = [
    "furthermore",
    "moreover",
    "however",
    "therefore",
    "consequently",
    "nevertheless",
    "in addition",
    "on the other hand",
    "in contrast",
    "as a result",
    "subsequently",
  ];

  const lower = text.toLowerCase();
  const matchedConnectors = academicConnectors.filter((c) => lower.includes(c));

  let taskAchievement = 5.0;
  let coherenceCohesion = 5.0;
  let lexicalResource = 5.0;
  let grammaticalRange = 5.0;

  if (wordCount >= 250) {
    taskAchievement += 1.5;
  } else if (wordCount >= 180) {
    taskAchievement += 1.0;
  } else if (wordCount >= 100) {
    taskAchievement += 0.5;
  }

  if (matchedConnectors.length >= 4) {
    coherenceCohesion += 2.0;
  } else if (matchedConnectors.length >= 2) {
    coherenceCohesion += 1.0;
  }

  const complexWords = [
    "significant",
    "crucial",
    "demonstrate",
    "substantially",
    "perspective",
    "comprehensive",
    "fundamental",
    "implementation",
    "predominantly",
    "illustrate",
  ];
  const matchedComplex = complexWords.filter((w) => lower.includes(w));
  if (matchedComplex.length >= 3) {
    lexicalResource += 1.5;
  } else if (matchedComplex.length >= 1) {
    lexicalResource += 1.0;
  }

  const complexStructures = [
    "although",
    "despite",
    "whereas",
    "not only",
    "if",
    "provided that",
    "having been",
  ];
  const matchedStructures = complexStructures.filter((s) => lower.includes(s));
  if (matchedStructures.length >= 2) {
    grammaticalRange += 1.5;
  } else if (matchedStructures.length >= 1) {
    grammaticalRange += 1.0;
  }

  taskAchievement = Math.min(9.0, Math.round(taskAchievement * 2) / 2);
  coherenceCohesion = Math.min(9.0, Math.round(coherenceCohesion * 2) / 2);
  lexicalResource = Math.min(9.0, Math.round(lexicalResource * 2) / 2);
  grammaticalRange = Math.min(9.0, Math.round(grammaticalRange * 2) / 2);

  const overall =
    Math.round(((taskAchievement + coherenceCohesion + lexicalResource + grammaticalRange) / 4) * 2) / 2;
  const estimatedBand = `Band ${overall.toFixed(1)}`;

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= 150) {
    strengths.push(`So'zlar hajmi yaxshi shakllangan (${wordCount} ta so'z yozilgan).`);
  } else {
    improvements.push(`Hajmni oshirish kerak (IELTS Task 2 uchun kamida 250 ta so'z talab qilinadi, sizda hozir ${wordCount} ta).`);
  }

  if (matchedConnectors.length > 0) {
    strengths.push(`Akademik bog'lovchilar to'g'ri ishlatilgan: "${matchedConnectors.slice(0, 3).join('", "')}".`);
  } else {
    improvements.push("Fikrlar orasiga bog'lovchilar («Furthermore», «However», «Consequently») qo'shing.");
  }

  if (matchedComplex.length > 0) {
    strengths.push(`Boyitilgan leksika: "${matchedComplex.slice(0, 3).join('", "')}".`);
  } else {
    improvements.push("Oddiy so'zlar o'rniga sinonimlardan foydalaning (masalan, «good» o'rniga «beneficial/effective»).");
  }

  const socraticChallenge =
    level === "BEGINNER" || level === "ZERO"
      ? `${honorific}, birinchi jumlani olib, uni «Because...» (Chunki...) bilan sabab keltiruvchi 1 ta mukammal gapga aylantirib yozing-chi!`
      : `${honorific}, inshongizdagi asosiy da'voni «Not only does [X]..., but it also...» inversiya qolipi yordamida Band 8.0 darajasida qayta yozib ko'ring!`;

  const reply = [
    `✨ **Ofarin, ${honorific}!** Yozma ishingizni diqqat bilan o'qib chiqdim.`,
    ``,
    `📊 **IELTS Writing Tahlil Natijasi:**`,
    `• **Taxminiy umumiy ball:** **${estimatedBand}**`,
    `• **So'zlar soni:** ${wordCount} ta so'z`,
    `• **Vazifani bajarish (Task Achievement):** ${taskAchievement}/9.0`,
    `• **Mantiqiy bog'liqlik (Coherence & Cohesion):** ${coherenceCohesion}/9.0`,
    `• **Lug'at boyligi (Lexical Resource):** ${lexicalResource}/9.0`,
    `• **Grammatik qamrov (Grammatical Range):** ${grammaticalRange}/9.0`,
    ``,
    `🌟 **Kuchli tomonlaringiz:**`,
    ...strengths.map((s) => `• ${s}`),
    ``,
    `🎯 **O'sish nuqtalari (Keyingi qadam):**`,
    ...improvements.map((i) => `• ${i}`),
    ``,
    `🧭 **Socratic Vazifa:**`,
    `${socraticChallenge}`,
  ].join("\n");

  return {
    reply,
    rubric: {
      estimatedBand,
      wordCount,
      taskAchievement,
      coherenceCohesion,
      lexicalResource,
      grammaticalRange,
      strengthsUz: strengths,
      improvementsUz: improvements,
      socraticRewriteChallengeUz: socraticChallenge,
    },
  };
}

// ── 6. Yangilangan Ta'lim Metodlari Dvigateli ────────────────────────────────
function buildLocalSocraticResponse(
  req: AICoachRequest,
  honorific: string,
  hadPII = false
): AICoachResponse {
  const level = req.studentLevel ?? "BEGINNER";
  const levelLabel =
    level === "ZERO"
      ? "Noldan (eng sodda tushuntirish)"
      : level === "BEGINNER"
        ? "Boshlang'ich"
        : level === "INTERMEDIATE"
          ? "O'rta"
          : "Yuqori (chuqurlashtirilgan)";

  const signal = analyzeStudentSignal(req.userMessage);

  // 6.1. Xavfsizlik
  if (signal.isUnsafe) {
    return {
      reply: [
        `🛡️ **${honorific}**, men sizning ilmiy ustozi va do'stingiz sifatida faqat ta'lim, ilm-fan, SAT, IELTS hamda shaxsiy rivojlanish mavzularida yordam bera olaman.`,
        ``,
        `Keling, diqqatimizni sizni **${req.targetUniversity ?? "nufuzli universitet"}** talabasi qiladigan bilimlarga qaratamiz!`,
      ].join("\n"),
      metadata: {
        providerUsed: "local",
        mode: req.mode,
        honorificUsed: honorific,
        socraticStep: "WELLNESS_CARE",
        safetyBlocked: true,
      },
    };
  }

  // 6.2. Charchoq / Motivatsiya
  if (signal.isFatigued || req.mode === "MOTIVATION") {
    return {
      reply: [
        `🌿 **${honorific}**, charchoq — bu sizning tinimsiz intilayotganingiz isboti!`,
        ``,
        `☕ **Pomodoro Qisqa Tanaffus Metodi (10 daqiqa):**`,
        `1. Ekrandan uzoqlashing va iliq suv iching.`,
        `2. Ko'z mashqi: 20 soniya davomida 6 metr uzoqlikdagi biron nuqtaga qarab turing (20-20-20 qoidasi).`,
        `3. Chuqur nafas oling. Katta maqsadlar qadam-baqadam zabt etiladi!`,
        ``,
        `Dam olgach, *«Davom etamiz»* deb yozing, eng qiziqarli mashqdan davom ettiramiz! ✨`,
      ].join("\n"),
      metadata: {
        providerUsed: "local",
        mode: req.mode,
        honorificUsed: honorific,
        socraticStep: "WELLNESS_CARE",
        fatigueDetected: true,
      },
    };
  }

  // 6.3. Mavzudan chetlanish
  if (signal.isOffTopic) {
    return {
      reply: [
        `😊 **${honorific}**, bu mavzu ham qiziq, biroq bizning oltin vaqtimiz sizni **${req.targetUniversity ?? "orzuyingizdagi universitet"}** ga olib chiqadigan darslarga bag'ishlangan!`,
        ``,
        `Keling, kelishib olamiz: hozir navbatdagi masalani yechamiz, dam olish paytida esa xohlagancha hordiq chiqarasiz.`,
      ].join("\n"),
      metadata: {
        providerUsed: "local",
        mode: req.mode,
        honorificUsed: honorific,
        socraticStep: "GUIDING_QUESTION",
        offTopicRedirected: true,
      },
    };
  }

  // 6.4. Writing tekshiruvi
  if (req.mode === "WRITING_REVIEW") {
    const { reply, rubric } = evaluateAcademicWriting(req.userMessage, honorific, level);
    return {
      reply,
      metadata: {
        providerUsed: "local",
        mode: "WRITING_REVIEW",
        honorificUsed: honorific,
        socraticStep: "WRITING_FEEDBACK",
        writingRubric: rubric,
      },
    };
  }

  const piiNotice = hadPII
    ? `\n\n🔒 *Eslatma, ${honorific}: xavfsizligingiz uchun telefon yoki shaxsiy ma'lumotlarni chatda yozmang.*`
    : "";

  // 6.5. METOD: FAST_SOLUTION (Tezkor Shortcut / SAT 5-soniya usuli)
  if (req.mode === "FAST_SOLUTION") {
    return {
      reply: [
        `⚡ **Tezkor Yechim Metodi (SAT & IELTS Shortcut), ${honorific}!**`,
        ``,
        `Akademik testlarda vaqt — eng qimmatli resurs. Bu masalani standart uzun yo'l bilan emas, **5–15 soniyalik professional usul** bilan yechamiz:`,
        ``,
        `1. 🎯 **Tuzoqdan qochish:** Masalada to'liq hisoblash shart emas. E'tibor bering: tenglamaning ikki tomonida umumiy ko'paytuvchi yoki qisqaradigan had bormi?`,
        `2. ⚡ **Munosabatni ko'rish (Pattern Recognition):** Masalan, $6x + 10$ ifodaning qiymati so'ralgan bo'lsa va sizga $3x + 5 = 17$ berilgan bo'lsa, $x$ ni topib o'tirmang — to'g'ridan-to'g'ri 2 ga ko'paytiring ($17 \\times 2 = 34$)!`,
        `3. ⏱️ **Vaqt tejamkorligi:** Bu usul sizga imtihonda 40-50 soniya qo'shimcha vaqt tejab beradi.`,
        ``,
        `Savolingiz bo'yicha ifodani birgalikda sinab ko'ramizmi?${piiNotice}`,
      ].join("\n"),
      metadata: {
        providerUsed: "local",
        mode: "FAST_SOLUTION",
        honorificUsed: honorific,
        socraticStep: "STEP_BY_STEP",
      },
    };
  }

  // 6.6. METOD: STEP_BY_STEP (Qadamma-qadam to'liq akademik yechim)
  if (req.mode === "STEP_BY_STEP") {
    return {
      reply: [
        `📘 **Qadamma-qadam To'liq Akademik Tahlil Metodi, ${honorific}!** (${levelLabel})`,
        ``,
        `Keling, ushbu mavzuni noldan mustahkam poydevor bilan ko'rib chiqamiz:`,
        ``,
        `• **1-Qadam (Boshlang'ich qoida):** Har bir ifodaning qoidasini aniqlaymiz va berilgan ma'lumotlarni formulaga joylashtiramiz.`,
        `• **2-Qadam (Oraliq amallar):** Har bir matematik amalni ketma-ketlik bilan bajaramiz: qavslarni ochish $\\rightarrow$ o'xshash hadlarni ixshamlash $\\rightarrow$ noma'lumni ajratish.`,
        `• **3-Qadam (Akademik xulosa):** Natijani tekshiramiz va qoidani mustahkamlab olamiz.`,
        ``,
        `Har bir qadam tushunarli bo'lyaptimi? Qaysi bosqichda savolingiz bor?${piiNotice}`,
      ].join("\n"),
      metadata: {
        providerUsed: "local",
        mode: "STEP_BY_STEP",
        honorificUsed: honorific,
        socraticStep: "STEP_BY_STEP",
      },
    };
  }

  // 6.7. METOD: TEST_ANALYZER yoki ERROR_EXPLAINER (Test va xatolar diagnostikasi)
  if (req.mode === "TEST_ANALYZER" || req.mode === "ERROR_EXPLAINER") {
    return {
      reply: [
        `🔍 **Test & Xatolar Diagnostikasi Metodi, ${honorific}!**`,
        ``,
        `Imtihonda xato qilish — muammo emas, o'sish nuqtasi! Keling, test tuzuvchilarning asosiy tuzoqlarini fosh qilamiz:`,
        ``,
        `1. ⚠️ **Chalg'ituvchi variant (Distractor):** Variantlar orasida doimo shoshilgan o'quvchi hisoblab qo'yadigan «yarim yechim» bo'ladi (masalan, $x$ emas, $x^2$ so'ralgan bo'ladi).`,
        `2. 🎯 **Istisno qilish usuli (Process of Elimination):** 4 ta variantdan aniq xato bo'lgan 2 tasini darhol o'chirib tashlang. Ehtimollik 25% dan 50% ga oshadi!`,
        `3. 💡 **Ildiz tahlili:** Siz qaysi variantni belgiladingiz va nima uchun? Birgalikda xatoning tub ildizini tahlil qilamiz.`,
        ``,
        `Variantlarni yuboring, birma-bir saralab chiqamiz!${piiNotice}`,
      ].join("\n"),
      metadata: {
        providerUsed: "local",
        mode: "TEST_ANALYZER",
        honorificUsed: honorific,
        socraticStep: "GUIDING_QUESTION",
      },
    };
  }

  // 6.8. METOD: SOCRATIC_TUTOR (Asosiy Socratic yo'naltiruvchi metod)
  const isSecondStep =
    Boolean(req.history && req.history.length >= 2) || (req.turnIndex ?? 0) >= 1;

  if (!isSecondStep) {
    return {
      reply: [
        `🌟 **Socratic Izlanish Metodi, ${honorific}!** (${levelLabel})`,
        ``,
        `Men sizga tayyor javobni birdan bermayman — chunki o'zingiz kashf etgan formula xotirangizda umrbod saqlanib qoladi!`,
        ``,
        `🧩 **Keling, birgalikda o'ylab ko'ramiz:**`,
        `• Savol shartiga e'tibor bering: berilgan parametrlar orasida qanday umumiy bog'liqlik ko'ryapsiz?`,
        `• Agar tenglamada noma'lum $x$ ni ajratmoqchi bo'lsak, eng birinchi bo'lib qaysi amalni bajarish mantiqan to'g'ri bo'ladi?`,
        ``,
        `🧭 **Birinchi qadam taxminingizni yozing — men keyingi bosqichda to'g'rilab boraman!**${piiNotice}`,
      ].join("\n"),
      metadata: {
        providerUsed: "local",
        mode: "SOCRATIC_TUTOR",
        honorificUsed: honorific,
        socraticStep: "GUIDING_QUESTION",
      },
    };
  }

  return {
    reply: [
      `🎯 **Barakalla, ${honorific}! Fikrlash yo'nalishingiz juda to'g'ri!**`,
      ``,
      `Endi mantiqiy zanjirni davom ettiramiz:`,
      `1. **1-bosqich:** Aniqlangan qoidaga ko'ra tenglamani soddalashtiramiz.`,
      `2. **2-bosqich:** Natijani savolda so'ralgan ifodaga qo'yamiz.`,
      `3. **3-bosqich:** Javobni tekshiramiz.`,
      ``,
      `🚀 **Keyingi qadam:** Xuddi shu usulni mustahkamlash uchun yana 1 ta shunga o'xshash tezkor misol ko'ramizmi?${piiNotice}`,
    ].join("\n"),
    metadata: {
      providerUsed: "local",
      mode: "SOCRATIC_TUTOR",
      honorificUsed: honorific,
      socraticStep: "STEP_BY_STEP",
    },
  };
}

// ── 7. Tashqi LLM Provayderlar (Gemini / Claude / OpenRouter) + Fallback ─────
function buildSystemPrompt(req: AICoachRequest, honorific: string): string {
  const modeGuidance: Record<AICoachMode, string> = {
    SOCRATIC_TUTOR: "SOCRATIC USUL: Javobni darrov berib qo'yma! Avval o'quvchini o'ylashga yo'naltiruvchi savol ber, keyin qadamma-qadam tushuntir.",
    FAST_SOLUTION: "TEZKOR YECHIM USULI (SHORTCUT): Standart formulalardan ko'ra SAT/IELTSda vaqtni 3 barobar tejovchi tezkor usul va qoliplarni o'rgat.",
    STEP_BY_STEP: "QADAMMA-QADAM AKADEMIK USUL: Har bir amalni, qoidani va oraliq bosqichlarni batafsil, noldan tushuntir.",
    TEST_ANALYZER: "TEST VA XATOLAR DIAGNOSTIKASI: Savoldagi chalg'ituvchi variantlarni fosh et va nima uchun xato ekanini tahlil qil.",
    ERROR_EXPLAINER: "XATOLARNI TUSHUNTIRISH: Xatoni kamsitmasdan, o'sish nuqtasi sifatida ko'rsat.",
    WRITING_REVIEW: "IELTS WRITING BAHOLASH: Inshoni 4 ta xalqaro mezon bo'yicha Band balli bilan bahola.",
    MOTIVATION: "MOTIVATSIYA VA DAM OLISH: Charchoqni yengish uchun 10 daqiqalik Pomodoro tanaffusini tavsiya qil.",
  };

  return [
    `Sen "3Talab" o'quv platformasining AI murabbiyisan.`,
    `MUHIM QOIDALAR:`,
    `1. Har doim faqat o'zbek tilida (lotin alifbosida), hurmat va samimiyat bilan gapir.`,
    `2. O'quvchiga "${honorific}" deb hurmat bilan murojaat qil.`,
    `3. TANLANGAN METOD: ${modeGuidance[req.mode] || modeGuidance.SOCRATIC_TUTOR}`,
    `4. Xato qilganda hech qachon kamsitma, xatoni o'rganish imkoniyati sifatida ko'rsat.`,
    `5. O'quvchi darajasi: ${req.studentLevel ?? "BEGINNER"}. Maqsadi: ${req.targetUniversity ?? "Top xorijiy universitet"}.`,
    `6. Dars mavzusidan tashqariga chiqsa muloyimlik bilan darsga qaytar.`,
    `7. O'quvchi charchagan ko'rinsa qisqa dam olishni tavsiya qil va rag'batlantir.`,
    `8. Bolalar xavfsizligi: nomaqbul mavzularga javob berma, shaxsiy ma'lumot so'rama.`,
  ].join("\n");
}

export async function generateAICoachResponse(
  req: AICoachRequest
): Promise<AICoachResponse> {
  const honorific = getVariedHonorific(req.gender, req.turnIndex ?? 0);
  const { cleanText, hadPII } = redactPersonalInfo(req.userMessage);
  const sanitizedReq: AICoachRequest = { ...req, userMessage: cleanText };

  // Xavfsizlik, charchoq yoki Writing tekshiruvini darhol aniq qoidalar bilan bajarish
  const signal = analyzeStudentSignal(cleanText);
  if (signal.isUnsafe || signal.isFatigued || signal.isOffTopic || req.mode === "WRITING_REVIEW") {
    return buildLocalSocraticResponse(sanitizedReq, honorific, hadPII);
  }

  const provider = (process.env.AI_PROVIDER ?? "local").toLowerCase();
  const systemPrompt = buildSystemPrompt(sanitizedReq, honorific);
  const history = (req.history ?? []).slice(-8).map((m) => ({
    role: m.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
    content: redactPersonalInfo(m.content).cleanText,
  }));
  const metaFor = (providerUsed: AICoachMetadata["providerUsed"]): AICoachMetadata => ({
    providerUsed,
    mode: req.mode,
    honorificUsed: honorific,
    socraticStep: history.length >= 2 ? "STEP_BY_STEP" : "GUIDING_QUESTION",
  });

  try {
    const text = await callExternalProvider(provider, systemPrompt, history, cleanText);
    if (text) {
      const used: AICoachMetadata["providerUsed"] =
        provider === "anthropic" ? "claude" : (provider as AICoachMetadata["providerUsed"]);
      return { reply: text, metadata: metaFor(used) };
    }
  } catch {
    // Tashqi provayder xato bersa yoki tarmoq bo'lmasa, mahalliy dvigatelga o'tiladi
  }

  return buildLocalSocraticResponse(sanitizedReq, honorific, hadPII);
}

type ChatTurn = { role: "user" | "assistant"; content: string };

/** Tashqi LLM chaqiruvi. Kalit yo'q yoki javob bo'sh bo'lsa `null` qaytaradi. */
async function callExternalProvider(
  provider: string,
  systemPrompt: string,
  history: ChatTurn[],
  userText: string
): Promise<string | null> {
  const signal = AbortSignal.timeout(20_000);
  const messages: ChatTurn[] = [...history, { role: "user", content: userText }];

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  }

  if ((provider === "claude" || provider === "anthropic") && process.env.ANTHROPIC_API_KEY) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    return data.content?.find((c) => c.type === "text")?.text?.trim() ?? null;
  }

  if (provider === "openrouter" && process.env.OPENROUTER_API_KEY) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://3talaba.netlify.app",
        "X-Title": "3Talab",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  }

  return null;
}
