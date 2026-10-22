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
import { VoiceTutor } from "@/components/voice/VoiceTutor";
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

  const handleSelectAnswer = (optId: "A" | "B" | "C" | "D") => {
    if (feedback !== "idle" || !currentQuestion) return;
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
    { id: "THEORY", label: "1. Qisqa Nazariya", stepNum: "01" },
    { id: "EXAMPLES", label: "2. Hayotiy Misollar", stepNum: "02" },
    { id: "EXERCISES", label: `3. Mashqlar (${lesson.questions.length})`, stepNum: "03" },
    { id: "ANALYSIS", label: "4. Tahlil & Ertangi Vazifa", stepNum: "04" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Tinch sinfxona sarlavhasi (Matrix oqimisiz, diqqatni jamlovchi muhit) */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-neon">
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

          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 rounded-xl border border-border bg-elevated px-3 py-1.5 font-mono text-xs text-fg-muted">
              <Clock className="h-3.5 w-3.5 text-neon" />
              {lesson.estMinutes} daq
            </span>
            <span className="rounded-xl border border-gold/40 bg-gold-soft px-3 py-1.5 font-mono text-xs font-bold text-gold">
              +{lesson.xpReward} XP
            </span>
          </div>
        </div>

        <div className="mt-5"><VoiceTutor lessonTitle={lesson.titleUz} summaryUz={lesson.summaryUz} theoryText={lesson.theoryMarkdown.slice(0, 500)} honorific={honorific} lessonSlug={lesson.slug} /></div>

        {/* 4 bosqichli dars navigatsiyasi: Nazariya -> Misollar -> Mashqlar -> Tahlil */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {phasesList.map((item) => {
            const active = phase === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-phase-tab={item.id}
                onClick={() => setPhase(item.id)}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-all ${
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

        {/* ====================================================================
            1-BOSQICH: QISQA NAZARIYA
            ==================================================================== */}
        {phase === "THEORY" && (
          <div
            ref={stageCardRef}
            className="mt-6 rounded-2xl border border-border bg-canvas/90 p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon">
              <BookOpen className="h-4 w-4" />
              <span>Qisqa va Aniq Nazariya • Tinch O&apos;qish Rejimi</span>
            </div>

            <p className="mt-2 rounded-xl border border-border bg-elevated/60 p-3.5 text-xs text-fg-muted sm:text-sm">
              💡 <strong>{honorific}</strong>, ushbu qoidalarni shoshilmasdan o&apos;qib chiqing.
              Har bir formula keyingi qadamdagi hayotiy misollarda qo&apos;llaniladi.
            </p>

            <div className="mt-6 space-y-4 whitespace-pre-line text-sm leading-relaxed text-fg sm:text-base">
              {lesson.theoryMarkdown}
            </div>

            <div className="mt-8 flex justify-end border-t border-border pt-5">
              <button
                type="button"
                id="to-examples-btn"
                onClick={() => setPhase("EXAMPLES")}
                className="btn-neon inline-flex items-center gap-2 px-6 py-3 text-xs font-bold sm:text-sm"
              >
                <span>2-qadam: Hayotiy Misollarni Ko&apos;rish</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            2-BOSQICH: HAYOTIY MISOLLAR
            ==================================================================== */}
        {phase === "EXAMPLES" && (
          <div
            ref={stageCardRef}
            className="mt-6 space-y-5 rounded-2xl border border-border bg-canvas/90 p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
              <Lightbulb className="h-4 w-4" />
              <span>Bosqichma-Bosqich Yechilgan Namunaviy Misollar</span>
            </div>

            {lesson.examples.map((ex, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-surface p-5 space-y-3"
              >
                <h3 className="text-base font-extrabold text-neon">{ex.title}</h3>
                <p className="rounded-xl border border-border bg-canvas p-3.5 text-sm font-semibold text-fg">
                  📌 Masala: {ex.problem}
                </p>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-fg-muted">
                    Qadamma-qadam yechim:
                  </span>
                  {ex.stepByStepSolution.map((stepText, sIdx) => (
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
                </div>
                <div className="rounded-xl border border-gold/40 bg-gold-soft/20 px-3.5 py-2.5 text-xs font-semibold text-gold">
                  🔑 Xulosa: {ex.takeaway}
                </div>
              </div>
            ))}

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

            <div className="mt-5 grid gap-3">
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
