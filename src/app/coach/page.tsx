"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  Coffee,
  Compass,
  Eraser,
  Feather,
  Globe2,
  GraduationCap,
  HelpCircle,
  ListOrdered,
  Search,
  Send,
  ShieldCheck,
  Sigma,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type { AICoachMetadata, AICoachMode } from "@/lib/ai";
import { ThinkingBubble } from "@/components/ai/TypewriterText";
import { CoachSpeechButton } from "@/components/coach/CoachSpeechButton";
import {
  StructuredMessage,
  messageToPlainText,
} from "@/components/coach/StructuredMessage";
import {
  buildSmartFallback,
  type CoachSubjectId,
} from "@/lib/coach/smart-fallback";
import { useBrowserSpeech } from "@/lib/voice/useBrowserSpeech";

interface ChatMsgItem {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  metadata?: AICoachMetadata | null;
  createdAt: string;
}

interface CoachPayload {
  student: {
    name: string;
    gender: "FEMALE" | "MALE";
    honorific: string;
    currentLevel: string;
    targetUniversity: string;
    xpTotal: number;
  };
  activeSession: {
    id: string;
    title: string;
    mode: AICoachMode;
    messages: ChatMsgItem[];
  } | null;
  sessions: Array<{
    id: string;
    title: string;
    mode: string;
    updatedAt: string;
    messageCount: number;
  }>;
}

interface IconComponentProps {
  className?: string;
}

interface CoachSubjectConfig {
  id: CoachSubjectId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<IconComponentProps>;
  accent: "neon" | "gold";
  tagline: string;
  greeting: string;
  practicePrompts: Array<{ label: string; text: string }>;
}

interface ModeConfig {
  id: AICoachMode;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<IconComponentProps>;
}

interface StarterPrompt {
  id: string;
  icon: React.ComponentType<IconComponentProps>;
  title: string;
  subtitle: string;
  text: string;
  subjectId: CoachSubjectId;
  mode: AICoachMode;
}

const COACH_SUBJECTS: CoachSubjectConfig[] = [
  {
    id: "sat-math",
    label: "SAT Math",
    shortLabel: "SAT Math",
    icon: Calculator,
    accent: "neon",
    tagline: "Algebra, geometriya va Digital SAT Math tuzoqlari",
    greeting:
      "Bugun SAT Math bo'yicha eng qiyin tuzoqlarni birgalikda yechamiz. Avval o'zingiz o'ylaysiz — men faqat to'g'ri yo'lga yo'naltiraman.",
    practicePrompts: [
      {
        label: "📐 6x + 10 = 34 mantiqiy siri",
        text: "Ustoz, 6x + 10 = 34 tenglamadan 3x + 5 ni x ni topmasdan qanday tez hisoblayman?",
      },
      {
        label: "⚡ SAT Math: 5 soniyalik shortcut",
        text: "SAT Math'da vaqtni tejaydigan eng kuchli 3 ta shortcut usulini misollar bilan tushuntiring.",
      },
    ],
  },
  {
    id: "sat-rw",
    label: "SAT Reading & Writing",
    shortLabel: "SAT R&W",
    icon: BookOpen,
    accent: "gold",
    tagline: "Dalilga asoslangan o'qish, bog'lovchilar va grammatika",
    greeting:
      "SAT Reading & Writing'da matnni tezroq tushunish va dalilga asoslangan javob tanlashni birgalikda mashq qilamiz.",
    practicePrompts: [
      {
        label: "🔗 Moreover va However farqi",
        text: "SAT Reading & Writingda However va Moreover bog'lovchilarini qanday aniq farqlayman?",
      },
      {
        label: "🧠 Paired Passages strategiyasi",
        text: "SAT'dagi Paired Passages savollarini vaqtni yo'qotmasdan yechish strategiyasini tushuntiring.",
      },
    ],
  },
  {
    id: "ielts",
    label: "IELTS Academic",
    shortLabel: "IELTS",
    icon: Globe2,
    accent: "neon",
    tagline: "Writing Task 1/2, Reading va Speaking uchun Band 7.5+",
    greeting:
      "IELTS Academic bo'yicha maqsadingiz Band 7.5+ bo'lsa, bugun Writing, Reading va Speaking uchun aniq tizim quramiz.",
    practicePrompts: [
      {
        label: "📝 Writing Task 2: Band 7.5+ tuzilma",
        text: "IELTS Writing Task 2 uchun Band 7.5+ darajadagi to'liq insho tuzilmasini qadam-baqadam tushuntiring.",
      },
      {
        label: "🎤 Speaking Part 2: 2 daqiqalik javob",
        text: "IELTS Speaking Part 2 uchun 2 daqiqalik javobni qanday rejalashtirish va ravon gapirishni o'rgating.",
      },
    ],
  },
  {
    id: "deep-math",
    label: "Chuqur Algebra & Geometriya",
    shortLabel: "Deep Math",
    icon: Sigma,
    accent: "gold",
    tagline: "Formulalar isboti, Viyeta, diskriminant va geometriya",
    greeting:
      "Chuqur algebra va geometriyada formulalarni yodlamaymiz — ular qayerdan kelib chiqishini va qachon ishlatishni tushunamiz.",
    practicePrompts: [
      {
        label: "🔺 Diskriminant qayerdan keladi?",
        text: "Diskriminant formulasi qayerdan kelib chiqadi va u ildizlar sonini qanday aniqlaydi?",
      },
      {
        label: "⭕ Aylana sektori va yoyi",
        text: "Radiusi 10 bo'lgan aylanada 72° li sektor yuzi va yoy uzunligini chuqur tushuntirib bering.",
      },
    ],
  },
  {
    id: "admissions",
    label: "Universitet & 100% Grant Yo'li",
    shortLabel: "OTM & Grant",
    icon: GraduationCap,
    accent: "neon",
    tagline: "Common App, Personal Statement, CSS Profile va Xalqaro Grantlar",
    greeting:
      "Top universitetlar va 100% grant (AQSH Full-Ride, KAIST, Stipendium Hungaricum, El-Yurt Umidi) bo'yicha shaxsiy qabul strategiyangizni, portfoliongizni va insholaringizni birgalikda quramiz.",
    practicePrompts: [
      {
        label: "🎓 100% Full-Ride Grant strategiyasi",
        text: "AQSH, Koreya (KAIST) va Yevropa universitetlaridan 100% grant yutish uchun 0 dan qanday qadamlar qo'yishim kerak?",
      },
      {
        label: "✍️ Common App Personal Statement (650 so'z)",
        text: "Top universitetlar qabul komissiyasini hayratda qoldiradigan Common App Personal Statement inshosini qanday tuzaman?",
      },
    ],
  },
];

