"use client";

import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

const memoryStorageMap = new Map<string, string>();
const safeStorage: StateStorage = {
  getItem: (name: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(name);
    }
    return memoryStorageMap.get(name) ?? null;
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(name, value);
      return;
    }
    memoryStorageMap.set(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(name);
      return;
    }
    memoryStorageMap.delete(name);
  },
};

export type HighlightColor = "yellow" | "green";
export type ContrastMode = "standard" | "dark" | "high_contrast";

export interface TextHighlight {
  id: string;
  passageId: string;
  quote: string;
  color: HighlightColor;
  note?: string;
  createdAt: string;
}

export interface InlineCorrection {
  original_phrase: string;
  improved_phrase: string;
  band_9_synonym: string;
  criterion: "TR" | "CC" | "LR" | "GRA";
  severity: "minor" | "moderate" | "critical";
  reason: string;
  reason_uz: string;
}

export interface CriteriaScores {
  TR: number;
  CC: number;
  LR: number;
  GRA: number;
}

export interface IELTSExaminerGradeResult {
  overall_band: number;
  criteria_scores: CriteriaScores;
  inline_corrections: InlineCorrection[];
  actionable_next_steps: string[];
  examiner_summary_en: string;
  examiner_summary_uz: string;
  xp_awarded: number;
  remediation_plan?: {
    weakest_criterion: "TR" | "CC" | "LR" | "GRA";
    scheduled_node_slug: string;
    scheduled_node_title: string;
    scheduled_node_title_uz: string;
    scheduled_for: string;
  };
}

export interface AdaptiveRoadmapItem {
  id: string;
  nodeSlug: string;
  title: string;
  titleUz: string;
  module: "READING" | "WRITING" | "LISTENING" | "SPEAKING";
  reason: string;
  reasonUz: string;
  masteryProbability: number;
  priority: "URGENT_REMEDIATION" | "SCHEDULED";
  scheduledDate: string;
}

export interface RealExamZustandState {
  sessionId: string;
  activeTab: "reading" | "writing";
  activePassageId: "passage-1" | "passage-2" | "passage-3";
  activeWritingTask: 1 | 2;
  themeMode: "light" | "dark";
  contrastMode: ContrastMode;
  locale: "en" | "uz";
  splitRatio: number; // Left pane width percentage (25 to 75)
  remainingSeconds: number;
  isTimerPaused: boolean;
  lastSavedAt: string | null;

  // 40-Question Palette State (1..40)
  currentQuestion: number;
  questionAnswers: Record<number, string>;
  flaggedByNumber: Record<number, boolean>;

  // Legacy string-keyed maps for backward compatibility with unit tests
  readingAnswers: Record<string, string>;
  flaggedQuestions: Record<string, boolean>;
  strikethroughOptions: Record<string, string[]>;

  // Custom Highlighter & Sticky Notes Engine
  highlights: TextHighlight[];

  // Writing Module State
  writingTaskType: "WRITING_TASK_1" | "WRITING_TASK_2";
  writingTask1Essay: string;
  writingEssay: string;
  readingSubmitted: boolean;
  readingScore: number | null;
  aiGradeResult: IELTSExaminerGradeResult | null;
  adaptiveRoadmap: AdaptiveRoadmapItem[];
  xpPoints: number;
  streakDays: number;

  // Zustand Actions
  setActiveTab: (tab: "reading" | "writing") => void;
  setActivePassageId: (id: "passage-1" | "passage-2" | "passage-3") => void;
  setActiveWritingTask: (task: 1 | 2) => void;
  setThemeMode: (mode: "light" | "dark") => void;
  cycleContrastMode: () => void;
  setLocale: (locale: "en" | "uz") => void;
  setSplitRatio: (ratio: number) => void;
  tickTimer: () => void;
  toggleTimerPause: () => void;
  pauseAndSaveSession: () => void;
  resetTimer: (seconds?: number) => void;
  setCurrentQuestion: (questionNumber: number) => void;
  setQuestionAnswer: (questionNumber: number, value: string) => void;
  toggleQuestionFlag: (questionNumber: number) => void;
  addHighlight: (
    quote: string,
    color: HighlightColor,
    note?: string,
    passageId?: string
  ) => void;
  updateHighlightNote: (id: string, note: string) => void;
  removeHighlight: (id: string) => void;
  clearHighlights: (selectedQuote?: string, passageId?: string) => void;
  toggleFlagQuestion: (questionId: string) => void;
  toggleStrikethrough: (questionId: string, optionKey: string) => void;
  setReadingAnswer: (questionId: string, value: string) => void;
  setWritingTask1Essay: (text: string) => void;
  setWritingEssay: (text: string) => void;
  setAIGradeResult: (result: IELTSExaminerGradeResult) => void;
  applyReadingEvaluation: (
    score: number,
    remediationItems: AdaptiveRoadmapItem[]
  ) => void;
  resetReadingSubmission: () => void;
}

