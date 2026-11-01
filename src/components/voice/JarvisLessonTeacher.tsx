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
  Radio,
  Cpu,
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

  // AI Murabbiy bilan jonli savol-javob
  const [questionText, setQuestionText] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{ role: "USER" | "JARVIS"; text: string }>
  >([]);

  useEffect(() => {
    return jarvisVoice.subscribe((s) => setVoiceState(s));
  }, []);

  // JARVIS tushuntirish nutqi (Ovozli Agent dars beradi)
  const lessonScript = `Salom, ${honorific}! Men JARVIS sun'iy intellekt murabbiyingizman. Bugungi darsimiz: ${lessonTitle}. ${lessonSummary}. Chiziqli funksiyaning umumiy formulasi f(x) = mx + b. Bu yerda m — to'g'ri chiziqning qiyalik koeffitsiyenti bo'lib, x bir birlikka oshganda y ning o'zgarish tezligini ko'rsatadi. b esa boshlang'ich nuqtadir. SAT imtihonida eng asosiy qoida: agar parallel chiziqlar berilsa, ularning qiyaliklari teng bo'ladi. Perpendikulyar bo'lsa, qiyaliklar ko'paytmasi minus birga teng. Istalgan savolingiz bo'lsa, menga ovozda yoki yozma berishingiz mumkin.`;

  const isSpeaking =
    voiceState.currentText === lessonScript &&
    voiceState.isSpeaking &&
    !voiceState.isPaused;

  const toggleVoice = () => {
    if (isSpeaking) {
      jarvisVoice.pause();
    } else if (voiceState.currentText === lessonScript && voiceState.isPaused) {
      jarvisVoice.resume();
    } else {
      jarvisVoice.speak(lessonScript);
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
          `Juda to'g'ri savol, ${honorific}! Bu metodda eng asosiysi: formuladagi qiyalik koeffitsiyentini tezkor aniqlash va butun ifodani 5 soniyada hisoblashdir.`;
        setConversation((prev) => [
          ...prev,
          { role: "JARVIS" as const, text: replyText },
        ]);
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
    <div className="space-y-8">
      {/* ====================================================================
          1. JARVIS ARC REACTOR — HOLOGRAFIK AI AGENT OVOZ MARKAZI
          ==================================================================== */}
      <div className="glass-card relative overflow-hidden p-8 sm:p-10 border border-cyan-400/30 bg-gradient-to-b from-cyan-950/40 via-slate-900/90 to-slate-950 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        {/* Yuqori maqom paneli */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-xs font-black tracking-widest text-cyan-300 uppercase">
              JARVIS MARK XXXIX • JONLI OVOZLI O&apos;QITUVCHI AGENT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-amber-300">
              Ovoz: Puck (Gemini Live)
            </span>
            <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-emerald-400">
              Onlayn
            </span>
          </div>
        </div>

        {/* Markaziy Arc Reactor va Agent Murojaati */}
        <div className="mt-8 flex flex-col items-center text-center">
          {/* JARVIS Arc Reactor Visualizatori */}
          <div className="relative flex items-center justify-center h-40 w-40 my-2">
            {/* Tashqi aylanuvchi doira (Orbit A) */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50 ${
                isSpeaking ? "animate-[spin_6s_linear_infinite]" : ""
              }`}
            />
            {/* Ichki halqa (Orbit B) */}
            <div
              className={`absolute inset-3 rounded-full border border-emerald-400/60 shadow-[0_0_30px_rgba(6,182,212,0.35)] ${
                isSpeaking ? "animate-[spin_10s_linear_infinite_reverse]" : ""
              }`}
            />
            {/* Spoke nurli panjara */}
            <div className="absolute inset-6 rounded-full border border-cyan-300/40 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2)_0%,transparent_75%)]" />

            {/* Markaziy Yadro (Reactor Core) */}
            <button
              type="button"
              onClick={toggleVoice}
              title="JARVIS bilan gaplashish / tinglash"
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-300 bg-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.8)] text-cyan-300 transition-transform active:scale-95 ${
                isSpeaking ? "animate-pulse scale-105" : "hover:scale-105"
              }`}
            >
              {isSpeaking ? (
                <Pause className="h-8 w-8 text-amber-300" />
              ) : (
                <Play className="h-8 w-8 text-cyan-300 fill-cyan-300 ml-1" />
              )}
            </button>
          </div>

          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-white tracking-tight">
            JARVIS Dars O&apos;tmoqda: {lessonTitle}
          </h2>

          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {isSpeaking
              ? "🔊 JARVIS sizga jonli nutq bilan dars tushuntirmoqda. Tinglang..."
              : "Tugmani bosing va JARVIS ovozli tushuntirishini tinglang."}
          </p>

          {/* Ovoz boshqaruvi */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleVoice}
              className={`inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold shadow-2xl transition-all ${
                isSpeaking
                  ? "border border-amber-400 bg-amber-500/25 text-amber-300 animate-pulse"
                  : "btn-neon"
              }`}
            >
              {isSpeaking ? (
                <>
                  <Pause className="h-5 w-5" />
                  <span>Ovozni To&apos;xtatish</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  <span>JARVIS Ovozida Darsni Boshlash</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <button
                type="button"
                onClick={() => jarvisVoice.stop()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25"
                title="Darsni to'xtatish"
              >
                <Square className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. TOZA INTERAKTIV METOD KARTALARI (Xom matn butunlay yo'q!)
          ==================================================================== */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              METODOLOGIK STRUKTURA
            </span>
            <h3 className="text-xl font-black text-white">
              Darsdagi 3 ta Asosiy Qoida va Formula
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Barchasi JARVIS ovozida
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Metod 1: Asosiy Model */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-emerald-400/50 transition-colors">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-extrabold text-emerald-400 uppercase">
                  1-Qoida • Formula
                </span>
                <JarvisVoiceButton
                  text="Chiziqli funksiya f(x) = mx + b. m — to'g'ri chiziqning qiyaligi (slope), b esa y-o'qi bilan kesishish nuqtasi."
                  label=""
                />
              </div>

              <div className="my-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-center">
                <span className="font-mono text-2xl font-black text-emerald-300">
                  f(x) = mx + b
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <span><strong>m (Slope):</strong> Qiyalik koeffitsiyenti = (y₂ - y₁) / (x₂ - x₁)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-400 mt-1 shrink-0" />
                  <span><strong>b (Y-intercept):</strong> x = 0 bo&apos;lgandagi boshlang&apos;ich nuqta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metod 2: SAT Tezkor Usuli */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-amber-400/50 transition-colors">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-extrabold text-amber-300 uppercase">
                  2-Qoida • SAT Tuzog&apos;i
                </span>
                <JarvisVoiceButton
                  text="SAT imtihonida x ning o'zini topib o'tirmang! Butun ifodani bir vaqtda hisoblash orqali masalani 5 soniyada yeching."
                  label=""
                />
              </div>

              <div className="my-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-center">
                <span className="font-mono text-lg font-black text-amber-300">
                  5 Soniyalik Tezkor Yechim
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Ko&apos;pincha <strong>3x + 2</strong> kabi ifodalar so&apos;raladi. Tenglamani ikkala tomonini bir xil songa bo&apos;lish yoki ko&apos;paytirish orqali darhol javob topiladi.
              </p>
            </div>
          </div>

          {/* Metod 3: Parallel & Perpendikulyar */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-cyan-400/50 transition-colors">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-extrabold text-cyan-300 uppercase">
                  3-Qoida • Geometriya
                </span>
                <JarvisVoiceButton
                  text="Parallel chiziqlarning qiyaliklari teng bo'ladi (m1 = m2). Perpendikulyar chiziqlarning qiyaliklari ko'paytmasi minus birga teng bo'ladi."
                  label=""
                />
              </div>

              <div className="my-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-center">
                <span className="font-mono text-base font-black text-cyan-300">
                  m₁ = m₂  ||  m₁ · m₂ = -1
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Parallel chiziqlar hech qachon kesishmaydi va yechimga ega emas. Perpendikulyar chiziqlar esa 90° burchak ostida kesishadi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. JARVIS BILAN JONLI MULOQOT (Ovozli & Matnli AI Murabbiy)
          ==================================================================== */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-400">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">
                JARVIS&apos;dan savol so&apos;rash
              </h4>
              <p className="text-xs text-slate-400">
                Mikrofon yoki yozuv orqali murojaat qiling
              </p>
            </div>
          </div>
          <span className="glass-pill rounded-full px-3 py-1 text-xs font-mono font-bold text-emerald-400">
            Socratic AI Faol
          </span>
        </div>

        {/* Tezkor Savollar */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "SAT da bu mavzudan qanday tuzoqlar tushadi?",
            "Qiyalik formulasini hayotiy misol bilan tushuntir",
            "Parallel va perpendikulyar chiziqlar farqini ayt",
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskJarvis(prompt)}
              className="glass-pill rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 transition-colors"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Suhbat tarixi */}
        {conversation.length > 0 && (
          <div className="mt-4 space-y-3 max-h-[280px] overflow-y-auto pr-2">
            {conversation.map((msg, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === "USER"
                    ? "ml-8 border border-white/15 bg-white/5 text-white"
                    : "mr-8 border border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
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
            placeholder="Dars yuzasidan savolingizni yozing..."
            className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />

          <JarvisMicButton onTranscript={(txt) => setQuestionText(txt)} />

          <button
            type="submit"
            disabled={loadingReply || !questionText.trim()}
            className="btn-neon flex items-center justify-center rounded-2xl px-5 py-3.5 text-xs font-bold disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* ====================================================================
          4. O'TISH TUGMASI VA DARS TARIXIGA HAVOLA
          ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
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
          className="btn-neon flex items-center gap-2.5 px-7 py-4 text-sm font-bold shadow-2xl"
        >
          <span>2-Bosqich: Hayotiy Misollarni Ko&apos;rish</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
