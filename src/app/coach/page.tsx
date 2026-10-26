"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Coffee,
  Compass,
  Feather,
  HelpCircle,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
  ListOrdered,
  Search,
} from "lucide-react";
import type { AICoachMetadata, AICoachMode } from "@/lib/ai";

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

const MODE_TABS: Array<{
  id: AICoachMode;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "SOCRATIC_TUTOR",
    label: "Socratic Izlanish",
    desc: "Tayyor javob bermasdan, to'g'ri fikrlashga yo'naltiradi",
    icon: Brain,
  },
  {
    id: "FAST_SOLUTION",
    label: "Tezkor Yechim (Shortcut)",
    desc: "SAT va IELTSda vaqtni 3 barobar tejaydigan lifehack usullar",
    icon: Zap,
  },
  {
    id: "STEP_BY_STEP",
    label: "Qadamma-qadam Tahlil",
    desc: "Har bir amal va formulani noldan batafsil tushuntiradi",
    icon: ListOrdered,
  },
  {
    id: "TEST_ANALYZER",
    label: "Test & Xatolar Diagnostikasi",
    desc: "Chalg'ituvchi variantlarni aniqlash va xatolar ildizini topish",
    icon: Search,
  },
  {
    id: "WRITING_REVIEW",
    label: "Writing Tekshiruvi",
    desc: "IELTS Task 1/2 va Akademik insholarni Band mezonida baholaydi",
    icon: Feather,
  },
  {
    id: "MOTIVATION",
    label: "Dam Olish & Motivatsiya",
    desc: "Charchoqni yengish, Pomodoro tanaffusi va ruhiy quvvat",
    icon: Coffee,
  },
];

const QUICK_PROMPTS: Record<AICoachMode, Array<{ label: string; text: string }>> = {
  SOCRATIC_TUTOR: [
    {
      label: "📐 SAT Math: 6x + 10 = 34 mantiqiy siri",
      text: "Ustoz, 6x + 10 = 34 tenglamadan 3x + 5 ni x ni topmasdan qanday tez hisoblayman?",
    },
    {
      label: "🔗 SAT R&W: Moreover vs However",
      text: "SAT Reading & Writingda However va Moreover bog'lovchilarini qanday farqlayman?",
    },
  ],
  FAST_SOLUTION: [
    {
      label: "⚡ SAT 5-soniya ifoda topish usuli",
      text: "Agar 4a - 6 = 18 bo'lsa, 2a - 3 ning qiymatini 5 soniyada qanday topish mumkin?",
    },
    {
      label: "⚡ IELTS Reading: Scanning va Skimming",
      text: "IELTS Reading matnida kalit so'zlarni 10 soniyada topishning eng tez usulini ko'rsating.",
    },
  ],
  STEP_BY_STEP: [
    {
      label: "📘 Chiziqli tenglamalarni noldan yechish",
      text: "Kvadrat tenglamani diskriminant orqali yechish bosqichlarini noldan tushuntirib bering.",
    },
    {
      label: "📘 Complex Sentences tuzish qoidasi",
      text: "Ingliz tilida murakkab qo'shma gaplarni bog'lovchilar yordamida tuzish qoidalarini birma-bir ko'rib chiqaylik.",
    },
  ],
  TEST_ANALYZER: [
    {
      label: "🔍 Chalg'ituvchi variant (Distractor) tahlili",
      text: "SAT testida ikkita yaqin variant orasida qolib ketsam, noto'g'risini qanday ajratib olaman?",
    },
    {
      label: "🔍 IELTS True / False / Not Given",
      text: "IELTS Readingda FALSE bilan NOT GIVEN ni bir-biridan qanday aniq ajratib olish mumkin?",
    },
  ],
  ERROR_EXPLAINER: [
    {
      label: "🔍 Xatoni tahlil qilish",
      text: "Matematika darsida foiz hisoblashda adashibman, xatoyimni ko'rsatib bera olasizmi?",
    },
  ],
  WRITING_REVIEW: [
    {
      label: "✍️ Namunaviy IELTS Writing Task 2 tekshirish",
      text: "Some people argue that online platforms will completely replace traditional universities. However, campus education remains essential because laboratory research and peer mentorship cultivate critical thinking. Furthermore, international universities provide collaborative networks that digital courses cannot easily replicate. Therefore, a hybrid educational model is the most effective path forward.",
    },
  ],
  MOTIVATION: [
    {
      label: "☕ Ustoz, bugun biroz charchadim...",
      text: "Ustoz, bugun dars qilib biroz charchadim va boshim og'riyapti, nima qilsam bo'ladi?",
    },
  ],
};

