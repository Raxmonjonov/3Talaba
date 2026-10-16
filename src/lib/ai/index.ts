/**
 * 3Talab — Provayder-Agnostik AI Murabbiy Qatlami (/lib/ai)
 *
 * Qo'llab-quvvatlanadigan provayderlar (.env orqali):
 * - AI_PROVIDER="gemini"     (GEMINI_API_KEY)
 * - AI_PROVIDER="claude"     (ANTHROPIC_API_KEY)
 * - AI_PROVIDER="openrouter" (OPENROUTER_API_KEY)
 * - AI_PROVIDER="local"      (Kalitsiz ham to'liq ishlaydigan Socratic O'zbek AI dvigateli)
 *
 * Barcha 6-bo'lim AI Murabbiy qoidalariga qat'iy amal qiladi:
 * 1) Har doim o'zbek tilida, hurmat va iliqlik bilan gapiradi.
 * 2) Qiz o'quvchiga «Malikam», o'g'il o'quvchiga «Shag'zodam» va shunga o'xshash iliq iboralarni
 *    aralashtirib, takrorlanmasdan ishlatadi.
 * 3) Socratic usul: javobni darrov bermaydi, avval o'ylashga yo'naltiradi, so'ng qadamma-qadam tushuntiradi.
 * 4) Xato qilganda hech qachon kamsitmaydi — xatoni o'sish imkoniyati sifatida ko'rsatadi.
 * 5) O'quvchi darajasiga (ZERO/BEGINNER/INTERMEDIATE/ADVANCED) moslab soddalashtiradi yoki chuqurlashtiradi.
 * 6) Mavzudan chalg'isa muloyimlik bilan darsga qaytaradi.
 * 7) Charchagan yoki tushkun ko'rinsa qisqa dam olishni tavsiya qiladi va rag'batlantiradi.
 * 8) Bolalar xavfsizligi: nomaqbul mavzularni bloklaydi va shaxsiy ma'lumot (PII) so'ramaydi/loglamaydi.
 */

export type AICoachMode =
  | "SOCRATIC_TUTOR"
  | "ERROR_EXPLAINER"
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

// ── 1. Murojaat variatsiyalari (aralashtirib, takrorlanmasdan ishlatish) ──────
const FEMALE_WARM_ADDRESSES = [
  "Malikam",
  "Bilimdon Malikam",
  "Zukko Malikam",
  "Bo'lajak olima Malikam",
  "Intiluvchan Malikam",
] as const;

const MALE_WARM_ADDRESSES = [
  "Shag'zodam",
  "Bilimdon Shag'zodam",
  "Zukko Shag'zodam",
  "Mard Shag'zodam",
  "Intiluvchan Shag'zodam",
] as const;

export function getVariedHonorific(
  gender: "FEMALE" | "MALE",
  turnIndex = 0
): string {
  const pool = gender === "FEMALE" ? FEMALE_WARM_ADDRESSES : MALE_WARM_ADDRESSES;
  const safeIdx = Math.abs(turnIndex) % pool.length;
  return pool[safeIdx] ?? (gender === "FEMALE" ? "Malikam" : "Shag'zodam");
}

// ── 2. Voyaga yetmaganlar shaxsiy ma'lumotini (PII) tozalash ─────────────────
export function redactPersonalInfo(text: string): {
  cleanText: string;
  hadPII: boolean;
} {
  let cleanText = text;
  let hadPII = false;

  // Karta raqami (16 raqam) yoki pasport seriya/raqam yoki telefon raqam
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
  "toliqdim",
  "uyqum",
  "boshim og'ri",
  "tushkun",
  "qo'limdan kelmaydi",
  "juda qiyin",
  "zerikdim",
  "motivatsiya yo'q",
  "tashlab ketgim",
  "stress",
  "qo'rqyapman",
];

const OFF_TOPIC_KEYWORDS = [
  "futbol hisobi",
  "kino tavsiya",
  "pubg",
  "counter strike",
  "dota",
  "serial",
  "mashina narxi",
  "kriptovalyuta",
  "bitcoin",
  "sevgi haqida",
];

export function analyzeStudentSignal(text: string): {
  isUnsafe: boolean;
  isFatigued: boolean;
  isOffTopic: boolean;
} {
  const lower = text.toLowerCase();
  const isUnsafe = UNSAFE_KEYWORDS.some((kw) => lower.includes(kw));
  const isFatigued = FATIGUE_KEYWORDS.some((kw) => lower.includes(kw));
  const isOffTopic = OFF_TOPIC_KEYWORDS.some((kw) => lower.includes(kw));

  return { isUnsafe, isFatigued, isOffTopic };
}

// ── 4. In-Memory Rate Limiter (AI endpointlarini himoyalash uchun) ───────────
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