const DEFAULT_TASK_1_ESSAY = `The bar chart illustrates the energy consumption per cubic meter of desalinated water (in kWh/m³) and the percentage of brine mineral cost recovery across four desalination technologies between 2015 and 2025.

Overall, autonomous wave-driven reverse osmosis (RO) barges achieved the lowest electrical energy intensity, whereas conventional thermal multi-stage flash plants consumed the most power. Additionally, integrating zero-liquid-discharge (ZLD) electrodialysis significantly increased operational cost recovery over the decade.`;

const DEFAULT_TASK_2_ESSAY = `It is often argued that university education should focus exclusively on preparing students for practical career paths, while others believe that higher education serves a broader intellectual purpose. In my opinion, while employability is a vital outcome, universities must balance vocational training with critical thinking and theoretical inquiry.

On the one hand, many students attend university to improve their job prospects. Because the modern labor market is very competitive, graduates need good skills in technology, engineering, and finance. If universities only teach abstract philosophy, students might struggle to find a good job after graduation and pay back their tuition fees.

On the other hand, universities are not just factories for workers. A society needs people who can think critically, solve complex global problems, and question ethical norms. Furthermore, many jobs of the future do not exist yet, so adaptable analytical skills are more valuable than narrow technical training that quickly becomes obsolete.

In conclusion, higher education should integrate practical career skills with broad intellectual development so that graduates become both capable professionals and thoughtful citizens.`;

const INITIAL_ROADMAP: AdaptiveRoadmapItem[] = [
  {
    id: "node-1",
    nodeSlug: "reading-tfng-inference",
    title: "Reading: True / False / Not Given Logic Traps",
    titleUz: "Reading: True / False / Not Given mantiqiy tuzoqlari",
    module: "READING",
    reason:
      "Baseline diagnostic node for distinguishing FALSE (contradiction) from NOT GIVEN (absence).",
    reasonUz:
      "FALSE (qarama-qarshilik) va NOT GIVEN (ma'lumot yo'qligi) farqini aniqlash mashqi.",
    masteryProbability: 0.68,
    priority: "SCHEDULED",
    scheduledDate: "Today",
  },
  {
    id: "node-2",
    nodeSlug: "writing-task2-lexical-precision",
    title: "Writing Task 2: C1/C2 Academic Collocations",
    titleUz: "Writing Task 2: C1/C2 Akademik iboralar va sinonimlar",
    module: "WRITING",
    reason:
      "Target Band 7.5 requires eliminating repetitive adjectives like 'good' and 'very'.",
    reasonUz:
      "Band 7.5 uchun 'good' va 'very' kabi oddiy so'zlarni akademik birikmalar bilan almashtirish.",
    masteryProbability: 0.62,
    priority: "SCHEDULED",
    scheduledDate: "Tomorrow",
  },
];