const MODE_META: Record<AICoachMode, ModeConfig> = {
  SOCRATIC_TUTOR: {
    id: "SOCRATIC_TUTOR",
    label: "Sokratik rejim",
    shortLabel: "Sokratik izlanish",
    description:
      "AI tayyor javobni aytmaydi — yo'naltiruvchi savollar berib, o'quvchining o'zini javob topishga undaydi.",
    icon: Brain,
  },
  STEP_BY_STEP: {
    id: "STEP_BY_STEP",
    label: "Qadamma-qadam tushuntirish",
    shortLabel: "Qadamma-qadam",
    description:
      "Mavzu yoki misolni 0 dan maydalab, har bir amal va formulani alohida tushuntiradi.",
    icon: ListOrdered,
  },
  ERROR_EXPLAINER: {
    id: "ERROR_EXPLAINER",
    label: "Xatolar tahlili",
    shortLabel: "Xatolar tahlili",
    description:
      "O'quvchi yechimini yozsa, qayerda mantiqiy xato qilganini topib, to'g'ri yo'lni ko'rsatadi.",
    icon: Search,
  },
  FAST_SOLUTION: {
    id: "FAST_SOLUTION",
    label: "Tezkor yechim",
    shortLabel: "Tezkor yechim",
    description: "SAT va IELTSda vaqtni tejaydigan qisqa usullar.",
    icon: Zap,
  },
  TEST_ANALYZER: {
    id: "TEST_ANALYZER",
    label: "Test tahlili",
    shortLabel: "Test tahlili",
    description: "Chalg'ituvchi variantlarni aniqlash va xato ildizini topish.",
    icon: Target,
  },
  WRITING_REVIEW: {
    id: "WRITING_REVIEW",
    label: "Writing tekshiruvi",
    shortLabel: "Writing tahlili",
    description:
      "IELTS Task 1/2 va akademik insholarni Band mezonlari bo'yicha baholaydi.",
    icon: Feather,
  },
  MOTIVATION: {
    id: "MOTIVATION",
    label: "Dam olish & motivatsiya",
    shortLabel: "G'amxo'rlik",
    description:
      "Charchoqni yengish, qisqa tanaffus va ruhiy quvvat uchun suhbat.",
    icon: Coffee,
  },
  MATH_DEEP_DIVE: {
    id: "MATH_DEEP_DIVE",
    label: "Chuqur matematika",
    shortLabel: "Chuqur matematika",
    description: "6 bosqichli chuqur algebra va geometriya metodi.",
    icon: Sigma,
  },
};

