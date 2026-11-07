"use client";

import React, { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate } from "animejs";
import {
  BookOpen,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Sparkles,
  HelpCircle,
  Brain,
  Award,
  CalendarCheck,
  Clock,
} from "lucide-react";
import { ConfettiBurst } from "@/components/anime/ConfettiBurst";
import { LessonCoachWidget } from "@/components/ai/LessonCoachWidget";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";
import {
  JarvisLiveTeacher,
  type LiveTeacherAction,
} from "@/components/voice/JarvisLiveTeacher";
import { TheoryMethodCards } from "@/components/curriculum/TheoryMethodCards";
import { useUIPreferences } from "@/components/providers/AppProviders";

interface LessonExample {
  title: string;
  problem: string;
  stepByStepSolution: string[];
  takeaway: string;
}

interface LessonQuestion {
  id: string;
  difficulty: number;
  promptUz: string;
  passageUz?: string | null;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanationUz: string;
  hints: string[];
}

interface LessonDetailPayload {
  honorific: string;
  lesson: {
    id: string;
    slug: string;
    titleUz: string;
    summaryUz: string;
    theoryMarkdown: string;
    examples: LessonExample[];
    estMinutes: number;
    xpReward: number;
    topic: { titleUz: string };
    subject: { slug: string; nameUz: string };
    questions: LessonQuestion[];
  };
  tomorrowLesson: {
    slug: string;
    titleUz: string;
    subjectNameUz: string;
    estMinutes: number;
    xpReward: number;
  } | null;
}

interface CompletionResultPayload {
  correctCount: number;
  totalQuestions: number;
  accuracyPct: number;
  xpEarned: number;
  newXpTotal: number;
  newLevel: number;
  unlockedBadges: Array<{
    slug: string;
    titleUz: string;
    descriptionUz: string;
    xpBonus: number;
  }>;
  detailedResults: Array<{
    questionId: string;
    promptUz: string;
    givenAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanationUz: string;
  }>;
}

type LessonPhase = "THEORY" | "EXAMPLES" | "EXERCISES" | "ANALYSIS";

