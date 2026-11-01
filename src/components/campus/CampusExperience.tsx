"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Flame,
  Globe2,
  GraduationCap,
  Layers,
  Play,
  Sigma,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";

interface QuickQuizQuestion {
  id: string;
  subject: string;
  prompt: string;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correct: "A" | "B" | "C" | "D";
  explanation: string;
}

const SAMPLE_QUIZ_QUESTIONS: QuickQuizQuestion[] = [
  {
    id: "q-1",
    subject: "Algebra & SAT Math",
    prompt: "Agar 3x + 7 = 22 bo'lsa, 6x + 5 ning qiymati nechiga teng?",
    options: [
      { id: "A", text: "30" },
      { id: "B", text: "35" },
      { id: "C", text: "40" },
      { id: "D", text: "45" },
    ],
    correct: "B",
    explanation: "3x = 15 ⇒ x = 5. Demak, 6x + 5 = 6(5) + 5 = 35.",
  },
  {
    id: "q-2",
    subject: "Geometriya (Pifagor)",
    prompt: "To'g'ri burchakli uchburchakning katetlari 9 va 12 ga teng. Uning gipotenuzasini toping:",
    options: [
      { id: "A", text: "14" },
      { id: "B", text: "15" },
      { id: "C", text: "16" },
      { id: "D", text: "18" },
    ],
    correct: "B",
    explanation: "3-4-5 Pifagor uchligining 3 barobari: 3·3 = 9, 4·3 = 12, 5·3 = 15.",
  },
  {
    id: "q-3",
    subject: "SAT Reading & Writing",
    prompt: "Qaysi bog'lovchi ikki qarama-qarshi fikrni bog'lash uchun to'g'ri ishlatiladi?",
    options: [
      { id: "A", text: "Furthermore" },
      { id: "B", text: "Consequently" },
      { id: "C", text: "However" },
      { id: "D", text: "Moreover" },
    ],
    correct: "C",
    explanation: "However (ammo, biroq) ziddiyatni ifodalaydi. Furthermore esa fikrni kuchaytiradi.",
  },
];