const CORE_MODES: ModeConfig[] = [
  MODE_META.SOCRATIC_TUTOR,
  MODE_META.STEP_BY_STEP,
  MODE_META.ERROR_EXPLAINER,
];

const EXTRA_MODES: ModeConfig[] = [
  MODE_META.WRITING_REVIEW,
  MODE_META.MOTIVATION,
];

const MODE_PRACTICE_PROMPTS: Record<
  AICoachMode,
  Array<{ label: string; text: string }>
> = {
  SOCRATIC_TUTOR: [
    {
      label: "🧭 Sokratik savol bilan boshlash",
      text: "Ustoz, 6x + 10 = 34 tenglamani birgalikda tahlil qilamizmi? Menga tayyor javobni aytmang, avval o'zim urinaman.",
    },
  ],
  STEP_BY_STEP: [
    {
      label: "📘 Kvadrat tenglamani noldan yechish",
      text: "Kvadrat tenglamani diskriminant orqali yechish bosqichlarini noldan tushuntirib bering.",
    },
  ],
  ERROR_EXPLAINER: [
    {
      label: "🩺 Xatomni tahlil qiling",
      text: "Matematikada foiz hisoblashda adashibman. Yechimimni yozaman, qayerda xato qilganimni ko'rsatib bering.",
    },
  ],
  FAST_SOLUTION: [
    {
      label: "⚡ 5 soniyalik SAT shortcut",
      text: "Agar 4a - 6 = 18 bo'lsa, 2a - 3 ning qiymatini 5 soniyada qanday topish mumkin?",
    },
  ],
  TEST_ANALYZER: [
    {
      label: "🔍 Chalg'ituvchi variantni aniqlash",
      text: "SAT testida ikkita yaqin variant orasida qolib ketsam, noto'g'risini qanday ajratib olaman?",
    },
  ],
  WRITING_REVIEW: [
    {
      label: "✍️ Namunaviy IELTS Task 2 inshosini tekshirish",
      text: "Some people argue that online platforms will completely replace traditional universities. However, campus education remains essential because laboratory research and peer mentorship cultivate critical thinking. Furthermore, international universities provide collaborative networks that digital courses cannot easily replicate. Therefore, a hybrid educational model is the most effective path forward.",
    },
  ],
  MOTIVATION: [
    {
      label: "☕ Ustoz, bugun biroz charchadim...",
      text: "Ustoz, bugun dars qilib biroz charchadim va boshim og'riyapti, nima qilsam bo'ladi?",
    },
  ],
  MATH_DEEP_DIVE: [
    {
      label: "📐 Viyeta va diskriminantni chuqur o'rganish",
      text: "x² − 7x + 12 = 0 tenglamani 6 bosqichli metod bilan chuqur tushuntirib bering: nega diskriminant formulasi to'g'ri va Viyeta teoremasi qayerdan keladi?",
    },
  ],
};

const STARTER_PROMPTS: StarterPrompt[] = [
  {
    id: "vieta",
    icon: Sigma,
    title: "Viyeta teoremasi — 10 soniyalik shortcut",
    subtitle: "SAT Math · ildizlar yig'indisi va ko'paytmasi",
    text: "Viyet teoremasini SAT da qanday qilib 10 soniyada ishlatish mumkin?",
    subjectId: "sat-math",
    mode: "STEP_BY_STEP",
  },
  {
    id: "ielts-intro",
    icon: Feather,
    title: "IELTS Writing Task 2 kirish qolipi",
    subtitle: "IELTS Academic · Band 7.5+ Introduction",
    text: "IELTS Writing Task 2 uchun Band 7.5+ kirish (Introduction) qolipini ber.",
    subjectId: "ielts",
    mode: "STEP_BY_STEP",
  },
  {
    id: "hard-quadratic",
    icon: Calculator,
    title: "Qiyin kvadrat funksiya savoli",
    subtitle: "SAT Math · Hard daraja · bilimni sinash",
    text: "Menga kvadrat funksiyadan 1 ta qiyin (Hard) savol berib, bilimini sinab ko'r.",
    subjectId: "sat-math",
    mode: "SOCRATIC_TUTOR",
  },
  {
    id: "command-evidence",
    icon: Search,
    title: "Command of Evidence siri",
    subtitle: "SAT Reading & Writing · dalil tanlash",
    text: "SAT Reading'dagi 'Command of Evidence' savollarini ishlash siri nimada?",
    subjectId: "sat-rw",
    mode: "STEP_BY_STEP",
  },
];

