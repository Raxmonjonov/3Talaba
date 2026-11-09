"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Columns,
  Edit3,
  Eye,
  FileText,
  Sparkles,
  Target,
  Wand2,
  X,
} from "lucide-react";
import {
  ErrorCategory,
  EssayEvaluation,
  evaluateEssayDeterministically,
  InlineCorrectionItem,
} from "@/lib/examiner/essay-evaluator";

const DEFAULT_TASK_2_PROMPT =
  "Some people believe that university education should focus exclusively on preparing students for practical career paths, while others think higher education should serve a broader intellectual purpose. Discuss both views and give your own opinion.";

const INITIAL_CANDIDATE_ESSAY = `It is often argued that university education should focus exclusively on preparing students for practical career paths, while others believe that higher education serves a broader intellectual purpose. In my opinion, while employability is a vital outcome, universities must balance vocational training with critical thinking and theoretical inquiry.

On the one hand, many students attend university to improve their job prospects. Because the modern labor market is very competitive, graduates need good skills in technology, engineering, and finance. If universities only teach abstract philosophy, students might struggle to find a good job after graduation and pay back their tuition fees.

On the other hand, universities are not just factories for workers. A society needs people who can think critically, solve complex global problems, and question ethical norms. Furthermore, many jobs of the future do not exist yet, so adaptable analytical skills are more valuable than narrow technical training that quickly becomes obsolete.

In conclusion, higher education should integrate practical career skills with broad intellectual development so that graduates become both capable professionals and thoughtful citizens.`;

interface PopoverPosition {
  top: number;
  left: number;
}

const CATEGORY_STYLES: Record<
  ErrorCategory,
  {
    highlightClass: string;
    badgeClass: string;
    dotClass: string;
    label: string;
    labelUz: string;
  }
> = {
  GRAMMAR: {
    highlightClass:
      "bg-rose-500/20 text-rose-200 border-b-2 border-rose-500 hover:bg-rose-500/30",
    badgeClass: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
    dotClass: "bg-rose-500",
    label: "Grammar (Red)",
    labelUz: "Grammatika (Qizil)",
  },
  LEXICAL: {
    highlightClass:
      "bg-amber-500/20 text-amber-200 border-b-2 border-amber-500 hover:bg-amber-500/30",
    badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    dotClass: "bg-amber-500",
    label: "Lexical (Amber)",
    labelUz: "Lug'at boyligi (Sariq)",
  },
  COHESION: {
    highlightClass:
      "bg-purple-500/25 text-purple-200 border-b-2 border-purple-500 hover:bg-purple-500/35",
    badgeClass: "bg-purple-500/20 text-purple-300 border border-purple-500/40",
    dotClass: "bg-purple-500",
    label: "Cohesion (Purple)",
    labelUz: "Matn izchilligi (Binafsha)",
  },
};