export default function AICoachPage() {
  const [data, setData] = useState<CoachPayload | null>(null);
  const [mode, setMode] = useState<AICoachMode>("SOCRATIC_TUTOR");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMsgItem[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [xpTotal, setXpTotal] = useState(50);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadInitial() {
      const res = await fetch("/api/ai/coach");
      if (res.ok) {
        const payload = (await res.json()) as CoachPayload;
        setData(payload);
        setXpTotal(payload.student.xpTotal);
        if (payload.activeSession) {
          setSessionId(payload.activeSession.id);
          setMode((payload.activeSession.mode as AICoachMode) ?? "SOCRATIC_TUTOR");
          setMessages(payload.activeSession.messages);
        }
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (overrideText?: string, overrideMode?: AICoachMode) => {
    const textToSend = (overrideText ?? input).trim();
    const activeMode = overrideMode ?? mode;
    if (!textToSend || sending) return;

    setSending(true);
    if (!overrideText) setInput("");

    // Optimistik xabar ko'rsatish
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "USER",
        content: textToSend,
        createdAt: new Date().toISOString(),
      },
    ]);

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

      if (res.ok) {
        const result = (await res.json()) as {
          sessionId: string;
          userMessage: ChatMsgItem;
          assistantMessage: ChatMsgItem;
          newXpTotal: number;
        };
        setSessionId(result.sessionId);
        setXpTotal(result.newXpTotal);
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempId),
          result.userMessage,
          result.assistantMessage,
        ]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleStartNewSession = (selectedMode: AICoachMode) => {
    setMode(selectedMode);
    setSessionId(undefined);
    setMessages([]);
  };

  const honorific = data?.student?.name?.split(" ")[0] ?? "Aziz o'quvchi";
  const wordCount = input
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Yuqori Sarlavha */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SHAXSIY SOCRATIC AI MURABBIY • O&apos;ZBEK TILIDA</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              Salom, <span className="text-gold">{honorific}</span>! Birgalikda
              fikrlaymiz
            </h1>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">
              Ustoz javobni darhol aytib qo&apos;ymaydi — avval o&apos;ylashga
              yo&apos;naltiradi, xatolarni mehr bilan tushuntiradi va Writing
              ishingizni tekshiradi.
            </p>
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-fg hover:border-neon"
            >
              <Compass className="h-4 w-4 text-gold" />
              <span>12 Oylik Xarita</span>
            </Link>
          </div>
        </div>

        {/* 4 ta Rejim Tanlagichi */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-coach-mode={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-neon bg-neon-soft/20 shadow-neon"
                    : "border-border bg-surface hover:border-neon/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                      active ? "bg-neon text-canvas" : "bg-elevated text-neon"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {active && (
                    <span className="rounded-full bg-neon px-2 py-0.5 font-mono text-[10px] font-extrabold text-canvas">
                      FAOL
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <h2 className="text-sm font-extrabold text-fg">{tab.label}</h2>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-fg-muted">
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Suhbat oynasi */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Chap panel: Qoidalar, Daraja va Tezkor namunalar */}
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-neon">
                  O&apos;quvchi Moslashuvi
                </span>
                <button
                  type="button"
                  onClick={() => handleStartNewSession(mode)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-elevated px-2.5 py-1 text-[11px] font-bold text-fg hover:border-neon"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5 text-neon" />
                  <span>Yangi suhbat</span>
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
                  <span className="text-fg-muted">Murojaat uslubi:</span>
                  <span className="font-bold text-gold">«{honorific}» (Iliq)</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
                  <span className="text-fg-muted">Moslashgan daraja:</span>
                  <span className="font-mono font-bold text-neon">
                    {data?.student.currentLevel ?? "BEGINNER"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
                  <span className="text-fg-muted">Maqsadli OTM:</span>
                  <span className="font-semibold text-fg">
                    {data?.student.targetUniversity ?? "Top Universitet"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tezkor sinov tugmalari */}
            <div className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gold">
                Tezkor Murojaat Namunalari:
              </span>
              <div className="mt-3 space-y-2">
                {QUICK_PROMPTS[mode].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    data-quick-prompt={mode}
                    onClick={() => handleSendMessage(item.text, mode)}
                    className="w-full rounded-xl border border-border bg-canvas p-3 text-left text-xs font-semibold text-fg transition-all hover:border-neon hover:text-neon"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neon/30 bg-neon-soft/10 p-4 text-xs leading-relaxed text-fg-muted">
              <div className="flex items-center gap-1.5 font-bold text-neon">
                <ShieldCheck className="h-4 w-4" />
                <span>Bolalar Xavfsizligi va Maxfiylik Himoyasi</span>
              </div>
              <p className="mt-1">
                AI Murabbiy shaxsiy ma&apos;lumotlarni (telefon, karta, pasport)
                avtomatik yashiradi va nomaqbul mavzulardan himoya qiladi.
              </p>
            </div>
          </div>

          {/* O'ng panel: Asosiy Socratic Suhbat va Writing Tahlil Maydoni */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-canvas/90 p-4 sm:p-6 lg:col-span-8">
            <div
              id="coach-messages-list"
              className="max-h-[520px] min-h-[360px] space-y-4 overflow-y-auto pr-1"
            >
              {messages.length === 0 ? (
                <div className="flex h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center">
                  <Brain className="h-10 w-10 text-neon" />
                  <h3 className="mt-3 text-base font-extrabold text-fg">
                    Xush kelibsiz, <span className="text-gold">{honorific}</span>!
                  </h3>
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-fg-muted">
                    Savolingizni yozing, yecholmagan misolingizni yuboring yoki{" "}
                    <strong>Writing Tekshiruvi</strong> rejimida inshongizni
                    tekshirtiring. Chap tomondagi tayyor namunalardan birini ham
                    bosishingiz mumkin!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "USER";
                  const rubric = msg.metadata?.writingRubric;
                  return (
                    <div
                      key={msg.id}
                      data-message-role={msg.role}
                      className={`flex flex-col ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed sm:text-sm ${
                          isUser
                            ? "bg-neon text-canvas font-semibold"
                            : "border border-border bg-surface text-fg"
                        }`}
                      >
                        {!isUser && msg.metadata?.honorificUsed && (
                          <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-border/60 pb-1.5 text-[11px]">
                            <span className="font-extrabold text-neon">
                              🤖 3Talab AI Ustoz ({msg.metadata.honorificUsed})
                            </span>
                            <span className="rounded-md bg-elevated px-2 py-0.5 font-mono text-[10px] text-gold">
                              {msg.metadata.socraticStep === "GUIDING_QUESTION"
                                ? "Socratic Yo'naltirish"
                                : msg.metadata.socraticStep === "WRITING_FEEDBACK"
                                  ? "Writing Band Tahlili"
                                  : msg.metadata.socraticStep === "WELLNESS_CARE"
                                    ? "G'amxo'rlik & Motivatsiya"
                                    : "Bosqichma-Bosqich Yechim"}
                            </span>
                          </div>
                        )}

                        <div className="whitespace-pre-line">{msg.content}</div>

                        {/* IELTS / SAT Writing Mezon Kartasi */}
                        {rubric && (
                          <div
                            id="writing-rubric-card"
                            className="mt-4 rounded-xl border border-gold/40 bg-canvas p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                                  IELTS / Academic Writing Natijasi
                                </span>
                                <h4 className="text-lg font-extrabold text-fg">
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

                            <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
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
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Yozish formasi */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="mt-4 border-t border-border pt-4"
            >
              {mode === "WRITING_REVIEW" && (
                <div className="mb-2 flex items-center justify-between text-xs text-fg-muted">
                  <span>
                    ✍️ IELTS Task 1/2 yoki Personal Statement matnini kiriting:
                  </span>
                  <span className="font-mono font-bold text-gold">
                    {wordCount} so&apos;z (+25 XP)
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <textarea
                  id="coach-message-input"
                  rows={mode === "WRITING_REVIEW" ? 4 : 2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === "WRITING_REVIEW"
                      ? "Insho matnini shu yerga yozing yoki nusxalab qo'ying..."
                      : `${honorific}, savolingizni yoki masalangizni shu yerga yozing...`
                  }
                  className="w-full rounded-xl border border-border bg-surface p-3.5 text-xs text-fg focus:border-neon focus:outline-none sm:text-sm"
                />
                <button
                  type="submit"
                  id="coach-send-btn"
                  disabled={sending || !input.trim()}
                  className="btn-neon inline-flex shrink-0 items-center justify-center gap-2 px-6 py-3 text-xs font-bold disabled:opacity-50 sm:text-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>{sending ? "Yozilmoqda..." : "Yuborish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
