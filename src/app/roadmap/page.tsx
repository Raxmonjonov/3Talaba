"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import {
  Sparkles,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Compass,
  Flame,
  Trophy,
  BookOpen,
  PenTool,
  Sliders,
  Zap,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";
import { LEVEL_LABELS } from "@/lib/validations/onboarding";
import type {
  DailyTimeBreakdown,
  MonthOverview,
} from "@/lib/curriculum/roadmap-generator";

interface RoadmapItemDTO {
  id: string;
  monthNumber: number;
  weekNumber: number;
  dayOfWeek: number;
  titleUz: string;
  descriptionUz: string;
  taskType: "LESSON" | "PRACTICE" | "REVIEW" | "MOCK_TEST" | "WRITING";
  durationMinutes: number;
  xpReward: number;
  isCompleted: boolean;
}

interface RoadmapApiResponse {
  honorific: string;
  message?: string;
  profile?: {
    targetUniversity?: string | null;
    targetSatScore?: number | null;
    targetIeltsScore?: number | null;
    xpTotal?: number;
  };
  roadmap: {
    id: string;
    dailyMinutes: number;
    startLevel: "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    targetSummary: string;
    items: RoadmapItemDTO[];
  };
  months: MonthOverview[];
  timeBreakdown: DailyTimeBreakdown;
  annualStudyHours: number;
}

const STANDARD_PRESETS = [
  { minutes: 30, label: "30 daqiqa", note: "0.5 soat • Yengil marom" },
  { minutes: 60, label: "60 daqiqa (1 soat)", note: "Oltin o'rtalik" },
  { minutes: 90, label: "90 daqiqa (1.5 soat)", note: "Tezkor o'sish" },
  { minutes: 120, label: "120 daqiqa (2 soat)", note: "Standart maksimum" },
];

const DAY_NAMES = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];

