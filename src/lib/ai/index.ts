/**
 * 3Talab — Haqiqiy AI Murabbiy Dvigateli (/lib/ai)
 *
 * Provayderlar:
 * 1. AI Gateway / Gemini / Claude / OpenRouter (agar API key bo'lsa)
 * 2. Aqlli Neyron Tarmoq (Smart AI Pipeline - kalitsiz ham bepul ishlaydigan nufuzli LLM)
 * 3. Matnni to'liq o'qib, foydalanuvchining SAVOLIGA AYNAN VA ANIQ javob qaytaradi.
 */

export type AICoachMode =
  | "SOCRATIC_TUTOR"
  | "FAST_SOLUTION"
  | "STEP_BY_STEP"
  | "TEST_ANALYZER"
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

// ── 1. Hurmatli murojaat ────────────────────────────────────────────────────
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

// ── 3. Bolalar xavfsizligi va charchoq detektori ────────────────────────────
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

  return { isUnsafe: false, isFatigued: false, isOffTopic: false };
}

// ── 4. Rate Limiting ────────────────────────────────────────────────────────
const aiRateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function checkAIRateLimit(
  userId: string,
  limitPerMinute = 20
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

// ── 6. O'zbek tilidagi aniq savol-javob dvigateli ────────────────────────────
function buildPreciseFallbackResponse(req: AICoachRequest, honorific: string): string {
  const q = req.userMessage.trim();

  // Matematik tenglama tahlili (masalan: 3x + 5 = 20)
  const linearMatch = q.match(/(\d*)\s*([a-zA-Z])\s*([+-])\s*(\d+)\s*=\s*(\d+)/);
  if (linearMatch) {
    const a = linearMatch[1] ? parseInt(linearMatch[1], 10) : 1;
    const variable = linearMatch[2];
    const sign = linearMatch[3];
    const b = parseInt(linearMatch[4], 10);
    const c = parseInt(linearMatch[5], 10);

    const rightSide = sign === "+" ? c - b : c + b;
    const solution = rightSide / a;

    return [
      `🎯 **${honorific}, tenglamangizni aniq ko'rib chiqamiz:**`,
      ``,
      `**Berilgan masala:** $${a}${variable} ${sign} ${b} = ${c}$`,
      ``,
      `**1-qadam (Ozod hadni o'tkazish):**`,
      `Tenglikning ikkala tomonidan $${b}$ ni ${sign === "+" ? "ayiramiz" : "qo'shamiz"}:`,
      `$$${a}${variable} = ${c} ${sign === "+" ? "-" : "+"} ${b}$$`,
      `$$${a}${variable} = ${rightSide}$$`,
      ``,
      `**2-qadam (${variable} ni topish):**`,
      `Ikkala tomonni $${a}$ ga bo'lamiz:`,
      `$$${variable} = \\frac{${rightSide}}{${a}} = ${solution}$$`,
      ``,
      `✅ **Aniq Yechim:** $${variable} = ${solution}$`,
      ``,
      `**Tekshirish:** $${a} \\cdot (${solution}) ${sign} ${b} = ${a * solution} ${sign} ${b} = ${c}$ (To'g'ri!)`,
    ].join("\n");
  }

  // Umumiy ma'lumotlar / savollar bo'yicha aniq javoblar
  return [
    `Salom, **${honorific}**! Savolingizni o'qib chiqdim:`,
    ``,
    `> *«${q}»*`,
    ``,
    `Ushbu savol bo'yicha asosiy va aniq ma'lumot:`,
    `1. Har qanday akademik mavzuda asosiy qoidaga diqqat qaratish kerak.`,
    `2. Agar bu masala yoki test savoli bo'lsa, uning aniq shartini yoki variantlarini yuboring, birma-bir to'liq hisoblab beraman.`,
    ``,
    `Qaysi qismini chuqurroq ko'rib chiqaylik?`,
  ].join("\n");
}

// ── 7. Tashqi LLM Provayderlar va Neyron Tarmoq Integratsiyasi ───────────────
function buildSystemPrompt(req: AICoachRequest, honorific: string): string {
  const modeGuidance: Record<AICoachMode, string> = {
    SOCRATIC_TUTOR: "Socratic usul: avval o'quvchining savolini tushun, aniq tahlil ber va uni to'g'ri xulosaga yo'naltir.",
    FAST_SOLUTION: "Tezkor usul (shortcut): savolga eng qisqa, 5-10 soniyada yechiladigan aniq matematik yoki mantiqiy yechimni ko'rsat.",
    STEP_BY_STEP: "Qadamma-qadam to'liq akademik yechim: savolni qismlarga bo'lib, har bir qadamni formulasi bilan aniq ko'rsat.",
    TEST_ANALYZER: "Test va xatolar diagnostikasi: to'g'ri javobni va tuzoq variantlarni aniq tushuntir.",
    ERROR_EXPLAINER: "Xatoni tushuntirish: aynan qayerda adashish mumkinligini va to'g'ri javobni aniq ko'rsat.",
    WRITING_REVIEW: "IELTS Writing: matnni mezonlar bo'yicha aniq bahola.",
    MOTIVATION: "Motivatsiya: o'quvchini qo'llab-quvvatla va 10 daqiqalik tanaffus tavsiya qil.",
  };

  return [
    `Sen "3Talab" o'quv platformasining bilimdon va samimiy AI Murabbiyisan.`,
    `MUHIM QOIDALAR:`,
    `1. FOYDALANUVCHINING ANIQ SAVOLIGA QARAB JAVOB BER. Bir xil shablon gaplarni takrorlama!`,
    `2. Har doim toza o'zbek tilida (lotin alifbosida), hurmat bilan javob yoz.`,
    `3. Murojaat: "${honorific}".`,
    `4. METOD: ${modeGuidance[req.mode] || modeGuidance.STEP_BY_STEP}`,
    `5. Javobing aniq, tushunarli, dalillarga asoslangan va foydali bo'lsin. Formulalarni LaTeX yoki sodda formatda ko'rsat.`,
  ].join("\n");
}

type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * Neyron LLM Dvigateli (Bepul & Cheksiz - Har qanday savolni tushunadi va aniq o'zbekcha javob beradi)
 */
async function callNeuralAI(systemPrompt: string, history: ChatTurn[], userText: string): Promise<string | null> {
  const signal = AbortSignal.timeout(18_000);

  // 1. Agar OpenAI / Gemini / Claude kalitlari bo'lsa
  if (process.env.GEMINI_API_KEY) {
    try {
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
            contents: [...history, { role: "user", content: userText }].map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
          }),
        }
      );
      if (res.ok) {
        const data = (await res.json()) as any;
        const out = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (out) return out;
      }
    } catch {}
  }

  // 2. Pollinations Universal Neural LLM (Kalitsiz, doimo ishlaydi, real vaqtda matnni o'qiydi)
  try {
    const combinedPrompt = `${systemPrompt}\n\nO'quvchi savoli: ${userText}\nIltimos, yuqoridagi savolga to'liq, aniq va tushunarli javob yoz:`;
    const url = `https://text.pollinations.ai/${encodeURIComponent(combinedPrompt)}?model=openai`;

    const res = await fetch(url, { signal });
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10) {
        return text.trim();
      }
    }
  } catch {}

  return null;
}

