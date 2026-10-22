"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Brain,
  Compass,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { LEVEL_LABELS } from "@/lib/validations/onboarding";
import { useUIPreferences } from "@/components/providers/AppProviders";

interface SubjectScoreDetail {
  nameUz: string;
  scorePercent: number;
  level: "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  correctCount: number;
  totalCount: number;
}

interface PlacementResultData {
  honorific: string;
  profile?: {
    targetUniversity?: string | null;
    targetCountry?: string | null;
    targetSatScore?: number | null;
    targetIeltsScore?: number | null;
    xpTotal?: number;
  };
  latestResult: {
    id: string;
    overallLevel: "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    scorePercent: number;
    estimatedSat: number;
    estimatedIelts: number;
    subjectScores: Record<string, SubjectScoreDetail>;
    strengths: string[];
    weaknesses: string[];
    writingSpeakingAdvice: string;
  } | null;
}

const RADAR_AXES = [
  { slug: "foundation-math", shortLabel: "Fund. Math", angleDeg: -90 },
  { slug: "sat-math", shortLabel: "SAT Math", angleDeg: -18 },
  { slug: "sat-rw", shortLabel: "SAT R&W", angleDeg: 54 },
  { slug: "ielts", shortLabel: "IELTS", angleDeg: 126 },
  { slug: "academic-writing", shortLabel: "Akademik Yozuv", angleDeg: 198 },
];

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Number((cx + radius * Math.cos(rad)).toFixed(1)),
    y: Number((cy + radius * Math.sin(rad)).toFixed(1)),
  };
}