const SOCRATIC_STEP_LABELS: Record<
  AICoachMetadata["socraticStep"],
  string
> = {
  GUIDING_QUESTION: "Socratic Yo'naltirish",
  STEP_BY_STEP: "Bosqichma-Bosqich Yechim",
  WRITING_FEEDBACK: "Writing Band Tahlili",
  WELLNESS_CARE: "G'amxo'rlik & Motivatsiya",
};

function modeMetaFor(mode: AICoachMode): ModeConfig {
  return MODE_META[mode] ?? MODE_META.SOCRATIC_TUTOR;
}

export default function AICoachPage() {
  const [data, setData] = useState<CoachPayload | null>(null);
  const [subjectId, setSubjectId] = useState<CoachSubjectId>("sat-math");
  const [mode, setMode] = useState<AICoachMode>("SOCRATIC_TUTOR");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMsgItem[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [xpTotal, setXpTotal] = useState(50);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const streamTimerRef = useRef<number | null>(null);
  const { speak, stop } = useBrowserSpeech("uz-UZ");

  const currentSubject =
    COACH_SUBJECTS.find((subject) => subject.id === subjectId) ??
    COACH_SUBJECTS[0];
  const currentMode = modeMetaFor(mode);

  const warmAddress =
    data?.student.gender === "FEMALE"
      ? "Qizim"
      : data?.student.gender === "MALE"
        ? "Shag'zodam"
        : data?.student.honorific || "Aziz o'quvchi";

  const studentName = data?.student.name?.split(" ")[0] ?? "O'quvchi";
  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const res = await fetch("/api/ai/coach");
        if (!res.ok) return;
        const payload = (await res.json()) as CoachPayload;
        if (!active) return;

        setData(payload);
        setXpTotal(payload.student.xpTotal);

        const openedFromLink = new URLSearchParams(window.location.search).has(
          "mode"
        );
        if (payload.activeSession && !openedFromLink) {
          setSessionId(payload.activeSession.id);
          setMode(payload.activeSession.mode ?? "SOCRATIC_TUTOR");
          setMessages(payload.activeSession.messages);
        }
      } catch {
        // Offline yoki avtorizatsiya yo'q — sahifa lokal rejimda ishlashda davom etadi.
      }
    }

    void loadInitial();
    return () => {
      active = false;
    };
  }, []);

  // /math sahifasidan kelgan havola: ?mode=MATH_DEEP_DIVE&q=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get("mode");
    const urlQuestion = params.get("q");
    const urlSubject = params.get("subject");

    if (urlMode && MODE_META[urlMode as AICoachMode]) {
      setMode(urlMode as AICoachMode);
      setSessionId(undefined);
      setMessages([]);
    }

    if (urlSubject && COACH_SUBJECTS.some((subject) => subject.id === urlSubject)) {
      setSubjectId(urlSubject as CoachSubjectId);
    }

    if (urlQuestion) setInput(urlQuestion);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingId]);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current !== null) {
        window.clearInterval(streamTimerRef.current);
      }
      stop();
    };
  }, [stop]);

  const streamMessage = useCallback((messageId: string, fullText: string) => {
    if (streamTimerRef.current !== null) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    const totalFrames = Math.max(16, Math.min(64, Math.ceil(fullText.length / 10)));
    let frame = 0;
    setStreamingId(messageId);

    streamTimerRef.current = window.setInterval(() => {
      frame += 1;
      const visibleLength =
        frame >= totalFrames
          ? fullText.length
          : Math.max(1, Math.ceil((fullText.length * frame) / totalFrames));

      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId
            ? { ...message, content: fullText.slice(0, visibleLength) }
            : message
        )
      );

      if (frame >= totalFrames) {
        if (streamTimerRef.current !== null) {
          window.clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }
        setStreamingId(null);
      }
    }, 26);
  }, []);

  const resetConversation = useCallback(() => {
    stop();
    setSpeakingMessageId(null);
    if (streamTimerRef.current !== null) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setStreamingId(null);
    setMessages([]);
    setSessionId(undefined);
    setInput("");
  }, [stop]);

  const handleSubjectChange = (nextSubjectId: CoachSubjectId) => {
    if (nextSubjectId === subjectId) return;
    setSubjectId(nextSubjectId);
    resetConversation();
  };

  const handleToggleSpeech = (message: ChatMsgItem) => {
    const speechText = messageToPlainText(message.content);
    if (!speechText) return;

    if (speakingMessageId === message.id) {
      stop();
      setSpeakingMessageId(null);
      return;
    }

    stop();
    setSpeakingMessageId(message.id);
    speak(speechText, () => setSpeakingMessageId(null));
  };

  const runLocalFallback = useCallback(
    (
      text: string,
      activeMode: AICoachMode,
      turnIndex: number,
      subjectOverride?: CoachSubjectId
    ) => {
      const activeSubject =
        COACH_SUBJECTS.find(
          (subject) => subject.id === (subjectOverride ?? subjectId)
        ) ?? currentSubject;

      const fallback = buildSmartFallback({
        subjectId: activeSubject.id,
        subjectLabel: activeSubject.label,
        mode: activeMode,
        message: text,
        honorific: warmAddress,
        turnIndex,
      });

      const assistantId = `local-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const assistantMessage: ChatMsgItem = {
        id: assistantId,
        role: "ASSISTANT",
        content: "",
        metadata: fallback.metadata,
        createdAt: new Date().toISOString(),
      };

      setMessages((previous) => [...previous, assistantMessage]);
      setXpTotal((previous) => previous + 10);
      streamMessage(assistantId, fallback.reply);
    },
    [currentSubject, subjectId, streamMessage, warmAddress]
  );

  const handleSendMessage = async (
    overrideText?: string,
    overrideMode?: AICoachMode,
    overrideSubject?: CoachSubjectId
  ) => {
    const textToSend = (overrideText ?? input).trim();
    const activeMode = overrideMode ?? mode;
    if (!textToSend || sending) return;

    setSending(true);
    if (!overrideText) setInput("");

    const tempId = `temp-${Date.now()}`;
    const userMessage: ChatMsgItem = {
      id: tempId,
      role: "USER",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((previous) => [...previous, userMessage]);
    const turnIndex = messages.filter((message) => message.role === "ASSISTANT").length;

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          mode: activeMode,
          sessionId,
        }),
      });

      if (!res.ok) {
        runLocalFallback(textToSend, activeMode, turnIndex, overrideSubject);
        return;
      }

      const result = (await res.json()) as {
        sessionId: string;
        userMessage: ChatMsgItem;
        assistantMessage: ChatMsgItem;
        newXpTotal: number;
      };

      setSessionId(result.sessionId);
      setXpTotal(result.newXpTotal);

      // Server javobi ham jonli "yozilayotgan" effekt bilan chiqadi.
      setMessages((previous) => [
        ...previous.filter((message) => message.id !== tempId),
        result.userMessage,
        { ...result.assistantMessage, content: "" },
      ]);
      streamMessage(result.assistantMessage.id, result.assistantMessage.content);
    } catch {
      // Tarmoq xatosi o'quvchiga ko'rsatilmaydi — aqlli lokal javob ishlaydi.
      runLocalFallback(textToSend, activeMode, turnIndex, overrideSubject);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = () => {
    resetConversation();
  };

  const sidebarPrompts =
    mode === "WRITING_REVIEW" || mode === "MOTIVATION"
      ? MODE_PRACTICE_PROMPTS[mode]
      : currentSubject.practicePrompts;

  return (
    <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      <div className="glass-card overflow-hidden">
        {/* Yuqori sarlavha va umumiy ko'rsatkichlar */}
        <div className="border-b border-border/70 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-neon-soft px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-neon">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Talaba AI · Shaxsiy Sokratik Murabbiy</span>
              </div>

              <h1 className="mt-2.5 text-2xl font-extrabold text-fg sm:text-3xl">
                Salom, <span className="text-gold">{warmAddress}</span>! Birgalikda
                fikrlaymiz
              </h1>

              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-fg-muted sm:text-sm">
                {currentSubject.greeting}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-neon/30 bg-neon-soft/20 px-2.5 py-1 text-neon">
                  <currentSubject.icon className="h-3.5 w-3.5" />
                  {currentSubject.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold-soft/20 px-2.5 py-1 text-gold">
                  <currentMode.icon className="h-3.5 w-3.5" />
                  {currentMode.label}
                </span>
                {data?.student.currentLevel && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-elevated/70 px-2.5 py-1 text-fg-muted">
                    Daraja: {data.student.currentLevel}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="rounded-xl border border-gold/40 bg-gold-soft px-4 py-2 text-center">
                <span
                  id="coach-xp-counter"
                  className="flex items-center gap-1.5 font-mono text-base font-extrabold text-gold"
                >
                  <Trophy className="h-4 w-4" />
                  {xpTotal} XP
                </span>
              </div>
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-fg hover:border-neon"
              >
                <BookOpen className="h-4 w-4 text-neon" />
                <span>Darslarga o&apos;tish</span>
              </Link>
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-fg hover:border-gold"
              >
                <Compass className="h-4 w-4 text-gold" />
                <span>12 Oylik Xarita</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-12">
          {/* Chap yon panel: fan, rejim, tezkor mashqlar va xavfsizlik */}
          <aside className="space-y-4 border-b border-border/70 p-4 sm:p-5 lg:col-span-4 xl:col-span-3 lg:border-b-0 lg:border-r">
            <section className="rounded-2xl border border-border bg-surface/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-neon">
                  Fan tanlash
                </h2>
                <span className="rounded-md bg-elevated px-2 py-0.5 font-mono text-[10px] text-fg-muted">
                  {studentName}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {COACH_SUBJECTS.map((subject, idx) => {
                  const SubjectIcon = subject.icon;
                  const active = subject.id === subjectId;
                  const isFullSpan = idx === COACH_SUBJECTS.length - 1 && COACH_SUBJECTS.length % 2 === 1;
                  const activeClass =
                    subject.accent === "gold"
                      ? "border-gold bg-gold-soft/25 shadow-gold"
                      : "border-neon bg-neon-soft/25 shadow-neon";

                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => handleSubjectChange(subject.id)}
                      data-subject-id={subject.id}
                      className={`${isFullSpan ? "col-span-2" : ""} rounded-xl border p-3 text-left transition-all ${
                        active
                          ? activeClass
                          : "border-border bg-canvas/70 hover:border-neon/40"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-1">
                        <SubjectIcon
                          className={`h-4 w-4 ${
                            active
                              ? subject.accent === "gold"
                                ? "text-gold"
                                : "text-neon"
                              : "text-fg-muted"
                          }`}
                        />
                        {active && (
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              subject.accent === "gold" ? "text-gold" : "text-neon"
                            }`}
                          />
                        )}
                      </span>
                      <span className="mt-2 block text-[11px] font-extrabold leading-tight text-fg">
                        {subject.label}
                      </span>
                      <span className="mt-1 block text-[10px] leading-snug text-fg-muted">
                        {subject.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface/70 p-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gold">
                O&apos;qitish rejimi
              </h2>

              <div className="mt-3 space-y-2">
                {CORE_MODES.map((modeItem) => {
                  const ModeIcon = modeItem.icon;
                  const active = mode === modeItem.id;
                  return (
                    <button
                      key={modeItem.id}
                      type="button"
                      data-coach-mode={modeItem.id}
                      onClick={() => setMode(modeItem.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                        active
                          ? "border-neon bg-neon-soft/20 shadow-neon"
                          : "border-border bg-canvas/70 hover:border-neon/40"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-neon text-canvas"
                            : "bg-elevated text-neon"
                        }`}
                      >
                        <ModeIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-fg">
                            {modeItem.label}
                          </span>
                          {active && (
                            <span className="rounded-full bg-neon px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-canvas">
                              FAOL
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-relaxed text-fg-muted">
                          {modeItem.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 border-t border-border/70 pt-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-fg-muted">
                  Qo&apos;shimcha vositalar
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {EXTRA_MODES.map((modeItem) => {
                    const ModeIcon = modeItem.icon;
                    const active = mode === modeItem.id;
                    return (
                      <button
                        key={modeItem.id}
                        type="button"
                        data-coach-mode={modeItem.id}
                        onClick={() => setMode(modeItem.id)}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[10px] font-bold transition-all ${
                          active
                            ? "border-gold bg-gold-soft/25 text-gold shadow-gold"
                            : "border-border bg-canvas/70 text-fg-muted hover:border-gold/50 hover:text-gold"
                        }`}
                      >
                        <ModeIcon className="h-3.5 w-3.5" />
                        <span>{modeItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-neon">
                  Tezkor mashqlar
                </h2>
                <span className="text-[10px] text-fg-muted">
                  {currentSubject.shortLabel}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {sidebarPrompts.map((item, index) => (
                  <button
                    key={`${mode}-${index}-${item.label}`}
                    type="button"
                    data-quick-prompt={mode}
                    onClick={() => void handleSendMessage(item.text, mode)}
                    className="w-full rounded-xl border border-border bg-canvas/80 p-3 text-left text-[11px] font-semibold leading-relaxed text-fg transition-all hover:border-neon hover:text-neon"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-neon/30 bg-neon-soft/10 p-4 text-[11px] leading-relaxed text-fg-muted">
              <div className="flex items-center gap-1.5 font-bold text-neon">
                <ShieldCheck className="h-4 w-4" />
                <span>Xavfsizlik va maxfiylik</span>
              </div>
              <p className="mt-1">
                AI Murabbiy telefon, karta va pasport kabi shaxsiy ma&apos;lumotlarni
                avtomatik yashiradi hamda nomaqbul mavzulardan himoya qiladi.
              </p>
            </section>
          </aside>

          {/* Asosiy chat oynasi */}
          <section className="flex min-h-[720px] flex-col lg:col-span-8 xl:col-span-9">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-neon/30 bg-neon-soft/20 px-2.5 py-1 text-[11px] font-bold text-neon">
                  <currentSubject.icon className="h-3.5 w-3.5" />
                  {currentSubject.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold-soft/20 px-2.5 py-1 text-[11px] font-bold text-gold">
                  <currentMode.icon className="h-3.5 w-3.5" />
                  {currentMode.label}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClearChat}
                data-clear-chat
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-elevated/80 px-3 py-1.5 text-[11px] font-bold text-fg-muted transition-all hover:border-danger/60 hover:text-danger"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Suhbatni tozalash</span>
              </button>
            </div>

            <div
              id="coach-messages-list"
              className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
              style={{ maxHeight: "640px" }}
            >
              {messages.length === 0 ? (
                <div className="space-y-5">
                  <div className="coach-fade-up rounded-2xl border border-neon/25 bg-gradient-to-br from-neon-soft/15 via-surface/60 to-canvas/80 p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neon text-canvas shadow-neon">
                        <currentSubject.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-base font-extrabold text-fg sm:text-lg">
                          {currentSubject.label} bo&apos;yicha bugungi maqsad
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-fg-muted sm:text-sm">
                          {currentSubject.greeting}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-semibold text-fg-muted">
                            Rejim: {currentMode.shortLabel}
                          </span>
                          <span className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-semibold text-fg-muted">
                            Har javob: +10 XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2.5 flex items-end justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold text-fg">
                          4 ta tezkor savol
                        </h3>
                        <p className="text-[11px] text-fg-muted">
                          Birini bosing — AI Murabbiy darhol suhbatni boshlaydi.
                        </p>
                      </div>
                      <Sparkles className="h-4 w-4 text-gold" />
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {STARTER_PROMPTS.map((prompt) => {
                        const PromptIcon = prompt.icon;
                        return (
                          <button
                            key={prompt.id}
                            type="button"
                            data-starter-prompt={prompt.id}
                            onClick={() => {
                              handleSubjectChange(prompt.subjectId);
                              setMode(prompt.mode);
                              void handleSendMessage(
                                prompt.text,
                                prompt.mode,
                                prompt.subjectId
                              );
                            }}
                            className="group rounded-2xl border border-border bg-surface/70 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-neon hover:bg-neon-soft/10"
                          >
                            <span className="flex items-center gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-elevated text-neon transition-colors group-hover:bg-neon group-hover:text-canvas">
                                <PromptIcon className="h-4 w-4" />
                              </span>
                              <span className="text-[11px] font-extrabold leading-tight text-fg">
                                {prompt.title}
                              </span>
                            </span>
                            <span className="mt-2 block text-[10px] leading-relaxed text-fg-muted">
                              {prompt.subtitle}
                            </span>
                            <span className="mt-2 block text-[11px] font-semibold leading-relaxed text-neon/90">
                              &ldquo;{prompt.text}&rdquo;
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-border bg-canvas/40 p-4 text-center">
                    <p className="text-[11px] leading-relaxed text-fg-muted">
                      Yoki pastdagi maydonga o&apos;z savolingizni yozing. Yecholmagan
                      misolingizni, insho matnini yoki test savolini yuborishingiz mumkin.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.role === "USER";
                  const metadata = message.metadata;
                  const rubric = metadata?.writingRubric;
                  const messageMode = metadata?.mode
                    ? modeMetaFor(metadata.mode)
                    : currentMode;

                  return (
                    <div
                      key={message.id}
                      data-message-role={message.role}
                      className={`coach-fade-up flex flex-col ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="mb-1 flex items-center gap-2 pl-1">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neon text-canvas">
                            <Brain className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neon">
                            Talaba AI Ustoz
                          </span>
                          {metadata?.honorificUsed && (
                            <span className="text-[10px] font-semibold text-fg-muted">
                              ({metadata.honorificUsed})
                            </span>
                          )}
                          {metadata?.socraticStep && (
                            <span className="rounded-md border border-gold/30 bg-gold-soft/15 px-1.5 py-0.5 font-mono text-[9px] text-gold">
                              {SOCRATIC_STEP_LABELS[metadata.socraticStep]}
                            </span>
                          )}
                        </div>
                      )}

                      <div
                        className={`max-w-[94%] rounded-2xl p-3.5 text-xs leading-relaxed sm:max-w-[88%] xl:max-w-[82%] sm:p-4 sm:text-sm ${
                          isUser
                            ? "rounded-br-md bg-neon font-semibold text-canvas shadow-[0_10px_30px_-12px_rgba(198,244,50,0.8)]"
                            : "rounded-bl-md border border-white/10 bg-surface/85 text-fg shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-line">{message.content}</p>
                        ) : message.content ? (
                          <StructuredMessage content={message.content} />
                        ) : (
                          <ThinkingBubble
                            modeLabel={`${messageMode.shortLabel} tayyorlanmoqda…`}
                          />
                        )}

                        {!isUser && message.id === streamingId && message.content && (
                          <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-neon align-middle" />
                        )}

                        {rubric && (
                          <div
                            id="writing-rubric-card"
                            className="mt-4 rounded-xl border border-gold/40 bg-canvas/90 p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                                  IELTS / Academic Writing natijasi
                                </span>
                                <h4 className="text-base font-extrabold text-fg sm:text-lg">
                                  Taxminiy Band:{" "}
                                  <span className="font-mono text-neon">
                                    {rubric.estimatedBand}
                                  </span>
                                </h4>
                              </div>
                              <span className="rounded-lg bg-elevated px-3 py-1 font-mono text-xs text-fg-muted">
                                {rubric.wordCount} ta so&apos;z
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                              <div className="rounded-lg bg-surface p-2.5 text-center">
                                <span className="block text-[10px] text-fg-muted">
                                  Task Response
                                </span>
                                <span className="font-mono text-sm font-bold text-neon">
                                  {rubric.taskAchievement.toFixed(1)}
                                </span>
                              </div>
                              <div className="rounded-lg bg-surface p-2.5 text-center">
                                <span className="block text-[10px] text-fg-muted">
                                  Coherence
                                </span>
                                <span className="font-mono text-sm font-bold text-neon">
                                  {rubric.coherenceCohesion.toFixed(1)}
                                </span>
                              </div>
                              <div className="rounded-lg bg-surface p-2.5 text-center">
                                <span className="block text-[10px] text-fg-muted">
                                  Lexical
                                </span>
                                <span className="font-mono text-sm font-bold text-gold">
                                  {rubric.lexicalResource.toFixed(1)}
                                </span>
                              </div>
                              <div className="rounded-lg bg-surface p-2.5 text-center">
                                <span className="block text-[10px] text-fg-muted">
                                  Grammar
                                </span>
                                <span className="font-mono text-sm font-bold text-gold">
                                  {rubric.grammaticalRange.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {!isUser && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                            <CoachSpeechButton
                              active={speakingMessageId === message.id}
                              disabled={!message.content.trim() || message.id === streamingId}
                              onToggle={() => handleToggleSpeech(message)}
                            />
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-fg-muted">
                              {metadata?.providerUsed === "local"
                                ? "Talaba AI · tezkor rejim"
                                : "Talaba AI · neyro javob"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {sending && (
                <div className="flex items-start">
                  <ThinkingBubble
                    modeLabel={`${currentMode.shortLabel} tahlil qilmoqda…`}
                  />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Xabar yuborish formasi */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSendMessage();
              }}
              className="border-t border-border/70 p-4 sm:p-5"
            >
              {mode === "WRITING_REVIEW" && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-fg-muted">
                  <span>
                    ✍️ IELTS Task 1/2 yoki Personal Statement matnini kiriting:
                  </span>
                  <span className="font-mono font-bold text-gold">
                    {wordCount} so&apos;z (+25 XP)
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
                <textarea
                  id="coach-message-input"
                  rows={mode === "WRITING_REVIEW" ? 4 : 2}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  placeholder={
                    mode === "WRITING_REVIEW"
                      ? "Insho matnini shu yerga yozing yoki nusxalab qo'ying..."
                      : `${warmAddress}, savolingizni yoki masalangizni shu yerga yozing...`
                  }
                  className="min-h-[70px] w-full resize-y rounded-xl border border-border bg-canvas/80 p-3.5 text-xs text-fg outline-none transition-colors placeholder:text-fg-muted/70 focus:border-neon sm:text-sm"
                />

                <button
                  type="submit"
                  id="coach-send-btn"
                  disabled={sending || !input.trim()}
                  className="btn-neon inline-flex shrink-0 items-center justify-center gap-2 px-6 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>{sending ? "Yozilmoqda..." : "Yuborish"}</span>
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-neon" />
                  Enter — yuborish, Shift + Enter — yangi qator
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-neon" />
                  Shaxsiy ma&apos;lumotlar avtomatik yashiriladi
                </span>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
