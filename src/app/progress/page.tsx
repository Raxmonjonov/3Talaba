"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  Crown,
  Flame,
  GraduationCap,
  Layers,
  Shield,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";
import type {
  ChartPoint,
  GoalDistanceInfo,
  LeaderboardEntry,
  LevelProgressInfo,
  SubjectMasteryItem,
} from "@/lib/gamification/progress-engine";

interface BadgeViewItem {
  slug: string;
  titleUz: string;
  descriptionUz: string;
  icon: string;
  xpBonus: number;
  unlocked: boolean;
  earnedAt: string | null;
}

interface ProgressPayload {
  student: {
    name: string;
    gender: "FEMALE" | "MALE";
    honorific: string;
    region: string;
    dailyMinutes: number;
  };
  levelInfo: LevelProgressInfo;
  streak: {
    currentStreak: number;
    longestStreak: number;
    freezeCount: number;
  };
  goalDistance: GoalDistanceInfo;
  subjectMastery: SubjectMasteryItem[];
  weeklySeries: ChartPoint[];
  monthlySeries: ChartPoint[];
  badges: BadgeViewItem[];
  leaderboard: LeaderboardEntry[];
}

export default function ProgressDashboardPage() {
  const { reduceMotion } = useUIPreferences();
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [chartRange, setChartRange] = useState<"weekly" | "monthly">("weekly");
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  const xpCounterRef = useRef<HTMLSpanElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProgress() {
      const res = await fetch("/api/progress");
      if (res.ok) {
        const payload = (await res.json()) as ProgressPayload;
        setData(payload);
      }
    }
    fetchProgress();
  }, []);

  useEffect(() => {
    if (!data || reduceMotion) return;

    if (xpCounterRef.current) {
      const counter = { val: 0 };
      animate(counter, {
        val: data.levelInfo.currentXp,
        duration: 1000,
        ease: "outExpo",
        onUpdate: () => {
          if (xpCounterRef.current) {
            xpCounterRef.current.textContent = String(Math.round(counter.val));
          }
        },
      });
    }

    if (chartContainerRef.current) {
      const bars = chartContainerRef.current.querySelectorAll(".progress-chart-bar");
      if (bars.length > 0) {
        animate(bars, {
          scaleY: [0.1, 1],
          opacity: [0.3, 1],
          delay: stagger(65),
          duration: 650,
          ease: "outQuad",
        });
      }
    }
  }, [data, chartRange, reduceMotion]);

  if (!data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">
          Progress va gamifikatsiya paneli yuklanmoqda...
        </p>
      </div>
    );
  }

  const {
    student,
    levelInfo,
    streak,
    goalDistance,
    subjectMastery,
    weeklySeries,
    monthlySeries,
    badges,
    leaderboard,
  } = data;

  const activeSeries = chartRange === "weekly" ? weeklySeries : monthlySeries;
  const maxChartXp = Math.max(...activeSeries.map((p) => p.xp), 100);
  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* ====================================================================
          1. GAMIFIKATSIYA HERO PANELI (XP, DARAJA, STREAK, NISHONLAR)
          ==================================================================== */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <Sparkles className="h-3.5 w-3.5" />
              <span>GAMIFIKATSIYA VA PROGRESS PANELI</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              <span className="text-gold">{student.honorific}</span> ({student.name}
              ) — O&apos;sish Ko&apos;rsatkichlaringiz
            </h1>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">
              Unvoningiz:{" "}
              <strong className="text-neon">
                {levelInfo.level}-daraja • {levelInfo.titleUz}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/learn"
              className="btn-neon inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
            >
              <BookOpen className="h-4 w-4" />
              <span>Darsni davom ettirish</span>
            </Link>
            <Link
              href="/coach"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold-soft px-4 py-2.5 text-xs font-bold text-gold hover:bg-gold hover:text-canvas"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Murabbiy</span>
            </Link>
          </div>
        </div>

        {/* 4 ta asosiy Gamifikatsiya ko'rsatkichi */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* XP va Daraja */}
          <div className="rounded-2xl border border-gold/40 bg-gold-soft/15 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gold">
                Jami Tajriba (XP)
              </span>
              <Trophy className="h-5 w-5 text-gold" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-fg">
              <span ref={xpCounterRef}>{levelInfo.currentXp}</span>{" "}
              <span className="text-base text-gold">XP</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${levelInfo.progressPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-fg-muted">
              {levelInfo.level + 1}-darajagacha yana{" "}
              <strong className="text-gold">{levelInfo.xpToNextLevel} XP</strong>{" "}
              qoldi
            </p>
          </div>

          {/* Kunlik Streak */}
          <div
            id="streak-status-card"
            className="rounded-2xl border border-neon/40 bg-neon-soft/15 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neon">
                Kunlik Streak Zanjiri
              </span>
              <Flame className="h-5 w-5 text-neon" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-fg">
              {streak.currentStreak}{" "}
              <span className="text-base text-neon">kun</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-fg-muted">
              <span>Rekord: {streak.longestStreak} kun</span>
              <span className="inline-flex items-center gap-1 text-neon">
                <Shield className="h-3.5 w-3.5" />
                {streak.freezeCount} himoya
              </span>
            </div>
          </div>

          {/* Nishonlar (Badges) */}
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-muted">
                Ochilgan Nishonlar
              </span>
              <Award className="h-5 w-5 text-gold" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-fg">
              {unlockedBadgesCount}{" "}
              <span className="text-base text-fg-muted">/ {badges.length}</span>
            </div>
            <p className="mt-2 text-[11px] text-fg-muted">
              Har bir nishon qo&apos;shimcha +50..150 XP bonus beradi
            </p>
          </div>

          {/* Maqsadga Tayyorgarlik */}
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-muted">
                OTM Tayyorgarligi
              </span>
              <GraduationCap className="h-5 w-5 text-neon" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-neon">
              {goalDistance.overallReadinessPct}%
            </div>
            <p className="mt-2 truncate text-[11px] text-fg-muted">
              Maqsad: <strong className="text-fg">{goalDistance.targetUniversity}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. MAQSADGA QANCHA QOLGANI VA HAFTALIK/OYLIK GRAFIKLAR
          ==================================================================== */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Maqsadga Qancha Qolgani (SAT va IELTS masofasi) */}
        <div
          id="goal-distance-section"
          className="glass-card flex flex-col justify-between p-6 lg:col-span-5"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gold">
              <Target className="h-4 w-4" />
              <span>Maqsadga Qancha Qolgani</span>
            </div>
            <h2 className="mt-1 text-lg font-extrabold text-fg">
              {goalDistance.targetUniversity}
            </h2>
            <p className="mt-1 text-xs text-fg-muted">
              Kunlik {student.dailyMinutes} daqiqalik reja asosida maqsadli ballga
              yaqinlashuv:
            </p>

            {/* SAT Masofasi */}
            <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-fg">Digital SAT (1600)</span>
                <span className="font-mono font-bold text-neon">
                  Joriy: {goalDistance.satCurrent} / Maqsad: {goalDistance.satTarget}
                </span>
              </div>
              <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-neon transition-all"
                  style={{ width: `${goalDistance.satProgressPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-fg-muted">
                <span>Tayyorgarlik: {goalDistance.satProgressPct}%</span>
                <span className="font-bold text-gold">
                  {goalDistance.satRemaining > 0
                    ? `Yana +${goalDistance.satRemaining} ball qoldi`
                    : "Maqsadga erishildi! 🎉"}
                </span>
              </div>
            </div>

            {/* IELTS Masofasi */}
            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-fg">IELTS Academic (9.0)</span>
                <span className="font-mono font-bold text-gold">
                  Joriy: {goalDistance.ieltsCurrent} / Maqsad:{" "}
                  {goalDistance.ieltsTarget}
                </span>
              </div>
              <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-gold transition-all"
                  style={{ width: `${goalDistance.ieltsProgressPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-fg-muted">
                <span>Tayyorgarlik: {goalDistance.ieltsProgressPct}%</span>
                <span className="font-bold text-neon">
                  {goalDistance.ieltsRemaining > 0
                    ? `Yana +${goalDistance.ieltsRemaining} Band qoldi`
                    : "Maqsadga erishildi! 🎉"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-neon/30 bg-neon-soft/10 px-4 py-3 text-xs">
            <span className="text-fg-muted">Kunlik o&apos;qish rejasi:</span>
            <Link
              href="/roadmap"
              className="font-mono font-bold text-neon hover:underline"
            >
              {student.dailyMinutes} daqiqa / kun (O&apos;zgartirish →)
            </Link>
          </div>
        </div>

        {/* Haftalik va Oylik Grafiklar */}
        <div
          id="progress-charts-section"
          className="glass-card flex flex-col justify-between p-6 lg:col-span-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neon">
                <BarChart3 className="h-4 w-4" />
                <span>O&apos;quv Faolligi va Dinamikasi</span>
              </div>
              <h2 className="mt-1 text-lg font-extrabold text-fg">
                {chartRange === "weekly"
                  ? "Haftalik XP va O'zlashtirish Grafikasi (7 kun)"
                  : "Oylik O'sish Trajektoriyasi (6 oy)"}
              </h2>
            </div>

            <div className="inline-flex rounded-xl border border-border bg-surface p-1">
              <button
                type="button"
                data-chart-range="weekly"
                onClick={() => setChartRange("weekly")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  chartRange === "weekly"
                    ? "bg-neon text-canvas"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                Haftalik
              </button>
              <button
                type="button"
                data-chart-range="monthly"
                onClick={() => setChartRange("monthly")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  chartRange === "monthly"
                    ? "bg-neon text-canvas"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                Oylik
              </button>
            </div>
          </div>

          {/* Interaktiv Ustunli Grafik */}
          <div
            ref={chartContainerRef}
            className="mt-6 grid h-56 grid-cols-7 items-end gap-3 rounded-2xl border border-border bg-canvas/80 p-5"
          >
            {activeSeries.map((pt, idx) => {
              const heightPct = Math.max(
                18,
                Math.min(100, Math.round((pt.xp / maxChartXp) * 100))
              );
              return (
                <div
                  key={idx}
                  className="flex h-full flex-col items-center justify-end gap-2"
                >
                  <span className="font-mono text-[10px] font-bold text-neon">
                    +{pt.xp}
                  </span>
                  <div className="relative flex h-36 w-full items-end justify-center rounded-xl bg-surface/70 p-1">
                    <div
                      className="progress-chart-bar w-full origin-bottom rounded-lg bg-gradient-to-t from-neon/60 to-neon shadow-neon"
                      style={{ height: `${heightPct}%` }}
                      title={`${pt.label}: ${pt.xp} XP, ${pt.minutes} daq (${pt.accuracyPct}% aniqlik)`}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-fg">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-fg-muted">
            <span>
              📊 Har bir ustun yig&apos;ilgan XP va o&apos;qilgan daqiqalar
              hajmini ifodalaydi.
            </span>
            <span className="font-mono font-bold text-gold">
              O&apos;rtacha aniqlik:{" "}
              {Math.round(
                activeSeries.reduce((acc, item) => acc + item.accuracyPct, 0) /
                  activeSeries.length
              )}
              %
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. MAVZULAR VA FANLAR BO'YICHA O'ZLASHTIRISH (SUBJECT MASTERY)
          ==================================================================== */}
      <div id="subject-mastery-section" className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neon">
              <Layers className="h-4 w-4" />
              <span>Fanlar va Mavzular Kesimida Tahlil</span>
            </div>
            <h2 className="mt-1 text-xl font-extrabold text-fg">
              5 ta Asosiy Fan Bo&apos;yicha O&apos;zlashtirish Ko&apos;rsatkichi
            </h2>
          </div>
          <Link
            href="/practice"
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-neon hover:border-neon"
          >
            Savollar Bankida mustahkamlash →
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {subjectMastery.map((subj) => (
            <div
              key={subj.slug}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-extrabold text-neon">
                    {subj.masteryPct}%
                  </span>
                  <span className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-bold text-gold">
                    {subj.statusLabelUz}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-extrabold text-fg">
                  {subj.nameUz}
                </h3>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-neon transition-all"
                    style={{ width: `${subj.masteryPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-fg-muted">
                <span>Yechilgan: {subj.attemptsCount} ta</span>
                <Link
                  href={`/practice?subject=${subj.slug}`}
                  className="font-bold text-neon hover:underline"
                >
                  Mashq →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          4. NISHONLAR VITRINASI (BADGES) VA IXTIYORIY REYTING (LEADERBOARD)
          ==================================================================== */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Nishonlar vitrinasi */}
        <div
          id="badges-showcase-section"
          className="glass-card p-6 lg:col-span-7"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gold">
                <Award className="h-4 w-4" />
                <span>Mukofotlar va Yutuqlar</span>
              </div>
              <h2 className="mt-1 text-lg font-extrabold text-fg">
                Shaxsiy Nishonlar Vitrinasi ({unlockedBadgesCount} /{" "}
                {badges.length})
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
            {badges.map((badge) => (
              <div
                key={badge.slug}
                data-badge-slug={badge.slug}
                data-badge-unlocked={String(badge.unlocked)}
                className={`rounded-2xl border p-4 transition-all ${
                  badge.unlocked
                    ? "border-gold/50 bg-gold-soft/15 shadow-gold"
                    : "border-border bg-surface/50 opacity-65"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-fg">
                    {badge.unlocked ? "🏅" : "🔒"} {badge.titleUz}
                  </span>
                  <span className="rounded-lg bg-elevated px-2.5 py-0.5 font-mono text-xs font-bold text-gold">
                    +{badge.xpBonus} XP
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">
                  {badge.descriptionUz}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reyting (Leaderboard — ixtiyoriy yoqish/o'chirish tugmasi bilan) */}
        <div
          id="leaderboard-section"
          className="glass-card p-6 lg:col-span-5"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neon">
                <Crown className="h-4 w-4 text-gold" />
                <span>Do&apos;stona Bellashuv (Ixtiyoriy)</span>
              </div>
              <h2 className="mt-1 text-lg font-extrabold text-fg">
                Respublika Peshqadamlari
              </h2>
            </div>

            <button
              type="button"
              id="toggle-leaderboard-btn"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg-muted hover:border-neon hover:text-fg"
            >
              {showLeaderboard ? "Yashirish" : "Ko'rsatish"}
            </button>
          </div>

          {showLeaderboard ? (
            <div className="mt-4 space-y-2.5">
              {leaderboard.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.name}`}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-xs transition-all ${
                    entry.isCurrentUser
                      ? "border-neon bg-neon-soft/20 shadow-neon"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-extrabold ${
                        entry.rank === 1
                          ? "bg-gold text-canvas"
                          : entry.isCurrentUser
                            ? "bg-neon text-canvas"
                            : "bg-elevated text-fg-muted"
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <div>
                      <div className="font-extrabold text-fg">
                        {entry.name}{" "}
                        {entry.isCurrentUser && (
                          <span className="ml-1 rounded bg-neon px-1.5 py-0.5 text-[10px] text-canvas">
                            SIZ
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-fg-muted">
                        {entry.region} • Maqsad: {entry.targetUniversity}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-mono text-sm font-extrabold text-gold">
                      {entry.xpTotal} XP
                    </span>
                    <span className="font-mono text-[10px] text-neon">
                      🔥 {entry.streakDays} kun
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-xs text-fg-muted">
              Reyting jadvali yashirildi. Siz faqat o&apos;z shaxsiy o&apos;sish
              tezligingizga diqqat qaratishingiz mumkin,{" "}
              <strong className="text-gold">{student.honorific}</strong>!
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neon hover:underline"
            >
              <Compass className="h-4 w-4" />
              <span>12 Oylik Yo&apos;l Xaritasiga o&apos;tish →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
