"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  MessageSquare,
  Send,
  HelpCircle,
  FileText,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sigma,
} from "lucide-react";
import { jarvisVoice, type JarvisVoiceState } from "@/lib/voice/jarvis-speech";
import { JarvisVoiceButton, JarvisMicButton } from "@/components/voice/JarvisVoiceAgent";

interface JarvisLessonTeacherProps {
  lessonTitle: string;
  lessonSummary: string;
  theoryMarkdown: string;
  honorific: string;
  lessonSlug: string;
  onProceedToExamples: () => void;
}

export function JarvisLessonTeacher({
  lessonTitle,
  lessonSummary,
  theoryMarkdown,
  honorific,
  lessonSlug,
  onProceedToExamples,
}: JarvisLessonTeacherProps) {
  const [voiceState, setVoiceState] = useState<JarvisVoiceState>(jarvisVoice.state);
  const [activeCard, setActiveCard] = useState<number>(0);

  // AI Murabbiy bilan jonli savol-javob
  const [chatOpen, setChatOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{ role: "USER" | "JARVIS"; text: string }>
  >([]);

  useEffect(() => {
    return jarvisVoice.subscribe((s) => setVoiceState(s));
  }, []);

  // Matndan toza tushuntirish nutqini yaratish (kod belgilarisiz)
  const cleanSpeechText = `Salom ${honorific}. Bugungi mavzumiz: ${lessonTitle}. ${lessonSummary}. Chiziqli funksiya f(x) = mx + b ko'rinishida yoziladi. Bu yerda m qiyalik koeffitsiyenti bo'lib, o'zgarish tezligini ko'rsatadi. b esa boshlang'ich nuqta. Savollaringiz bo'lsa, istalgan vaqtda so'rashingiz mumkin.`;

  const isLessonPlaying =
    voiceState.currentText === cleanSpeechText &&
    voiceState.isSpeaking &&
    !voiceState.isPaused;

  const toggleLessonAudio = () => {
    if (isLessonPlaying) {
      jarvisVoice.pause();
    } else if (
      voiceState.currentText === cleanSpeechText &&
      voiceState.isPaused
    ) {
      jarvisVoice.resume();
    } else {
      jarvisVoice.speak(cleanSpeechText);
    }
  };

  const handleAskJarvis = async (customPrompt?: string) => {
    const q = (customPrompt ?? questionText).trim();
    if (!q || loadingReply) return;

    const newHistory = [...conversation, { role: "USER" as const, text: q }];
    setConversation(newHistory);
    if (!customPrompt) setQuestionText("");
    setLoadingReply(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          mode: "SOCRATIC_TUTOR",
          lessonSlug,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          assistantMessage?: { content: string };
        };
        const replyText =
          data.assistantMessage?.content ??
          `Juda yaxshi savol, ${honorific}! Bu mavzuda asosiysi formulani yodlash emas, balki qiyalik (m) qanday o'zgarishini anglashdir.`;
        setConversation((prev) => [
          ...prev,
          { role: "JARVIS" as const, text: replyText },
        ]);
        // JARVIS javobni ovozda o'qiydi
        jarvisVoice.speak(replyText);
      }
    } catch {
      setConversation((prev) => [
        ...prev,
        {
          role: "JARVIS" as const,
          text: `Kechirasiz ${honorific}, aloqa uzildi. Iltimos, qayta urinib ko'ring.`,
        },
      ]);
    } finally {
      setLoadingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ====================================================================
          1. JARVIS AI OVOZLI MURABBIY VIZUAL BLOKI (Agent Interface)
          ==================================================================== */}
      <div className="rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/15 via-slate-900/80 to-amber-500/15 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            {/* Hologramma / Ovoz to'lqini visualizatori */}
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/50 bg-emerald-500/20 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <Brain className="h-7 w-7 animate-pulse" />
              {isLessonPlaying && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-black text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  <span>JARVIS AI OVOZLI MURABBIY</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {isLessonPlaying ? "🔊 Ovozda tushuntirmoqda..." : "Jonli rejim"}
                </span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">
                {lessonTitle}
              </h2>
            </div>
          </div>

          {/* Ovozli Boshqaruv Tugmalari */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLessonAudio}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold shadow-xl transition-all ${
                isLessonPlaying
                  ? "border border-amber-400 bg-amber-500/20 text-amber-300 animate-pulse"
                  : "btn-neon"
              }`}
            >
              {isLessonPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>To&apos;xtatish</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>JARVIS Ovozida Tinglash</span>
                </>
              )}
            </button>

            {isLessonPlaying && (
              <button
                type="button"
                onClick={() => jarvisVoice.stop()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="To'xtatish"
              >
                <Square className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Qisqa mazmun */}
        <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed">
          {lessonSummary}
        </p>
      </div>

      {/* ====================================================================
          2. TOZA VIZUAL FORMULA & QOIDA VITRINALARI (Xom matn o'rniga!)
          ==================================================================== */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Vitrina 1: Model & Formula */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-emerald-400/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400">
                1-ASOSIY MODEL
              </span>
              <JarvisVoiceButton
                text="Chiziqli funksiya f(x) = mx + b. m — qiyalik koeffitsiyenti, b — boshlang'ich nuqta."
                label=""
              />
            </div>
            <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center">
              <span className="font-mono text-xl font-black text-emerald-300">
                f(x) = mx + b
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span><strong>m (Slope):</strong> O&apos;zgarish tezligi</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                <span><strong>b (Intercept):</strong> Boshlang&apos;ich nuqta</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Vitrina 2: SAT Qoidasi */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-amber-400/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-300">
                2-SAT TEZKOR USULI
              </span>
              <JarvisVoiceButton
                text="SAT imtihonida x ning o'zini emas, balki so'ralgan butun ifodani 5 soniyada topish tavsiya etiladi."
                label=""
              />
            </div>
            <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-center">
              <span className="font-mono text-base font-black text-amber-300">
                3x + 2 ning qiymati
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              Tenglamaning har ikki tomonini bir xil songa bo&apos;lish yoki ko&apos;paytirish orqali javob <strong>5 soniyada</strong> chiqadi.
            </p>
          </div>
        </div>

        {/* Vitrina 3: Geometrik Tahlil */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-cyan-400/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-300">
                3-GEOMETRIK BOG&apos;LIQLIK
              </span>
              <JarvisVoiceButton
                text="Parallel chiziqlarning qiyaliklari teng. Perpendikulyar chiziqlarning qiyaliklari ko'paytmasi minus birga teng."
                label=""
              />
            </div>
            <div className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-center">
              <span className="font-mono text-sm font-black text-cyan-300">
                m₁ = m₂ || m₁ · m₂ = -1
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              Parallel chiziqlar hech qachon kesishmaydi, perpendikulyarlari esa 90° burchak hosil qiladi.
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. JONLI AI MURABBIY BILAN SAVOL-JAVOB VA SUHBAT
          ==================================================================== */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">
              Tushunmagan joyingizni JARVIS&apos;dan so&apos;rang
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Ovozli yoki matnli savol bering
          </span>
        </div>

        {/* Tezkor Savollar */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "SAT da eng ko'p uchraydigan tuzoq nima?",
            "Qiyalik formulasini hayotiy misol bilan tushuntir",
            "Parallel va perpendikulyar chiziqlar farqini ayt",
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskJarvis(prompt)}
              className="glass-pill rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:border-emerald-400/40 transition-colors"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Suhbat tarixi */}
        {conversation.length > 0 && (
          <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {conversation.map((msg, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === "USER"
                    ? "ml-8 border border-white/10 bg-white/5 text-white"
                    : "mr-8 border border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                    {msg.role === "USER" ? "Siz" : "JARVIS AI Murabbiy"}
                  </span>
                  {msg.role === "JARVIS" && (
                    <JarvisVoiceButton text={msg.text} label="Ovozda tinglash" />
                  )}
                </div>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Savol kiritish maydoni */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskJarvis();
          }}
          className="mt-4 flex items-center gap-2"
        >
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Mavzu bo'yicha savolingizni yozing..."
            className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
          />

          <JarvisMicButton onTranscript={(txt) => setQuestionText(txt)} />

          <button
            type="submit"
            disabled={loadingReply || !questionText.trim()}
            className="btn-neon flex items-center justify-center rounded-2xl px-5 py-3 text-xs font-bold disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* ====================================================================
          4. O'TISH TUGMASI VA DARS TARIXIGA HAVOLA
          ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-300 transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span>To&apos;liq matnli darslikni Dars Tarixida ko&apos;rish →</span>
        </Link>

        <button
          type="button"
          onClick={onProceedToExamples}
          className="btn-neon flex items-center gap-2 px-6 py-3.5 text-sm font-bold shadow-xl"
        >
          <span>2-Bosqich: Hayotiy Misollarni Ko&apos;rish</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
