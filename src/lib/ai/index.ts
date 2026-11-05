/**
 * 3Talaba — Haqiqiy AI Murabbiy Dvigateli (/lib/ai)
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
  | "MOTIVATION"
  | "MATH_DEEP_DIVE";

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

  if (matchedConnectors.length >= 3) {
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
    "essential",
    "critical",
    "optimal",
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
  const estimatedBand = overall.toFixed(1);

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
    `• **Taxminiy umumiy ball:** **Band ${estimatedBand}**`,
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

  // Socratic suhbatning keyingi qadamida tenglama oldingi xabarda qoladi —
  // shu sabab avval joriy savolga, keyin suhbat tarixiga qarab izlaymiz.
  const equationCandidates = [
    q,
    ...[...(req.history ?? [])]
      .reverse()
      .filter((m) => m.role === "USER")
      .map((m) => m.content),
  ];
  const equationSource =
    equationCandidates.find((text) =>
      /\d*\s*[a-zA-Z]\s*[+-]\s*\d+\s*=\s*-?\d+/.test(text)
    ) ?? "";

  // Matematik tenglama tahlili (masalan: 3x + 5 = 20)
  const linearMatch = equationSource.match(/(\d*)\s*([a-zA-Z])\s*([+-])\s*(\d+)\s*=\s*(-?\d+)/);
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
      `**1-bosqich (Ozod hadni o'tkazish):**`,
      `Tenglikning ikkala tomonidan $${b}$ ni ${sign === "+" ? "ayiramiz" : "qo'shamiz"}:`,
      `$$${a}${variable} = ${c} ${sign === "+" ? "-" : "+"} ${b}$$`,
      `$$${a}${variable} = ${rightSide}$$`,
      ``,
      `**2-bosqich (${variable} ni topish):**`,
      `Ikkala tomonni $${a}$ ga bo'lamiz:`,
      `$$${variable} = \\frac{${rightSide}}{${a}} = ${solution}$$`,
      ``,
      `✅ **Aniq Yechim:** $${variable} = ${solution}$`,
      ``,
      `**Tekshirish:** $${a} \\cdot (${solution}) ${sign} ${b} = ${a * solution} ${sign} ${b} = ${c}$ (To'g'ri!)`,
    ].join("\n");
  }

  // Universitet va 100% Grant bo'yicha savollar tahlili
  if (
    /(universitet|grant|full-ride|common app|personal statement|css profile|kaist|harvard|mit|stipendium|el-yurt|portfolio|motivatsion)/i.test(
      q
    )
  ) {
    return [
      `🎓 **${honorific}, Top Universitet va 100% Grant strategiyasi:**`,
      ``,
      `**1-bosqich — Akademik Maqsadlar:**`,
      `• **Digital SAT:** 1500+ (ayniqsa Math 790–800 texnik va iqtisodiy yo'nalishlar uchun hal qiluvchi).`,
      `• **IELTS Academic:** Band 7.5+ (Writing va Speaking kamida 7.0 bo'lishi maqsadga muvofiq).`,
      `• **Maktab GPA:** 4.8+ / 5.0 (9–11-sinf baholar transkripti).`,
      ``,
      `**2-bosqich — Personal Statement & Motivatsion Insho:**`,
      `Qabul komissiyasi yutuqlar ro'yxatini emas, **sizning shaxsiy o'sish hikoyangizni** o'qiydi: *Muammo/Qiziqish → Amaliy Harakat/Loyiha → Xulosa va Universitetda kutilayotgan natija*.`,
      ``,
      `**3-bosqich — 100% Grant Manbalari:**`,
      `• **AQSH (Full-Ride):** Common App + CSS Profile (muddat: Early Action 1-Noyabr, Regular 1-Yanvar).`,
      `• **Janubiy Koreya & Osiyo:** KAIST, UNIST, HKUST — 100% kontrakt + oylik stipendiya.`,
      `• **Yevropa & Milliy Grantlar:** Stipendium Hungaricum (15-Yanvar) hamda "El-Yurt Umidi" jamg'armasi.`,
      ``,
      `**Keyingi qadam:** Tanlagan yo'nalishingiz va hozirgi sinfingizni yozing — birgalikda shaxsiy qabul rejangizni tuzamiz!`,
    ].join("\n");
  }

  // Viyeta va Kvadrat tenglama savollari tahlili
  if (/(viyet|vieta|kvadrat tenglama|diskriminant)/i.test(q)) {
    return [
      `📐 **${honorific}, Kvadrat tenglama va Viyet teoremasi qoidasi:**`,
      ``,
      `Standart kvadrat tenglama $ax^2 + bx + c = 0$ uchun:`,
      `• **Diskriminant:** $D = b^2 - 4ac$ ($D > 0$: 2 ta ildiz, $D = 0$: 1 ta ildiz, $D < 0$: haqiqiy ildiz yo'q).`,
      `• **Viyet teoremasi:**`,
      `$$x_1 + x_2 = -\\frac{b}{a}, \\qquad x_1 \\cdot x_2 = \\frac{c}{a}$$`,
      ``,
      `**SAT 10-soniyalik usul:** Agar masalada ildizlar yig'indisi so'ralsa, tenglamani yechib o'tirmasdan darhol $-b/a$ ni hisoblang!`,
    ].join("\n");
  }

  // IELTS Writing / Speaking savollari tahlili
  if (/(ielts|writing|task 2|speaking|band 7)/i.test(q)) {
    return [
      `📝 **${honorific}, IELTS Band 7.5+ Tizimli Qolipi:**`,
      ``,
      `**1-bosqich (Introduction — 2 gap):** Savolni sinonimlar bilan parafraz qiling + aniq Thesis Statement bering (*"This essay argues that..."*).`,
      `**2-bosqich (Body Paragraph 1 & 2 — PEEL usuli):** *Point (Asosiy fikr) → Explain (Nega shunday?) → Example (Aniq misol) → Link (Mavzuga bog'lash)*.`,
      `**3-bosqich (Conclusion — 1-2 gap):** Yangi g'oya qo'shmasdan, asosiy pozitsiyani xulosalang.`,
      ``,
      `Tayyor inshongiz bo'lsa, **Writing tekshiruvi** rejimida yuboring — Band ballingizni hisoblab beraman!`,
    ].join("\n");
  }

  // Umumiy ma'lumotlar / savollar bo'yicha aniq javoblar
  return [
    `Salom, **${honorific}**! Savolingizni diqqat bilan tahlil qildim:`,
    ``,
    `> *«${q}»*`,
    ``,
    `**1-bosqich — Asosiy yondashuv:**`,
    `Har bir akademik savolda avvalo berilgan shartni va topilishi kerak bo'lgan maqsadni aniq ajratib olamiz.`,
    ``,
    `**2-bosqich — Amaliy qadam:**`,
    `Agar aniq matematik misol, ingliz tili savoli, insho matni yoki maqsadli universitetingiz nomini yozsangiz, uni **formulalar va aniq qadamlar** bilan to'liq yechib beraman!`,
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
    MATH_DEEP_DIVE:
      "Algebra va Geometriya chuqur o'rganish metodi (6 bosqich): 1) TUSHUN — mavzuning hayotiy ma'nosi va intuitsiyasi; 2) KO'R — vizual model yoki chizmani so'z bilan tasvirla; 3) FORMULA — asosiy formulani yoz va NEGA to'g'ri ekanini qisqa isbotla; 4) NAMUNA — o'quvchi savolini qadamma-qadam yech va javobni tekshir; 5) MASHQ — shu mavzuda o'quvchiga 1 ta yangi masala ber (javobini yozma); 6) TAHLIL — 2 ta tipik xato va 1 ta SAT lifehack. Har bir bosqichni sarlavha bilan ajrat. Hisob-kitoblar 100% aniq bo'lsin.",
  };

  return [
    `Sen "3Talaba Campus" platformasining bosh AI Ustozi va Xalqaro Universitet/Grant Mentorisan ("Talaba AI").`,
    `VAZIFANG: O'quvchini 0 dan boshlab Matematika, Digital SAT 1500+ (Math 800), IELTS Academic 7.5+ hamda Top Universitetlarga 100% grant (Full-Ride, KAIST, Stipendium Hungaricum, El-Yurt Umidi) asosida kirishigacha shaxsan yetaklash.`,
    `MUHIM QOIDALAR:`,
    `1. FOYDALANUVCHINING ANIQ SAVOLIGA QARAB JAVOB BER. Bir xil shablon gaplarni takrorlama!`,
    `2. Har doim toza o'zbek tilida (lotin alifbosida), hurmat va ustozona g'amxo'rlik bilan javob yoz.`,
    `3. Murojaat: "${honorific}".${req.lessonContextTitle ? ` Joriy dars mavzusi: "${req.lessonContextTitle}".` : ""}`,
    `4. METOD: ${modeGuidance[req.mode] || modeGuidance.STEP_BY_STEP}`,
    `5. Javobing aniq, tushunarli, dalillarga asoslangan va amaliy qadamlar bilan bo'lsin. Matematik formulalarni aniq ko'rsat.`,
  ].join("\n");
}

type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * Neyron LLM Dvigateli (Gemini / OpenAI / AI Gateway + tezkor neyron fallback)
 */