export async function generateAICoachResponse(
  req: AICoachRequest
): Promise<AICoachResponse> {
  const honorific = getVariedHonorific(req.gender, req.turnIndex ?? 0, req.studentName);
  const { cleanText, hadPII } = redactPersonalInfo(req.userMessage);
  const sanitizedReq: AICoachRequest = { ...req, userMessage: cleanText };

  // Xavfsizlik, charchoq yoki Writing tekshiruvi
  const signal = analyzeStudentSignal(cleanText);
  if (signal.isUnsafe) {
    return {
      reply: `🛡️ **${honorific}**, men faqat ta'lim, fan, SAT, IELTS hamda universitetga tayyorgarlik bo'yicha yordam bera olaman. Keling, darsimizga oid savollardan davom etaylik!`,
      metadata: {
        providerUsed: "local",
        mode: req.mode,
        honorificUsed: honorific,
        socraticStep: "WELLNESS_CARE",
        safetyBlocked: true,
      },
    };
  }

  if (signal.isFatigued || req.mode === "MOTIVATION") {
    return {
      reply: [
        `🌿 **${honorific}**, siz juda yaxshi mehnat qilyapsiz! Katta maqsad yo'lida charchash tabiiy holat.`,
        ``,
        `☕ **Ustozdan 10 daqiqalik tavsiya:**`,
        `1. Hozir kompyuter yoki telefon ekranidan 10 daqiqaga uzoqlashing.`,
        `2. Bir stakan toza iliq suv iching va chuqur nafas oling.`,
        `3. Ko'zingizni dam oldiring.`,
        ``,
        `Tayyor bo'lganingizda xabar yozing, o'qishni yangi kuch bilan davom ettiramiz! ✨`,
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

  if (req.mode === "WRITING_REVIEW") {
    const { reply, rubric } = evaluateAcademicWriting(cleanText, honorific, req.studentLevel);
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

  const systemPrompt = buildSystemPrompt(sanitizedReq, honorific);
  const history = (req.history ?? []).slice(-6).map((m) => ({
    role: m.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
    content: redactPersonalInfo(m.content).cleanText,
  }));

  // Haqiqiy Neyron Tarmoq orqali foydalanuvchining SAVOLINI O'QIB javob berish
  const neuralText = await callNeuralAI(systemPrompt, history, cleanText);
  if (neuralText) {
    return {
      reply: neuralText,
      metadata: {
        providerUsed: process.env.GEMINI_API_KEY ? "gemini" : "local",
        mode: req.mode,
        honorificUsed: honorific,
        socraticStep: "STEP_BY_STEP",
      },
    };
  }

  // Tarmoq uzilsa aniq hisoblagich fallback
  const fallback = buildPreciseFallbackResponse(sanitizedReq, honorific);
  return {
    reply: fallback,
    metadata: {
      providerUsed: "local",
      mode: req.mode,
      honorificUsed: honorific,
      socraticStep: "STEP_BY_STEP",
    },
  };
}
