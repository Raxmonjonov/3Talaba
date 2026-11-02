/**
 * 3Talab — JARVIS jonli ovozli ustoz (Gemini Live)
 *
 * JARVIS-OS-V.2 arxitekturasidan moslashtirilgan:
 * - Gemini Live native audio (PCM 16 kHz kirish / 24 kHz chiqish)
 * - Qisqa muddatli (ephemeral) token — haqiqiy API kalit brauzerga chiqmaydi
 * - Dars kontekstiga moslashtirilgan o'qituvchilik prompti
 */

export interface LiveTeacherExample {
  title: string;
  problem: string;
  stepByStepSolution: string[];
  takeaway: string;
}

export interface LiveTeacherQuestion {
  promptUz: string;
  passageUz?: string | null;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanationUz: string;
  hints: string[];
}

export interface LiveTeacherLesson {
  titleUz: string;
  summaryUz: string;
  theoryMarkdown: string;
  examples: LiveTeacherExample[];
  questions: LiveTeacherQuestion[];
  estMinutes: number;
  subjectNameUz: string;
  topicTitleUz: string;
  nextLessonTitleUz?: string | null;
}

export interface LiveTeacherStudent {
  honorific: string;
  level?: string | null;
  grade?: string | null;
  targetUniversity?: string | null;
}

export interface LiveTeacherRuntimeConfig {
  apiKey: string;
  model: string;
  voice: string;
  wsUrl: string;
}

export const DEFAULT_LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
export const DEFAULT_LIVE_VOICE = "Puck";
export const LIVE_TEACHER_TOKEN_TTL_MS = 30 * 60 * 1000;
export const LIVE_TEACHER_SESSION_TTL_MS = 2 * 60 * 1000;

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained";

export class LiveTeacherTokenError extends Error {
  readonly status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "LiveTeacherTokenError";
    this.status = status;
  }
}

export function normalizeLiveModel(model?: string | null): string {
  const value = (model || DEFAULT_LIVE_MODEL).trim();
  return value.replace(/^models\//, "") || DEFAULT_LIVE_MODEL;
}

export function getLiveTeacherConfig(): LiveTeacherRuntimeConfig {
  return {
    apiKey: (process.env.GEMINI_API_KEY || "").trim(),
    model: normalizeLiveModel(process.env.GEMINI_LIVE_MODEL),
    voice: (process.env.GEMINI_LIVE_VOICE || DEFAULT_LIVE_VOICE).trim() || DEFAULT_LIVE_VOICE,
    wsUrl: GEMINI_WS_BASE,
  };
}

export function isLiveTeacherConfigured(): boolean {
  return Boolean(getLiveTeacherConfig().apiKey);
}

export function buildLiveTeacherWebSocketUrl(token: string): string {
  return `${GEMINI_WS_BASE}?access_token=${encodeURIComponent(token)}`;
}

/**
 * Gemini Live native audio talaffuzi uchun LaTeX/Markdown belgilarini
 * tabiiy o'zbekcha so'zlarga aylantiradi.
 */
export function toSpokenText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$?/g, " ")
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1 bo'lingan $2")
    .replace(/\\sqrt\{([^{}]+)\}/g, "ildiz ostida $1")
    .replace(/\\cdot|\\times/g, " ko'paytirish ")
    .replace(/\\div/g, " bo'lish ")
    .replace(/\\neq/g, " teng emas ")
    .replace(/\\leq?/g, " kichik yoki teng ")
    .replace(/\\geq?/g, " katta yoki teng ")
    .replace(/\\pi/g, " pi ")
    .replace(/\\circ/g, " daraja ")
    .replace(/\^2/g, " kvadrat")
    .replace(/\^3/g, " kub")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*_`>]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatOptions(options: Array<{ id: string; text: string }>): string {
  if (!options.length) return "(variantlar yo'q)";
  return options.map((option) => `${option.id}) ${toSpokenText(option.text)}`).join("; ");
}

function formatExamples(examples: LiveTeacherExample[]): string {
  if (!examples.length) return "(misollar kiritilmagan)";

  return examples
    .map((example, index) => {
      const steps = example.stepByStepSolution
        .map((step, stepIndex) => `  ${stepIndex + 1}. ${toSpokenText(step)}`)
        .join("\n");
      return [
        `Misol ${index + 1}: ${toSpokenText(example.title)}`,
        `  Masala: ${toSpokenText(example.problem)}`,
        steps,
        `  Xulosa: ${toSpokenText(example.takeaway)}`,
      ].join("\n");
    })
    .join("\n\n");
}

function formatQuestions(questions: LiveTeacherQuestion[]): string {
  if (!questions.length) return "(mashq savollari kiritilmagan)";

  return questions
    .map((question, index) => {
      const passage = question.passageUz
        ? `\n  Matn: ${toSpokenText(question.passageUz)}`
        : "";
      const hints = question.hints.length
        ? `\n  Maslahatlar: ${question.hints.map((hint) => toSpokenText(hint)).join(" | ")}`
        : "";
      return [
        `Savol ${index + 1}: ${toSpokenText(question.promptUz)}${passage}`,
        `  Variantlar: ${formatOptions(question.options)}`,
        `  To'g'ri javob (o'quvchiga aytma): ${question.correctAnswer}`,
        `  Izoh: ${toSpokenText(question.explanationUz)}${hints}`,
      ].join("\n");
    })
    .join("\n\n");
}