export function checkAIRateLimit(
  userId: string,
  maxRequestsPerMinute = 25
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const windowMs = 60_000;
  const entry = rateLimitStore.get(userId);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= maxRequestsPerMinute) {
    const retryAfterSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

// ── 5. IELTS / SAT Writing Insho Baholash Dvigateli ──────────────────────────
export function evaluateAcademicWriting(
  essayText: string,
  honorific: string,
  level: StudentLevel = "BEGINNER"
): { reply: string; rubric: WritingRubricBreakdown } {
  const words = essayText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;

  const lower = essayText.toLowerCase();
  const academicConnectors = [
    "however",
    "furthermore",
    "moreover",
    "consequently",
    "nevertheless",
    "therefore",
    "in conclusion",
    "for instance",
    "specifically",
    "although",
    "whereas",
  ];
  const usedConnectors = academicConnectors.filter((c) => lower.includes(c));

  const sentences = essayText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const avgSentenceLength =
    sentences.length > 0 ? Math.round(wordCount / sentences.length) : wordCount;

  // Mezon ballari (5.0 dan 8.5 gacha)
  const lengthScore = wordCount >= 180 ? 7.5 : wordCount >= 90 ? 6.5 : wordCount >= 40 ? 6.0 : 5.5;
  const cohesionScore =
    usedConnectors.length >= 3
      ? 7.5
      : usedConnectors.length >= 1
        ? 6.5
        : 5.5;
  const lexicalScore =
    words.filter((w) => w.length >= 8).length >= 10
      ? 7.5
      : words.filter((w) => w.length >= 7).length >= 4
        ? 6.5
        : 6.0;
  const grammarScore = avgSentenceLength >= 12 && avgSentenceLength <= 26 ? 7.0 : 6.0;

  const avgRaw = (lengthScore + cohesionScore + lexicalScore + grammarScore) / 4;
  const roundedBand = (Math.round(avgRaw * 2) / 2).toFixed(1);

  const strengthsUz: string[] = [];
  const improvementsUz: string[] = [];

  if (wordCount >= 80) {
    strengthsUz.push(
      `Fikringizni kengroq yoritishga harakat qilgansiz (${wordCount} ta so'z).`
    );
  } else {
    improvementsUz.push(
      `Insho hajmini kamida 150–250 ta so'zga yetkazishga harakat qiling (hozir: ${wordCount} ta so'z).`
    );
  }

  if (usedConnectors.length > 0) {
    strengthsUz.push(
      `Mantiqiy bog'lovchilardan (${usedConnectors.slice(0, 3).join(", ")}) o'rinli foydalangansiz.`
    );
  } else {
    improvementsUz.push(
      `Gaplar orasini bog'lash uchun «However», «Furthermore», «Consequently» kabi akademik ko'priklarni qo'shing.`
    );
  }

  strengthsUz.push(
    "Mavzuning asosiy g'oyasini aniq ushlagansiz va o'z nuqtai nazaringizni bildirgansiz."
  );

  if (improvementsUz.length === 0) {
    improvementsUz.push(
      "Har bir paragrafni PEEL (Point -> Evidence -> Explanation -> Link) qolipida yanada aniqroq dalillang."
    );
  }

  const socraticChallenge =
    level === "ZERO" || level === "BEGINNER"
      ? `${honorific}, birinchi gapingizni «Although...» (Garchi...) bog'lovchisi bilan boshlab, qarama-qarshi fikrni ham ko'rsatadigan 1 ta murakkab gapga aylantirib ko'rasizmi?`
      : `${honorific}, inshongizdagi asosiy da'voni (Thesis Statement) «Not only does [X]..., but it also...» inversiya qolipi yordamida Band 8.0 darajasida qayta yozib ko'ring-chi!`;

  const reply = [
    `✨ **Ofarin, ${honorific}!** Yozma ishingizni diqqat bilan o'qib chiqdim. Yozishdan qo'rqmasdan mashq qilayotganingizning o'zi katta g'alaba!`,
    ``,
    `📊 **Dastlabki Akademik Tahlil (Taxminiy daraja: Band ${roundedBand}):**`,
    `• **So'zlar soni:** ${wordCount} ta so'z (${sentences.length} ta gap)`,
    `• **Task Achievement:** ${lengthScore.toFixed(1)} | **Coherence & Cohesion:** ${cohesionScore.toFixed(1)}`,
    `• **Lexical Resource:** ${lexicalScore.toFixed(1)} | **Grammar:** ${grammarScore.toFixed(1)}`,
    ``,
    `✅ **Kuchli tomonlaringiz:**`,
    ...strengthsUz.map((s) => `  — ${s}`),
    ``,
    `🌱 **O'sish nuqtalari (Hech qachon xatodan cho'chimang!):**`,
    ...improvementsUz.map((i) => `  — ${i}`),
    ``,
    `🧭 **Socratic Vazifa (Birgalikda kuchaytiramiz):**`,
    `${socraticChallenge}`,
  ].join("\n");

  return {
    reply,
    rubric: {
      estimatedBand: roundedBand,
      wordCount,
      taskAchievement: lengthScore,
      coherenceCohesion: cohesionScore,
      lexicalResource: lexicalScore,
      grammaticalRange: grammarScore,
      strengthsUz,
      improvementsUz,
      socraticRewriteChallengeUz: socraticChallenge,
    },
  };
}

// ── 6. Socratic O'zbek AI Murabbiy javob generatori ──────────────────────────
function buildLocalSocraticResponse(
  req: AICoachRequest,
  honorific: string,
  hadPII: boolean
): AICoachResponse {
  const signal = analyzeStudentSignal(req.userMessage);
  const level = req.studentLevel ?? "BEGINNER";
  const levelLabel =
    level === "ZERO"
      ? "Noldan (juda sodda misollar bilan)"
      : level === "BEGINNER"
        ? "Boshlang'ich"
        : level === "INTERMEDIATE"
          ? "O'rta"
          : "Yuqori (chuqurlashtirilgan)";

  // 6.1. Bolalar xavfsizligi (Child Safety)
  if (signal.isUnsafe) {
    return {
      reply: [
        `🛡️ **${honorific}**, men sizning ilmiy ustozi va do'stingiz sifatida faqat ta'lim, ilm-fan, SAT, IELTS hamda shaxsiy rivojlanish mavzularida suhbatlasha olaman.`,
        ``,
        `Keling, diqqatimizni sizni **${req.targetUniversity ?? "nufuzli xorijiy universitet"}** talabasi qiladigan bilimlarga qaratamiz! Hozir qaysi mavzuda mashq qilishni xohlaysiz — **SAT Matematika**mi yoki **IELTS Academic**?`,
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

  // 6.2. Charchoq yoki tushkunlikni sezish (Fatigue / Wellness Care)
  if (signal.isFatigued || req.mode === "MOTIVATION") {
    return {
      reply: [
        `🌿 **${honorific}**, sizni juda yaxshi tushunaman. Katta maqsad sari ketayotgan har bir kuchli inson ba'zida charchaydi — bu sizning zaifligingiz emas, balki astoydil mehnat qilayotganingiz belgisidir!`,
        ``,
        `☕ **Ustoz tavsiyasi (10 daqiqalik tanaffus):**`,
        `1. Hozir ekran oldidan 10 daqiqaga uzoqlashing va bir stakan iliq suv iching.`,
        `2. Ko'zlaringizni yumib, chuqur nafas oling (4 soniya nafas olish — 4 soniya chiqarish).`,
        `3. Esingizda tuting: **${req.targetUniversity ?? "Top Universitet"}** sari yo'l sprint emas, marafon!`,
        ``,
        `Dam olib bo'lganingizdan so'ng menga *«Tayyorman»* deb yozing — bugun eng yengil va qiziqarli 1 dona o'yin-mashqdan boshlaymiz! ✨`,
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

  // 6.3. Dars mavzusidan tashqariga chiqib ketsa muloyimlik bilan qaytarish
  if (signal.isOffTopic) {
    return {
      reply: [
        `😊 **${honorific}**, bu mavzu ham qiziq, ammo bizning oltin vaqtimiz sizni **${req.targetUniversity ?? "orzuyingizdagi universitet"}** ga olib chiqadigan SAT va IELTS bilimlariga bag'ishlangan!`,
        ``,
        `Keling, kichik kelishuv qilamiz: hozir birgalikda **${req.lessonContextTitle ?? "navbatdagi SAT/IELTS masalasi"}** ni yechamiz, keyin esa tanaffus paytida dam olasiz.`,
        ``,
        `🧭 **Boshlash uchun kichik savol:** Tenglama yoki matn tahlilida eng birinchi qadamimiz nima bo'lishi kerak deb o'ylaysiz?`,
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

  // 6.4. Writing tekshiruvi rejimi
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

  // 6.5. Xatoni tushuntirish rejimi (Hech qachon kamsitmasdan, o'rganish imkoniyati sifatida)
  if (req.mode === "ERROR_EXPLAINER") {
    return {
      reply: [
        `💡 **Hechqisi yo'q, ${honorific}!** Har bir xato — miyangizda yangi neyron bog'lam hosil bo'layotganining isbotidir. Eng kuchli SAT 1550+ va IELTS 8.5 sohiblari ham aynan xatolarini tahlil qilib cho'qqiga chiqishgan.`,
        ``,
        `🔍 **Darajangizga mos tahlil (${levelLabel}):**`,
        `Siz bergan savol/xato bo'yicha javobni darhol aytib qo'ymayman — keling, tuzoqni o'zingiz topishingizga yordam beraman:`,
        `1. **1-qadam (Shartni ajratish):** Savolning oxirgi jumlasida aynan *nima* so'ralganiga e'tibor bering (masalan, $x$ ning o'zimi yoki $2x + 3$ ifodami?).`,
        `2. **2-qadam (Chalg'ituvchi variantni o'chirish):** Variantlar orasida shoshilgan o'quvchini chalg'itadigan «yarim yechim» bor.`,
        ``,
        `🧭 **Menga ayting-chi, ${honorific}:** Berilgan ifodani eng sodda ko'rinishga keltirish uchun avval qaysi amalni bajargan bo'lardingiz?`,
      ].join("\n"),
      metadata: {
        providerUsed: "local",
        mode: "ERROR_EXPLAINER",
        honorificUsed: honorific,
        socraticStep: "GUIDING_QUESTION",
      },
    };
  }

  // 6.6. Asosiy Socratic Ustoz rejimi (avval yo'naltiradi, keyin qadamma-qadam tushuntiradi)
  const isSecondStep =
    Boolean(req.history && req.history.length >= 2) || (req.turnIndex ?? 0) >= 1;

  const piiNotice = hadPII
    ? `\n\n🔒 *Eslatma, ${honorific}: xavfsizligingiz uchun telefon yoki shaxsiy raqamlarni chatda yozmaslikni tavsiya qilaman.*`
    : "";

  if (!isSecondStep) {
    return {
      reply: [
        `🌟 **Ajoyib savol, ${honorific}!** (${levelLabel} darajada birgalikda yechamiz).`,
        ``,
        `Men sizga tayyor javobni darhol berib qo'ymayman, chunki o'zingiz topgan yechim xotirangizda 10 barobar mustahkamroq saqlanadi!`,
        ``,
        `🧩 **Keling, masalaga «kalit» topamiz:**`,
        `• Agar tenglama yoki savol shartiga diqqat bilan qarasangiz, berilgan sonlar orasida umumiy bo'luvchi yoki o'zaro bog'liqlik ko'rinyaptimi?`,
        `• Masalan, chiziqli tenglamalarda ($ax + b = c$) noma'lum $x$ ni yolg'iz qoldirish uchun avval ozod hadni ($b$) nima qilishimiz kerak?`,
        ``,
        `🧭 **Birinchi qadamni o'zingiz yozib ko'ring, ${honorific} — men keyingi qadamda to'liq yechimni ko'rsataman!**${piiNotice}`,
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
      `Endi bosqichma-bosqich mantiqiy zanjirni yakunlaymiz:`,
      `1. **1-bosqich:** Tenglama yoki shartdagi ikkala qismni bir xil songa soddalashtiramiz (bu SATda vaqtni 40 soniyaga tejaydi!).`,
      `2. **2-bosqich:** Hosil bo'lgan sodda ifodadan noma'lum qiymatni topamiz va uni so'ralgan ifodaga qo'yamiz.`,
      `3. **3-bosqich (Tekshiruv):** Topilgan sonni dastlabki tenglamaga qo'yib, chap va o'ng tomon tengligiga ishonch hosil qilamiz.`,
      ``,
      `🚀 **Keyingi kichik sinov:** Shu usulni o'zlashtirganingizni mustahkamlash uchun yana bitta shunga o'xshash misol beraymi, ${honorific}?${piiNotice}`,
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
  return [
    `Sen "3Talab" o'quv platformasining AI murabbiyisan.`,
    `MUHIM QOIDALAR:`,
    `1. Har doim faqat o'zbek tilida (lotin alifbosida), hurmat va iliqlik bilan gapir.`,
    `2. O'quvchiga "${honorific}" deb murojaat qil (jinsi: ${req.gender === "FEMALE" ? "Qiz bola -> Malikam" : "O'g'il bola -> Shag'zodam"}).`,
    `3. SOCRATIC USUL: Javobni darrov berib qo'yma! Avval o'quvchini o'ylashga yo'naltiradigan savol ber, keyin bosqichma-bosqich tushuntir.`,
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
  // Socratic oqim uchun oxirgi 8 ta xabar kontekst sifatida yuboriladi (PII allaqachon tozalangan)
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
    // Tashqi provayder xato bersa yoki tarmoq bo'lmasa, mahalliy Socratic dvigatelga o'tiladi
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
          // Kalit URL'da emas, sarlavhada — loglarga tushib qolmasligi uchun
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
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
        max_tokens: 700,
        system: systemPrompt,
        messages,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: Array<{ text?: string }> };
    return data.content?.[0]?.text ?? null;
  }

  if (provider === "openrouter" && process.env.OPENROUTER_API_KEY) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
        max_tokens: 700,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? null;
  }

  return null;
}
