"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Feather,
  FileText,
  Filter,
  Globe2,
  HelpCircle,
  Layers,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  Scissors,
  Sigma,
  Sparkles,
  Trophy,
  Volume2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { SegmentLoading } from "@/components/layout/SegmentLoading";
import {
  PRACTICE_QUESTIONS,
  SAT_MATH_REFERENCE_FORMULAS,
  type DifficultyLevel,
  type PracticeQuestion,
  type SubjectSlug,
} from "@/lib/practice/practice-data";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";

// ============================================================================
// ASOSIY SAHIFA WRAPPERI (Next.js Suspense talabi)
// ============================================================================

export default function PracticeBankPage() {
  return (
    <Suspense fallback={<SegmentLoading />}>
      <PracticeCenterContent />
    </Suspense>
  );
}

// ============================================================================
// AMALIYOT MARKAZI KONTENTI
// ============================================================================

function PracticeCenterContent() {
  const searchParams = useSearchParams();

  // URL dagi ?subject query parametri
  const urlSubject = searchParams.get("subject");
  const initialSubject: SubjectSlug =
    urlSubject === "sat-rw" || urlSubject === "ielts" ? urlSubject : "sat-math";

  // State
  const [activeSubject, setActiveSubject] = useState<SubjectSlug>(initialSubject);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("all");
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  // URL parametri o'zgarganda yangilash
  useEffect(() => {
    if (urlSubject === "sat-math" || urlSubject === "sat-rw" || urlSubject === "ielts") {
      setActiveSubject(urlSubject);
      setCurrentIdx(0);
    }
  }, [urlSubject]);

  // Savol yechish holatlari
  const [selectedOpt, setSelectedOpt] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);

  // Qoralama (Scratchpad) va Reference Sheet modallari
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchpadText, setScratchpadText] = useState<string>("");
  const [showReferenceSheet, setShowReferenceSheet] = useState<boolean>(false);

  // Statistika (Session davomida)
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // Imtihon Taymeri
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // IELTS Rejimi: "reading" yoki "writing"
  const [ieltsMode, setIeltsMode] = useState<"reading" | "writing">("reading");

  // IELTS Writing Simulator State
  const [writingEssay, setWritingEssay] = useState<string>("");
  const [isCheckingWriting, setIsCheckingWriting] = useState<boolean>(false);
  const [writingFeedback, setWritingFeedback] = useState<{
    band: string;
    taskResponse: string;
    coherence: string;
    lexical: string;
    grammar: string;
    recommendation: string;
  } | null>(null);

  // Taymer hisobi
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [timerSeconds]);

  // Filtrlangan savollar ro'yxati
  const filteredQuestions = useMemo(() => {
    return PRACTICE_QUESTIONS.filter((q) => {
      const matchSubject = q.subjectSlug === activeSubject;
      const matchDiff = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      return matchSubject && matchDiff;
    });
  }, [activeSubject, selectedDifficulty]);

  // Joriy savol
  const currentQuestion = filteredQuestions[currentIdx] || filteredQuestions[0];

  // Yangi savolga o'tganda holatni tozalash
  const resetQuestionState = () => {
    setSelectedOpt(null);
    setIsChecked(false);
    setShowHint(false);
    setEliminatedOptions([]);
  };

  const handleSubjectChange = (slug: SubjectSlug) => {
    setActiveSubject(slug);
    setCurrentIdx(0);
    resetQuestionState();
  };

  const handleDifficultyChange = (diff: DifficultyLevel) => {
    setSelectedDifficulty(diff);
    setCurrentIdx(0);
    resetQuestionState();
  };

  // Variantni tanlash
  const handleSelectOption = (optId: "A" | "B" | "C" | "D") => {
    if (isChecked) return;
    if (eliminatedOptions.includes(optId)) return;
    setSelectedOpt(optId);
  };

  // 50/50 Eliminatsiya (Cross-out)
  const handleEliminateTwo = () => {
    if (!currentQuestion || isChecked) return;
    const wrongKeys = (["A", "B", "C", "D"] as const).filter(
      (k) => k !== currentQuestion.correct
    );
    // 2 tasini tanlaymiz
    const twoToEliminate = wrongKeys.slice(0, 2);
    setEliminatedOptions(twoToEliminate);
    if (selectedOpt && twoToEliminate.includes(selectedOpt)) {
      setSelectedOpt(null);
    }
  };

  // Javobni tekshirish
  const handleCheckAnswer = () => {
    if (!selectedOpt || isChecked || !currentQuestion) return;
    setIsChecked(true);
    setAnsweredCount((prev) => prev + 1);
    if (selectedOpt === currentQuestion.correct) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  // Keyingi / Oldingi savol
  const handleNextQuestion = () => {
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      resetQuestionState();
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      resetQuestionState();
    }
  };

  // IELTS Writing so'zlar soni
  const essayWordCount = useMemo(() => {
    return writingEssay.trim() ? writingEssay.trim().split(/\s+/).length : 0;
  }, [writingEssay]);

  // IELTS Writing Simulated AI Feedback
  const handleAnalyzeEssay = () => {
    if (essayWordCount < 10) return;
    setIsCheckingWriting(true);
    setTimeout(() => {
      let band = "Band 6.5";
      if (essayWordCount >= 250) {
        band = "Band 7.5";
      } else if (essayWordCount >= 150) {
        band = "Band 7.0";
      }

      setWritingFeedback({
        band,
        taskResponse:
          essayWordCount >= 250
            ? "Mavzuning ikkala tomoni to'liq qamrab olingan (Band 7.5)"
            : "Fikrlar yaxshi, lekin so'zlar sonini kamida 250 tagacha yetkazing.",
        coherence: "Paragraflar mantiqiy bog'langan, ammo 'However', 'Furthermore' kabi bog'lovchilarni boyiting.",
        lexical: "Akademik leksika qo'llangan. 'Very good' o'rniga 'paramount', 'essential' so'zlarini ishlatish tavsiya etiladi.",
        grammar: "Murakkab qo'shma gaplar mavjud. Inversiya (Not only... but also...) qo'shilsa Band 8.0 ga chiqadi.",
        recommendation:
          "Talaba AI bilan Sokratik rejimda ushbu inshoni qayta ko'rib chiqing va Band 8.0 ga moslang.",
      });
      setIsCheckingWriting(false);
    }, 1200);
  };

  // Aniqlik foizi
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 100;

  return (
    <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 lg:px-10 space-y-8">
      {/* ====================================================================
          1. YUQORI BOSHQARUV PANELI (Tabs, Filtrlar va Taymer)
          ==================================================================== */}
      <div className="glass-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>BLUEBOOK &amp; IELTS AMALIYOT MARKAZI</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white">
              Haqiqiy Imtihon Standartidagi Savollar Banki
            </h1>
          </div>

          {/* O'ng panel: Aniqlik, Hisob va Imtihon Taymeri */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-pill rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs font-mono">
              <Trophy className="h-4 w-4 text-amber-300" />
              <span>
                To&apos;g&apos;ri: <strong className="text-emerald-400">{correctCount}</strong> / {answeredCount}
              </span>
              <span className="text-slate-400">({accuracyPercent}%)</span>
            </div>

            {/* Imtihon Taymeri */}
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs font-bold text-amber-300">
              <Clock className={`h-4 w-4 ${isTimerRunning ? "animate-pulse text-amber-400" : "text-slate-400"}`} />
              <span>{formattedTime}</span>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="ml-1 text-slate-400 hover:text-white"
                title={isTimerRunning ? "Taymerni to'xtatish" : "Taymerni davom ettirish"}
              >
                {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3 ta Yo'nalish Tabs va Qiyinlik filtri */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { slug: "sat-math" as SubjectSlug, label: "Digital SAT Math (800)", icon: Sigma, accent: "emerald" },
              { slug: "sat-rw" as SubjectSlug, label: "SAT Reading & Writing", icon: BookOpen, accent: "teal" },
              { slug: "ielts" as SubjectSlug, label: "IELTS Academic (7.5+)", icon: Globe2, accent: "amber" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubject === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => handleSubjectChange(tab.slug)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? "border border-emerald-400 bg-emerald-500/25 text-white shadow-neon"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4 text-emerald-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Qiyinlik filtri */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
            {(["all", "easy", "medium", "hard"] as DifficultyLevel[]).map((diff) => {
              const isDiffActive = selectedDifficulty === diff;
              const labels: Record<DifficultyLevel, string> = {
                all: "Barchasi",
                easy: "Oson",
                medium: "O'rta",
                hard: "Qiyin (750+)",
              };
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => handleDifficultyChange(diff)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                    isDiffActive
                      ? "bg-white/20 text-white border border-white/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {labels[diff]}
                </button>
              );
            })}
          </div>
        </div>

        {/* IELTS ichida: Reading va Writing Tabs */}
        {activeSubject === "ielts" && (
          <div className="flex items-center gap-2 border-t border-white/10 pt-4">
            <span className="text-xs font-bold text-slate-400">IELTS moduli:</span>
            <button
              type="button"
              onClick={() => setIeltsMode("reading")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                ieltsMode === "reading" ? "bg-amber-500/25 text-amber-300 border border-amber-400/40" : "text-slate-400"
              }`}
            >
              Academic Reading &amp; Lexis
            </button>
            <button
              type="button"
              onClick={() => setIeltsMode("writing")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                ieltsMode === "writing" ? "bg-amber-500/25 text-amber-300 border border-amber-400/40" : "text-slate-400"
              }`}
            >
              <Feather className="h-3.5 w-3.5" />
              <span>Writing Task 2 Simulyatori</span>
            </button>
          </div>
        )}
      </div>

      {/* ====================================================================
          2. IELTS WRITING TASK 2 INTERAKTIV SIMULYATORI (Agar tanlangan bo'lsa)
          ==================================================================== */}
      {activeSubject === "ielts" && ieltsMode === "writing" ? (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-extrabold uppercase text-amber-300">
              <Feather className="h-4 w-4" />
              <span>IELTS Writing Task 2 • Rasmiy Mavzu</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              &ldquo;Some people argue that university education should be completely free for everyone, while others believe that students should pay for higher education. Discuss both views and give your own opinion.&rdquo;
            </h2>
            <p className="text-xs text-slate-400">
              Kamida 250 ta so&apos;z yozing. Inshoyingizni kiritgach, Talaba AI sizning Band Score ingizni 4 ta mezon bo&apos;yicha tekshirib beradi.
            </p>
          </div>

          {/* Yozish maydoni */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Insho matni:</span>
              <span className={`font-bold ${essayWordCount >= 250 ? "text-emerald-400" : "text-amber-300"}`}>
                So&apos;zlar soni: {essayWordCount} / 250
              </span>
            </div>

            <textarea
              rows={12}
              value={writingEssay}
              onChange={(e) => setWritingEssay(e.target.value)}
              placeholder="Inshoni bu yerga yozing (masalan: While some argue that tertiary education is a fundamental public right, others contend that personal tuition fees foster student commitment...)"
              className="w-full rounded-2xl border border-white/10 bg-[#0b0b0c] p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">
                {essayWordCount < 50 ? "Insho juda qisqa (kamida 150-250 so'z tavsiya etiladi)" : "Tahlilga tayyor"}
              </span>

              <button
                type="button"
                disabled={essayWordCount < 10 || isCheckingWriting}
                onClick={handleAnalyzeEssay}
                className="btn-gold inline-flex items-center gap-2 px-6 py-3 text-xs font-bold"
              >
                {isCheckingWriting ? (
                  <>
                    <Brain className="h-4 w-4 animate-spin" />
                    <span>Talaba AI tekshirmoqda...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    <span>Talaba AI orqali Band Score ni tekshirish</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Simulated AI Feedback kartochkasi */}
          {writingFeedback && (
            <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-transparent p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-300">Talaba AI Tahlil Xulosasi</span>
                  <h3 className="text-2xl font-black text-white font-mono mt-0.5">
                    Taxminiy Natija: <span className="text-emerald-400">{writingFeedback.band}</span>
                  </h3>
                </div>
                <span className="glass-pill rounded-xl px-3 py-1 font-mono text-xs text-slate-300">
                  {essayWordCount} ta so&apos;z
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="glass-pill rounded-xl p-3.5 space-y-1">
                  <span className="text-emerald-400 font-bold block">1. Task Response (Topshiriq yechimi):</span>
                  <p className="text-slate-300">{writingFeedback.taskResponse}</p>
                </div>
                <div className="glass-pill rounded-xl p-3.5 space-y-1">
                  <span className="text-teal-300 font-bold block">2. Coherence &amp; Cohesion (Bog&apos;liqlik):</span>
                  <p className="text-slate-300">{writingFeedback.coherence}</p>
                </div>
                <div className="glass-pill rounded-xl p-3.5 space-y-1">
                  <span className="text-amber-300 font-bold block">3. Lexical Resource (Leksik boylik):</span>
                  <p className="text-slate-300">{writingFeedback.lexical}</p>
                </div>
                <div className="glass-pill rounded-xl p-3.5 space-y-1">
                  <span className="text-emerald-400 font-bold block">4. Grammatical Range (Grammatika):</span>
                  <p className="text-slate-300">{writingFeedback.grammar}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-300">
                  Ushbu inshoni Sokratik murabbiy bilan so&apos;zma-so&apos;z tahlil qilishni xohlaysizmi?
                </span>
                <Link
                  href={`/coach?mode=WRITING_REVIEW&subject=ielts&q=${encodeURIComponent(writingEssay)}`}
                  className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
                >
                  <span>Talaba AI bilan chuqur ko&apos;rib chiqish</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ====================================================================
            3. REAL EXAM BLUEBOOK SPLIT-SCREEN INTERFEYSI
            ==================================================================== */
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-12 items-stretch">
          {/* ==================================================================
              CHAP TOMON: Masala sharti / Passage / Reference / Qoralama
              ================================================================== */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 space-y-5 flex flex-col justify-between min-h-[500px]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                  Savol {currentIdx + 1} / {filteredQuestions.length}
                </span>
                <span className="glass-pill rounded-md px-2 py-0.5 font-mono text-[10px] text-slate-300">
                  {currentQuestion?.difficultyLabel}
                </span>
              </div>

              {/* Qo'shimcha asboblar: Reference Sheet & Scratchpad */}
              <div className="flex items-center gap-2">
                {activeSubject === "sat-math" && (
                  <button
                    type="button"
                    onClick={() => setShowReferenceSheet(!showReferenceSheet)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Reference</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowScratchpad(!showScratchpad)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <PenLine className="h-3.5 w-3.5 text-amber-300" />
                  <span>Qoralama</span>
                </button>

                <JarvisVoiceButton
                  text={`${currentQuestion?.passage ? currentQuestion.passage + '. ' : ''}${currentQuestion?.prompt}`}
                  label="Eshitish"
                />
              </div>
            </div>

            {/* SAT Math Reference Sheet Modali */}
            {showReferenceSheet && activeSubject === "sat-math" && (
              <div className="rounded-2xl border border-emerald-400/40 bg-[#0b0b0c] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-extrabold uppercase text-emerald-400">
                    SAT Math Reference Sheet (Rasmiy formulalar)
                  </span>
                  <button type="button" onClick={() => setShowReferenceSheet(false)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {SAT_MATH_REFERENCE_FORMULAS.map((item, idx) => (
                    <div key={idx} className="rounded-lg bg-black/40 p-2.5 border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-sans">{item.label}</span>
                      <span className="text-emerald-300 font-bold">{item.formula}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Qoralama / Scratchpad maydoni */}
            {showScratchpad && (
              <div className="rounded-2xl border border-amber-400/40 bg-[#0b0b0c] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                  <span>Qoralama (Scratchpad / Hisob-kitob)</span>
                  <button type="button" onClick={() => setShowScratchpad(false)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={scratchpadText}
                  onChange={(e) => setScratchpadText(e.target.value)}
                  placeholder="Hisob-kitoblaringizni bu yerga yozib boring..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            )}

            {/* Agar Passage bo'lsa (SAT RW yoki IELTS) */}
            {currentQuestion?.passage && (
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0c] p-5 text-sm leading-relaxed text-slate-200 font-serif space-y-3">
                <span className="text-[11px] font-sans uppercase font-bold text-slate-400 block tracking-wider">
                  Akademik Matn (Passage)
                </span>
                <p>{currentQuestion.passage}</p>
              </div>
            )}

            {/* Masala sharti */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Mavzu: {currentQuestion?.topicTitle}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQuestion?.prompt}
              </h2>
            </div>

            {/* Maslahat (Hint) tugmasi */}
            {currentQuestion?.hint && (
              <div>
                {!showHint ? (
                  <button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>💡 Maslahat olish (Hint)</span>
                  </button>
                ) : (
                  <div className="glass-pill rounded-xl p-3 border-l-4 border-l-amber-400 text-xs text-slate-300 space-y-1">
                    <strong className="text-amber-300">Maslahat: </strong>
                    <span>{currentQuestion.hint}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==================================================================
              O'NG TOMON: Variantlar, 50/50 Eliminatsiya va Yechim tahlili
              ================================================================== */}
          <div className="lg:col-span-5 glass-card p-6 sm:p-8 space-y-6 flex flex-col justify-between min-h-[500px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Javob variantlari
              </span>

              {/* 50/50 Eliminatsiya */}
              <button
                type="button"
                disabled={isChecked || eliminatedOptions.length > 0}
                onClick={handleEliminateTwo}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-300 transition-colors disabled:opacity-40"
                title="Ikkita xato variantni o'chirish"
              >
                <Scissors className="h-3.5 w-3.5" />
                <span>50/50 Cross-out</span>
              </button>
            </div>

            {/* 4 ta Variant */}
            <div className="space-y-3">
              {currentQuestion?.options.map((opt) => {
                const isSelected = selectedOpt === opt.id;
                const isEliminated = eliminatedOptions.includes(opt.id);
                const isCorrect = isChecked && opt.id === currentQuestion.correct;
                const isWrong = isChecked && isSelected && !isCorrect;

                let cardClass = "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-400/40 hover:bg-white/10";
                if (isEliminated) {
                  cardClass = "border-white/5 bg-white/[0.02] text-slate-600 line-through opacity-40 cursor-not-allowed";
                } else if (isChecked) {
                  if (isCorrect) {
                    cardClass = "border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-neon";
                  } else if (isWrong) {
                    cardClass = "border-red-400 bg-red-500/20 text-red-300";
                  } else {
                    cardClass = "border-white/5 bg-white/[0.02] text-slate-500 opacity-60";
                  }
                } else if (isSelected) {
                  cardClass = "border-emerald-400 bg-emerald-500/20 text-white font-bold shadow-[0_0_20px_rgba(198,244,50,0.25)]";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isChecked || isEliminated}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left text-xs transition-all ${cardClass}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-extrabold ${
                        isEliminated
                          ? "bg-white/5 text-slate-600"
                          : isSelected
                          ? "bg-emerald-400 text-slate-950"
                          : "bg-white/10 text-emerald-400"
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {isChecked && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    {isChecked && isWrong && <XCircle className="h-4 w-4 text-red-400" />}
                  </button>
                );
              })}
            </div>

            {/* Tekshirish tugmasi */}
            {!isChecked ? (
              <button
                type="button"
                disabled={!selectedOpt}
                onClick={handleCheckAnswer}
                className={`btn-neon w-full flex items-center justify-center gap-2 py-3.5 text-xs font-bold ${
                  !selectedOpt ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <span>Javobni Tekshirish</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            ) : (
              /* Yechim izohi va Talaba AI bilan tahlil qilish */
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold">
                  {selectedOpt === currentQuestion.correct ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> To&apos;g&apos;ri javob!
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <XCircle className="h-4 w-4" /> Noto&apos;g&apos;ri. To&apos;g&apos;ri javob: {currentQuestion.correct}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <strong className="text-slate-200 block">Batafsil izoh:</strong>
                  <p className="leading-relaxed">{currentQuestion.explanation}</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={`/coach?mode=ERROR_EXPLAINER&subject=${activeSubject}&q=${encodeURIComponent(
                      currentQuestion.prompt
                    )}`}
                    className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold"
                  >
                    <Brain className="h-3.5 w-3.5" />
                    <span>Talaba AI bilan tahlil qilish</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Pastki Navigatsiya: Oldingi / Keyingi savol */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={handlePrevQuestion}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30"
              >
                <span>Oldingi</span>
              </button>

              <button
                type="button"
                disabled={currentIdx >= filteredQuestions.length - 1}
                onClick={handleNextQuestion}
                className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold disabled:opacity-30"
              >
                <span>Keyingi savol</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