export interface LiveTeacherContext {
  /** Darsning joriy bosqichi: THEORY | EXAMPLES | EXERCISES | ANALYSIS */
  stage?: string;
  /** Joriy mashq savoli indeksi (0 dan boshlanadi) */
  questionIndex?: number;
  /** Jami mashq savollari soni */
  totalQuestions?: number;
}

const STAGE_LABELS: Record<string, string> = {
  THEORY: "nazariya va metodlar",
  EXAMPLES: "hayotiy misollar",
  EXERCISES: "mustaqil mashqlar",
  ANALYSIS: "yakuniy tahlil",
};

/**
 * `lesson_control` tool deklaratsiyasi — Gemini Live sessiyasiga beriladi.
 * Agent shu tool orqali dars bosqichini boshqaradi.
 */
export const LIVE_TEACHER_TOOL_DECLARATIONS = [
  {
    name: "lesson_control",
    description:
      "Dars bosqichini boshqarish. O'quvchi keyingi bosqichga o'tishga rozi bo'lganda yoki aniq buyruq berganda chaqir.",
    parameters: {
      type: "OBJECT",
      properties: {
        action: {
          type: "STRING",
          enum: ["theory", "examples", "exercises", "hint"],
          description:
            "theory — nazariyaga qaytish; examples — misollarga o'tish; exercises — mashqlarga o'tish; hint — joriy mashq uchun maslahat ko'rsatish.",
        },
      },
      required: ["action"],
    },
  },
];

/**
 * Dars ma'lumotlari asosida JARVIS uchun o'qituvchilik tizim promptini quradi.
 */
