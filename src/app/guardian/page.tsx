"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Award,
  BookOpen,
  CalendarCheck,
  Flame,
  GraduationCap,
  HeartHandshake,
  Search,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";

interface GuardianReportPayload {
  student: {
    name: string;
    gender: string;
    honorific: string;
    grade: string;
    region: string;
    guardianShareCode: string;
    dailyMinutes: number;
    reminderTime: string;
  };
  levelInfo: {
    level: number;
    titleUz: string;
    currentXp: number;
  };
  streakDays: number;
  goalDistance: {
    targetUniversity: string;
    satCurrent: number;
    satTarget: number;
    satProgressPct: number;
    ieltsCurrent: number;
    ieltsTarget: number;
    ieltsProgressPct: number;
    overallReadinessPct: number;
  };
  academicSummary: {
    totalAttempts: number;
    accuracyPct: number;
    weeklyPlannedHours: number;
    teacherNoteUz: string;
  };
}

function GuardianViewInner() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";
  const [codeInput, setCodeInput] = useState(initialCode);
  const [data, setData] = useState<GuardianReportPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGuardianReport = async (code?: string) => {
    setLoading(true);
    try {
      const query = code?.trim() ? `?code=${encodeURIComponent(code.trim())}` : "";
      const res = await fetch(`/api/guardian${query}`);
      if (res.ok) {
        const payload = (await res.json()) as GuardianReportPayload;
        setData(payload);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuardianReport(initialCode);
  }, [initialCode]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">
          Ota-ona va ustoz hisoboti yuklanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3.5 py-1 text-xs font-bold text-gold">
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>OTA-ONA VA USTOZ KO&apos;RINISHI • SHAXSIY HISOBOT</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              O&apos;quvchi Progressini Kuzatish Markazi
            </h1>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadGuardianReport(codeInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Maxsus o'quvchi kodi..."
              className="rounded-xl border border-border bg-surface px-3.5 py-2 font-mono text-xs text-fg"
            />
            <button
              type="submit"
              className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Tekshirish</span>
            </button>
          </form>
        </div>

        {data && (
          <div className="mt-6 space-y-6">
            {/* O'quvchi asosiy kartasi */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-neon/40 bg-neon-soft/15 p-4">
                <span className="text-xs font-bold text-neon">O&apos;quvchi</span>
                <div className="mt-1 text-lg font-extrabold text-fg">
                  {data.student.name}
                </div>
                <span className="text-xs text-fg-muted">
                  {data.student.grade} • {data.student.region}
                </span>
              </div>

              <div className="rounded-2xl border border-gold/40 bg-gold-soft/15 p-4">
                <span className="text-xs font-bold text-gold">
                  Daraja va Tajriba
                </span>
                <div className="mt-1 font-mono text-xl font-extrabold text-fg">
                  {data.levelInfo.currentXp} XP ({data.levelInfo.level}-daraja)
                </div>
                <span className="text-xs text-gold">{data.levelInfo.titleUz}</span>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <span className="text-xs font-bold text-fg-muted">
                  Kunlik Intizom (Streak)
                </span>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-xl font-extrabold text-neon">
                  <Flame className="h-5 w-5" />
                  <span>{data.streakDays} kun uzluksiz</span>
                </div>
                <span className="text-xs text-fg-muted">
                  Kuniga {data.student.dailyMinutes} daq ({data.academicSummary.weeklyPlannedHours} soat/hafta)
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <span className="text-xs font-bold text-fg-muted">
                  O&apos;rtacha Aniqlik
                </span>
                <div className="mt-1 font-mono text-xl font-extrabold text-fg">
                  {data.academicSummary.accuracyPct}%
                </div>
                <span className="text-xs text-fg-muted">
                  Maqsadga tayyorgarlik: {data.goalDistance.overallReadinessPct}%
                </span>
              </div>
            </div>

            {/* Maqsadli Universitet va Ball o'sishi */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neon">
                  <Target className="h-4 w-4" />
                  <span>Digital SAT Ko&apos;rsatkichi</span>
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-sm font-bold text-fg">
                  <span>Joriy: {data.goalDistance.satCurrent}</span>
                  <span className="text-neon">
                    Maqsad: {data.goalDistance.satTarget}
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-neon"
                    style={{ width: `${data.goalDistance.satProgressPct}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gold">
                  <GraduationCap className="h-4 w-4" />
                  <span>IELTS Academic Ko&apos;rsatkichi</span>
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-sm font-bold text-fg">
                  <span>Joriy Band: {data.goalDistance.ieltsCurrent}</span>
                  <span className="text-gold">
                    Maqsad Band: {data.goalDistance.ieltsTarget}
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${data.goalDistance.ieltsProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Ustoz va AI Murabbiy Xulosasi (Ota-ona uchun tavsiyanoma) */}
            <div
              id="guardian-teacher-note"
              className="rounded-2xl border border-neon/40 bg-neon-soft/15 p-5"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neon">
                <ShieldCheck className="h-4 w-4" />
                <span>Ota-ona va Ustoz Uchun Haftalik Pedagogik Xulosa</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fg">
                {data.academicSummary.teacherNoteUz}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuardianPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-sm text-fg-muted">Yuklanmoqda...</p>
        </div>
      }
    >
      <GuardianViewInner />
    </Suspense>
  );
}