export const useRealExamStore = create<RealExamZustandState>()(
  persist(
    (set, get) => ({
      sessionId: "cd-ielts-inspera-session-v2",
      activeTab: "reading",
      activePassageId: "passage-1",
      activeWritingTask: 2,
      themeMode: "dark",
      contrastMode: "dark",
      locale: "en",
      splitRatio: 50,
      remainingSeconds: 60 * 60, // 60:00
      isTimerPaused: false,
      lastSavedAt: null,

      currentQuestion: 1,
      questionAnswers: {
        1: "TRUE",
        4: "TRUE",
        8: "B",
      },
      flaggedByNumber: {
        2: true,
        15: true,
      },

      readingAnswers: {
        q1: "TRUE",
        q4: "TRUE",
        q8: "B",
      },
      flaggedQuestions: {
        q2: true,
        q15: true,
      },
      strikethroughOptions: {},

      highlights: [
        {
          id: "hl-initial-1",
          passageId: "passage-1",
          quote:
            "Adult neurogenesis continues within the subgranular zone of the hippocampal dentate gyrus",
          color: "yellow",
          note: "Direct evidence for Question 1 (TRUE) and Question 8 (Option B)",
          createdAt: new Date().toISOString(),
        },
        {
          id: "hl-initial-2",
          passageId: "passage-1",
          quote: "selective elimination process termed synaptic pruning",
          color: "green",
          note: "Answer for Gap-Fill Question 11",
          createdAt: new Date().toISOString(),
        },
      ],

      writingTaskType: "WRITING_TASK_2",
      writingTask1Essay: DEFAULT_TASK_1_ESSAY,
      writingEssay: DEFAULT_TASK_2_ESSAY,
      readingSubmitted: false,
      readingScore: null,
      aiGradeResult: null,
      adaptiveRoadmap: INITIAL_ROADMAP,
      xpPoints: 1450,
      streakDays: 12,

      setActiveTab: (activeTab) => set({ activeTab }),

      setActivePassageId: (activePassageId) => set({ activePassageId }),

      setActiveWritingTask: (activeWritingTask) =>
        set({
          activeWritingTask,
          writingTaskType:
            activeWritingTask === 1 ? "WRITING_TASK_1" : "WRITING_TASK_2",
        }),

      setThemeMode: (themeMode) =>
        set({
          themeMode,
          contrastMode: themeMode === "light" ? "standard" : "dark",
        }),

      cycleContrastMode: () => {
        const order: ContrastMode[] = ["standard", "dark", "high_contrast"];
        const current = get().contrastMode;
        const next = order[(order.indexOf(current) + 1) % order.length];
        set({
          contrastMode: next,
          themeMode: next === "standard" ? "light" : "dark",
        });
      },

      setLocale: (locale) => set({ locale }),

      setSplitRatio: (ratio) =>
        set({
          splitRatio: Math.max(25, Math.min(75, Math.round(ratio * 10) / 10)),
        }),

      tickTimer: () => {
        const { isTimerPaused, remainingSeconds } = get();
        if (isTimerPaused || remainingSeconds <= 0) return;
        set({ remainingSeconds: Math.max(0, remainingSeconds - 1) });
      },

      toggleTimerPause: () =>
        set((state) => ({
          isTimerPaused: !state.isTimerPaused,
          lastSavedAt: new Date().toLocaleTimeString(),
        })),

      pauseAndSaveSession: () =>
        set((state) => ({
          isTimerPaused: !state.isTimerPaused,
          lastSavedAt: new Date().toLocaleTimeString(),
        })),

      resetTimer: (seconds = 3600) =>
        set({ remainingSeconds: seconds, isTimerPaused: false }),

      setCurrentQuestion: (questionNumber) => {
        const clamped = Math.max(1, Math.min(40, questionNumber));
        const targetPassage =
          clamped <= 13
            ? "passage-1"
            : clamped <= 26
            ? "passage-2"
            : "passage-3";
        set({
          currentQuestion: clamped,
          activePassageId: targetPassage,
        });
      },

      setQuestionAnswer: (questionNumber, value) =>
        set((state) => ({
          questionAnswers: {
            ...state.questionAnswers,
            [questionNumber]: value,
          },
          readingAnswers: {
            ...state.readingAnswers,
            [`q${questionNumber}`]: value,
          },
        })),

      toggleQuestionFlag: (questionNumber) =>
        set((state) => {
          const nextVal = !state.flaggedByNumber[questionNumber];
          return {
            flaggedByNumber: {
              ...state.flaggedByNumber,
              [questionNumber]: nextVal,
            },
            flaggedQuestions: {
              ...state.flaggedQuestions,
              [`q${questionNumber}`]: nextVal,
            },
          };
        }),

      addHighlight: (quote, color, note, passageId) => {
        const trimmed = quote.trim();
        if (!trimmed) return;
        const targetPassage = passageId ?? get().activePassageId;
        const newHighlight: TextHighlight = {
          id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          passageId: targetPassage,
          quote: trimmed,
          color,
          note: note?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          highlights: [newHighlight, ...state.highlights],
        }));
      },

      updateHighlightNote: (id, note) =>
        set((state) => ({
          highlights: state.highlights.map((h) =>
            h.id === id ? { ...h, note: note.trim() || undefined } : h
          ),
        })),

      removeHighlight: (id) =>
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== id),
        })),

      clearHighlights: (selectedQuote, passageId) =>
        set((state) => {
          const normalized = selectedQuote?.trim().toLowerCase();
          if (normalized) {
            return {
              highlights: state.highlights.filter(
                (h) =>
                  !h.quote.toLowerCase().includes(normalized) &&
                  !normalized.includes(h.quote.toLowerCase())
              ),
            };
          }
          if (passageId) {
            return {
              highlights: state.highlights.filter(
                (h) => h.passageId !== passageId
              ),
            };
          }
          return { highlights: [] };
        }),

      toggleFlagQuestion: (questionId) => {
        const num = Number(questionId.replace(/\D/g, "")) || 1;
        get().toggleQuestionFlag(num);
      },

      toggleStrikethrough: (questionId, optionKey) =>
        set((state) => {
          const existing = state.strikethroughOptions[questionId] ?? [];
          const next = existing.includes(optionKey)
            ? existing.filter((k) => k !== optionKey)
            : [...existing, optionKey];
          return {
            strikethroughOptions: {
              ...state.strikethroughOptions,
              [questionId]: next,
            },
          };
        }),

      setReadingAnswer: (questionId, value) => {
        const num = Number(questionId.replace(/\D/g, "")) || 1;
        get().setQuestionAnswer(num, value);
      },

      setWritingTask1Essay: (writingTask1Essay) => set({ writingTask1Essay }),

      setWritingEssay: (writingEssay) => set({ writingEssay }),

      setAIGradeResult: (result) =>
        set((state) => {
          const updatedRoadmap = [...state.adaptiveRoadmap];
          if (result.remediation_plan) {
            const rem = result.remediation_plan;
            updatedRoadmap.unshift({
              id: `rem-${Date.now()}`,
              nodeSlug: rem.scheduled_node_slug,
              title: rem.scheduled_node_title,
              titleUz: rem.scheduled_node_title_uz,
              module: "WRITING",
              reason: `Auto-scheduled after AI Examiner scored ${rem.weakest_criterion} at Band ${result.criteria_scores[rem.weakest_criterion]}.`,
              reasonUz: `AI Ekspert ${rem.weakest_criterion} mezonini Band ${result.criteria_scores[rem.weakest_criterion]} deb baholagani sababli ertangi rejaga qo'shildi.`,
              masteryProbability: 0.42,
              priority: "URGENT_REMEDIATION",
              scheduledDate: rem.scheduled_for,
            });
          }
          return {
            aiGradeResult: result,
            xpPoints: state.xpPoints + (result.xp_awarded || 50),
            adaptiveRoadmap: updatedRoadmap.slice(0, 6),
          };
        }),

      applyReadingEvaluation: (score, remediationItems) =>
        set((state) => ({
          readingSubmitted: true,
          readingScore: score,
          xpPoints: state.xpPoints + score * 15,
          adaptiveRoadmap: [
            ...remediationItems,
            ...state.adaptiveRoadmap.filter(
              (existing) =>
                !remediationItems.some((r) => r.nodeSlug === existing.nodeSlug)
            ),
          ].slice(0, 6),
        })),

      resetReadingSubmission: () =>
        set({ readingSubmitted: false, readingScore: null }),
    }),
    {
      name: "talab_inspera_zustand_session_v2",
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

// Helper aliases for imperative calls & existing test suite
export function hydrateExamStore() {
  // Zustand persist middleware hydrates automatically on mount
}

export const examStoreActions = {
  getState: () => useRealExamStore.getState(),
  setActiveTab: (tab: "reading" | "writing") =>
    useRealExamStore.getState().setActiveTab(tab),
  setThemeMode: (mode: "light" | "dark") =>
    useRealExamStore.getState().setThemeMode(mode),
  setLocale: (locale: "en" | "uz") =>
    useRealExamStore.getState().setLocale(locale),
  tickTimer: () => useRealExamStore.getState().tickTimer(),
  toggleTimerPause: () => useRealExamStore.getState().toggleTimerPause(),
  resetTimer: (s?: number) => useRealExamStore.getState().resetTimer(s),
  addHighlight: (quote: string, color: HighlightColor, note?: string) =>
    useRealExamStore.getState().addHighlight(quote, color, note),
  removeHighlight: (id: string) =>
    useRealExamStore.getState().removeHighlight(id),
  toggleFlagQuestion: (qId: string) =>
    useRealExamStore.getState().toggleFlagQuestion(qId),
  toggleStrikethrough: (qId: string, opt: string) =>
    useRealExamStore.getState().toggleStrikethrough(qId, opt),
  setReadingAnswer: (qId: string, val: string) =>
    useRealExamStore.getState().setReadingAnswer(qId, val),
  setWritingEssay: (text: string) =>
    useRealExamStore.getState().setWritingEssay(text),
  setAIGradeResult: (res: IELTSExaminerGradeResult) =>
    useRealExamStore.getState().setAIGradeResult(res),
  applyReadingEvaluation: (
    score: number,
    items: AdaptiveRoadmapItem[]
  ) => useRealExamStore.getState().applyReadingEvaluation(score, items),
  resetReadingSubmission: () =>
    useRealExamStore.getState().resetReadingSubmission(),
};

export const useExamStore = useRealExamStore;