export default function PlacementResultPage() {
  const { reduceMotion } = useUIPreferences();
  const [data, setData] = useState<PlacementResultData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const radarPolygonRef = useRef<SVGPolygonElement | null>(null);
  const barsContainerRef = useRef<HTMLDivElement | null>(null);
  const satCounterRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    fetch("/api/placement")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: PlacementResultData | null) => {
        setData(payload);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Grafiklar va ko'rsatkichlarni anime.js v4 bilan jonlantirish
  useEffect(() => {
    if (!data?.latestResult) return;

    const result = data.latestResult;
    const cx = 150;
    const cy = 145;
    const maxRadius = 92;

    const targetPoints = RADAR_AXES.map((axis) => {
      const pct = result.subjectScores[axis.slug]?.scorePercent ?? 55;
      const r = Math.max(22, (pct / 100) * maxRadius);
      const pt = polarToCartesian(cx, cy, r, axis.angleDeg);
      return `${pt.x},${pt.y}`;
    }).join(" ");

    const centerPoints = RADAR_AXES.map(() => `${cx},${cy}`).join(" ");

    if (radarPolygonRef.current) {
      if (reduceMotion) {
        radarPolygonRef.current.setAttribute("points", targetPoints);
      } else {
        radarPolygonRef.current.setAttribute("points", centerPoints);
        animate(radarPolygonRef.current, {
          points: targetPoints,
          duration: 1200,
          ease: "outElastic(1, .7)",
        });
      }
    }

    if (barsContainerRef.current && !reduceMotion) {
      const bars = barsContainerRef.current.querySelectorAll<HTMLElement>("[data-bar-fill]");
      bars.forEach((bar) => {
        const targetWidth = bar.dataset.targetWidth || "60%";
        animate(bar, {
          width: ["0%", targetWidth],
          duration: 1000,
          delay: stagger(110),
          ease: "outQuart",
        });
      });
    }

    if (satCounterRef.current) {
      if (reduceMotion) {
        satCounterRef.current.textContent = String(result.estimatedSat);
      } else {
        const obj = { val: 800 };
        animate(obj, {
          val: result.estimatedSat,
          duration: 1100,
          ease: "outQuart",
          onUpdate: () => {
            if (satCounterRef.current) {
              satCounterRef.current.textContent = String(Math.round(obj.val));
            }
          },
        });
      }
    }
  }, [data, reduceMotion]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">Diagnostika tahlili tayyorlanmoqda...</p>
      </div>
    );
  }

  const result = data?.latestResult;
  const honorific = data?.honorific ?? "Aziz o'quvchi";

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="glass-card p-8">
          <h1 className="text-2xl font-extrabold text-fg">
            Hali saralash testi topshirilmagan
          </h1>
          <p className="mt-2 text-sm text-fg-muted">
            Shaxsiy darajangiz va grafiklarni ko&apos;rish uchun qisqa adaptiv testdan o&apos;ting.
          </p>
          <Link
            href="/placement"
            className="btn-neon mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
          >
            <span>Saralash testini boshlash</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const levelInfo = LEVEL_LABELS[result.overallLevel] ?? LEVEL_LABELS.BEGINNER;
  const targetSat = data?.profile?.targetSatScore ?? 1480;
  const targetIelts = data?.profile?.targetIeltsScore ?? 7.5;

  return (
    <div className="classroom-grid-bg mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Yuqori Natija Banneri */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <Sparkles className="h-3.5 w-3.5" />
              <span>DIAGNOSTIKA YAKUNLANDI • +100 XP</span>
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-4xl">
              Tabriklaymiz, <span className="text-gold">{honorific}</span>! Sizning
              boshlang&apos;ich darajangiz:{" "}
              <span className="text-neon">{levelInfo.uz}</span>
            </h1>
            <p className="mt-1.5 max-w-3xl text-xs text-fg-muted sm:text-sm">
              {levelInfo.desc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/placement"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-semibold text-fg-muted hover:text-fg"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Qayta topshirish</span>
            </Link>
            <Link
              href="/roadmap"
              id="go-to-roadmap-btn"
              className="btn-neon inline-flex items-center gap-2 px-6 py-3 text-xs font-bold sm:text-sm"
            >
              <span>12 Oylik Yo&apos;l Xaritasini Ochish</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Asosiy 4 ko'rsatkich kartochkasi */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neon/40 bg-neon-soft/30 p-4">
            <span className="text-xs font-semibold text-fg-muted">Aniqlangan Daraja</span>
            <p className="mt-1 text-xl font-extrabold text-neon">{levelInfo.uz}</p>
            <span className="mt-1 block font-mono text-xs text-fg-muted">
              Umumiy ko&apos;rsatkich: {result.scorePercent}%
            </span>
          </div>

          <div className="rounded-xl border border-border bg-elevated/60 p-4">
            <span className="text-xs font-semibold text-fg-muted">
              Hozirgi SAT Salohiyati
            </span>
            <p className="mt-1 font-mono text-2xl font-extrabold text-fg">
              <span ref={satCounterRef}>{result.estimatedSat}</span>{" "}
              <span className="text-xs font-normal text-fg-muted">/ Maqsad: {targetSat}</span>
            </p>
            <span className="mt-1 block text-xs text-neon">
              12 oyda +{Math.max(120, targetSat - result.estimatedSat)} ball o&apos;sish rejasi
            </span>
          </div>

          <div className="rounded-xl border border-border bg-elevated/60 p-4">
            <span className="text-xs font-semibold text-fg-muted">
              Hozirgi IELTS Salohiyati
            </span>
            <p className="mt-1 font-mono text-2xl font-extrabold text-gold">
              Band {result.estimatedIelts.toFixed(1)}{" "}
              <span className="text-xs font-normal text-fg-muted">
                / Maqsad: {targetIelts.toFixed(1)}
              </span>
            </p>
            <span className="mt-1 block text-xs text-gold">
              4 ko&apos;nikma bo&apos;yicha tizimli o&apos;sish
            </span>
          </div>

          <div className="rounded-xl border border-gold/40 bg-gold-soft/30 p-4">
            <span className="text-xs font-semibold text-fg-muted">Maqsadli Yo&apos;nalish</span>
            <p className="mt-1 truncate text-base font-extrabold text-fg">
              {data?.profile?.targetUniversity ?? "Top Xorijiy Universitet"}
            </p>
            <span className="mt-1 block text-xs text-gold">
              <Trophy className="mr-1 inline h-3.5 w-3.5" />
              Jami XP: {data?.profile?.xpTotal ?? 200} XP
            </span>
          </div>
        </div>

        {/* ====================================================================
            KO'RINADIGAN GRAFIKLAR (SVG Pentagon Radar + Ustunli Mastery Grafik)
            ==================================================================== */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* 1. SVG Radar Grafik */}
          <div className="rounded-2xl border border-border bg-canvas/80 p-5 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-fg">
                <Compass className="h-4 w-4 text-neon" />
                <span>5 Yo&apos;nalishli Bilim Xaritasi (Radar)</span>
              </h2>
              <span className="font-mono text-xs text-neon">anime.js SVG</span>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <svg
                viewBox="0 0 300 285"
                className="h-64 w-full max-w-[300px] overflow-visible"
                role="img"
                aria-label="Fanlar kesimida radar grafigi"
              >
                {/* Setka halqalari (33%, 66%, 100%) */}
                {[30, 60, 92].map((r) => {
                  const ringPts = RADAR_AXES.map((a) => {
                    const pt = polarToCartesian(150, 145, r, a.angleDeg);
                    return `${pt.x},${pt.y}`;
                  }).join(" ");
                  return (
                    <polygon
                      key={r}
                      points={ringPts}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.22)"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* O'q chiziqlari va yozuvlar */}
                {RADAR_AXES.map((axis) => {
                  const endPt = polarToCartesian(150, 145, 92, axis.angleDeg);
                  const labelPt = polarToCartesian(150, 145, 116, axis.angleDeg);
                  return (
                    <g key={axis.slug}>
                      <line
                        x1={150}
                        y1={145}
                        x2={endPt.x}
                        y2={endPt.y}
                        stroke="rgba(148, 163, 184, 0.25)"
                        strokeWidth="1"
                      />
                      <text
                        x={labelPt.x}
                        y={labelPt.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="currentColor"
                        className="font-mono text-[10px] font-bold opacity-85"
                      >
                        {axis.shortLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Foydalanuvchi natijasi ko'pburchagi */}
                <polygon
                  ref={radarPolygonRef}
                  points="150,145 150,145 150,145 150,145 150,145"
                  fill="rgba(16, 185, 129, 0.28)"
                  stroke="#00E676"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          {/* 2. Fanlar kesimidagi ustunli (bar) grafik */}
          <div
            ref={barsContainerRef}
            className="rounded-2xl border border-border bg-canvas/80 p-5 lg:col-span-7"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-fg">
                <BarChart3 className="h-4 w-4 text-gold" />
                <span>Fanlar Bo&apos;yicha Aniq Ko&apos;rsatkichlar</span>
              </h2>
              <span className="text-xs text-fg-muted">Noldan → Yuqorigacha</span>
            </div>

            <div className="mt-4 space-y-4">
              {Object.entries(result.subjectScores).map(([slug, item]) => {
                const badge = LEVEL_LABELS[item.level]?.uz ?? item.level;
                return (
                  <div key={slug} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-fg">{item.nameUz}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-elevated px-2 py-0.5 font-mono text-[11px] text-gold">
                          {badge}
                        </span>
                        <span className="font-mono font-bold text-neon">
                          {item.scorePercent}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-elevated">
                      <div
                        data-bar-fill
                        data-target-width={`${item.scorePercent}%`}
                        style={{ width: `${item.scorePercent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-neon via-emerald-400 to-gold"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ====================================================================
            KUCHLI VA ZAIF TOMONLAR + AI MURABBIY WRITING/SPEAKING TAVSIYASI
            ==================================================================== */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neon/35 bg-neon-soft/15 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-neon">
              <CheckCircle2 className="h-4 w-4" />
              <span>Kuchli tomonlaringiz (Tayanch ustunlar)</span>
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-fg sm:text-sm">
              {result.strengths.map((str) => (
                <li key={str} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gold/35 bg-gold-soft/15 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gold">
              <AlertTriangle className="h-4 w-4" />
              <span>1-navbatda kuchaytiriladigan yo&apos;nalishlar</span>
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-fg sm:text-sm">
              {result.weaknesses.map((wk) => (
                <li key={wk} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Murabbiy Xulosasi */}
        <div className="mt-6 rounded-2xl border border-border bg-elevated/70 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-soft text-neon">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-fg">
                AI Murabbiyning Writing & Speaking diagnostik xulosasi
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-fg-muted sm:text-sm">
                {result.writingSpeakingAdvice}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
