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
    subject: "Digital SAT Matematika",
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
    prompt: "To'g'ri burchakli uchburchakning katetlari 9 va 12 ga teng. Gipotenuzani toping:",
    options: [
      { id: "A", text: "14" },
      { id: "B", text: "15" },
      { id: "C", text: "16" },
      { id: "D", text: "18" },
    ],
    correct: "B",
    explanation: "3-4-5 Pifagor uchligining 3 barobari: 9, 12, 15. Gipotenuza c = 15.",
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

  const studentName = session?.user?.name?.split(" ")[0];

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
      {/* ====================================================================
          1. ASOSIY QIYOFASI: HAQIQIY O'QUV PLATFORMASI HERO (Coursera/Apple uslubida)
          ==================================================================== */}
      <section className="grid gap-8 lg:grid-cols-12 items-center">
        {/* Chap qism: Sarlavha, Maqsad va Harakat tugmalari */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-extrabold text-emerald-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>XALQARO TA&apos;LIM PLATFORMASI • 12 OYLIK TIZIM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Top Universitetlar Sari{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Tizimli Tayyorgarlik
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Digital SAT (1500+), IELTS (Band 7.5+) va chuqur Matematikani noldan boshlab,
            JARVIS sun&apos;iy intellekt murabbiyi bilan birga o&apos;rganing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {session?.user ? (
              <Link
                href="/roadmap"
                className="btn-neon inline-flex items-center gap-2.5 px-7 py-4 text-base font-bold shadow-xl"
              >
                <Compass className="h-5 w-5" />
                <span>12 Oylik Xaritangizni Ochish</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="btn-neon inline-flex items-center gap-2.5 px-8 py-4 text-base font-bold shadow-xl"
              >
                <Sparkles className="h-5 w-5" />
                <span>Hoziroq Boshlash (Diagnostika)</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}

            <Link
              href="/math"
              className="glass-card inline-flex items-center gap-2 px-6 py-4 text-base font-bold text-white hover:text-emerald-300 transition-colors"
            >
              <Sigma className="h-5 w-5 text-emerald-400" />
              <span>Algebra &amp; Geometriya</span>
            </Link>
          </div>

          {/* Afzalliklar qatori */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            <div className="glass-pill rounded-xl p-3 text-center">
              <span className="block font-mono text-lg font-black text-emerald-400">1450+</span>
              <span className="text-[11px] font-semibold text-slate-400">SAT Maqsadi</span>
            </div>
            <div className="glass-pill rounded-xl p-3 text-center">
              <span className="block font-mono text-lg font-black text-amber-300">Band 7.5+</span>
              <span className="text-[11px] font-semibold text-slate-400">IELTS Academic</span>
            </div>
            <div className="glass-pill rounded-xl p-3 text-center">
              <span className="block font-mono text-lg font-black text-teal-300">12 Oy</span>
              <span className="text-[11px] font-semibold text-slate-400">Shaxsiy Reja</span>
            </div>
            <div className="glass-pill rounded-xl p-3 text-center">
              <span className="block font-mono text-lg font-black text-emerald-400">24/7 AI</span>
              <span className="text-[11px] font-semibold text-slate-400">JARVIS Murabbiy</span>
            </div>
          </div>
        </div>

        {/* O'ng qism: Jonli Interaktiv Darslik Vitrinasi (Live Glass Classroom Card) */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 sm:p-7 relative overflow-hidden">
            {/* Yuqori modul yorlig'i */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-400" />
                <span className="font-mono text-xs font-bold text-emerald-400">
                  NAMUNA INTERAKTIV DARSLIK
                </span>
              </div>
              <span className="glass-pill rounded-full px-3 py-0.5 text-xs font-mono font-bold text-amber-300">
                SAT 800
              </span>
            </div>

            {/* Darslik mazmuni */}
            <div className="mt-5 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mavzu: Kvadrat Tenglamalar va Viyet
                </span>
                <h3 className="mt-1 text-xl font-black text-white">
                  x² - 6x + 8 = 0 ning ildizlarini toping
                </h3>
              </div>

              {/* Yechim qadamlari */}
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>1. Ko&apos;paytuvchilar: (x - 2)(x - 4) = 0</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>2. Ildizlar: x₁ = 2, x₂ = 4</span>
                </div>
              </div>

              {/* JARVIS Ovozli tushuntirish paneli */}
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">JARVIS Ovozli Tushuntirish</span>
                    <span className="block text-[11px] text-slate-300">Nutq bilan tinglash</span>
                  </div>
                </div>
                <JarvisVoiceButton
                  text="Kvadrat tenglamani Viyet teoremasi orqali tezkor yechamiz. Ildizlar yig'indisi 6 ga, ko'paytmasi 8 ga teng. Demak, javob: 2 va 4."
                  label="Tinglash"
                />
              </div>

              {/* Tugma */}
              <Link
                href="/math"
                className="btn-neon flex items-center justify-center gap-2 py-3 text-center text-sm font-bold w-full"
              >
                <span>Barcha 15 ta Matematika Modullarini Ochish</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ASOSIY O'QUV KURSLARI VA MODULLAR KATALOGI
          ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              O&apos;QUV DASTURLARI
            </span>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl tracking-tight">
              Asosiy Fanlar va Chuqur Tayyorgarlik Kurslari
            </h2>
          </div>
          <Link
            href="/roadmap"
            className="text-sm font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1.5"
          >
            <span>12 Oylik Xaritani ko&apos;rish</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kurs 1: Algebra & Geometriya */}
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
                Algebra &amp; Geometriya
              </h3>
              <p className="mt-2 text-xs font-medium text-slate-300">
                6 bosqichli chuqur metod, formulalar isboti va vizual SVG modellar.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Kursga kirish</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Kurs 2: Digital SAT Matematika */}
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
                SAT Matematika
              </h3>
              <p className="mt-2 text-xs font-medium text-slate-300">
                Tenglamalar, funksiyalar va raqamli SAT imtihoni savollar banki.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
              <span>Savollar bankiga o&apos;tish</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Kurs 3: SAT Reading & Writing */}
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
              <p className="mt-2 text-xs font-medium text-slate-300">
                Akademik matnlar tahlili, mantiqiy xulosalar va grammatik qoliplar.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Mashqlarni boshlash</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Kurs 4: IELTS Academic */}
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
                IELTS Academic
              </h3>
              <p className="mt-2 text-xs font-medium text-slate-300">
                Listening, Reading, Academic Writing Task 1/2 va Speaking ko&apos;nikmalari.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
              <span>IELTS darslariga o&apos;tish</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ====================================================================
          3. 12 OYLIK TIZIMNING 4 CHORAGI (Structured Timeline)
          ==================================================================== */}
      <section className="glass-card p-6 sm:p-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
            STRATEGIYA
          </span>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            12 Oylik Tayyorgarlik Traektoriyasi
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Noldan boshlab dunyoning nufuzli universitetlariga grant asosida kirishgacha bo&apos;lgan yo&apos;l.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-pill rounded-2xl p-5 border-l-4 border-l-emerald-400">
            <span className="text-xs font-extrabold text-emerald-400 uppercase">1-CHORAK (1–3 OY)</span>
            <h4 className="mt-1.5 text-base font-bold text-white">Fundamental Poydevor</h4>
            <p className="mt-2 text-xs text-slate-300">
              Maktab algebrasini noldan mustahkamlash, ingliz tili grammatikasi va bazaviy so&apos;z boyligi.
            </p>
          </div>

          <div className="glass-pill rounded-2xl p-5 border-l-4 border-l-teal-400">
            <span className="text-xs font-extrabold text-teal-300 uppercase">2-CHORAK (4–6 OY)</span>
            <h4 className="mt-1.5 text-base font-bold text-white">SAT &amp; IELTS Strategiyalari</h4>
            <p className="mt-2 text-xs text-slate-300">
              Test tuzoqlari, tezkor ishlash uslublari, Reading skanerlash va Writing qoidalari.
            </p>
          </div>

          <div className="glass-pill rounded-2xl p-5 border-l-4 border-l-amber-400">
            <span className="text-xs font-extrabold text-amber-300 uppercase">3-CHORAK (7–9 OY)</span>
            <h4 className="mt-1.5 text-base font-bold text-white">Intensiv Amaliyot</h4>
            <p className="mt-2 text-xs text-slate-300">
              Minglab haqiqiy savollar banki, xatolar tahlili va Sokratik murabbiy bilan qiyin mavzular.
            </p>
          </div>

          <div className="glass-pill rounded-2xl p-5 border-l-4 border-l-emerald-400">
            <span className="text-xs font-extrabold text-emerald-400 uppercase">4-CHORAK (10–12 OY)</span>
            <h4 className="mt-1.5 text-base font-bold text-white">Mock Testlar &amp; Grant Qabuli</h4>
            <p className="mt-2 text-xs text-slate-300">
              To&apos;liq vaqtli sinov imtihonlari, insholarni tekshirish va xorijiy universitetlarga ariza topshirish.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. JONLI AMALIYOT: KUNLIK MASHQ SPRINTI
          ==================================================================== */}
      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-400" /> KUNLIK TEZKOR MASHQ
            </span>
            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
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