export default function RoadmapPage() {
  const { reduceMotion } = useUIPreferences();
  const [data, setData] = useState<RoadmapApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingTime, setUpdatingTime] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Kunlik vaqt boshqaruvi (2 soatgacha standart + qo'lda kiritish)
  const [customMinutesInput, setCustomMinutesInput] = useState<string>("180");
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedWeekInMonth, setSelectedWeekInMonth] = useState<number>(1);

  const tasksContainerRef = useRef<HTMLDivElement | null>(null);
  const annualHoursRef = useRef<HTMLSpanElement | null>(null);
  const timelinePathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: RoadmapApiResponse | null) => {
        if (payload) {
          setData(payload);
          if (payload.roadmap.dailyMinutes > 120) {
            setCustomMinutesInput(String(payload.roadmap.dailyMinutes));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // SVG 12 oylik chiziq va yillik soat sanalishi animatsiyasi
  useEffect(() => {
    if (!data) return;

    if (annualHoursRef.current) {
      if (reduceMotion) {
        annualHoursRef.current.textContent = String(data.annualStudyHours);
      } else {
        const obj = { val: Math.max(50, data.annualStudyHours - 120) };
        animate(obj, {
          val: data.annualStudyHours,
          duration: 750,
          ease: "outQuart",
          onUpdate: () => {
            if (annualHoursRef.current) {
              annualHoursRef.current.textContent = String(Math.round(obj.val));
            }
          },
        });
      }
    }

    if (timelinePathRef.current && !reduceMotion) {
      const len = timelinePathRef.current.getTotalLength?.() || 800;
      timelinePathRef.current.style.strokeDasharray = `${len}`;
      timelinePathRef.current.style.strokeDashoffset = `${len}`;
      animate(timelinePathRef.current, {
        strokeDashoffset: [len, 0],
        duration: 1100,
        ease: "inOutQuart",
      });
    }
  }, [data, reduceMotion]);

  // Oy yoki hafta almashganda kunlik vazifalar stagger animatsiyasi
  useEffect(() => {
    if (reduceMotion || !tasksContainerRef.current) return;
    const cards = tasksContainerRef.current.querySelectorAll<HTMLElement>("[data-day-card]");
    if (cards.length > 0) {
      animate(cards, {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 480,
        delay: stagger(65),
        ease: "outExpo",
      });
    }
  }, [selectedMonth, selectedWeekInMonth, data?.roadmap.dailyMinutes, reduceMotion]);

  const handleApplyDailyMinutes = async (minutes: number) => {
    const clamped = Math.max(15, Math.min(480, Math.round(minutes)));
    setUpdatingTime(true);
    setStatusBanner(null);

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyMinutes: clamped }),
      });

      const updated = (await res.json()) as RoadmapApiResponse & { error?: string };
      if (res.ok && updated.roadmap) {
        setData(updated);
        setStatusBanner(
          updated.message ??
            `Reja kunlik ${clamped} daqiqaga muvaffaqiyatli moslashtirildi!`,
        );
      }
    } finally {
      setUpdatingTime(false);
    }
  };

  const handleToggleTask = async (item: RoadmapItemDTO) => {
    const nextState = !item.isCompleted;
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        roadmap: {
          ...prev.roadmap,
          items: prev.roadmap.items.map((it) =>
            it.id === item.id ? { ...it, isCompleted: nextState } : it,
          ),
        },
      };
    });

    await fetch("/api/roadmap", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, isCompleted: nextState }),
    }).catch(() => {});
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">
          12 oylik shaxsiy yo&apos;l xaritangiz tuzilmoqda...
        </p>
      </div>
    );
  }

  const { roadmap, months, timeBreakdown, honorific } = data;
  const currentMonthMeta =
    months.find((m) => m.monthNumber === selectedMonth) ?? months[0];

  // Tanlangan oyning vazifalari (hafta raqamiga moslab sarlavha bilan ko'rsatiladi)
  const monthTasks = roadmap.items.filter((it) => it.monthNumber === selectedMonth);
  const globalWeekNumber = (selectedMonth - 1) * 4 + selectedWeekInMonth;
  const startLevelLabel = LEVEL_LABELS[roadmap.startLevel]?.uz ?? "Boshlang'ich";

  return (
    <div className="classroom-grid-bg mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ====================================================================
          1. YUQORI SARLAVHA VA 12 OYLIK SVG PROGRESS TRAJEKTORIYASI
          ==================================================================== */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <Compass className="h-3.5 w-3.5" />
              <span>12 OYLIK SHAXSIY YO&apos;L XARITASI (48 HAFTA)</span>
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-4xl">
              <span className="text-gold">{honorific}</span>, universitet sari 365 kunlik
              aniq rejangiz
            </h1>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">
              Boshlang&apos;ich nuqta:{" "}
              <strong className="text-neon">{startLevelLabel}</strong> •{" "}
              {roadmap.targetSummary}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-neon/40 bg-neon-soft px-4 py-2.5 text-center">
              <span
                ref={annualHoursRef}
                className="block font-mono text-2xl font-extrabold text-neon"
              >
                {data.annualStudyHours}
              </span>
              <span className="text-[11px] text-fg-muted">Yillik sof o&apos;quv soati</span>
            </div>
            <Link
              href="/learn"
              className="btn-neon inline-flex items-center gap-2 px-5 py-3 text-xs font-bold sm:text-sm"
            >
              <span>Bugungi darsni boshlash</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Interaktiv SVG 12 oylik chiziqli timeline */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-canvas/80 p-4">
          <svg
            viewBox="0 0 880 76"
            className="h-20 min-w-[680px] w-full"
            role="img"
            aria-label="12 oylik bosqichlar chizig'i"
          >
            <path
              ref={timelinePathRef}
              d="M 35 42 L 845 42"
              stroke="url(#roadmapLineGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="roadmapLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="55%" stopColor="#00E676" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {months.map((m, idx) => {
              const cx = 35 + idx * 73.6;
              const isSelected = m.monthNumber === selectedMonth;
              return (
                <g
                  key={m.monthNumber}
                  onClick={() => setSelectedMonth(m.monthNumber)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={cx}
                    cy={42}
                    r={isSelected ? 11 : 7}
                    fill={isSelected ? "#F59E0B" : "#10B981"}
                    stroke="#050A0E"
                    strokeWidth="2.5"
                  />
                  <text
                    x={cx}
                    y={18}
                    textAnchor="middle"
                    fill={isSelected ? "#F59E0B" : "currentColor"}
                    className="font-mono text-[11px] font-bold"
                  >
                    {m.monthNumber}-oy
                  </text>
                  <text
                    x={cx}
                    y={66}
                    textAnchor="middle"
                    fill="currentColor"
                    className="font-mono text-[9px] opacity-70"
                  >
                    {m.totalHoursInMonth} soat
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ====================================================================
          2. KUNLIK O'QISH VAQTI TANLASH PANELI
             Standart <= 2 soat (30, 60, 90, 120 daq) + Maxsus Qo'lda Kiritish (> 120 daq)
          ==================================================================== */}
      <div className="glass-card mt-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-fg sm:text-xl">
              <Clock className="h-5 w-5 text-gold" />
              <span>Kunlik o&apos;qish vaqtini tanlang (Reja avtomatik moslashadi)</span>
            </h2>
            <p className="mt-0.5 text-xs text-fg-muted sm:text-sm">
              Standart variantlar kuniga <strong>eng ko&apos;pi bilan 2 soat (120 daqiqa)</strong>.
              Undan ko&apos;proq vaqt ajratmoqchi bo&apos;lsangiz, o&apos;ng tomondagi maxsus
              maydonga qo&apos;lda kiriting.
            </p>
          </div>
          <span
            id="current-daily-minutes-badge"
            className={`rounded-xl border px-3.5 py-1.5 font-mono text-xs font-extrabold ${
              timeBreakdown.isCustomOverTwoHours
                ? "border-gold bg-gold-soft text-gold"
                : "border-neon bg-neon-soft text-neon"
            }`}
          >
            Faol rejim: Kuniga {roadmap.dailyMinutes} daqiqa (
            {(roadmap.dailyMinutes / 60).toFixed(1)} soat)
          </span>
        </div>

        {statusBanner && (
          <div
            role="status"
            id="roadmap-recalc-banner"
            className="mt-4 flex items-center gap-2 rounded-xl border border-neon bg-neon-soft/40 px-4 py-3 text-xs font-bold text-neon sm:text-sm"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          {/* Chap: 4 ta standart variant (<= 120 daqiqa) */}
          <div className="lg:col-span-7">
            <span className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-neon">
              Standart variantlar (Kuniga 2 soatgacha):
            </span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STANDARD_PRESETS.map((preset) => {
                const isSelected = roadmap.dailyMinutes === preset.minutes;
                return (
                  <button
                    key={preset.minutes}
                    type="button"
                    disabled={updatingTime}
                    data-preset-minutes={preset.minutes}
                    onClick={() => handleApplyDailyMinutes(preset.minutes)}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-neon bg-neon-soft shadow-neon"
                        : "border-border bg-surface hover:border-neon/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-extrabold text-fg">
                        {preset.label}
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-neon" />}
                    </div>
                    <p className="mt-1 text-[11px] text-fg-muted">{preset.note}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* O'ng: 2 soatdan ko'p vaqtni qo'lda kiritish maxsus maydoni */}
          <div className="rounded-xl border border-gold/40 bg-gold-soft/25 p-4 lg:col-span-5">
            <label
              htmlFor="roadmap-custom-minutes-input"
              className="block text-xs font-bold uppercase tracking-wider text-gold"
            >
              ⚡ 2 soatdan ko&apos;proq vaqtni qo&apos;lda kiritish (Maxsus maydon)
            </label>
            <p className="mt-1 text-xs text-fg-muted">
              Kuniga 125 daqiqadan 480 daqiqagacha o&apos;zingiz kiriting:
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <input
                id="roadmap-custom-minutes-input"
                type="number"
                min={125}
                max={480}
                step={15}
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                className="w-28 rounded-xl border border-gold bg-canvas px-3.5 py-2 text-center font-mono text-sm font-extrabold text-fg focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <span className="text-xs font-semibold text-fg">daqiqa</span>
              <button
                type="button"
                id="roadmap-apply-custom-btn"
                disabled={updatingTime}
                onClick={() => handleApplyDailyMinutes(Number(customMinutesInput) || 180)}
                className="btn-gold ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Qo&apos;lda kiritishni qo&apos;llash</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tanlangan vaqtning kunlik taqsimoti */}
        <div className="mt-5 grid gap-3 rounded-xl border border-border bg-canvas/70 p-4 sm:grid-cols-4">
          <div>
            <span className="text-[11px] text-fg-muted">Nazariya va Misollar</span>
            <p className="font-mono text-base font-extrabold text-fg">
              {timeBreakdown.theoryMinutes} daqiqa / kun
            </p>
          </div>
          <div>
            <span className="text-[11px] text-fg-muted">Adaptiv Mashqlar</span>
            <p className="font-mono text-base font-extrabold text-neon">
              {timeBreakdown.practiceMinutes} daqiqa ({timeBreakdown.dailyQuestionCount} ta
              savol)
            </p>
          </div>
          <div>
            <span className="text-[11px] text-fg-muted">AI Murabbiy Tahlili</span>
            <p className="font-mono text-base font-extrabold text-gold">
              {timeBreakdown.aiReviewMinutes} daqiqa / kun
            </p>
          </div>
          <div>
            <span className="text-[11px] text-fg-muted">Fokus & Sog&apos;lom Tanaffus</span>
            <p className="font-mono text-base font-extrabold text-fg">
              {timeBreakdown.pomodoroSessions} blok • +{timeBreakdown.restBreakMinutes} daq
              dam
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-fg-muted">
          💡 <strong>AI Ustoz tavsiyasi:</strong> {timeBreakdown.scheduleAdviceUz}
        </p>
      </div>

      {/* ====================================================================
          3. OYLAR (1..12) -> HAFTALAR (1..4) -> KUNLIK VAZIFALAR
          ==================================================================== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Chap ustun: 12 oy ro'yxati */}
        <div className="glass-card p-5 lg:col-span-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-fg">
            <Calendar className="h-4 w-4 text-neon" />
            <span>12 Oylik Bosqichlar</span>
          </h3>

          <div className="mt-4 space-y-2">
            {months.map((m) => {
              const active = m.monthNumber === selectedMonth;
              return (
                <button
                  key={m.monthNumber}
                  type="button"
                  data-month-btn={m.monthNumber}
                  onClick={() => {
                    setSelectedMonth(m.monthNumber);
                    setSelectedWeekInMonth(1);
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    active
                      ? "border-neon bg-neon-soft shadow-neon"
                      : "border-border bg-surface/70 hover:border-neon/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-gold">
                      {m.quarterTitleUz}
                    </span>
                    <span className="font-mono text-[11px] text-fg-muted">
                      {m.totalHoursInMonth} soat
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-extrabold text-fg sm:text-sm">
                    {m.titleUz}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neon">{m.milestoneTargetUz}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* O'ng ustun: Tanlangan oyning haftalari va kunlik vazifalari */}
        <div className="glass-card p-6 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-gold">
                {currentMonthMeta.quarterTitleUz} • {currentMonthMeta.milestoneTargetUz}
              </span>
              <h3 className="mt-1 text-xl font-extrabold text-fg">
                {currentMonthMeta.titleUz}
              </h3>
              <p className="mt-1 text-xs text-fg-muted">{currentMonthMeta.focusUz}</p>
            </div>
          </div>

          {/* 4 ta hafta tanlagichi */}
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((wk) => {
              const active = selectedWeekInMonth === wk;
              const absWeek = (selectedMonth - 1) * 4 + wk;
              return (
                <button
                  key={wk}
                  type="button"
                  onClick={() => setSelectedWeekInMonth(wk)}
                  className={`rounded-xl border py-2.5 text-center text-xs font-bold transition-all ${
                    active
                      ? "border-gold bg-gold-soft text-gold shadow-gold"
                      : "border-border bg-surface text-fg-muted hover:text-fg"
                  }`}
                >
                  <span className="block">{wk}-hafta</span>
                  <span className="font-mono text-[10px] opacity-75">
                    (Yillik #{absWeek}-hafta)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Kunlik vazifalar (Dushanba..Shanba + Yakshanba dam olish) */}
          <div ref={tasksContainerRef} className="mt-5 space-y-3">
            {monthTasks.map((task, idx) => {
              const dayName = DAY_NAMES[idx % DAY_NAMES.length];
              return (
                <div
                  key={task.id}
                  data-day-card
                  className={`flex flex-col justify-between gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center ${
                    task.isCompleted
                      ? "border-neon/60 bg-neon-soft/20"
                      : "border-border bg-canvas/80 hover:border-neon/40"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-elevated px-2.5 py-0.5 font-mono text-xs font-bold text-neon">
                        {dayName} (#{globalWeekNumber}-hafta)
                      </span>
                      <span className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-fg-muted">
                        {task.durationMinutes} daqiqa
                      </span>
                      <span className="rounded-md bg-gold-soft px-2 py-0.5 font-mono text-[11px] font-bold text-gold">
                        +{task.xpReward} XP
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-fg sm:text-base">
                      {task.titleUz}
                    </h4>
                    <p className="text-xs text-fg-muted">{task.descriptionUz}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                        task.isCompleted
                          ? "border-neon bg-neon text-white"
                          : "border-border bg-surface text-fg hover:border-neon"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{task.isCompleted ? "Bajarildi" : "Belgilash"}</span>
                    </button>

                    <Link
                      href="/learn"
                      className="inline-flex items-center gap-1 rounded-xl border border-neon/40 bg-neon-soft px-3.5 py-2 text-xs font-bold text-neon hover:bg-neon hover:text-white"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Dars</span>
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Yakshanba — Tiklanish kuni */}
            <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-elevated/30 px-4 py-3 text-xs text-fg-muted">
              <span>
                🌿 <strong>Yakshanba — Energiyani tiklash va ixtiyoriy takrorlash kuni:</strong>{" "}
                Charchamasdan 12 oy davom etish uchun haftada 1 kun miyaga dam beramiz.
              </span>
              <span className="font-mono font-bold text-neon">Streak saqlanadi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