export function buildLiveTeacherPrompt(
  lesson: LiveTeacherLesson,
  student: LiveTeacherStudent,
  context: LiveTeacherContext = {},
): string {
  const honorific = student.honorific?.trim() || "aziz o'quvchi";
  const level = student.level || "BEGINNER";
  const target = student.targetUniversity || "tanlangan universitet";
  const grade = student.grade || "noma'lum";
  const stageLabel = STAGE_LABELS[context.stage || "THEORY"] || "nazariya va metodlar";
  const questionLine =
    typeof context.questionIndex === "number" && context.totalQuestions
      ? `- Hozir ekranda ${context.questionIndex + 1}-mashq ko'rsatilmoqda (jami ${context.totalQuestions} ta).`
      : "";

  return [
    "Sen — JARVIS, 3Talab ta'lim platformasining jonli ovozli ustozisan (JARVIS MARK XXXIX o'quv rejimi).",
    "Sening vazifang — o'quvchiga darsni shunchaki o'qib bermaslik, balki jonli suhbat orqali tushuntirish, savol berish va bilimini tekshirish.",
    "",
    "O'QUVCHI HAQIDA:",
    `- Murojaat: "${honorific}" (hurmat bilan, iliq ohangda ishlat).`,
    `- Darajasi: ${level}. Sinfi: ${grade}. Maqsadi: ${target}.`,
    "",
    "DARS HAQIDA:",
    `- Fan: ${lesson.subjectNameUz}`,
    `- Mavzu: ${lesson.topicTitleUz}`,
    `- Dars nomi: ${lesson.titleUz}`,
    `- Davomiyligi: ${lesson.estMinutes} daqiqa.`,
    `- Maqsad: ${toSpokenText(lesson.summaryUz)}`,
    lesson.nextLessonTitleUz ? `- Keyingi dars: ${toSpokenText(lesson.nextLessonTitleUz)}` : "",
    "",
    "JORIY HOLAT (ekranda ko'rinib turgan qism):",
    `- O'quvchi hozir "${stageLabel}" bosqichida. Suhbatni shu bosqichga moslab olib bor.`,
    questionLine,
    "",
    "NAZARIYA (o'quvchiga tushuntirish uchun manba):",
    toSpokenText(lesson.theoryMarkdown),
    "",
    "NAMUNAVIY MISOLLAR:",
    formatExamples(lesson.examples),
    "",
    "MASHQ SAVOLLARI (to'g'ri javoblar sen uchun, o'quvchiga oldindan aytma):",
    formatQuestions(lesson.questions),
    "",
    "O'QITISH PROTOKOLI (qat'iy rioya qil):",
    "1. Boshlash: qisqa salomlash, o'zingni JARVIS deb tanishtir va bugungi maqsadni 1-2 gapda ayt. So'ng \"Tayyormisiz?\" deb so'ra.",
    "2. Har bir javobing 2-4 gapdan oshmasin. Uzun monolog, ro'yxat yoki paragraf o'qib berma.",
    "3. Sokratik usul: avval tushuntir, keyin bitta aniq savol ber va o'quvchi javobini kut.",
    "4. O'quvchi xato qilsa — to'g'ri javobni darhol aytma. Bitta maslahat ber, yana harakat qilishga unda. Ikkinchi xatodan keyin qadamma-qadam tushuntir.",
    "5. O'quvchi to'g'ri javob bersa — qisqa maqtov ayt va keyingi kichik qadamga o't.",
    "6. Har 2-3 daqiqada bitta tekshiruv savoli ber. Savollarni darsdagi mashqlardan ol.",
    "7. Formulalarni so'z bilan ayt: \"x kvadrat\", \"ildiz ostida\", \"bo'lingan\" kabi. LaTeX, yulduzcha yoki murakkab belgilarni ovoz chiqarib o'qima.",
    "8. O'quvchi \"keyingi\", \"davom\", \"tushundim\" desa — keyingi qismga o'tishdan oldin bir marta tasdiqla.",
    "9. O'quvchi charchaganini aytsa — 1 daqiqalik tanaffus taklif qil va keyin davom ettir.",
    "10. Mavzudan chetga chiqsa — muloyim ravishda darsga qaytar. Faqat ta'lim va o'quv maqsadlariga oid savollarga javob ber.",
    "11. Dars oxirida: 3 ta asosiy xulosa, 1 ta uyga vazifa va keyingi darsni qisqa eslatib o't.",
    "12. Faqat o'zbek tilida (lotin alifbosida) gapir. Ingliz tilini faqat atama sifatida ishlat.",
    "13. O'quvchi gapni bo'lsa yoki \"to'xta\" desa — darhol to'xta va tingla.",
    "14. Hech qachon o'zingni Gemini yoki Google modeli deb tanishtirma; sen JARVIS — 3Talab ustozisan.",
    "",
    "DARS BOSQICHLARI VA lesson_control TOOL:",
    "- Bosqichlar: nazariya → misollar → mashqlar → xulosa.",
    "- O'quvchi keyingi bosqichga o'tishga rozi bo'lsa yoki aniq buyruq bersa, lesson_control toolini chaqir:",
    "  action=\"theory\" — nazariyaga qaytish;",
    "  action=\"examples\" — misollarga o'tish;",
    "  action=\"exercises\" — mashqlarga o'tish;",
    "  action=\"hint\" — joriy mashq uchun maslahat ko'rsatish.",
    "- Tool natijasini kut, keyin o'quvchiga nima o'zgarganini bir gapda ayt.",
    "- Bosqichni o'quvchi roziligisiz o'zgartirma.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Gemini Live uchun bir martalik ephemeral token yaratadi.
 * Token 30 daqiqa amal qiladi, yangi sessiya boshlash uchun 2 daqiqa.
 */
export async function createLiveEphemeralToken(
  config: LiveTeacherRuntimeConfig = getLiveTeacherConfig(),
): Promise<{ token: string; expiresAt: string }> {
  if (!config.apiKey) {
    throw new LiveTeacherTokenError("GEMINI_API_KEY sozlanmagan", 503);
  }

  const now = Date.now();
  const expiresAt = new Date(now + LIVE_TEACHER_TOKEN_TTL_MS).toISOString();
  const newSessionExpireTime = new Date(
    now + LIVE_TEACHER_SESSION_TTL_MS,
  ).toISOString();

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_BASE}/auth_tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      body: JSON.stringify({
        uses: 1,
        expireTime: expiresAt,
        newSessionExpireTime,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new LiveTeacherTokenError(
      "Gemini Live xizmatiga ulanib bo'lmadi. Internet aloqasini tekshiring.",
      502,
    );
  }

  const raw = await response.text();
  if (!response.ok) {
    throw new LiveTeacherTokenError(
      `Gemini Live token yaratilmadi (${response.status}): ${raw.slice(0, 180)}`,
      response.status === 400 || response.status === 401 ? 502 : response.status,
    );
  }

  let payload: { name?: string } = {};
  try {
    payload = JSON.parse(raw) as { name?: string };
  } catch {
    throw new LiveTeacherTokenError("Gemini Live javobi o'qilmadi", 502);
  }

  if (!payload.name) {
    throw new LiveTeacherTokenError("Gemini Live tokeni bo'sh qaytdi", 502);
  }

  return { token: payload.name, expiresAt };
}
