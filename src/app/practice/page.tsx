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
  Trophy,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";

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
  const [data, setData] = useState<QuestionsBankResponse | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  const [chosenOpt, setChosenOpt] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [xpTotal, setXpTotal] = useState<number>(150);

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedSubject !== "all") params.set("subject", selectedSubject);
    if (selectedDifficulty !== "all") params.set("difficulty", selectedDifficulty);

    fetch(`/api/questions?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: QuestionsBankResponse | null) => {
        if (payload) {
          setData(payload);
          setCurrentIdx(0);
          setChosenOpt(null);
          setFeedback("idle");
          if (payload.profile?.xpTotal) setXpTotal(payload.profile.xpTotal);
        }
      })
      .catch(() => {});
  }, [selectedSubject, selectedDifficulty]);

  const currentQuestion = data?.questions[currentIdx] ?? null;

  const handleAnswer = async (optId: "A" | "B" | "C" | "D") => {
    if (!currentQuestion || feedback !== "idle") return;
    setChosenOpt(optId);
    const isRight = optId === currentQuestion.correctAnswer;
    setFeedback(isRight ? "correct" : "wrong");

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

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        givenAnswer: optId,
        timeSpentSec: 15,
      }),
    });

    if (res.ok) {
      const result = (await res.json()) as { xpTotal?: number };
      if (result.xpTotal) setXpTotal(result.xpTotal);
    }
  };

  if (!data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">Savollar banki yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <Layers className="h-3.5 w-3.5" />
              <span>SAVOLLAR BANKI VA MASHQ MAYDONI</span>
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              {data.honorific}, fan va qiyinlik bo&apos;yicha mashq qiling
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-gold/40 bg-gold-soft px-4 py-2 text-center">
              <span className="flex items-center gap-1.5 font-mono text-lg font-extrabold text-gold">
                <Trophy className="h-4 w-4" />
                {xpTotal} XP
              </span>
            </div>
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-fg hover:border-neon"
            >
              <BookOpen className="h-4 w-4 text-neon" />
              <span>Darslarga qaytish</span>
            </Link>
          </div>
        </div>

        {/* Filtrlar: Fan va Qiyinlik */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-fg-muted">
              <Filter className="h-3.5 w-3.5 text-neon" />
              <span>Fanni tanlang:</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm text-fg focus:border-neon focus:outline-none"
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
            <label className="mb-1.5 block text-xs font-bold text-fg-muted">
              Qiyinlik darajasi:
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm text-fg focus:border-neon focus:outline-none"
            >
              <option value="all">Barcha darajalar (1..4)</option>
              <option value="1">1-daraja: Noldan (Tayanch)</option>
              <option value="2">2-daraja: Boshlang&apos;ich</option>
              <option value="3">3-daraja: O&apos;rta</option>
              <option value="4">4-daraja: Yuqori (Murakkab)</option>
            </select>
          </div>
        </div>

        {/* Savol maydoni */}
        {currentQuestion ? (
          <div
            ref={cardRef}
            className="mt-6 rounded-2xl border border-border bg-canvas/90 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-lg bg-elevated px-3 py-1 text-xs font-bold text-neon">
                {currentQuestion.subjectNameUz} • {currentQuestion.topicTitleUz} (Savol{" "}
                {currentIdx + 1} / {data.questions.length})
              </span>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-bold text-gold"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Maslahat (Hint)</span>
              </button>
            </div>

            {showHint && currentQuestion.hints.length > 0 && (
              <div className="mt-3 rounded-xl border border-gold/40 bg-gold-soft/20 p-3 text-xs text-gold">
                💡 {currentQuestion.hints[0]}
              </div>
            )}

            {currentQuestion.passageUz && (
              <div className="mt-4 rounded-xl border border-border bg-surface p-4 font-serif text-sm italic text-fg">
                &ldquo;{currentQuestion.passageUz}&rdquo;
              </div>
            )}

            <h2 className="mt-4 text-base font-bold text-fg sm:text-lg">
              {currentQuestion.promptUz}
            </h2>

            <div className="mt-5 grid gap-3">
              {currentQuestion.options.map((opt) => {
                const isRight = opt.id === currentQuestion.correctAnswer;
                const isSelected = chosenOpt === opt.id;
                let cls = "border-border bg-surface text-fg hover:border-neon/50";
                if (feedback !== "idle") {
                  if (isRight) cls = "border-neon bg-neon-soft text-neon font-bold shadow-neon";
                  else if (isSelected) cls = "border-danger bg-danger/15 text-danger";
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={feedback !== "idle"}
                    onClick={() => handleAnswer(opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm transition-all ${cls}`}
                  >
                    <span>
                      <strong className="mr-2 font-mono">{opt.id}.</strong>
                      {opt.text}
                    </span>
                    {feedback !== "idle" && isRight && (
                      <CheckCircle2 className="h-5 w-5 text-neon" />
                    )}
                  </button>
                );
              })}
            </div>

            {feedback !== "idle" && (
              <div className="mt-5 rounded-xl border border-border bg-elevated p-4">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                  <Brain className="mt-0.5 h-5 w-5 shrink-0 text-neon" />
                  <div>
                    <p className="font-bold text-neon">Tushuntirish:</p>
                    <p className="mt-1 text-fg">{currentQuestion.explanationUz}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setChosenOpt(null);
                      setFeedback("idle");
                      setShowHint(false);
                      setCurrentIdx((prev) => (prev + 1) % data.questions.length);
                    }}
                    className="btn-neon inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold"
                  >
                    <span>Keyingi savol</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-canvas p-8 text-center text-sm text-fg-muted">
            Ushbu filtr bo&apos;yicha savollar topilmadi.
          </div>
        )}
      </div>
    </div>
  );
}