function CircularBandGauge({
  score,
  size = 112,
  strokeWidth = 9,
  label,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.max(0, Math.min(100, (score / 9.0) * 100));
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  const strokeColor =
    score >= 8.0
      ? "#10b981" // emerald-500
      : score >= 7.0
      ? "#6366f1" // indigo-500
      : score >= 6.0
      ? "#f59e0b" // amber-500
      : "#f43f5e"; // rose-500

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(148, 163, 184, 0.16)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-black text-white">
          {score.toFixed(1)}
        </span>
        {label && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export function WritingExaminerDashboard() {
  const [promptText, setPromptText] = useState<string>(DEFAULT_TASK_2_PROMPT);
  const [essayText, setEssayText] = useState<string>(INITIAL_CANDIDATE_ESSAY);
  const [isEditingEssay, setIsEditingEssay] = useState<boolean>(false);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [evaluation, setEvaluation] = useState<EssayEvaluation>(() =>
    evaluateEssayDeterministically(
      INITIAL_CANDIDATE_ESSAY,
      DEFAULT_TASK_2_PROMPT,
      "WRITING_TASK_2"
    )
  );

  const [categoryFilter, setCategoryFilter] = useState<"ALL" | ErrorCategory>(
    "ALL"
  );
  const [activeCorrectionIndex, setActiveCorrectionIndex] = useState<
    number | null
  >(0);
  const [popoverPos, setPopoverPos] = useState<PopoverPosition | null>(null);

  const [compareTab, setCompareTab] = useState<
    "my_essay" | "band_8_5_rewrite" | "side_by_side"
  >("side_by_side");
  const [activeCriterionTab, setActiveCriterionTab] = useState<
    "TR" | "CC" | "LR" | "GRA"
  >("LR");
  const [completedDrills, setCompletedDrills] = useState<Record<number, boolean>>(
    {}
  );
  const [creditsMeta, setCreditsMeta] = useState<{
    used: number;
    limit: number;
    processingMs: number;
  }>({ used: 1, limit: 5, processingMs: 42 });

  const viewerContainerRef = useRef<HTMLDivElement | null>(null);

  const wordCount = useMemo(() => {
    const words = essayText.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [essayText]);

  const handleGradeEssay = async () => {
    setIsGrading(true);
    setErrorBanner(null);
    try {
      const response = await fetch("/api/v1/examiner/grade-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "WRITING_TASK_2",
          prompt_text: promptText,
          essay_text: essayText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorBanner(
          data.detail || "Failed to evaluate essay. Please check your input."
        );
        return;
      }

      setEvaluation({
        overall_band: data.overall_band,
        criteria: data.criteria,
        inline_corrections: data.inline_corrections,
        band_8_5_full_rewrite: data.band_8_5_full_rewrite,
        actionable_drills_uz: data.actionable_drills_uz,
      });

      if (data.meta) {
        setCreditsMeta({
          used: data.meta.credits_used_today ?? 1,
          limit: data.meta.daily_credit_limit ?? 5,
          processingMs: data.meta.processing_time_ms ?? 50,
        });
      }

      setIsEditingEssay(false);
      setActiveCorrectionIndex(
        data.inline_corrections && data.inline_corrections.length > 0 ? 0 : null
      );
      setPopoverPos(null);
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : "Network error during grading."
      );
    } finally {
      setIsGrading(false);
    }
  };

  const handleHighlightClick = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setActiveCorrectionIndex(index);
    const containerRect = viewerContainerRef.current?.getBoundingClientRect();
    const targetRect = event.currentTarget.getBoundingClientRect();

    if (containerRect) {
      const top = Math.max(
        16,
        targetRect.bottom - containerRect.top + 10
      );
      const left = Math.max(
        16,
        Math.min(
          targetRect.left - containerRect.left,
          containerRect.width - 360
        )
      );
      setPopoverPos({ top, left });
    }
  };

  const applyReplacementInEssay = (
    correction: InlineCorrectionItem,
    useBand9Upgrade: boolean
  ) => {
    const replacementText = useBand9Upgrade
      ? correction.band_9_academic_upgrade
      : correction.corrected_version;

    if (!essayText.includes(correction.exact_original_quote)) return;
    const updatedEssay = essayText.replace(
      correction.exact_original_quote,
      replacementText
    );
    setEssayText(updatedEssay);

    // Re-evaluate immediately so inline highlights stay synchronized
    const refreshed = evaluateEssayDeterministically(
      updatedEssay,
      promptText,
      "WRITING_TASK_2"
    );
    setEvaluation(refreshed);
    setPopoverPos(null);
    setActiveCorrectionIndex(
      refreshed.inline_corrections.length > 0 ? 0 : null
    );
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPopoverPos(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /**
   * Splits `essayText` and wraps every `exact_original_quote` from `inline_corrections`
   * in a color-coded interactive highlight button (Red = GRAMMAR, Amber = LEXICAL, Purple = COHESION).
   */
  const renderAnnotatedEssay = () => {
    const filteredCorrections = evaluation.inline_corrections
      .map((item, originalIdx) => ({ item, originalIdx }))
      .filter(
        ({ item }) =>
          categoryFilter === "ALL" || item.error_category === categoryFilter
      );

    if (filteredCorrections.length === 0) {
      return (
        <p className="whitespace-pre-wrap text-sm leading-8 text-slate-200">
          {essayText}
        </p>
      );
    }

    type TextSegment = {
      text: string;
      correction?: InlineCorrectionItem;
      correctionIndex?: number;
    };

    let segments: TextSegment[] = [{ text: essayText }];

    for (const { item, originalIdx } of filteredCorrections) {
      const quote = item.exact_original_quote;
      if (!quote) continue;

      const nextSegments: TextSegment[] = [];
      for (const seg of segments) {
        if (seg.correction) {
          nextSegments.push(seg);
          continue;
        }
        const matchIndex = seg.text.indexOf(quote);
        if (matchIndex === -1) {
          nextSegments.push(seg);
        } else {
          const before = seg.text.slice(0, matchIndex);
          const matched = seg.text.slice(matchIndex, matchIndex + quote.length);
          const after = seg.text.slice(matchIndex + quote.length);
          if (before) nextSegments.push({ text: before });
          nextSegments.push({
            text: matched,
            correction: item,
            correctionIndex: originalIdx,
          });
          if (after) nextSegments.push({ text: after });
        }
      }
      segments = nextSegments;
    }

    return (
      <div className="whitespace-pre-wrap text-[15px] leading-8 text-slate-200">
        {segments.map((seg, idx) => {
          if (!seg.correction || seg.correctionIndex === undefined) {
            return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
          }

          const style = CATEGORY_STYLES[seg.correction.error_category];
          const isSelected = activeCorrectionIndex === seg.correctionIndex;

          return (
            <button
              key={`hl-${seg.correctionIndex}-${idx}`}
              type="button"
              onClick={(e) => handleHighlightClick(seg.correctionIndex!, e)}
              className={`mx-0.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-medium transition-all ${
                style.highlightClass
              } ${
                isSelected
                  ? "ring-2 ring-white/80 shadow-lg"
                  : "hover:scale-[1.01]"
              }`}
            >
              <span>{seg.text}</span>
              <span className="rounded bg-slate-950/90 px-1.5 py-0.2 text-[10px] font-extrabold uppercase tracking-wider">
                {seg.correction.error_category}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const activeCorrection =
    activeCorrectionIndex !== null
      ? evaluation.inline_corrections[activeCorrectionIndex] ?? null
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="3Talaba Campus Bosh sahifasiga qaytish"
            >
              ← Campus
            </Link>
            <Link
              href="/simulator"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-2.5 py-1.5 text-xs font-bold text-blue-300 transition hover:bg-blue-500/20"
              title="CD-IELTS Simulyatoriga o'tish"
            >
              Simulyator (Reading/Writing)
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  AI IELTS Writing & Speaking Examiner
                </h1>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  Anti-Inflation Rubric v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Strict British Council / IDP Rubric • Inline Phrase Diagnostics •
                Band 8.5+ Full Rewrite • O&apos;zbekcha Tahlil
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Daily Credits Indicator */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs">
              <span className="text-slate-400">Daily Credits: </span>
              <strong className="font-mono text-indigo-400">
                {creditsMeta.used}/{creditsMeta.limit}
              </strong>
              <span className="ml-2 text-slate-500">
                ({creditsMeta.processingMs}ms)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingEssay((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              {isEditingEssay ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-indigo-400" />
                  <span>View Annotated Highlights</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Edit / Paste New Essay</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGradeEssay}
              disabled={isGrading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isGrading
                  ? "Running Examiner Calibration..."
                  : "Grade Essay with AI Examiner"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {errorBanner && (
        <div className="mx-auto mt-4 max-w-[1600px] px-6">
          <div className="flex items-center justify-between rounded-xl border border-rose-500/50 bg-rose-950/40 px-4 py-3 text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-rose-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* ================================================================ */}
        {/* LEFT PANEL: ANNOTATED ESSAY VIEWER & FLOATING POPOVER/DRAWER      */}
        {/* ================================================================ */}
        <section className="flex flex-col gap-5 lg:col-span-7">
          {/* Prompt Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-indigo-400">
                IELTS Academic Writing Task 2 Prompt
              </span>
              <span
                className={`font-mono font-bold ${
                  wordCount >= 250 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {wordCount} words{" "}
                {wordCount < 250 && "(Under-length penalty < 250w)"}
              </span>
            </div>
            {isEditingEssay ? (
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              />
            ) : (
              <p className="text-xs leading-relaxed text-slate-300">
                {promptText}
              </p>
            )}
          </div>

          {/* Annotated Essay Viewer Card */}
          <div
            ref={viewerContainerRef}
            className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl"
          >
            {/* Legend & Filter Controls */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Annotated Candidate Essay Viewer
                </h2>
                <p className="text-xs text-slate-400">
                  Click any color-coded highlight in your essay to inspect the
                  Uzbek explanation & Band 9.0 upgrade.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("ALL")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    categoryFilter === "ALL"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  All ({evaluation.inline_corrections.length})
                </button>
                {(["GRAMMAR", "LEXICAL", "COHESION"] as const).map((cat) => {
                  const count = evaluation.inline_corrections.filter(
                    (c) => c.error_category === cat
                  ).length;
                  const meta = CATEGORY_STYLES[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        categoryFilter === cat
                          ? meta.badgeClass
                          : "bg-slate-800/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${meta.dotClass}`}
                      />
                      <span>
                        {cat} ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editor Mode vs Annotated Highlight Mode */}
            {isEditingEssay ? (
              <div className="space-y-3">
                <textarea
                  rows={14}
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-7 text-slate-100 focus:border-indigo-500 focus:outline-none"
                  placeholder="Paste or write your IELTS Task 2 essay here..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingEssay(false)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGradeEssay}
                    disabled={isGrading}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Run Full Examiner Evaluation</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-[320px] rounded-xl border border-slate-800/90 bg-slate-950/70 p-5">
                {renderAnnotatedEssay()}
              </div>
            )}

            {/* FLOATING INTERACTIVE POPOVER CARD WHEN A PHRASE IS CLICKED */}
            {popoverPos && activeCorrection && !isEditingEssay && (
              <div
                style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
                className="absolute z-40 w-[360px] max-w-[92vw] rounded-2xl border border-indigo-500/50 bg-slate-900 p-4 shadow-2xl ring-1 ring-black/50"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                      CATEGORY_STYLES[activeCorrection.error_category].badgeClass
                    }`}
                  >
                    {CATEGORY_STYLES[activeCorrection.error_category].labelUz}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPopoverPos(null)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 1. Original phrase (crossed out) -> Corrected phrase */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-rose-500/20 px-2 py-0.5 font-medium text-rose-300 line-through">
                      {activeCorrection.exact_original_quote}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300">
                      {activeCorrection.corrected_version}
                    </span>
                  </div>
                </div>

                {/* 2. "Band 9.0 Upgrade" Badge with Advanced Academic Alternative */}
                <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Band 9.0 Upgrade</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-white">
                    &ldquo;{activeCorrection.band_9_academic_upgrade}&rdquo;
                  </p>
                </div>

                {/* 3. Detailed Explanation in Uzbek */}
                <div className="mt-2.5 text-xs leading-relaxed text-slate-300">
                  <strong className="text-indigo-400">
                    Ekspert izohi (UZ):{" "}
                  </strong>
                  {activeCorrection.explanation_in_uzbek}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      applyReplacementInEssay(activeCorrection, false)
                    }
                    className="flex-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25"
                  >
                    Apply Corrected
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyReplacementInEssay(activeCorrection, true)
                    }
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-500"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span>Apply Band 9.0</span>
                  </button>
                </div>
              </div>
            )}

            {/* DOCKED INLINE CORRECTION DRAWER (Always visible below the essay for effortless navigation) */}
            {activeCorrection && (
              <div className="mt-5 rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-extrabold uppercase ${
                        CATEGORY_STYLES[activeCorrection.error_category]
                          .badgeClass
                      }`}
                    >
                      {activeCorrection.error_category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Correction {(activeCorrectionIndex ?? 0) + 1} of{" "}
                      {evaluation.inline_corrections.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {evaluation.inline_corrections.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveCorrectionIndex(idx);
                          setPopoverPos(null);
                        }}
                        className={`h-6 w-6 rounded font-mono text-xs font-bold ${
                          activeCorrectionIndex === idx
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. Crossed-out Original -> Corrected */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-sm">
                  <span className="rounded-lg bg-rose-500/15 px-3 py-1 font-medium text-rose-300 line-through">
                    {activeCorrection.exact_original_quote}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="rounded-lg bg-emerald-500/15 px-3 py-1 font-bold text-emerald-300">
                    {activeCorrection.corrected_version}
                  </span>
                </div>

                {/* 2. Band 9.0 Upgrade Badge */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                      <Sparkles className="h-3 w-3" /> Band 9.0 Upgrade
                    </span>
                    <p className="mt-1 text-sm font-bold text-white">
                      &ldquo;{activeCorrection.band_9_academic_upgrade}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      applyReplacementInEssay(activeCorrection, true)
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 transition hover:bg-amber-400"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Replace in Essay</span>
                  </button>
                </div>

                {/* 3. Detailed Explanation in Uzbek */}
                <div className="mt-3 rounded-xl bg-slate-950/70 p-3.5 text-xs leading-relaxed text-slate-200">
                  <span className="mr-1.5 font-bold uppercase tracking-wider text-indigo-400">
                    O&apos;zbekcha Tahlil:
                  </span>
                  {activeCorrection.explanation_in_uzbek}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* RIGHT PANEL: SCORECARD GAUGES, REWRITE TOGGLE & UZBEK DRILLS      */}
        {/* ================================================================ */}
        <section className="flex flex-col gap-5 lg:col-span-5">
          {/* 1. SCORECARD & 4 OFFICIAL CRITERIA GAUGES */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex flex-col items-center justify-between gap-6 border-b border-slate-800 pb-5 sm:flex-row">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Official IELTS Rubric Scorecard
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-white">
                  Criterion-by-Criterion Band Breakdown
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Click any criterion (`TR`, `CC`, `LR`, `GRA`) below to inspect
                  specific strengths and anti-inflation penalties.
                </p>
              </div>
              <CircularBandGauge
                score={evaluation.overall_band}
                label="Overall Band"
              />
            </div>

            {/* 4 Criteria Progress Gauges */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { key: "TR", title: "Task Response" },
                  { key: "CC", title: "Coherence" },
                  { key: "LR", title: "Lexical Resource" },
                  { key: "GRA", title: "Grammar" },
                ] as const
              ).map(({ key, title }) => {
                const crit = evaluation.criteria[key];
                const pct = Math.round((crit.score / 9.0) * 100);
                const isSelected = activeCriterionTab === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCriterionTab(key)}
                    className={`flex flex-col justify-between rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-400">
                        {key}
                      </span>
                      <span className="font-mono text-lg font-black text-white">
                        {crit.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-slate-400">
                      {title}
                    </div>
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${
                          crit.score >= 7.5
                            ? "bg-emerald-500"
                            : crit.score >= 6.5
                            ? "bg-indigo-500"
                            : "bg-amber-500"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Criterion Strengths & Weaknesses */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-indigo-400">
                  {activeCriterionTab} Examiner Audit (Band{" "}
                  {evaluation.criteria[activeCriterionTab].score.toFixed(1)})
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <span className="font-bold text-emerald-400">
                    ✓ Strengths:
                  </span>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-300">
                    {evaluation.criteria[activeCriterionTab].strengths.map(
                      (s, idx) => (
                        <li key={idx}>{s}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-rose-400">
                    ⚠ Weaknesses & Penalties:
                  </span>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-slate-300">
                    {evaluation.criteria[activeCriterionTab].weaknesses.map(
                      (w, idx) => (
                        <li key={idx}>{w}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 2. "MY ESSAY" VS "BAND 8.5 REWRITE" SIDE-BY-SIDE COMPARATOR */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Band 8.5+ Model Transformation
                </span>
                <h3 className="text-sm font-bold text-white">
                  Compare &ldquo;My Essay&rdquo; vs &ldquo;Band 8.5 Rewrite&rdquo;
                </h3>
              </div>

              <div className="inline-flex rounded-xl bg-slate-950 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCompareTab("my_essay")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-semibold ${
                    compareTab === "my_essay"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>My Essay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompareTab("band_8_5_rewrite")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-semibold ${
                    compareTab === "band_8_5_rewrite"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Band 8.5 Rewrite</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompareTab("side_by_side")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-semibold ${
                    compareTab === "side_by_side"
                      ? "bg-purple-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span>Side-by-Side</span>
                </button>
              </div>
            </div>

            {compareTab === "my_essay" && (
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-7 text-slate-300 whitespace-pre-wrap">
                {essayText}
              </div>
            )}

            {compareTab === "band_8_5_rewrite" && (
              <div className="max-h-80 overflow-y-auto rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-4 text-xs leading-7 text-emerald-100 whitespace-pre-wrap">
                {evaluation.band_8_5_full_rewrite}
              </div>
            )}

            {compareTab === "side_by_side" && (
              <div className="grid max-h-96 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    My Essay (Band {evaluation.overall_band.toFixed(1)})
                  </div>
                  <p className="whitespace-pre-wrap text-xs leading-6 text-slate-300">
                    {essayText}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-3.5">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <span>Band 8.5+ Academic Rewrite</span>
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <p className="whitespace-pre-wrap text-xs leading-6 text-emerald-100">
                    {evaluation.band_8_5_full_rewrite}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 3. ACTIONABLE DRILLS IN UZBEK (3 SPECIFIC TASKS FOR WEAKEST CRITERION) */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 shadow-xl">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                Actionable Drills (O&apos;zbek tilida 3 ta amaliy topshiriq)
              </h3>
            </div>
            <ul className="space-y-2.5">
              {evaluation.actionable_drills_uz.map((drill, idx) => {
                const done = Boolean(completedDrills[idx]);
                return (
                  <li
                    key={idx}
                    onClick={() =>
                      setCompletedDrills((prev) => ({
                        ...prev,
                        [idx]: !prev[idx],
                      }))
                    }
                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed transition ${
                      done
                        ? "border-emerald-500/40 bg-emerald-950/20 text-slate-400 line-through"
                        : "border-slate-800 bg-slate-900/90 text-slate-200 hover:border-indigo-500/40"
                    }`}
                  >
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        done ? "text-emerald-400" : "text-indigo-400"
                      }`}
                    />
                    <span>{drill}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
