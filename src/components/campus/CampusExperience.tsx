"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Flame,
  Globe2,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  ListOrdered,
  Play,
  Search,
  Shapes,
  Sigma,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

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
    explanation: "3x = 15 ⇒ x = 5. Demak, 6x + 5 = 6(5) + 5 = 35. (Yoki 6x = 2·3x = 30 ⇒ 30 + 5 = 35).",
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
    explanation: "3-4-5 Pifagor uchligining 3 barobari: 3·3 = 9, 4·3 = 12, 5·3 = 15. c = 15.",
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
    explanation: "However (ammo, biroq) ziddiyatni ifodalaydi. Furthermore va Moreover esa fikrni kuchaytiradi.",
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

  const handleNextQuiz = () => {
    setChosenOption(null);
    setQuizAnswered(false);
    setActiveQuizIdx((prev) => (prev + 1) % SAMPLE_QUIZ_QUESTIONS.length);
  };

  const studentName = session?.user?.name?.split(" ")[0] || "O'quvchi";

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* ====================================================================
          1. O'QUVCHI BOSHQARUV PANELI (Campus Header & Progress Status)
          ==================================================================== */}
      <section className="glass-card p-6 sm:p-8 relative overflow-hidden">
        {/* Shishasimon ichki aura */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-neon/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-neon animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-neon">
                Jonli O&apos;quv Muhiti • 3Talab Campus
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-4xl tracking-tight">
              Xush kelibsiz, <span className="text-gold">{studentName}</span>!
            </h1>
            <p className="mt-1.5 text-sm text-fg-muted max-w-2xl">
              12 oylik xalqaro universitetlarga tayyorgarlik tizimi. Bugungi darslaringiz va amaliy mashqlaringiz tayyor.
            </p>
          </div>

          {/* O'quvchi ko'rsatkichlari (Glass Pills) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-pill rounded-2xl px-4 py-2.5 text-center flex items-center gap-2.5">
              <Flame className="h-5 w-5 text-amber-500 fill-amber-500/20" />
              <div className="text-left">
                <span className="block font-mono text-xs font-bold text-fg">5 Kun</span>
                <span className="block text-[10px] text-fg-muted">Uzluksiz Streak</span>
              </div>
            </div>

            <div className="glass-pill rounded-2xl px-4 py-2.5 text-center flex items-center gap-2.5">
              <Zap className="h-5 w-5 text-neon" />
              <div className="text-left">
                <span className="block font-mono text-xs font-bold text-neon">+{quizScore + 150} XP</span>
                <span className="block text-[10px] text-fg-muted">Ballar</span>
              </div>
            </div>

            <div className="glass-pill rounded-2xl px-4 py-2.5 text-center flex items-center gap-2.5">
              <Trophy className="h-5 w-5 text-gold" />
              <div className="text-left">
                <span className="block font-mono text-xs font-bold text-gold">2-Daraja</span>
                <span className="block text-[10px] text-fg-muted">Zukko Yetakchi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Faol Darsni Davom Ettirish Bloki (Continue Learning Hero Card) */}
        <div className="mt-6 grid gap-4 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-neon/40 bg-neon-soft text-neon shadow-neon">
              <Sigma className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-neon-soft px-2 py-0.5 text-[10px] font-bold text-neon">
                  TAVSIYA ETILGAN DARSLIK
                </span>
                <span className="text-xs text-fg-muted">15 moduldan 4 tasi tugallangan</span>
              </div>
              <h3 className="mt-1 text-base font-bold text-fg sm:text-lg">
                Algebra & Geometriya: 6 Bosqichli Chuqur Metod
              </h3>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 max-w-md overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-neon to-accent-neon-bright w-[32%]" />
                </div>
                <span className="font-mono text-xs font-bold text-neon">32%</span>
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
              href="/learn"
              className="glass-pill inline-flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-fg hover:text-neon"
            >
              <span>Barcha Darslar</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ASOSIY FANLAR AKADEMIYASI (Subjects Glass Grid)
          ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-neon">
              O&apos;QUV YO&apos;NALISHLARI
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-fg sm:text-3xl tracking-tight">
              Asosiy Fanlar va Chuqur Tayyorgarlik Modullari
            </h2>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">
              Har bir fan noldan xalqaro imtihonlar (SAT, IELTS) va top universitetlar darajasigacha tuzilgan.
            </p>
          </div>
          <Link
            href="/roadmap"
            className="text-xs font-bold text-gold hover:text-gold-bright inline-flex items-center gap-1"
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/40 bg-neon-soft text-neon group-hover:scale-105 transition-transform">
                  <Sigma className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-[11px] font-bold text-neon">
                  15 ta Modul
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg group-hover:text-neon transition-colors">
                Algebra & Geometriya (Chuqur)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted line-clamp-3">
                6 bosqichli metod: Tushun, Ko&apos;r (SVG), Formula isboti, Namuna, SAT testlari va Xatolar tahlili.
                Formulalar spravochnigi va interaktiv kalkulyatorlar.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-neon">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-gold-soft text-gold group-hover:scale-105 transition-transform">
                  <Shapes className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-[11px] font-bold text-gold">
                  800 Ballgacha
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg group-hover:text-gold transition-colors">
                SAT Matematika (Digital SAT)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted line-clamp-3">
                Chiziqli va kvadratik tenglamalar, funksiyalar grafiklari, eksponensial o&apos;sish va ma&apos;lumotlar tahlili
                bo&apos;yicha minglab original savollar banki.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-gold">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/40 bg-neon-soft text-neon group-hover:scale-105 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-[11px] font-bold text-neon">
                  R&W Moduli
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg group-hover:text-neon transition-colors">
                SAT Reading & Writing
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted line-clamp-3">
                Ilmiy, tarixiy va adabiy matnlarni tezkor skanerlash, mantiqiy xulosalar chiqarish va grammatik qoliplarni
                oson o&apos;zlashtirish.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-neon">
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-gold-soft text-gold group-hover:scale-105 transition-transform">
                  <Globe2 className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-[11px] font-bold text-gold">
                  Band 7.5 – 8.5
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg group-hover:text-gold transition-colors">
                IELTS Academic (4 Ko&apos;nikma)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted line-clamp-3">
                Listening va Reading tuzoqlari (True/False/Not Given), Writing Task 1/2 mezonlari va Speaking uchun professional
                akademik strukturalar.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-gold">
              <span>IELTS darslariga o&apos;tish</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 5. Akademik Yozuv & Admission */}
          <Link
            href="/coach?mode=WRITING_REVIEW"
            className="glass-card glass-card-interactive p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/40 bg-neon-soft text-neon group-hover:scale-105 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-[11px] font-bold text-neon">
                  Grant & Stipendiya
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg group-hover:text-neon transition-colors">
                Akademik Insho & Grantlar
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted line-clamp-3">
                Xalqaro top universitetlar qabul komissiyasi uchun Personal Statement, Motivational Letter va insholarni AI orqali
                Band mezonlarida tekshirish.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-neon">
              <span>Writing tekshiruviga kirish</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 6. Shaxsiy AI Murabbiy */}
          <Link
            href="/coach"
            className="glass-card glass-card-interactive p-6 flex flex-col justify-between group border-gold/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/50 bg-gold-soft text-gold group-hover:scale-105 transition-transform">
                  <Brain className="h-6 w-6" />
                </div>
                <span className="glass-pill rounded-full px-3 py-1 font-mono text-[11px] font-bold text-gold">
                  24/7 Socratic AI
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg group-hover:text-gold transition-colors">
                Shaxsiy AI Murabbiy
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted line-clamp-3">
                Savolni o&apos;qib, tayyor javob bermasdan to&apos;g&apos;ri yechimga yo&apos;naltiradi. 6 xil metod: Socratic, Fast Shortcut, Step-by-Step va Math Deep Dive.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-gold">
              <span>AI Murabbiy bilan muloqot</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ====================================================================
          3. JONLI AMALIYOT ARENASI (Live Interactive Practice Arena)
          ==================================================================== */}
      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-neon flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-neon" /> JONLI MASHQ SPRINTI (+15 XP)
            </span>
            <h2 className="mt-1 text-xl font-extrabold text-fg sm:text-2xl">
              Bilimingizni darhol sinab ko&apos;ring: {currentQuiz.subject}
            </h2>
          </div>
          <span className="glass-pill rounded-xl px-3 py-1 font-mono text-xs font-bold text-gold">
            Savol {activeQuizIdx + 1} / {SAMPLE_QUIZ_QUESTIONS.length}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-base font-bold text-fg sm:text-lg">
            {currentQuiz.prompt}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuiz.options.map((opt) => {
              const isChosen = chosenOption === opt.id;
              const isCorrect = opt.id === currentQuiz.correct;

              let btnClass = "border-white/10 bg-white/5 text-fg hover:border-neon/50";
              if (quizAnswered) {
                if (isCorrect) {
                  btnClass = "border-neon bg-neon-soft text-neon font-bold shadow-neon";
                } else if (isChosen) {
                  btnClass = "border-danger bg-danger/20 text-danger";
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
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated font-mono text-xs font-extrabold text-neon">
                    {opt.id}
                  </span>
                  <span className="text-sm font-medium">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="mt-4 rounded-xl border border-neon/50 bg-neon-soft/40 p-4 animate-fadeIn">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-neon shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-neon">
                    {chosenOption === currentQuiz.correct ? "Ofarin! To'g'ri javob (+15 XP)" : "Yechim tushuntirishi:"}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-fg leading-relaxed">
                    {currentQuiz.explanation}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuiz}
                  className="btn-neon px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <span>Keyingi savol</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          4. TEZKOR AI MURABBIY SAVOL MAYDONI (Instant Socratic Ask Bar)
          ==================================================================== */}
      <section className="glass-card p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="mx-auto max-w-2xl space-y-3">
          <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold text-gold">
            <Sparkles className="h-3.5 w-3.5" /> AI MURABBIY KUTMOQDA
          </span>
          <h2 className="text-xl font-extrabold text-fg sm:text-3xl">
            Tushunmagan misol yoki mavzungiz bormi?
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted">
            Istalgan tenglama, test savoli yoki ingliz tili qoidasini yozing. Murabbiy uni o&apos;qib, qadamma-qadam tushuntirib beradi.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (aiQuestion.trim()) {
                window.location.href = `/coach?q=${encodeURIComponent(aiQuestion.trim())}`;
              }
            }}
            className="mt-5 flex flex-col sm:flex-row items-center gap-2.5 max-w-xl mx-auto"
          >
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-fg-muted" />
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Misol: 4x² - 16 = 0 ni qanday yechaman? yoki IELTS Reading usuli..."
                className="w-full rounded-2xl border border-white/10 bg-canvas/80 py-3 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted focus:border-neon focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-neon px-6 py-3 text-xs sm:text-sm font-bold whitespace-nowrap w-full sm:w-auto"
            >
              Murabbiydan so&apos;rash
            </button>
          </form>
        </div>
      </section>

      {/* ====================================================================
          5. 12 OYLIK O'QUV XARITASI (Roadmap Milestones)
          ==================================================================== */}
      <section className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-gold">
              STRATEGIK O&apos;QUV REJASI
            </span>
            <h2 className="mt-1 text-xl font-extrabold text-fg sm:text-2xl">
              12 Oyda Top Universitetga Tayyorgarlik Yo&apos;lagi
            </h2>
          </div>
          <Link
            href="/roadmap"
            className="btn-gold px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Compass className="h-4 w-4" />
            <span>To&apos;liq Xaritani Ochish</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-surface/50 p-4">
            <span className="font-mono text-xs font-bold text-neon">1-3 OY</span>
            <h4 className="mt-1 text-sm font-bold text-fg">1. Fundamental Poydevor</h4>
            <p className="mt-1 text-xs text-fg-muted">
              Algebraik asoslar, matematika poydevori, grammatika va akademik so&apos;z boyligi.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface/50 p-4">
            <span className="font-mono text-xs font-bold text-gold">4-6 OY</span>
            <h4 className="mt-1 text-sm font-bold text-fg">2. Asosiy Ko&apos;nikmalar</h4>
            <p className="mt-1 text-xs text-fg-muted">
              SAT Math chuqur teoremalari, IELTS 4 ko&apos;nikmasi va Socratic usulda xatolar tahlili.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface/50 p-4">
            <span className="font-mono text-xs font-bold text-neon">7-9 OY</span>
            <h4 className="mt-1 text-sm font-bold text-fg">3. Yuqori Ball va Mock Testlar</h4>
            <p className="mt-1 text-xs text-fg-muted">
              Digital SAT to&apos;liq simulyatsiyalari, vaqt strategiyasi va Band 8.0+ writing qoliplari.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface/50 p-4">
            <span className="font-mono text-xs font-bold text-gold">10-12 OY</span>
            <h4 className="mt-1 text-sm font-bold text-fg">4. Grantlar & Qabul</h4>
            <p className="mt-1 text-xs text-fg-muted">
              Personal statement tahriri, xalqaro universitetlar portfeli va grant arizalari.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