export function CampusExperience() {
  const { data: session } = useSession();
  const [activeQuizIdx, setActiveQuizIdx] = useState(0);
  const [chosenOption, setChosenOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [aiQuestion, setAiQuestion] = useState("");

  const currentQuiz = SAMPLE_QUIZ_QUESTIONS[activeQuizIdx];

  const handleChoose = (optId: "A" | "B" | "C" | "D") => {
    if (quizAnswered) return;
    setChosenOption(optId);
    setQuizAnswered(true);
    if (optId === currentQuiz.correct) {
      setQuizScore((prev) => prev + 15);
    }
  };

  const nextQuiz = () => {
    setChosenOption(null);
    setQuizAnswered(false);
    setActiveQuizIdx((prev) => (prev + 1) % SAMPLE_QUIZ_QUESTIONS.length);
  };

  const studentName = session?.user?.name?.split(" ")[0] || "O'quvchi";

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* ====================================================================
          1. O'QUVCHI BOSHQARUV PANELI (Campus Header & Progress)
          ==================================================================== */}
      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                Jonli O&apos;quv Muhiti • 3Talab Campus
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-4xl tracking-tight">
              Xush kelibsiz, <span className="text-amber-300">{studentName}</span>!
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              12 oylik xalqaro universitetlarga tayyorgarlik tizimi. Bugungi darslaringiz tayyor.
            </p>
          </div>

          {/* O'quvchi ko'rsatkichlari */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-pill rounded-2xl px-4 py-2.5 text-center flex items-center gap-2.5">
              <Flame className="h-5 w-5 text-amber-400 fill-amber-400/20" />
              <div className="text-left">
                <span className="block font-mono text-xs font-extrabold text-white">5 Kun</span>
                <span className="block text-[10px] text-slate-400">Uzluksiz Streak</span>
              </div>
            </div>

            <div className="glass-pill rounded-2xl px-4 py-2.5 text-center flex items-center gap-2.5">
              <Zap className="h-5 w-5 text-emerald-400" />
              <div className="text-left">
                <span className="block font-mono text-xs font-extrabold text-emerald-400">+{quizScore + 150} XP</span>
                <span className="block text-[10px] text-slate-400">Ballar</span>
              </div>
            </div>

            <div className="glass-pill rounded-2xl px-4 py-2.5 text-center flex items-center gap-2.5">
              <Trophy className="h-5 w-5 text-amber-300" />
              <div className="text-left">
                <span className="block font-mono text-xs font-extrabold text-amber-300">2-Daraja</span>
                <span className="block text-[10px] text-slate-400">Zukko Yetakchi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Faol Darsni Davom Ettirish Bloki (Continue Learning Hero Card) */}
        <div className="mt-6 grid gap-4 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Sigma className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  Faol Darslik
                </span>
                <span className="text-xs text-slate-400">15 moduldan 4 tasi tugallangan</span>
              </div>
              <h3 className="mt-1 text-base font-bold text-white sm:text-lg">
                Algebra &amp; Geometriya: 6 Bosqichli Chuqur Metod
              </h3>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 max-w-md overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 w-[32%]" />
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">32%</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-3">
            <Link
              href="/math"
              className="btn-neon inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold w-full sm:w-auto justify-center"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Darsni Boshlash</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/history"
              className="glass-pill inline-flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-slate-200 hover:text-emerald-400"
            >
              <BookOpen className="h-4 w-4" />
              <span>Dars Tarixi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ASOSIY FANLAR VA O'QUV MODULLARI (Clean Visual Course Cards)
          ==================================================================== */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              Akademik Dastur
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
              Asosiy Fanlar va Chuqur Tayyorgarlik Modullari
            </h2>
          </div>
          <Link
            href="/roadmap"
            className="text-xs font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1"
          >
            <span>12 Oylik Xaritani ko&apos;rish</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Algebra & Geometriya */}
          <Link
            href="/math"
            className="glass-card glass-card-interactive p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Sigma className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                  15 ta Modul
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Algebra &amp; Geometriya (Chuqur)
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  SAT &amp; Olimpiada
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  Formulalar &amp; Isbotlar
                </span>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Laboratoriyaga kirish</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. SAT Matematika */}
          <Link
            href="/practice?subject=sat-math"
            className="glass-card glass-card-interactive p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/20 text-amber-300 group-hover:scale-105 transition-transform">
                  <Layers className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-amber-300">
                  800 Ballgacha
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                SAT Matematika (Digital SAT)
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  Tenglamalar &amp; Funksiyalar
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  Savollar Banki
                </span>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
              <span>Savollar bankiga o&apos;tish</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. SAT Reading & Writing */}
          <Link
            href="/practice?subject=sat-rw"
            className="glass-card glass-card-interactive p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                  R&amp;W Moduli
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                SAT Reading &amp; Writing
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  Akademik Matnlar
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  Grammatika
                </span>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Mashqlarni boshlash</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. IELTS Academic */}
          <Link
            href="/practice?subject=ielts"
            className="glass-card glass-card-interactive p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/20 text-amber-300 group-hover:scale-105 transition-transform">
                  <Globe2 className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-amber-300">
                  Band 7.5 – 8.5
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                IELTS Academic (4 Ko&apos;nikma)
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  Listening &amp; Reading
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  Writing Task 1/2
                </span>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
              <span>IELTS darslariga o&apos;tish</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 5. Dars Tarixi & Matnlar */}
          <Link
            href="/history"
            className="glass-card glass-card-interactive p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                  Audio &amp; Matn
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Dars Tarixi &amp; Konspektlar
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  To&apos;liq Dars Matnlari
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  JARVIS Ovozida
                </span>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Arxivni ochish</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 6. Shaxsiy AI Murabbiy */}
          <Link
            href="/coach"
            className="glass-card glass-card-interactive p-6 flex flex-col justify-between group border-amber-400/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/20 text-amber-300 group-hover:scale-105 transition-transform">
                  <Brain className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-amber-300">
                  24/7 JARVIS AI
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                AI Ovozli Murabbiy
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  Sokratik Muloqot
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                  Ovozli Javob (STT/TTS)
                </span>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
              <span>Murabbiy bilan suhbat</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ====================================================================
          3. JONLI AMALIYOT ARENASI (Live Practice Sprint)
          ==================================================================== */}
      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-400" /> JONLI MASHQ SPRINTI (+15 XP)
            </span>
            <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
              {currentQuiz.subject}: Bilimingizni sinab ko&apos;ring
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <JarvisVoiceButton
              text={`${currentQuiz.prompt}. Variantlar: ${currentQuiz.options.map(o => o.id + ': ' + o.text).join('. ')}`}
              label="Savolni tinglash"
            />
            <span className="glass-pill rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-amber-300">
              Savol {activeQuizIdx + 1} / {SAMPLE_QUIZ_QUESTIONS.length}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-lg font-bold text-white sm:text-xl">
            {currentQuiz.prompt}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuiz.options.map((opt) => {
              const isChosen = chosenOption === opt.id;
              const isCorrect = opt.id === currentQuiz.correct;

              let btnClass = "border-white/15 bg-white/5 text-white hover:border-emerald-400/50 hover:bg-white/10";
              if (quizAnswered) {
                if (isCorrect) {
                  btnClass = "border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]";
                } else if (isChosen) {
                  btnClass = "border-red-400 bg-red-500/20 text-red-300";
                } else {
                  btnClass = "border-white/5 bg-white/[0.02] text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={quizAnswered}
                  onClick={() => handleChoose(opt.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${btnClass}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 font-mono text-xs font-extrabold text-emerald-400">
                    {opt.id}
                  </span>
                  <span className="text-base font-semibold">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
              <div className="text-sm">
                <span className="font-bold text-emerald-400">Tushuntirish: </span>
                <span className="text-slate-200">{currentQuiz.explanation}</span>
              </div>
              <button
                type="button"
                onClick={nextQuiz}
                className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
              >
                <span>Keyingi savol</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