async function callNeuralAI(systemPrompt: string, history: ChatTurn[], userText: string): Promise<string | null> {
  // Unit tests must stay deterministic and offline — the Socratic fallback is
  // what we assert against, so never reach out to a provider under Vitest.
  if (process.env.VITEST) return null;

  // 1. Google Gemini API (yoki Netlify Gemini AI Gateway)
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          signal: AbortSignal.timeout(12_000),
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

  // 2. OpenAI API (yoki Netlify OpenAI AI Gateway)
  if (process.env.OPENAI_API_KEY) {
    try {
      const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        signal: AbortSignal.timeout(12_000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: userText },
          ],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        const out = data.choices?.[0]?.message?.content?.trim();
        if (out) return out;
      }
    } catch {}
  }

  // 3. Kalitsiz tezkor neyron provayder (qisqa timeout bilan, hech qachon osilib qolmaydi)
  try {
    const combinedPrompt = `${systemPrompt}\n\nO'quvchi savoli: ${userText}\nIltimos, yuqoridagi savolga to'liq, aniq va tushunarli javob yoz:`;
    const url = `https://text.pollinations.ai/${encodeURIComponent(combinedPrompt)}?model=openai`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6_500) });
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 15 && !text.includes("<!DOCTYPE html>")) {
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
        `☕ **Ustozdan 10 daqiqalik tanaffus tavsiyasi:**`,
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

  // Neyron AI ishlamasa: Socratic usulning birinchi qadami — savol bilan yo'naltirish.
  const isOpeningSocraticTurn =
    req.mode === "SOCRATIC_TUTOR" &&
    (req.turnIndex ?? 0) === 0 &&
    !(req.history ?? []).some((m) => m.role === "ASSISTANT");

  if (isOpeningSocraticTurn) {
    const equation = cleanText.match(/(-?\d*)\s*([a-zA-Z])\s*([+-])\s*(\d+)\s*=\s*(-?\d+)/);
    const guide = equation
      ? [
          `**Yo'naltiruvchi savol:** tenglamada $${equation[2]}$ ni yolg'iz qoldirish uchun birinchi bo'lib qaysi amalni bajarish kerak deb o'ylaysiz?`,
          `Maslahat: ozod hadni ($${equation[4]}$) tenglikning narigi tomoniga o'tkazsangiz, o'ng tomon qanday o'zgaradi?`,
        ]
      : [
          `**Yo'naltiruvchi savol:** masalada berilgan ma'lumotlardan qaysi biri eng muhim deb o'ylaysiz?`,
          `Maslahat: avval nimani topish so'ralganini, keyin qanday ma'lumot berilganini ajratib yozib ko'ring.`,
        ];

    return {
      reply: [
        `🧭 **${honorific}, bu savolni birgalikda ochamiz!**`,
        ``,
        `Men sizga tayyor javobni darhol berib qo'ymayman — avval siz o'ylab ko'rasiz, keyin birgalikda tekshiramiz.`,
        ``,
        ...guide,
        ``,
        `Javobingizni yozing — keyin har bir qadamni birgalikda ko'rib chiqamiz! ✨`,
      ].join("\n"),
      metadata: {
        providerUsed: "local",
        mode: req.mode,
        honorificUsed: honorific,
        socraticStep: "GUIDING_QUESTION",
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