export default function LessonRunnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { reduceMotion } = useUIPreferences();

  const [data, setData] = useState<LessonDetailPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [phase, setPhase] = useState<LessonPhase>("THEORY");

  // Mashqlar holati
  const [qIdx, setQIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});

  // Yakuniy tahlil va XP/Nishon holati
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [completionResult, setCompletionResult] =
    useState<CompletionResultPayload | null>(null);
  const [stepByStepExamples, setStepByStepExamples] = useState<boolean>(true);
  const [visibleExampleSteps, setVisibleExampleSteps] = useState<Record<number, number>>({});

  const stageCardRef = useRef<HTMLDivElement | null>(null);
  const xpEarnedSpanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lessons/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: LessonDetailPayload | null) => {
        setData(payload);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (reduceMotion || !stageCardRef.current) return;
    animate(stageCardRef.current, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 420,
      ease: "outExpo",
    });
  }, [phase, qIdx, reduceMotion]);

  // Yakuniy XP hisoblagich animatsiyasi
  useEffect(() => {
    if (!completionResult || !xpEarnedSpanRef.current) return;
    if (reduceMotion) {
      xpEarnedSpanRef.current.textContent = String(completionResult.xpEarned);
      return;
    }
    const obj = { val: 0 };
    animate(obj, {
      val: completionResult.xpEarned,
      duration: 950,
      ease: "outQuart",
      onUpdate: () => {
        if (xpEarnedSpanRef.current) {
          xpEarnedSpanRef.current.textContent = String(Math.round(obj.val));
        }
      },
    });
  }, [completionResult, reduceMotion]);

  if (loading || !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">Dars materiallari yuklanmoqda...</p>
      </div>
    );
  }

  const { lesson, honorific, tomorrowLesson } = data;
  const currentQuestion = lesson.questions[qIdx] ?? lesson.questions[0];

  const handleSelectAnswer = (optId: "A" | "B" | "C" | "D") => {    if (feedback !== "idle" || !currentQuestion) return;
    setSelectedOpt(optId);

    const isRight = optId === currentQuestion.correctAnswer;
    setFeedback(isRight ? "correct" : "wrong");
    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: optId }));

    if (!reduceMotion && stageCardRef.current) {
      if (isRight) {
        animate(stageCardRef.current, {
          scale: [0.99, 1.01, 1],
          duration: 360,
          ease: "outQuad",
        });
      } else {
        animate(stageCardRef.current, {
          translateX: [-7, 7, -5, 5, -2, 2, 0],
          duration: 400,
          ease: "outSine",
        });
      }
    }
  };

  const handleNextOrFinishExercises = async () => {
    setSelectedOpt(null);
    setFeedback("idle");
    setShowHint(false);

    if (qIdx + 1 < lesson.questions.length) {
      setQIdx((prev) => prev + 1);
      return;
    }

    // Dars mashqlarini yakunlash va tahlilni olish
    setSubmitting(true);
    try {
      const formattedAnswers = lesson.questions.map((q) => ({
        questionId: q.id,
        givenAnswer: answersMap[q.id] ?? q.correctAnswer,
        timeSpentSec: 20,
      }));

      const res = await fetch(`/api/lessons/${lesson.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (res.ok) {
        const resultData = (await res.json()) as CompletionResultPayload;
        setCompletionResult(resultData);
        setPhase("ANALYSIS");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const phasesList: Array<{ id: LessonPhase; label: string; stepNum: string }> = [
    { id: "THEORY", label: "1. AI Murabbiy & Metodlar", stepNum: "01" },
    { id: "EXAMPLES", label: "2. Hayotiy Misollar", stepNum: "02" },
    { id: "EXERCISES", label: `3. Mashqlar (${lesson.questions.length})`, stepNum: "03" },
    { id: "ANALYSIS", label: "4. Tahlil & Ertangi Vazifa", stepNum: "04" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      {/* Kengaytirilgan sinfxona sarlavhasi va asosiy dars maydoni */}
      <div className="glass-card p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-neon">
              <Link href="/learn" className="hover:underline">
                ← Darslar katalogi
              </Link>
              <span>•</span>
              <span>{lesson.subject.nameUz}</span>
              <span>•</span>
              <span className="text-fg-muted">{lesson.topic.titleUz}</span>
            </div>
            <h1 className="mt-2 text-xl font-extrabold text-fg sm:text-3xl">
              {lesson.titleUz}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <JarvisLiveTeacher
              lessonSlug={lesson.slug}
              stage={phase}
              questionIndex={phase === "EXERCISES" ? qIdx : undefined}
              onAction={(action: LiveTeacherAction) => {
                if (action === "theory") setPhase("THEORY");
                else if (action === "examples") setPhase("EXAMPLES");
                else if (action === "exercises") setPhase("EXERCISES");
                else if (action === "hint") {
                  setShowHint(true);
                  setPhase("EXERCISES");
                }
              }}
            />
            <span className="flex items-center gap-1 rounded-xl border border-border bg-elevated px-3.5 py-2 font-mono text-xs text-fg-muted">
              <Clock className="h-3.5 w-3.5 text-neon" />
              {lesson.estMinutes} daq
            </span>
            <span className="rounded-xl border border-gold/40 bg-gold-soft px-3.5 py-2 font-mono text-xs font-bold text-gold">
              +{lesson.xpReward} XP
            </span>
          </div>
        </div>

        {/* 4 bosqichli dars navigatsiyasi: Nazariya -> Misollar -> Mashqlar -> Tahlil */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {phasesList.map((item) => {
            const active = phase === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-phase-tab={item.id}
                onClick={() => setPhase(item.id)}
                className={`rounded-xl border px-4 py-3 text-left text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? "border-neon bg-neon-soft text-neon shadow-neon"
                    : "border-border bg-surface text-fg-muted hover:text-fg"
                }`}
              >
                <span className="block font-mono text-[10px] opacity-75">
                  BOSQICH {item.stepNum}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Joriy bosqich uchun aniq yo'l-yo'riq ko'rsatkichi */}
        <div className="mt-4 rounded-xl border border-[#c6f432]/35 bg-[#0b0b0c] px-4 py-3 text-xs sm:text-sm text-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong className="text-[#c6f432] mr-1.5">
              {phase === "THEORY" && "📍 1-Bosqich Yo'l-Yo'rig'i:"}
              {phase === "EXAMPLES" && "📍 2-Bosqich Yo'l-Yo'rig'i:"}
              {phase === "EXERCISES" && "📍 3-Bosqich Yo'l-Yo'rig'i:"}
              {phase === "ANALYSIS" && "📍 4-Bosqich Yo'l-Yo'rig'i:"}
            </strong>
            {phase === "THEORY" &&
              "Qoidalarni shoshilmay o'qing yoki «Tinglash» tugmasini bosing. Tushunmagan joyingizda «💡 Sodda tushuntir» ni bosing."}
            {phase === "EXAMPLES" &&
              "Har bir namunaviy masalada yechim qanday qurilganini qadam-baqadam ochib ko'ring va yakuniy xulosani eslab qoling."}
            {phase === "EXERCISES" &&
              "Qiynalsangiz darhol tasodifiy belgilamang — «Socratic maslahat olish» tugmasini bosib, o'zingiz topishga harakat qiling."}
            {phase === "ANALYSIS" &&
              "Xato bo'lgan savollar izohini ko'rib chiqing va ertangi tavsiya etilgan darsga o'ting."}
          </div>
        </div>

        {/* ====================================================================
            1-BOSQICH: INTERAKTIV TALABA AI VA METOD KARTALARI
            ==================================================================== */}
        {phase === "THEORY" && (
          <div ref={stageCardRef} className="mt-6">
            <TheoryMethodCards
              theoryMarkdown={lesson.theoryMarkdown}
              lessonTitle={lesson.titleUz}
              honorific={honorific}
              lessonSlug={lesson.slug}
              onProceedToExamples={() => setPhase("EXAMPLES")}
            />
          </div>
        )}

        {/* ====================================================================
            2-BOSQICH: HAYOTIY MISOLLAR
            ==================================================================== */}
        {phase === "EXAMPLES" && (
          <div
            ref={stageCardRef}
            className="mt-6 space-y-6 rounded-2xl border border-border bg-canvas/90 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-gold">
                <Lightbulb className="h-4 w-4 text-[#c6f432]" />
                <span>Bosqichma-Bosqich Yechilgan Namunaviy Misollar</span>
              </div>

              <button
                type="button"
                onClick={() => setStepByStepExamples((prev) => !prev)}
                className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                  stepByStepExamples
                    ? "border-[#c6f432] bg-[#c6f432]/15 text-[#c6f432]"
                    : "border-white/15 bg-white/5 text-slate-300 hover:text-white"
                }`}
              >
                {stepByStepExamples
                  ? "✓ Qadamma-qadam ochish rejimi (Oson)"
                  : "Barcha qadamlarni birvarakay ko'rsatish"}
              </button>
            </div>

            <div className={`grid gap-5 ${lesson.examples.length >= 2 ? "lg:grid-cols-2" : "grid-cols-1"}`}>
              {lesson.examples.map((ex, idx) => {
                const totalSteps = ex.stepByStepSolution.length;
                const shownCount = stepByStepExamples
                  ? Math.min(totalSteps, visibleExampleSteps[idx] ?? 1)
                  : totalSteps;
                const allRevealed = shownCount >= totalSteps;

                return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-emerald-400">{ex.title}</h3>
                      <JarvisVoiceButton text={ex.problem + ". " + ex.stepByStepSolution.join(". ") + ". Xulosa: " + ex.takeaway} label="Misolni tinglash" />
                    </div>
                    <p className="rounded-xl border border-border bg-canvas p-4 text-sm font-semibold text-fg">
                      📌 Masala: {ex.problem}
                    </p>
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-fg-muted">
                        Qadamma-qadam yechim ({shownCount} / {totalSteps}):
                      </span>
                      {ex.stepByStepSolution.slice(0, shownCount).map((stepText, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2.5 text-xs leading-relaxed text-fg sm:text-sm"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neon-soft font-mono text-[11px] font-bold text-neon">
                            {sIdx + 1}
                          </span>
                          <span>{stepText}</span>
                        </div>
                      ))}

                      {!allRevealed && (
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleExampleSteps((prev) => ({
                              ...prev,
                              [idx]: shownCount + 1,
                            }))
                          }
                          className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-[#c6f432]/50 bg-[#c6f432]/15 px-3.5 py-2 text-xs font-extrabold text-[#c6f432] hover:bg-[#c6f432] hover:text-[#0b0b0c] transition-all"
                        >
                          <span>Keyingi ({shownCount + 1}-) qadamni ochish</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {allRevealed && (
                    <div className="rounded-xl border border-[#c6f432]/40 bg-[#c6f432]/10 px-4 py-3 text-xs sm:text-sm font-semibold text-white">
                      🔑 <strong className="text-[#c6f432]">Eslab qolish siri:</strong> {ex.takeaway}
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setPhase("THEORY")}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-fg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Nazariyaga qaytish</span>
              </button>

              <button
                type="button"
                id="to-exercises-btn"
                onClick={() => setPhase("EXERCISES")}
                className="btn-neon inline-flex items-center gap-2 px-6 py-3 text-xs font-bold sm:text-sm"
              >
                <span>3-qadam: Mustaqil Mashqlarni Boshlash</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            3-BOSQICH: INTERAKTIV MASHQLAR
            ==================================================================== */}
        {phase === "EXERCISES" && currentQuestion && (
          <div
            ref={stageCardRef}
            className={`mt-6 rounded-2xl border p-6 transition-all sm:p-8 ${
              feedback === "correct"
                ? "border-neon bg-neon-soft/20 shadow-neon"
                : feedback === "wrong"
                  ? "border-danger/60 bg-danger/5"
                  : "border-border bg-canvas/90"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-neon">
                MASHQ {qIdx + 1} / {lesson.questions.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-bold text-gold"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>{showHint ? "Maslahatni yopish" : "Socratic maslahat olish"}</span>
                </button>
              </div>
            </div>

            {showHint && currentQuestion.hints.length > 0 && (
              <div className="mt-4 rounded-xl border border-gold/40 bg-gold-soft/20 p-3.5 text-xs text-gold sm:text-sm">
                💡 <strong>AI Ustoz ishorasi ({honorific}):</strong>{" "}
                {currentQuestion.hints[0]}
              </div>
            )}

            {currentQuestion.passageUz && (
              <div className="mt-4 rounded-xl border border-border bg-surface p-4 font-serif text-sm italic leading-relaxed text-fg">
                &ldquo;{currentQuestion.passageUz}&rdquo;
              </div>
            )}

            <h2 className="mt-5 text-base font-bold leading-relaxed text-fg sm:text-lg">
              {currentQuestion.promptUz}
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOpt === opt.id;
                const isRight = opt.id === currentQuestion.correctAnswer;

                let style = "border-border bg-surface text-fg hover:border-neon/50";
                if (feedback !== "idle") {
                  if (isRight) {
                    style = "border-neon bg-neon-soft text-neon font-bold shadow-neon";
                  } else if (isSelected && !isRight) {
                    style = "border-danger bg-danger/15 text-danger";
                  } else {
                    style = "border-border bg-surface/50 text-fg-muted opacity-65";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={feedback !== "idle"}
                    data-exercise-option={opt.id}
                    onClick={() => handleSelectAnswer(opt.id)}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm transition-all ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current font-mono text-xs font-bold">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    {feedback !== "idle" && isRight && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-neon" />
                    )}
                  </button>
                );
              })}
            </div>

            {feedback !== "idle" && (
              <div className="mt-6 rounded-xl border border-border bg-elevated/80 p-4">
                <div className="flex items-start gap-3">
                  <Brain
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      feedback === "correct" ? "text-neon" : "text-gold"
                    }`}
                  />
                  <div className="text-xs leading-relaxed sm:text-sm">
                    <p
                      className={`font-bold ${
                        feedback === "correct" ? "text-neon" : "text-gold"
                      }`}
                    >
                      {feedback === "correct"
                        ? `Ofarin, ${honorific}! To'ppa-to'g'ri yechim (+15 XP).`
                        : `Yaxshi urinish, ${honorific}! Keling, yechim mantiqini ko'rib chiqamiz:`}
                    </p>
                    <p className="mt-1 text-fg">{currentQuestion.explanationUz}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    id="exercise-next-btn"
                    disabled={submitting}
                    onClick={handleNextOrFinishExercises}
                    className="btn-neon inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold sm:text-sm"
                  >
                    <span>
                      {submitting
                        ? "Natija saqlanmoqda..."
                        : qIdx + 1 < lesson.questions.length
                          ? "Keyingi mashq"
                          : "Darsni Yakunlash va XP Olish"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            4-BOSQICH: NATIJA TAHLILI + XP/NISHON KONFETI + ERTANGI VAZIFA
            ==================================================================== */}
        {phase === "ANALYSIS" && (
          <div
            ref={stageCardRef}
            className="relative mt-6 overflow-hidden rounded-2xl border border-neon/50 bg-canvas/90 p-6 sm:p-8"
          >
            <ConfettiBurst trigger={Boolean(completionResult)} />

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>DARS MUVAFFAQIYATLI YAKUNLANDI!</span>
                </span>
                <h2 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
                  Barakalla, <span className="text-gold">{honorific}</span>!
                </h2>
                <p className="mt-1 text-xs text-fg-muted sm:text-sm">
                  Bugungi mavzu va mashqlar to&apos;liq o&apos;zlashtirildi.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-gold bg-gold-soft px-5 py-3 text-center shadow-gold">
                  <div className="flex items-center justify-center gap-1.5 font-mono text-2xl font-extrabold text-gold">
                    <Trophy className="h-5 w-5" />
                    <span>+</span>
                    <span ref={xpEarnedSpanRef}>
                      {completionResult?.xpEarned ?? lesson.xpReward}
                    </span>
                    <span>XP</span>
                  </div>
                  <span className="text-[11px] font-semibold text-fg">
                    Jami: {completionResult?.newXpTotal ?? 250} XP
                  </span>
                </div>

                <div className="rounded-xl border border-neon bg-neon-soft px-5 py-3 text-center">
                  <span className="block font-mono text-2xl font-extrabold text-neon">
                    {completionResult?.accuracyPct ?? 100}%
                  </span>
                  <span className="text-[11px] font-semibold text-fg">
                    Aniqlik ({completionResult?.correctCount ?? lesson.questions.length}/
                    {completionResult?.totalQuestions ?? lesson.questions.length})
                  </span>
                </div>
              </div>
            </div>

            {/* Yangi ochilgan Nishonlar (Badges) */}
            {completionResult?.unlockedBadges &&
              completionResult.unlockedBadges.length > 0 && (
                <div className="mt-6 rounded-2xl border border-gold bg-gold-soft/20 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-gold">
                    <Award className="h-5 w-5" />
                    <span>Yangi Nishon Qo&apos;lga Kiritildi!</span>
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {completionResult.unlockedBadges.map((b) => (
                      <div
                        key={b.slug}
                        className="rounded-xl border border-gold/40 bg-canvas/80 p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-fg">🏅 {b.titleUz}</span>
                          <span className="font-mono text-xs font-extrabold text-gold">
                            +{b.xpBonus} XP Bonus
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-fg-muted">{b.descriptionUz}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Savollar tahlili */}
            {completionResult?.detailedResults && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-fg">
                  Mashqlar Tahlili:
                </h3>
                {completionResult.detailedResults.map((item, idx) => (
                  <div
                    key={item.questionId}
                    className="rounded-xl border border-border bg-surface p-4 text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-fg">
                        {idx + 1}-savol: {item.promptUz}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          item.isCorrect ? "text-neon" : "text-gold"
                        }`}
                      >
                        {item.isCorrect
                          ? `✓ To'g'ri (${item.givenAnswer})`
                          : `Sizning javob: ${item.givenAnswer} → To'g'ri: ${item.correctAnswer}`}
                      </span>
                    </div>
                    <p className="mt-1.5 text-fg-muted">{item.explanationUz}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ERTANGI VAZIFA KARTASI */}
            {tomorrowLesson && (
              <div
                id="tomorrow-task-card"
                className="mt-7 rounded-2xl border border-neon/40 bg-elevated/80 p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neon">
                      <CalendarCheck className="h-4 w-4" />
                      <span>ERTANGI VAZIFA (KEYINGI QADAM)</span>
                    </span>
                    <h3 className="mt-1 text-lg font-extrabold text-fg">
                      {tomorrowLesson.subjectNameUz}: {tomorrowLesson.titleUz}
                    </h3>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      Davomiyligi: {tomorrowLesson.estMinutes} daqiqa • Mukofot: +
                      {tomorrowLesson.xpReward} XP
                    </p>
                  </div>

                  <Link
                    href={`/learn/${tomorrowLesson.slug}`}
                    className="btn-neon inline-flex shrink-0 items-center gap-2 px-5 py-3 text-xs font-bold sm:text-sm"
                  >
                    <span>Keyingi darsga o&apos;tish</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dars paytida savolga javob beruvchi va xatoni tushuntiruvchi kontekstual AI Murabbiy */}
        <LessonCoachWidget
          lessonSlug={lesson.slug}
          lessonTitle={lesson.titleUz}
          honorific={honorific}
          currentPromptUz={currentQuestion?.promptUz}
        />
      </div>
    </div>
  );
}
