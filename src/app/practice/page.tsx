"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate } from "animejs";
import {
  Layers,
  Filter,
  CheckCircle2,
  HelpCircle,
  Brain,
  ArrowRight,
  BookOpen,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";

interface PracticeQuestionDTO {
  id: string;
  subjectSlug: string;
  subjectNameUz: string;
  topicTitleUz: string;
  difficulty: number;
  promptUz: string;
  passageUz?: string | null;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanationUz: string;
  hints: string[];
}

interface QuestionsBankResponse {
  honorific: string;
  profile?: { xpTotal: number };
  subjects: Array<{ slug: string; nameUz: string }>;
  questions: PracticeQuestionDTO[];
}

export default function PracticeBankPage() {
  const { reduceMotion } = useUIPreferences();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [data, setData] = useState<QuestionsBankResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  const [selectedOpt, setSelectedOpt] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: QuestionsBankResponse | null) => {
        if (payload) setData(payload);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredQuestions = (data?.questions ?? []).filter((q) => {
    if (selectedSubject !== "all" && q.subjectSlug !== selectedSubject) return false;
    if (selectedDifficulty !== "all" && q.difficulty !== Number(selectedDifficulty)) {
      return false;
    }
    return true;
  });

  const currentQuestion: PracticeQuestionDTO | undefined =
    filteredQuestions[currentIdx] ?? filteredQuestions[0];

  const handleSelectOption = async (optId: "A" | "B" | "C" | "D") => {
    if (!currentQuestion || feedback !== "idle") return;
    setSelectedOpt(optId);

    const isRight = optId === currentQuestion.correctAnswer;
    setFeedback(isRight ? "correct" : "wrong");
    if (isRight) setAnsweredCount((prev) => prev + 1);

    if (!reduceMotion && cardRef.current) {
      if (isRight) {
        animate(cardRef.current, { scale: [0.99, 1.01, 1], duration: 350 });
      } else {
        animate(cardRef.current, {
          translateX: [-7, 7, -5, 5, 0],
          duration: 380,
        });
      }
    }

    try {
      await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          givenAnswer: optId,
          timeSpentSec: 15,
        }),
      });
    } catch {}
  };

  const nextQuestion = () => {
    setSelectedOpt(null);
    setFeedback("idle");
    setShowHint(false);
    if (currentIdx + 1 < filteredQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  const prevQuestion = () => {
    setSelectedOpt(null);
    setFeedback("idle");
    setShowHint(false);
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <span className="text-sm font-semibold">Savollar banki yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="glass-card p-6 sm:p-10">
        {/* Yuqori Sarlavha */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
              <Layers className="h-3.5 w-3.5" />
              <span>SAVOLLAR BANKI &amp; AMALIY MASHQLAR</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {data.honorific}, fanlar bo&apos;yicha intensiv mashq
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Har bir savol xalqaro standart (Digital SAT, IELTS) formatida tuzilgan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-pill rounded-2xl px-4 py-2.5 text-center">
              <span className="block font-mono text-lg font-black text-emerald-400">
                {answeredCount} / {filteredQuestions.length}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Yechilgan mashqlar
              </span>
            </div>

            <Link
              href="/history"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:border-emerald-400/50 hover:bg-white/10 transition-colors"
            >
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Dars Tarixi</span>
            </Link>

            <Link
              href="/learn"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:border-emerald-400/50 hover:bg-white/10 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-amber-300" />
              <span>Darslarga qaytish</span>
            </Link>
          </div>
        </div>

        {/* Filtrlar: Fan va Qiyinlik */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Filter className="h-3.5 w-3.5 text-emerald-400" />
              <span>Fanni tanlang:</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentIdx(0);
              }}
              className="w-full rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3 text-xs sm:text-sm font-semibold text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="all">Barcha fanlar ({data.questions.length} ta savol)</option>
              {data.subjects.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.nameUz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Qiyinlik darajasi:
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentIdx(0);
              }}
              className="w-full rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3 text-xs sm:text-sm font-semibold text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="all">Barcha darajalar (1..4)</option>
              <option value="1">1-daraja: Noldan (Tayanch)</option>
              <option value="2">2-daraja: Boshlang&apos;ich</option>
              <option value="3">3-daraja: O&apos;rta (SAT imtihoni)</option>
              <option value="4">4-daraja: Yuqori (800 / Band 8.5)</option>
            </select>
          </div>
        </div>

        {/* Savol maydoni */}
        {currentQuestion ? (
          <div
            ref={cardRef}
            className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="glass-pill rounded-lg px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                  {currentQuestion.subjectNameUz}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Mavzu: {currentQuestion.topicTitleUz}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <JarvisVoiceButton
                  text={`${currentQuestion.promptUz}. Variantlar: ${currentQuestion.options.map(o => o.id + ': ' + o.text).join('. ')}`}
                  label="Savolni tinglash"
                />

                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center gap-1 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Yordam</span>
                </button>
              </div>
            </div>

            {/* Matn / Passage (agar bo'lsa) */}
            {currentQuestion.passageUz && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                {currentQuestion.passageUz}
              </div>
            )}

            {/* Savol matni */}
            <h3 className="mt-4 text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQuestion.promptUz}
            </h3>

            {/* Hint paneli */}
            {showHint && currentQuestion.hints.length > 0 && (
              <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-xs font-semibold text-amber-200">
                <p>💡 <strong>Yordam:</strong> {currentQuestion.hints[0]}</p>
              </div>
            )}

            {/* Variantlar */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOpt === opt.id;
                const isCorrect = opt.id === currentQuestion.correctAnswer;

                let optClass = "border-white/15 bg-white/5 text-white hover:border-emerald-400/50 hover:bg-white/10";
                if (feedback !== "idle") {
                  if (isCorrect) {
                    optClass = "border-emerald-400 bg-emerald-500/25 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]";
                  } else if (isSelected) {
                    optClass = "border-red-400 bg-red-500/25 text-red-300 font-bold";
                  } else {
                    optClass = "border-white/5 bg-white/[0.02] text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={feedback !== "idle"}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${optClass}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 font-mono text-sm font-extrabold text-emerald-400">
                      {opt.id}
                    </span>
                    <span className="text-sm font-semibold">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Tahlil va Yechim */}
            {feedback !== "idle" && (
              <div
                className={`mt-6 rounded-2xl border p-5 ${
                  feedback === "correct"
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                    : "border-amber-400 bg-amber-500/15 text-amber-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{feedback === "correct" ? "To'g'ri javob!" : "Xato javob"}</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  {currentQuestion.explanationUz}
                </p>
              </div>
            )}

            {/* Navigatsiya: Oldingi / Keyingi savol */}
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Oldingi savol</span>
              </button>

              <span className="font-mono text-xs font-bold text-slate-400">
                {currentIdx + 1} / {filteredQuestions.length}
              </span>

              <button
                type="button"
                onClick={nextQuestion}
                className="btn-neon flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
              >
                <span>Keyingi savol</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/10 p-8 text-center text-slate-400">
            Tanlangan fan va darajada savollar topilmadi. Filtrni o&apos;zgartiring.
          </div>
        )}
      </div>
    </div>
  );
}
