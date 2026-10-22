"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate } from "animejs";
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sliders,
  Mic,
  PenTool,
  Brain,
  Zap,
} from "lucide-react";
import {
  PLACEMENT_QUESTION_BANK,
  PLACEMENT_SUBJECT_ORDER,
  levelToStartingDifficulty,
  selectNextAdaptiveQuestion,
  type PlacementQuestionItem,
} from "@/lib/curriculum/placement-engine";
import { useUIPreferences } from "@/components/providers/AppProviders";

const DIFFICULTY_LABELS: Record<1 | 2 | 3 | 4, { label: string; color: string }> = {
  1: { label: "1-pog'ona • Noldan (Tayanch)", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  2: { label: "2-pog'ona • Boshlang'ich", color: "text-neon border-neon/40 bg-neon-soft" },
  3: { label: "3-pog'ona • O'rta (Imtihon darajasi)", color: "text-gold border-gold/40 bg-gold-soft" },
  4: { label: "4-pog'ona • Yuqori (800 / Band 8.5)", color: "text-amber-300 border-amber-400/50 bg-amber-500/15" },
};

const TOTAL_ADAPTIVE_QUESTIONS = 10; // Har bir 5 fandan 2 tadan adaptiv savol

export default function PlacementTestPage() {
  const router = useRouter();
  const { reduceMotion } = useUIPreferences();
  const questionCardRef = useRef<HTMLDivElement | null>(null);

  const [honorific, setHonorific] = useState<string>("Aziz o'quvchi");
  const [currentDifficulty, setCurrentDifficulty] = useState<1 | 2 | 3 | 4>(2);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [recordedAnswers, setRecordedAnswers] = useState<
    Array<{
      questionId: string;
      subjectSlug: string;
      difficulty: number;
      givenAnswer: string;
      timeSpentSec: number;
    }>
  >([]);

  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [feedbackState, setFeedbackState] = useState<"idle" | "correct" | "wrong">("idle");
  const [showWritingSpeakingStep, setShowWritingSpeakingStep] = useState<boolean>(false);
  const [speakingComfort, setSpeakingComfort] = useState<"SHY" | "MODERATE" | "CONFIDENT">("MODERATE");
  const [writingExperience, setWritingExperience] = useState<"NONE" | "PARAGRAPHS" | "FULL_ESSAYS">("PARAGRAPHS");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Foydalanuvchi onboardingda belgilagan boshlang'ich darajasini olish
  useEffect(() => {
    fetch("/api/placement")
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            honorific?: string;
            profile?: { selfAssessedLevel?: string };
          } | null,
        ) => {
          if (!data) return;
          if (data.honorific) setHonorific(data.honorific);
          if (data.profile?.selfAssessedLevel) {
            setCurrentDifficulty(levelToStartingDifficulty(data.profile.selfAssessedLevel));
          }
        },
      )
      .catch(() => {});
  }, []);

  // Hozirgi savol qaysi fanga tegishli ekanini aniqlash (har 2 savolda keyingi fan)
  const currentSubjectInfo = useMemo(() => {
    const subjIdx = Math.min(
      PLACEMENT_SUBJECT_ORDER.length - 1,
      Math.floor(questionIndex / 2),
    );
    return PLACEMENT_SUBJECT_ORDER[subjIdx];
  }, [questionIndex]);

  // Adaptiv savolni tanlash
  const currentQuestion: PlacementQuestionItem = useMemo(() => {
    const chosen = selectNextAdaptiveQuestion({
      subjectSlug: currentSubjectInfo.slug,
      targetDifficulty: currentDifficulty,
      answeredIds,
    });
    return chosen ?? PLACEMENT_QUESTION_BANK[questionIndex % PLACEMENT_QUESTION_BANK.length];
  }, [currentSubjectInfo, currentDifficulty, answeredIds, questionIndex]);

  // Savol almashganda silliq animatsiya
  useEffect(() => {
    if (reduceMotion || !questionCardRef.current) return;
    animate(questionCardRef.current, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 460,
      ease: "outExpo",
    });
  }, [questionIndex, showWritingSpeakingStep, reduceMotion]);

  const handleCheckAnswer = (optId: "A" | "B" | "C" | "D") => {
    if (feedbackState !== "idle") return;
    setSelectedOption(optId);

    const isCorrect = optId === currentQuestion.correctAnswer;
    setFeedbackState(isCorrect ? "correct" : "wrong");

    if (!reduceMotion && questionCardRef.current) {
      if (isCorrect) {
        animate(questionCardRef.current, {
          scale: [0.99, 1.01, 1],
          duration: 380,
          ease: "outQuad",
        });
      } else {
        animate(questionCardRef.current, {
          translateX: [-7, 7, -5, 5, -2, 2, 0],
          duration: 420,
          ease: "outSine",
        });
      }
    }

    setRecordedAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        subjectSlug: currentQuestion.subjectSlug,
        difficulty: currentQuestion.difficulty,
        givenAnswer: optId,
        timeSpentSec: 18,
      },
    ]);
  };

  const handleNextQuestion = () => {
    const wasCorrect = feedbackState === "correct";
    const finishedQuestionId = currentQuestion.id;

    setSelectedOption(null);
    setFeedbackState("idle");
    setAnsweredIds((prev) => [...prev, finishedQuestionId]);
    setCurrentDifficulty((prev) => {
      const next = wasCorrect ? Math.min(4, prev + 1) : Math.max(1, prev - 1);
      return next as 1 | 2 | 3 | 4;
    });

    if (questionIndex + 1 >= TOTAL_ADAPTIVE_QUESTIONS) {
      setShowWritingSpeakingStep(true);
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const submitPlacement = async (
    customAnswers?: typeof recordedAnswers,
  ) => {
    setSubmitting(true);
    try {
      const payloadAnswers =
        customAnswers && customAnswers.length > 0
          ? customAnswers
          : recordedAnswers.length > 0
            ? recordedAnswers
            : PLACEMENT_QUESTION_BANK.slice(0, 10).map((q, idx) => ({
                questionId: q.id,
                subjectSlug: q.subjectSlug,
                difficulty: q.difficulty,
                givenAnswer: idx % 3 === 0 ? "A" : q.correctAnswer,
                timeSpentSec: 15,
              }));

      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: payloadAnswers,
          speakingComfort,
          writingExperience,
        }),
      });

      if (res.ok) {
        router.push("/placement/result");
      } else {
        setSubmitting(false);
      }
    } catch {
      setSubmitting(false);
    }
  };

  const diffBadge = DIFFICULTY_LABELS[currentQuestion.difficulty];

  return (
    <div className="classroom-grid-bg mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-card p-6 sm:p-8">
        {/* Sarlavha va Adaptiv Indikator */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3 py-1 text-xs font-bold text-neon">
              <Sliders className="h-3.5 w-3.5" />
              <span>ADAPTIV SARALASH TESTI (PLACEMENT)</span>
            </span>
            <h1 className="mt-1.5 text-xl font-extrabold text-fg sm:text-2xl">
              {honorific}, bilimingiz darajasini aniqlaymiz
            </h1>
          </div>

          <button
            type="button"
            id="placement-quick-finish-btn"
            onClick={() => submitPlacement()}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold-soft px-3.5 py-2 text-xs font-bold text-gold transition-transform hover:scale-105"
            title="Testni hozirgi javoblar bilan yakunlab natijani ko'rish"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Natijani hoziroq hisoblash</span>
          </button>
        </div>

        {/* Progress chizig'i */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-fg-muted">
            <span>
              {showWritingSpeakingStep
                ? "Yakuniy qadam: IELTS Writing & Speaking tavsiyasi"
                : `Savol ${questionIndex + 1} / ${TOTAL_ADAPTIVE_QUESTIONS} • ${currentQuestion.subjectNameUz}`}
            </span>
            <span className="font-mono text-neon">
              {showWritingSpeakingStep
                ? "100%"
                : `${Math.round(((questionIndex + 1) / TOTAL_ADAPTIVE_QUESTIONS) * 100)}%`}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon to-gold transition-all duration-300"
              style={{
                width: showWritingSpeakingStep
                  ? "100%"
                  : `${((questionIndex + 1) / TOTAL_ADAPTIVE_QUESTIONS) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* ====================================================================
            SAVOL KARTASI YOKI WRITING/SPEAKING DIAGNOSTIKA QADAMI
            ==================================================================== */}
        {!showWritingSpeakingStep ? (
          <div
            ref={questionCardRef}
            className={`mt-6 rounded-2xl border p-6 transition-all ${
              feedbackState === "correct"
                ? "border-neon bg-neon-soft/25 shadow-neon"
                : feedbackState === "wrong"
                  ? "border-danger/60 bg-danger/5"
                  : "border-border bg-canvas/80"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-lg border border-border bg-elevated px-3 py-1 text-xs font-bold text-fg">
                📚 {currentQuestion.subjectNameUz}: {currentQuestion.topicTitleUz}
              </span>
              <span
                className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${diffBadge.color}`}
              >
                Adaptiv daraja: {diffBadge.label}
              </span>
            </div>

            {currentQuestion.passageUz && (
              <div className="mt-4 rounded-xl border border-border bg-surface p-4 font-serif text-sm italic leading-relaxed text-fg">
                &ldquo;{currentQuestion.passageUz}&rdquo;
              </div>
            )}

            <h2 className="mt-5 text-base font-bold leading-relaxed text-fg sm:text-lg">
              {currentQuestion.promptUz}
            </h2>

            {/* Variantlar */}
            <div className="mt-5 grid gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isRightOption = opt.id === currentQuestion.correctAnswer;

                let btnStyle =
                  "border-border bg-surface text-fg hover:border-neon/50";
                if (feedbackState !== "idle") {
                  if (isRightOption) {
                    btnStyle = "border-neon bg-neon-soft text-neon font-bold shadow-neon";
                  } else if (isSelected && !isRightOption) {
                    btnStyle = "border-danger bg-danger/15 text-danger";
                  } else {
                    btnStyle = "border-border bg-surface/50 text-fg-muted opacity-65";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={feedbackState !== "idle"}
                    onClick={() => handleCheckAnswer(opt.id)}
                    data-option-id={opt.id}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm transition-all ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current font-mono text-xs font-bold">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    {feedbackState !== "idle" && isRightOption && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-neon" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Socratic Tushuntirish va Keyingi savol tugmasi */}
            {feedbackState !== "idle" && (
              <div className="mt-6 rounded-xl border border-border bg-elevated/80 p-4">
                <div className="flex items-start gap-3">
                  <Brain
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      feedbackState === "correct" ? "text-neon" : "text-gold"
                    }`}
                  />
                  <div className="flex-1 text-xs leading-relaxed sm:text-sm">
                    <p
                      className={`font-bold ${
                        feedbackState === "correct" ? "text-neon" : "text-gold"
                      }`}
                    >
                      {feedbackState === "correct"
                        ? `Barakalla, ${honorific}! To'g'ri javob — keyingi savol darajasi biroz ko'tariladi.`
                        : `Xavotir olmang, ${honorific}! Har bir xato — yangi bilim demakdir:`}
                    </p>
                    <p className="mt-1 text-fg">{currentQuestion.explanationUz}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    id="placement-next-btn"
                    onClick={handleNextQuestion}
                    className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold sm:text-sm"
                  >
                    <span>
                      {questionIndex + 1 >= TOTAL_ADAPTIVE_QUESTIONS
                        ? "Yakuniy qadamga o'tish"
                        : "Keyingi savol"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            ref={questionCardRef}
            className="mt-6 space-y-6 rounded-2xl border border-border bg-canvas/80 p-6"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-extrabold text-fg">
                IELTS Writing va Speaking bo&apos;yicha qisqa diagnostika
              </h2>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon">
                <Mic className="h-4 w-4" />
                <span>Ingliz tilida gapirishda (Speaking) o&apos;zingizni qanday his qilasiz?</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "SHY" as const, title: "Tortinaman / So'z topishga qiynalaman" },
                  { id: "MODERATE" as const, title: "Kundalik mavzularda bemalol gapiraman" },
                  { id: "CONFIDENT" as const, title: "Akademik mavzularda ravon fikr bildiraman" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSpeakingComfort(item.id)}
                    className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition-all ${
                      speakingComfort === item.id
                        ? "border-neon bg-neon-soft text-neon shadow-neon"
                        : "border-border bg-surface text-fg-muted"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
                <PenTool className="h-4 w-4" />
                <span>Ingliz tilida insho (Writing Essay) yozish tajribangiz qanday?</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "NONE" as const, title: "Hali insho yozib ko'rmaganman (Noldan)" },
                  { id: "PARAGRAPHS" as const, title: "Kichik paragraf va xatlar yozganman" },
                  { id: "FULL_ESSAYS" as const, title: "IELTS Task 1/2 insholarini yozib yuraman" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWritingExperience(item.id)}
                    className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition-all ${
                      writingExperience === item.id
                        ? "border-gold bg-gold-soft text-gold shadow-gold"
                        : "border-border bg-surface text-fg-muted"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <button
                type="button"
                id="placement-submit-final-btn"
                disabled={submitting}
                onClick={() => submitPlacement()}
                className="btn-neon inline-flex items-center gap-2 px-7 py-3 text-sm font-bold"
              >
                <span>
                  {submitting
                    ? "Natijalar tahlil qilinmoqda..."
                    : "Diagnostika Natijasini Ko'rish (+100 XP)"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Pastki eslatma */}
        <div className="mt-5 flex items-center gap-2 text-xs text-fg-muted">
          <HelpCircle className="h-4 w-4 text-neon" />
          <span>
            Adaptiv tizim: to&apos;g&apos;ri javob bersangiz savollar murakkablashadi, qiynalsangiz
            tayanch savollarga tushadi.
          </span>
        </div>
      </div>
    </div>
  );
}
