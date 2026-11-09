"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Contrast,
  Eraser,
  ExternalLink,
  Flag,
  GripVertical,
  Highlighter,
  Pause,
  PenTool,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  StickyNote,
  Strikethrough,
  X,
} from "lucide-react";
import {
  CD_IELTS_40_QUESTIONS,
  CD_IELTS_PASSAGES,
  SimulatorQuestion,
} from "@/lib/simulator/cd-ielts-data";
import {
  HighlightColor,
  TextHighlight,
  useRealExamStore,
} from "@/lib/simulator/exam-store";

interface FloatingToolbarState {
  visible: boolean;
  x: number;
  y: number;
  selectedText: string;
  showStickyInput: boolean;
  stickyDraft: string;
}

export function InsperaExamSimulator() {
  const store = useRealExamStore();

  const splitWrapperRef = useRef<HTMLDivElement | null>(null);
  const leftPaneRef = useRef<HTMLDivElement | null>(null);
  const rightPaneRef = useRef<HTMLDivElement | null>(null);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [toolbar, setToolbar] = useState<FloatingToolbarState>({
    visible: false,
    x: 0,
    y: 0,
    selectedText: "",
    showStickyInput: false,
    stickyDraft: "",
  });
  const [activeNoteHighlight, setActiveNoteHighlight] =
    useState<TextHighlight | null>(null);
  const [noteEditValue, setNoteEditValue] = useState("");
  const [submittedDiagnostic, setSubmittedDiagnostic] = useState<{
    correctCount: number;
    totalAnswered: number;
    estimatedBand: number;
  } | null>(null);

  // 1-second exam countdown ticker
  useEffect(() => {
    const timer = window.setInterval(() => {
      useRealExamStore.getState().tickTimer();
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Resizable Center Divider Mouse/Touch Drag Handlers
  useEffect(() => {
    if (!isDraggingDivider) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!splitWrapperRef.current) return;
      const rect = splitWrapperRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const relativeX = e.clientX - rect.left;
      const nextPercent = (relativeX / rect.width) * 100;
      useRealExamStore.getState().setSplitRatio(nextPercent);
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDivider]);

  // Format countdown timer MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(store.remainingSeconds / 60);
    const secs = store.remainingSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [store.remainingSeconds]);

  const isFiveMinuteWarning =
    store.remainingSeconds > 0 && store.remainingSeconds <= 300;

  // Active reading passage object
  const activePassage = useMemo(
    () =>
      CD_IELTS_PASSAGES.find((p) => p.id === store.activePassageId) ??
      CD_IELTS_PASSAGES[0],
    [store.activePassageId]
  );

  // Active writing essay word count
  const currentWritingEssay =
    store.activeWritingTask === 1
      ? store.writingTask1Essay
      : store.writingEssay;

  const writingStats = useMemo(() => {
    const trimmed = currentWritingEssay.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = trimmed.length;
    const minRequired = store.activeWritingTask === 1 ? 150 : 250;
    return { words, chars, minRequired };
  }, [currentWritingEssay, store.activeWritingTask]);

  // Smooth scroll Right Pane to question number (1..40)
  const navigateToQuestion = useCallback((qNumber: number) => {
    useRealExamStore.getState().setCurrentQuestion(qNumber);
    useRealExamStore.getState().setActiveTab("reading");

    window.requestAnimationFrame(() => {
      const targetEl = questionRefs.current[qNumber];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }, []);

  // Floating Mini-Toolbar on Text Selection inside Left Pane
  const handleLeftPaneMouseUp = () => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2 || selectedText.length > 320) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const paneRect = leftPaneRef.current?.getBoundingClientRect();
    if (!paneRect) return;

    const scrollTop = leftPaneRef.current?.scrollTop ?? 0;
    const x = Math.max(
      16,
      Math.min(
        rect.left - paneRect.left + rect.width / 2 - 150,
        paneRect.width - 330
      )
    );
    const y = Math.max(12, rect.top - paneRect.top + scrollTop - 52);

    setToolbar({
      visible: true,
      x,
      y,
      selectedText,
      showStickyInput: false,
      stickyDraft: "",
    });
  };

  const applyHighlightAction = (color: HighlightColor, stickyNote?: string) => {
    if (!toolbar.selectedText) return;
    store.addHighlight(
      toolbar.selectedText,
      color,
      stickyNote,
      store.activeTab === "reading" ? store.activePassageId : "writing-prompt"
    );
    setToolbar({
      visible: false,
      x: 0,
      y: 0,
      selectedText: "",
      showStickyInput: false,
      stickyDraft: "",
    });
    window.getSelection()?.removeAllRanges();
  };

  const handleClearSelectionHighlight = () => {
    store.clearHighlights(
      toolbar.selectedText,
      store.activeTab === "reading" ? store.activePassageId : "writing-prompt"
    );
    setToolbar({
      visible: false,
      x: 0,
      y: 0,
      selectedText: "",
      showStickyInput: false,
      stickyDraft: "",
    });
    window.getSelection()?.removeAllRanges();
  };

  // Render passage text with persisted Yellow/Green highlights and Sticky Note badges
  const renderTextWithHighlights = (rawText: string, passageKey: string) => {
    const relevantHighlights = store.highlights.filter(
      (h) => h.passageId === passageKey || !h.passageId
    );
    if (relevantHighlights.length === 0) return rawText;

    type Segment = {
      text: string;
      highlight?: TextHighlight;
    };

    let segments: Segment[] = [{ text: rawText }];

    for (const hl of relevantHighlights) {
      if (!hl.quote) continue;
      const next: Segment[] = [];
      for (const seg of segments) {
        if (seg.highlight) {
          next.push(seg);
          continue;
        }
        const idx = seg.text.toLowerCase().indexOf(hl.quote.toLowerCase());
        if (idx === -1) {
          next.push(seg);
        } else {
          const before = seg.text.slice(0, idx);
          const matched = seg.text.slice(idx, idx + hl.quote.length);
          const after = seg.text.slice(idx + hl.quote.length);
          if (before) next.push({ text: before });
          next.push({ text: matched, highlight: hl });
          if (after) next.push({ text: after });
        }
      }
      segments = next;
    }

    return segments.map((seg, idx) => {
      if (!seg.highlight) {
        return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
      }
      const hl = seg.highlight;
      const isYellow = hl.color === "yellow";

      return (
        <mark
          key={`${hl.id}-${idx}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveNoteHighlight(hl);
            setNoteEditValue(hl.note ?? "");
          }}
          title={
            hl.note
              ? `Sticky Note: ${hl.note} (Click to view/edit)`
              : "Click to add sticky note or remove highlight"
          }
          className={`cursor-pointer rounded px-1 py-0.5 font-medium transition ${
            isYellow
              ? "bg-yellow-300/90 text-slate-950 underline decoration-yellow-600"
              : "bg-emerald-300/90 text-slate-950 underline decoration-emerald-700"
          }`}
        >
          {seg.text}
          {hl.note && (
            <sup className="ml-1 inline-flex items-center gap-0.5 rounded bg-slate-900 px-1 py-0.2 text-[10px] font-bold text-amber-300">
              NOTE
            </sup>
          )}
        </mark>
      );
    });
  };

  // Evaluate all 40 Reading questions on submit
  const handleCheckReadingScore = () => {
    let correct = 0;
    let answered = 0;
    for (const q of CD_IELTS_40_QUESTIONS) {
      const userAns = (store.questionAnswers[q.number] ?? "").trim();
      if (userAns) answered += 1;
      if (userAns.toLowerCase() === q.correctAnswer.toLowerCase()) {
        correct += 1;
      }
    }
    const band =
      correct >= 39
        ? 9.0
        : correct >= 37
        ? 8.5
        : correct >= 35
        ? 8.0
        : correct >= 33
        ? 7.5
        : correct >= 30
        ? 7.0
        : correct >= 27
        ? 6.5
        : correct >= 23
        ? 6.0
        : correct >= 19
        ? 5.5
        : 5.0;

    setSubmittedDiagnostic({
      correctCount: correct,
      totalAnswered: answered,
      estimatedBand: band,
    });
  };

  // Theme / High-Contrast styling classes (Standard Light, Dark, and Official CD-IELTS Yellow-on-Black)
  const themeClasses = useMemo(() => {
    if (store.contrastMode === "high_contrast") {
      return {
        root: "bg-black text-yellow-300",
        bar: "border-yellow-400/60 bg-black text-yellow-300",
        paneLeft: "bg-black text-yellow-200 border-yellow-400/50",
        paneRight: "bg-zinc-950 text-yellow-200",
        card: "border-yellow-400/50 bg-zinc-950 text-yellow-200",
        input: "border-yellow-400 bg-black text-yellow-300",
      };
    }
    if (store.contrastMode === "standard") {
      return {
        root: "bg-slate-100 text-slate-900",
        bar: "border-slate-300 bg-white text-slate-900 shadow-sm",
        paneLeft: "bg-white text-slate-900 border-slate-300",
        paneRight: "bg-slate-50 text-slate-900",
        card: "border-slate-300 bg-white text-slate-900",
        input: "border-slate-300 bg-white text-slate-900",
      };
    }
    return {
      root: "bg-slate-950 text-slate-100",
      bar: "border-slate-800 bg-slate-900/95 text-slate-100",
      paneLeft: "bg-slate-900/50 text-slate-100 border-slate-800",
      paneRight: "bg-slate-950 text-slate-100",
      card: "border-slate-800 bg-slate-900/80 text-slate-100",
      input: "border-slate-700 bg-slate-950 text-white",
    };
  }, [store.contrastMode]);

  // Group questions by groupTitle for clean rendering
  const groupedQuestions = useMemo(() => {
    const groups: Array<{
      passageId: string;
      groupTitle: string;
      groupInstruction: string;
      questions: SimulatorQuestion[];
    }> = [];

    for (const q of CD_IELTS_40_QUESTIONS) {
      const lastGroup = groups[groups.length - 1];
      if (
        lastGroup &&
        lastGroup.groupTitle === q.groupTitle &&
        lastGroup.passageId === q.passageId
      ) {
        lastGroup.questions.push(q);
      } else {
        groups.push({
          passageId: q.passageId,
          groupTitle: q.groupTitle,
          groupInstruction: q.groupInstruction,
          questions: [q],
        });
      }
    }
    return groups;
  }, []);

  const answeredCount = useMemo(
    () =>
      Object.values(store.questionAnswers).filter(
        (v) => typeof v === "string" && v.trim().length > 0
      ).length,
    [store.questionAnswers]
  );

  return (
    <div
      className={`flex h-screen flex-col overflow-hidden select-none sm:select-auto ${themeClasses.root}`}
    >
      {/* ===================================================================== */}
      {/* 1. TOP EXAM NAVIGATION BAR (Countdown, 5m Alert, Pause/Save, Contrast) */}
      {/* ===================================================================== */}
      <header
        className={`z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 ${themeClasses.bar}`}
      >
        {/* Left: Official CD-IELTS / Bluebook Branding & Module Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            title="3Talaba Campus Bosh sahifasiga qaytish"
          >
            ← Campus
          </Link>

          <div className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black tracking-wider text-white shadow">
            <span>CD-IELTS INSPERA</span>
          </div>

          <div className="inline-flex rounded-lg border border-slate-700/60 bg-slate-800/50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => store.setActiveTab("reading")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-bold transition ${
                store.activeTab === "reading"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Academic Reading (Q1–40)</span>
            </button>
            <button
              type="button"
              onClick={() => store.setActiveTab("writing")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-bold transition ${
                store.activeTab === "writing"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Academic Writing (Task 1 & 2)</span>
            </button>
          </div>
        </div>

        {/* Center: Live Countdown Timer with 5-Minute Red Warning Alert */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 font-mono text-sm font-black transition-all ${
              isFiveMinuteWarning
                ? "animate-pulse border-red-500 bg-red-600/25 text-red-400 ring-2 ring-red-500/50"
                : "border-slate-700 bg-slate-800/90 text-emerald-400"
            }`}
          >
            {isFiveMinuteWarning ? (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            ) : (
              <Clock className="h-4 w-4 text-sky-400" />
            )}
            <span>{formattedTime}</span>
            {isFiveMinuteWarning && (
              <span className="rounded bg-red-600 px-1.5 py-0.5 font-sans text-[10px] font-extrabold uppercase text-white">
                &lt; 5 MIN LEFT
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              store.resetTimer(isFiveMinuteWarning ? 3600 : 295)
            }
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
            title="Toggle between 60:00 and <5:00 Red Warning Alert"
          >
            {isFiveMinuteWarning ? "Reset 60:00" : "Test 5m Alert"}
          </button>

          {/* Pause / Save Session Button */}
          <button
            type="button"
            onClick={() => store.pauseAndSaveSession()}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              store.isTimerPaused
                ? "border-amber-500 bg-amber-500/20 text-amber-300"
                : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            {store.isTimerPaused ? (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Resume Session</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" />
                <Save className="h-3.5 w-3.5 text-sky-400" />
                <span>Pause / Save Session</span>
              </>
            )}
          </button>

          {store.lastSavedAt && (
            <span className="hidden text-[11px] font-medium text-emerald-400 xl:inline">
              ✓ Saved {store.lastSavedAt}
            </span>
          )}
        </div>

        {/* Right: Contrast Toggle & Submit / AI Examiner */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => store.cycleContrastMode()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
            title="Cycle Standard Light / Dark / Official CD-IELTS High-Contrast (Yellow on Black)"
          >
            <Contrast className="h-3.5 w-3.5 text-amber-400" />
            <span className="capitalize">
              {store.contrastMode === "high_contrast"
                ? "High Contrast"
                : store.contrastMode}
            </span>
          </button>

          {store.activeTab === "reading" ? (
            <button
              type="button"
              onClick={handleCheckReadingScore}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-500"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Submit Reading ({answeredCount}/40)</span>
            </button>
          ) : (
            <Link
              href="/examiner"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:brightness-110"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Open Full AI Examiner</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. RESIZABLE SPLIT-SCREEN WORKSPACE (Left Pane + Divider + Right Pane) */}
      {/* ===================================================================== */}
      <div
        ref={splitWrapperRef}
        className="relative flex flex-1 overflow-hidden"
      >
        {/* ----------------------------------------------------------------- */}
        {/* LEFT PANE: SCROLLABLE READING PASSAGE OR WRITING PROMPT + CHART   */}
        {/* ----------------------------------------------------------------- */}
        <section
          ref={leftPaneRef}
          onMouseUp={handleLeftPaneMouseUp}
          style={{ width: `${store.splitRatio}%` }}
          className={`relative h-full overflow-y-auto border-r p-6 ${themeClasses.paneLeft}`}
        >
          {/* FLOATING CUSTOM TEXT HIGHLIGHTER & STICKY NOTE TOOLBAR */}
          {toolbar.visible && (
            <div
              style={{ left: `${toolbar.x}px`, top: `${toolbar.y}px` }}
              className="absolute z-40 w-[320px] rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-slate-100 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => applyHighlightAction("yellow")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-yellow-400/20 px-2 py-1.5 text-[11px] font-bold text-yellow-300 hover:bg-yellow-400/30"
                >
                  <Highlighter className="h-3 w-3" />
                  <span>Highlight Yellow</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyHighlightAction("green")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-400/20 px-2 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-400/30"
                >
                  <Highlighter className="h-3 w-3" />
                  <span>Highlight Green</span>
                </button>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setToolbar((prev) => ({
                      ...prev,
                      showStickyInput: !prev.showStickyInput,
                    }))
                  }
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-500/20 px-2 py-1.5 text-[11px] font-bold text-indigo-300 hover:bg-indigo-500/30"
                >
                  <StickyNote className="h-3 w-3" />
                  <span>Add Sticky Note</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearSelectionHighlight}
                  className="flex items-center justify-center gap-1 rounded-lg bg-rose-500/20 px-2.5 py-1.5 text-[11px] font-bold text-rose-300 hover:bg-rose-500/30"
                >
                  <Eraser className="h-3 w-3" />
                  <span>Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setToolbar((prev) => ({ ...prev, visible: false }))
                  }
                  className="rounded p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {toolbar.showStickyInput && (
                <div className="mt-2 space-y-1.5 border-t border-slate-800 pt-2">
                  <input
                    type="text"
                    value={toolbar.stickyDraft}
                    onChange={(e) =>
                      setToolbar((prev) => ({
                        ...prev,
                        stickyDraft: e.target.value,
                      }))
                    }
                    placeholder="Type sticky note for this quote..."
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      applyHighlightAction("yellow", toolbar.stickyDraft)
                    }
                    className="w-full rounded-lg bg-indigo-600 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    Save Highlight + Sticky Note
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STICKY NOTE POPOVER FOR AN EXISTING HIGHLIGHT */}
          {activeNoteHighlight && (
            <div className="mb-4 rounded-xl border border-amber-500/50 bg-slate-900 p-4 text-xs text-slate-100 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-amber-400">
                  Sticky Note Inspector
                </span>
                <button
                  type="button"
                  onClick={() => setActiveNoteHighlight(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 italic text-slate-300">
                &ldquo;{activeNoteHighlight.quote}&rdquo;
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={noteEditValue}
                  onChange={(e) => setNoteEditValue(e.target.value)}
                  placeholder="Add or update sticky note..."
                  className="flex-1 rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    store.updateHighlightNote(
                      activeNoteHighlight.id,
                      noteEditValue
                    );
                    setActiveNoteHighlight(null);
                  }}
                  className="rounded bg-indigo-600 px-3 py-1.5 font-bold text-white hover:bg-indigo-500"
                >
                  Save Note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    store.removeHighlight(activeNoteHighlight.id);
                    setActiveNoteHighlight(null);
                  }}
                  className="rounded bg-rose-600/30 px-2.5 py-1.5 font-bold text-rose-300 hover:bg-rose-600/50"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {store.activeTab === "reading" ? (
            <div className="space-y-5 pb-12">
              {/* Passage Switcher Tabs (Passage 1, 2, 3) */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
                <div className="flex gap-1.5">
                  {CD_IELTS_PASSAGES.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => store.setActivePassageId(p.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        store.activePassageId === p.id
                          ? "bg-blue-600 text-white shadow"
                          : "border border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      Passage {idx + 1} (Q{p.questionRange[0]}–
                      {p.questionRange[1]})
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-medium text-amber-400">
                  Select any text to Highlight or Add Sticky Note
                </span>
              </div>

              <div>
                <h1 className="text-lg font-extrabold tracking-tight">
                  {activePassage.title}
                </h1>
                <p className="mt-1 text-xs opacity-75">
                  {activePassage.subtitle}
                </p>
              </div>

              <div className="space-y-4 text-[15px] leading-8">
                {activePassage.paragraphs.map((para) => (
                  <article
                    key={para.label}
                    className={`rounded-xl border p-4 ${themeClasses.card}`}
                  >
                    <div className="mb-1.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-xs font-black text-white">
                        {para.label}
                      </span>
                    </div>
                    <p>
                      {renderTextWithHighlights(
                        para.text,
                        activePassage.id
                      )}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            /* WRITING LEFT PANE: TASK 1 (PROMPT + CHART) OR TASK 2 PROMPT */
            <div className="space-y-5 pb-12">
              <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3">
                <button
                  type="button"
                  onClick={() => store.setActiveWritingTask(1)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    store.activeWritingTask === 1
                      ? "bg-blue-600 text-white"
                      : "border border-slate-700 bg-slate-800/40 text-slate-400"
                  }`}
                >
                  Writing Task 1 (150+ words & Chart)
                </button>
                <button
                  type="button"
                  onClick={() => store.setActiveWritingTask(2)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    store.activeWritingTask === 2
                      ? "bg-blue-600 text-white"
                      : "border border-slate-700 bg-slate-800/40 text-slate-400"
                  }`}
                >
                  Writing Task 2 (250+ words Essay)
                </button>
              </div>

              {store.activeWritingTask === 1 ? (
                <div className="space-y-4">
                  <div className={`rounded-xl border p-4 ${themeClasses.card}`}>
                    <span className="text-xs font-bold uppercase text-sky-400">
                      Writing Task 1 • Spend about 20 minutes on this task
                    </span>
                    <p className="mt-2 text-sm font-semibold leading-relaxed">
                      {renderTextWithHighlights(
                        "The chart below compares the electrical energy consumption (kWh per cubic meter) and brine mineral cost-recovery percentage across four desalination systems between 2015 and 2025. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
                        "writing-prompt"
                      )}
                    </p>
                  </div>

                  {/* SVG Data Visualization Chart for Writing Task 1 */}
                  <div className={`rounded-xl border p-5 ${themeClasses.card}`}>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-sky-400">
                      Desalination Energy Intensity (kWh/m³) vs. Cost Recovery (%)
                    </h3>
                    <svg
                      viewBox="0 0 520 220"
                      className="w-full overflow-visible"
                    >
                      {/* Grid lines */}
                      {[40, 85, 130, 175].map((y, i) => (
                        <line
                          key={i}
                          x1="50"
                          y1={y}
                          x2="490"
                          y2={y}
                          stroke="currentColor"
                          strokeOpacity="0.15"
                          strokeDasharray="4 4"
                        />
                      ))}
                      {/* Bars */}
                      {[
                        {
                          label: "Thermal MSF",
                          energyHeight: 130,
                          recoveryHeight: 25,
                          x: 85,
                          eVal: "6.8 kWh",
                          rVal: "5%",
                        },
                        {
                          label: "Onshore RO",
                          energyHeight: 75,
                          recoveryHeight: 45,
                          x: 195,
                          eVal: "3.5 kWh",
                          rVal: "11%",
                        },
                        {
                          label: "Solar RO",
                          energyHeight: 58,
                          recoveryHeight: 72,
                          x: 305,
                          eVal: "2.6 kWh",
                          rVal: "18%",
                        },
                        {
                          label: "Wave RO + ZLD",
                          energyHeight: 38,
                          recoveryHeight: 110,
                          x: 415,
                          eVal: "1.7 kWh",
                          rVal: "27%",
                        },
                      ].map((bar) => (
                        <g key={bar.label}>
                          <rect
                            x={bar.x}
                            y={175 - bar.energyHeight}
                            width="28"
                            height={bar.energyHeight}
                            rx="4"
                            fill="#3b82f6"
                          />
                          <text
                            x={bar.x + 14}
                            y={170 - bar.energyHeight}
                            textAnchor="middle"
                            fontSize="9"
                            fill="currentColor"
                          >
                            {bar.eVal}
                          </text>
                          <rect
                            x={bar.x + 32}
                            y={175 - bar.recoveryHeight}
                            width="28"
                            height={bar.recoveryHeight}
                            rx="4"
                            fill="#10b981"
                          />
                          <text
                            x={bar.x + 46}
                            y={170 - bar.recoveryHeight}
                            textAnchor="middle"
                            fontSize="9"
                            fill="currentColor"
                          >
                            {bar.rVal}
                          </text>
                          <text
                            x={bar.x + 30}
                            y={195}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="currentColor"
                          >
                            {bar.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                    <div className="mt-2 flex items-center justify-center gap-6 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-blue-500" /> Energy
                        Consumption (kWh/m³)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-emerald-500" />{" "}
                        Brine Mineral Cost Recovery (%)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`rounded-xl border p-5 ${themeClasses.card}`}>
                  <span className="text-xs font-bold uppercase text-sky-400">
                    Writing Task 2 • Spend about 40 minutes on this task
                  </span>
                  <p className="mt-3 text-base font-bold leading-relaxed">
                    {renderTextWithHighlights(
                      "Some people believe that university education should focus exclusively on preparing students for practical career paths, while others think higher education should serve a broader intellectual purpose. Discuss both views and give your own opinion.",
                      "writing-prompt"
                    )}
                  </p>
                  <p className="mt-3 text-xs opacity-75">
                    Give reasons for your answer and include any relevant
                    examples from your own knowledge or experience. Write at
                    least <strong>250 words</strong>.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* CENTER DRAGGABLE DIVIDER HANDLE                                   */}
        {/* ----------------------------------------------------------------- */}
        <div
          role="separator"
          aria-orientation="vertical"
          title="Drag left/right to resize split-screen panes (Double-click to reset 50/50)"
          onMouseDown={() => setIsDraggingDivider(true)}
          onDoubleClick={() => store.setSplitRatio(50)}
          className={`group z-20 flex w-3 shrink-0 cursor-col-resize items-center justify-center transition-colors ${
            isDraggingDivider
              ? "bg-blue-600"
              : "bg-slate-800/80 hover:bg-blue-600/80"
          }`}
        >
          <GripVertical className="h-5 w-5 text-slate-400 group-hover:text-white" />
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* RIGHT PANE: INDEPENDENTLY SCROLLABLE QUESTIONS OR ESSAY EDITOR    */}
        {/* ----------------------------------------------------------------- */}
        <section
          ref={rightPaneRef}
          style={{ width: `${100 - store.splitRatio}%` }}
          className={`h-full overflow-y-auto p-6 ${themeClasses.paneRight}`}
        >
          {store.activeTab === "reading" ? (
            <div className="space-y-6 pb-16">
              {/* Reading Diagnostic Banner if Submitted */}
              {submittedDiagnostic && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-500/50 bg-blue-950/30 p-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-sky-400">
                      Official CD-IELTS Reading Result
                    </span>
                    <h3 className="text-lg font-black">
                      Raw Score: {submittedDiagnostic.correctCount} / 40 •
                      Estimated Band:{" "}
                      {submittedDiagnostic.estimatedBand.toFixed(1)}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmittedDiagnostic(null)}
                    className="rounded-lg border border-sky-400/40 px-3 py-1.5 text-xs font-bold text-sky-300"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Render all 40 Questions Grouped by Section */}
              {groupedQuestions.map((group, gIdx) => (
                <div
                  key={`${group.passageId}-${gIdx}`}
                  className={`rounded-2xl border p-5 ${themeClasses.card}`}
                >
                  <div className="mb-4 border-b border-slate-700/50 pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400">
                      {group.groupTitle}
                    </span>
                    <p className="mt-1 text-xs opacity-80">
                      {group.groupInstruction}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {group.questions.map((q) => {
                      const isCurrent = store.currentQuestion === q.number;
                      const currentAnswer =
                        store.questionAnswers[q.number] ?? "";
                      const isFlagged = Boolean(store.flaggedByNumber[q.number]);

                      return (
                        <div
                          key={q.number}
                          ref={(el) => {
                            questionRefs.current[q.number] = el;
                          }}
                          onClick={() => store.setCurrentQuestion(q.number)}
                          className={`rounded-xl border p-4 transition-all ${
                            isCurrent
                              ? "border-blue-500 ring-2 ring-blue-500/40"
                              : "border-slate-700/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold leading-relaxed">
                              <span
                                className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-black ${
                                  currentAnswer.trim()
                                    ? "bg-blue-600 text-white"
                                    : "border border-slate-500 text-slate-300"
                                }`}
                              >
                                {q.number}
                              </span>
                              {q.prompt}
                            </p>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                store.toggleQuestionFlag(q.number);
                              }}
                              className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition ${
                                isFlagged
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "text-slate-400 hover:bg-slate-800"
                              }`}
                              title="Flag question for review"
                            >
                              <Flag className="h-3.5 w-3.5" />
                              <span>{isFlagged ? "Flagged" : "Flag"}</span>
                            </button>
                          </div>

                          {/* Question Type Controls */}
                          {q.type === "TFNG" && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => {
                                const selected = currentAnswer === opt;
                                const struck = (
                                  store.strikethroughOptions[`q${q.number}`] ??
                                  []
                                ).includes(opt);
                                return (
                                  <div
                                    key={opt}
                                    className="flex items-center gap-1"
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        store.setQuestionAnswer(q.number, opt);
                                      }}
                                      className={`rounded-lg border px-3.5 py-1.5 text-xs font-bold transition ${
                                        selected
                                          ? "border-blue-500 bg-blue-600 text-white"
                                          : "border-slate-700 bg-slate-800/70 text-slate-300 hover:border-slate-500"
                                      } ${
                                        struck ? "line-through opacity-40" : ""
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        store.toggleStrikethrough(
                                          `q${q.number}`,
                                          opt
                                        );
                                      }}
                                      className="rounded p-1 text-slate-500 hover:text-slate-300"
                                      title="Eliminate / Strike-through option"
                                    >
                                      <Strikethrough className="h-3 w-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "MCQ" && q.options && (
                            <div className="mt-3 space-y-2">
                              {q.options.map((opt) => {
                                const selected = currentAnswer === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      store.setQuestionAnswer(
                                        q.number,
                                        opt.key
                                      );
                                    }}
                                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                                      selected
                                        ? "border-blue-500 bg-blue-600/25 text-white"
                                        : "border-slate-700/70 bg-slate-800/40 hover:border-slate-600"
                                    }`}
                                  >
                                    <span
                                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-xs font-bold ${
                                        selected
                                          ? "bg-blue-600 text-white"
                                          : "bg-slate-700 text-slate-300"
                                      }`}
                                    >
                                      {opt.key}
                                    </span>
                                    <span>{opt.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "GAP_FILL" && (
                            <div className="mt-3">
                              <input
                                type="text"
                                value={currentAnswer}
                                onChange={(e) =>
                                  store.setQuestionAnswer(
                                    q.number,
                                    e.target.value
                                  )
                                }
                                placeholder="Type answer (NO MORE THAN TWO WORDS)..."
                                className={`w-full max-w-md rounded-lg border px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none ${themeClasses.input}`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* RIGHT PANE: WRITING ESSAY EDITOR WITH LIVE WORD COUNT */
            <div className="space-y-4 pb-16">
              <div
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${themeClasses.card}`}
              >
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="opacity-75">Word Count: </span>
                    <strong
                      className={`font-mono text-base ${
                        writingStats.words >= writingStats.minRequired
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {writingStats.words}
                    </strong>
                    <span className="opacity-60">
                      {" "}
                      / {writingStats.minRequired} min
                    </span>
                  </div>
                  <div>
                    <span className="opacity-75">Characters: </span>
                    <strong className="font-mono">{writingStats.chars}</strong>
                  </div>
                </div>

                <Link
                  href="/examiner"
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Evaluate in AI Writing Examiner</span>
                </Link>
              </div>

              <textarea
                rows={20}
                value={currentWritingEssay}
                onChange={(e) =>
                  store.activeWritingTask === 1
                    ? store.setWritingTask1Essay(e.target.value)
                    : store.setWritingEssay(e.target.value)
                }
                placeholder={`Type your IELTS Academic Writing Task ${store.activeWritingTask} response here...`}
                className={`w-full rounded-2xl border p-5 font-sans text-[15px] leading-7 focus:border-blue-500 focus:outline-none ${themeClasses.input}`}
              />
            </div>
          )}
        </section>
      </div>

      {/* ===================================================================== */}
      {/* 3. BOTTOM QUESTION PALETTE (1 to 40: Answered, Unanswered, Current, Flagged) */}
      {/* ===================================================================== */}
      <footer
        className={`z-30 shrink-0 border-t px-4 py-2 ${themeClasses.bar}`}
      >
        <div className="mx-auto flex max-w-[1800px] flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-3 font-semibold">
              <span className="uppercase tracking-wider opacity-75">
                Official 40-Question Palette:
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded bg-blue-600" />{" "}
                Answered ({answeredCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded border border-slate-500" />{" "}
                Unanswered ({40 - answeredCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded ring-2 ring-sky-400" />{" "}
                Current (Q{store.currentQuestion})
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />{" "}
                Flagged for Review
              </span>
            </div>

            <div className="text-[11px] opacity-75">
              Split Ratio: {Math.round(store.splitRatio)}% /{" "}
              {Math.round(100 - store.splitRatio)}%
            </div>
          </div>

          {/* Numbered Buttons 1 to 40 */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {CD_IELTS_40_QUESTIONS.map((q) => {
              const isAnswered = Boolean(
                store.questionAnswers[q.number]?.trim()
              );
              const isCurrent = store.currentQuestion === q.number;
              const isFlagged = Boolean(store.flaggedByNumber[q.number]);

              return (
                <button
                  key={q.number}
                  type="button"
                  onClick={() => navigateToQuestion(q.number)}
                  className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded font-mono text-[11px] font-bold transition-all ${
                    isAnswered
                      ? "border border-blue-500 bg-blue-600 text-white"
                      : "border border-slate-500/70 bg-transparent hover:border-slate-300"
                  } ${
                    isCurrent
                      ? "ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-950"
                      : ""
                  }`}
                >
                  {q.number}
                  {isFlagged && (
                    <span
                      title="Flagged for Review"
                      className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-1 ring-slate-950"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}
