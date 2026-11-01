"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarClock,
  CheckCircle2,
  Eye,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  ListOrdered,
  PenLine,
  Shapes,
  Sigma,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import {
  DEEP_METHOD_STEPS,
  MATH_TOPICS,
  REVIEW_SCHEDULE_DAYS,
  checkMathProblemAnswer,
  type MathBranch,
  type MathTopic,
} from "@/lib/curriculum/math-deep-dive";
import { MathVisualDiagram } from "@/components/math/MathVisualDiagram";
import { FormulaSheetView, InteractiveSolversView } from "@/components/math/MathTools";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";

type TopicProgress = { solved: string[]; masteredAt?: number };
type ProgressMap = Record<string, TopicProgress>;

const STORAGE_KEY = "3talab-math-deep-progress";
const STEP_ICONS = [Lightbulb, Eye, Sigma, ListOrdered, PenLine, Brain];

function loadLocalProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as ProgressMap;
  } catch {
    return {};
  }
}

export default function MathDeepDivePage() {
  const [mainView, setMainView] = useState<"topics" | "formulas" | "solvers">("topics");
  const [branch, setBranch] = useState<MathBranch>("algebra");
  const [activeSlug, setActiveSlug] = useState<string>(MATH_TOPICS[0].slug);
  const [step, setStep] = useState<number>(1);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [xpTotal, setXpTotal] = useState<number>(0);
  const [lastXpGain, setLastXpGain] = useState<number | null>(null);

  // 1. Dastlabki yuklash: LocalStorage + Server sinxronizatsiyasi
  useEffect(() => {
    const local = loadLocalProgress();
    setProgress(local);

    fetch("/api/math/progress")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          if (typeof data.xpTotal === "number") {
            setXpTotal(data.xpTotal);
          }
          // Server va LocalStorage ma'lumotlarini birlashtirish (merge)
          if (data.progress) {
            setProgress((prev) => {
              const merged: ProgressMap = { ...prev };
              for (const [slug, item] of Object.entries(data.progress as ProgressMap)) {
                if (!merged[slug]) {
                  merged[slug] = item;
                } else {
                  const combinedSolved = Array.from(
                    new Set([...merged[slug].solved, ...(item.solved || [])])
                  );
                  merged[slug] = {
                    solved: combinedSolved,
                    masteredAt: merged[slug].masteredAt || item.masteredAt,
                  };
                }
              }
              try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const saveProgress = (next: ProgressMap) => {
    setProgress(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const topics = useMemo(() => MATH_TOPICS.filter((t) => t.branch === branch), [branch]);
  const topic = MATH_TOPICS.find((t) => t.slug === activeSlug) ?? topics[0];

  const masteredCount = MATH_TOPICS.filter((t) => progress[t.slug]?.masteredAt).length;

  const selectBranch = (b: MathBranch) => {
    setBranch(b);
    const first = MATH_TOPICS.find((t) => t.branch === b);
    if (first) setActiveSlug(first.slug);
    setStep(1);
  };

  const selectTopic = (slug: string) => {
    setActiveSlug(slug);
    setStep(1);
  };

  const markSolved = async (problemId: string) => {
    const current = progress[topic.slug] ?? { solved: [] };
    if (current.solved.includes(problemId)) return;

    const solved = [...current.solved, problemId];
    const isMasteredNow = solved.length >= topic.practice.length;
    const masteredAt = isMasteredNow ? current.masteredAt ?? Date.now() : current.masteredAt;

    const nextProgress = { ...progress, [topic.slug]: { solved, masteredAt } };
    saveProgress(nextProgress);

    // Serverga yuborish va haqiqiy XP olish
    try {
      const res = await fetch("/api/math/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicSlug: topic.slug,
          problemId,
          isMastered: isMasteredNow,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.xpTotal) {
          setXpTotal(data.xpTotal);
        }
        if (data.xpGained) {
          setLastXpGain(data.xpGained);
          setTimeout(() => setLastXpGain(null), 4000);
        }
      }
    } catch {}
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* XP Bildirishnomasi (Toast) */}
      {lastXpGain && (
        <div className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-2xl border border-neon bg-elevated/95 px-5 py-3 shadow-neon backdrop-blur-md animate-bounce">
          <Zap className="h-5 w-5 text-neon" />
          <span className="font-mono text-sm font-extrabold text-neon">
            +{lastXpGain} XP Qo&apos;shildi!
          </span>
        </div>
      )}

      {/* Sarlavha */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>MATEMATIKA LABORATORIYASI (ALGEBRA & GEOMETRIYA)</span>
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              Algebra va Geometriya — chuqur o&apos;rganish akademiyasi
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-fg-muted">
              Har bir mavzu 6 bosqichli metod asosida o&apos;rganiladi: avval tushunasiz, keyin ko&apos;rasiz,
              formulani isbotlaysiz, namunani tahlil qilasiz, mustaqil yechasiz va xatolaringizni tahlil qilasiz.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {xpTotal > 0 && (
              <div className="rounded-xl border border-neon/40 bg-neon-soft px-4 py-3 text-center">
                <span className="flex items-center justify-center gap-1.5 font-mono text-lg font-extrabold text-neon">
                  <Zap className="h-4 w-4" />
                  {xpTotal} XP
                </span>
                <span className="text-[11px] font-semibold text-neon">Umumiy Ball</span>
              </div>
            )}
            <div className="rounded-xl border border-gold/40 bg-gold-soft px-4 py-3 text-center">
              <span className="flex items-center justify-center gap-1.5 font-mono text-lg font-extrabold text-gold">
                <Trophy className="h-4 w-4" />
                {masteredCount} / {MATH_TOPICS.length}
              </span>
              <span className="text-[11px] font-semibold text-gold">o&apos;zlashtirilgan mavzu</span>
            </div>
          </div>
        </div>

        {/* Asosiy navigatsiya tablari */}
        <div className="mt-6 flex flex-wrap gap-2.5 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => setMainView("topics")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mainView === "topics"
                ? "bg-neon text-slate-950 shadow-neon"
                : "border border-border bg-surface text-fg-muted hover:text-fg"
            }`}
          >
            📚 6 Bosqichli Laboratoriya (Mavzular)
          </button>
          <button
            type="button"
            onClick={() => setMainView("formulas")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mainView === "formulas"
                ? "bg-neon text-slate-950 shadow-neon"
                : "border border-border bg-surface text-fg-muted hover:text-fg"
            }`}
          >
            📋 Formulalar Spravochnigi (Cheat Sheet)
          </button>
          <button
            type="button"
            onClick={() => setMainView("solvers")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mainView === "solvers"
                ? "bg-neon text-slate-950 shadow-neon"
                : "border border-border bg-surface text-fg-muted hover:text-fg"
            }`}
          >
            🧮 Interaktiv Yechuvchi Kalkulyatorlar
          </button>
        </div>

        {masteredCount === MATH_TOPICS.length && (
          <div className="mt-6 rounded-2xl border border-gold bg-gradient-to-r from-gold-soft/40 via-surface to-gold-soft/40 p-6 text-center shadow-gold">
            <span className="text-3xl">🏆</span>
            <h2 className="mt-2 text-xl font-extrabold text-gold sm:text-2xl">
              Ofarin! Barcha ${MATH_TOPICS.length} ta Algebra va Geometriya Modulini 100% O&apos;zlashtirdingiz!
            </h2>
            <p className="mt-1 text-sm text-fg-muted max-w-xl mx-auto">
              Siz SAT Math va xalqaro universitetlar darajasidagi barcha asosiy teoremalarni isboti bilan o&apos;rgandingiz.
            </p>
          </div>
        )}

        {/* Metod bosqichlari */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {DEEP_METHOD_STEPS.map((s, idx) => {
            const Icon = STEP_ICONS[idx];
            return (
              <div key={s.id} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neon-soft font-mono text-xs font-bold text-neon">
                    {s.id}
                  </span>
                  <Icon className="h-4 w-4 text-gold" />
                  <span className="text-sm font-bold text-fg">{s.titleUz}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-fg-muted">{s.descUz}</p>
              </div>
            );
          })}
        </div>
      </div>

      {mainView === "formulas" && (
        <div className="mt-6 glass-card p-6 sm:p-8">
          <FormulaSheetView />
        </div>
      )}

      {mainView === "solvers" && (
        <div className="mt-6 glass-card p-6 sm:p-8">
          <InteractiveSolversView />
        </div>
      )}

      {mainView === "topics" && (
      <div className="mt-6 grid gap-6 lg:grid-cols-[290px_1fr]">
        {/* Chap panel: fan va mavzular */}
        <aside className="glass-card h-fit p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => selectBranch("algebra")}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                branch === "algebra"
                  ? "border-neon bg-neon-soft text-neon"
                  : "border-border bg-surface text-fg-muted hover:text-fg"
              }`}
            >
              <Sigma className="h-4 w-4" />
              Algebra ({MATH_TOPICS.filter((t) => t.branch === "algebra").length})
            </button>
            <button
              type="button"
              onClick={() => selectBranch("geometry")}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                branch === "geometry"
                  ? "border-neon bg-neon-soft text-neon"
                  : "border-border bg-surface text-fg-muted hover:text-fg"
              }`}
            >
              <Shapes className="h-4 w-4" />
              Geometriya ({MATH_TOPICS.filter((t) => t.branch === "geometry").length})
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {topics.map((t, idx) => {
              const p = progress[t.slug];
              const solved = p?.solved.length ?? 0;
              const active = t.slug === topic.slug;
              return (
                <li key={t.slug}>
                  <button
                    type="button"
                    onClick={() => selectTopic(t.slug)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      active ? "border-neon bg-neon-soft" : "border-border bg-surface hover:border-neon/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-bold ${active ? "text-neon" : "text-fg"}`}>
                        {idx + 1}. {t.titleUz}
                      </span>
                      {p?.masteredAt ? <CheckCircle2 className="h-4 w-4 shrink-0 text-neon" /> : null}
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-fg-muted">{t.summaryUz}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                        <div
                          className="h-full rounded-full bg-neon transition-all"
                          style={{ width: `${Math.min(100, (solved / t.practice.length) * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-fg-muted">
                        {solved}/{t.practice.length}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* O'ng panel: tanlangan mavzu */}
        <section className="glass-card p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-gold">
                {topic.branch === "algebra" ? "Algebra" : "Geometriya"}
              </span>
              <h2 className="text-xl font-extrabold text-fg sm:text-2xl">{topic.titleUz}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <JarvisVoiceButton
                text={`${topic.titleUz} mavzusi. ${topic.intuitionUz.join('. ')}`}
                label="JARVIS ovozida tinglash"
              />
              <Link
                href={`/coach?mode=MATH_DEEP_DIVE&q=${encodeURIComponent(
                  `"${topic.titleUz}" mavzusini 6 bosqichli metod bilan chuqur tushuntirib bering va menga bitta yangi masala bering.`
                )}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold-soft px-3.5 py-2 text-xs font-bold text-gold hover:border-gold"
            >
              <Sparkles className="h-4 w-4" />
              AI Murabbiy bilan chuqurlashtirish
              </Link>
            </div>
          </div>

          {/* Bosqichlar navigatsiyasi */}
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="O'rganish bosqichlari">
            {DEEP_METHOD_STEPS.map((s, idx) => {
              const Icon = STEP_ICONS[idx];
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStep(s.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? "border-neon bg-neon text-slate-950 font-extrabold"
                      : step > s.id
                        ? "border-neon/40 bg-neon-soft text-neon"
                        : "border-border bg-surface text-fg-muted hover:text-fg"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {s.id}. {s.titleUz}
                </button>
              );
            })}
          </div>

          <div className="mt-5 min-h-[320px]">
            <StepContent
              key={`${topic.slug}-${step}`}
              topic={topic}
              step={step}
              solved={progress[topic.slug]?.solved ?? []}
              masteredAt={progress[topic.slug]?.masteredAt}
              onSolved={markSolved}
            />
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-fg disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Oldingi bosqich
            </button>
            {step < DEEP_METHOD_STEPS.length ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(DEEP_METHOD_STEPS.length, s + 1))}
                className="btn-neon inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold"
              >
                Keyingi bosqich
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <NextTopicButton topic={topic} onSelect={selectTopic} onBranch={setBranch} />
            )}
          </div>
        </section>
      </div>
      )}
    </div>
  );
}

function NextTopicButton({
  topic,
  onSelect,
  onBranch,
}: {
  topic: MathTopic;
  onSelect: (slug: string) => void;
  onBranch: (b: MathBranch) => void;
}) {
  const idx = MATH_TOPICS.findIndex((t) => t.slug === topic.slug);
  const next = MATH_TOPICS[(idx + 1) % MATH_TOPICS.length];
  return (
    <button
      type="button"
      onClick={() => {
        onBranch(next.branch);
        onSelect(next.slug);
      }}
      className="btn-neon inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold"
    >
      Keyingi mavzu: {next.titleUz}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function StepContent({
  topic,
  step,
  solved,
  masteredAt,
  onSolved,
}: {
  topic: MathTopic;
  step: number;
  solved: string[];
  masteredAt?: number;
  onSolved: (id: string) => void;
}) {
  switch (step) {
    case 1:
      return (
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-neon">
            <Lightbulb className="h-5 w-5" /> 1-bosqich: Tushun — mavzuning ma&apos;nosi
          </h3>
          <ul className="mt-4 space-y-3">
            {topic.intuitionUz.map((line, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-fg">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-soft font-mono text-xs font-bold text-gold">
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-fg-muted">
            💡 O&apos;zingizga savol bering: &quot;Buni 10 yoshli ukamga qanday tushuntirgan bo&apos;lardim?&quot; — agar
            tushuntira olsangiz, keyingi bosqichga o&apos;ting.
          </p>
        </div>
      );

    case 2:
      return (
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-neon">
            <Eye className="h-5 w-5" /> 2-bosqich: Ko&apos;r — vizual model
          </h3>
          <div className="mt-4 flex justify-center rounded-2xl border border-border bg-canvas/80 p-4">
            <MathVisualDiagram type={topic.visual} />
          </div>
          <p className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-fg">{topic.visualCaptionUz}</p>
        </div>
      );

    case 3:
      return (
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-neon">
            <Sigma className="h-5 w-5" /> 3-bosqich: Formula — va u nega to&apos;g&apos;ri
          </h3>
          <div className="mt-4 grid gap-3">
            {topic.formulas.map((f) => (
              <div key={f.nameUz} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gold">{f.nameUz}</p>
                <p className="mt-2 rounded-lg bg-elevated px-3 py-2 font-mono text-base font-bold text-fg">{f.formula}</p>
                <p className="mt-2 text-sm text-fg-muted">
                  <strong className="text-neon">Nega?</strong> {f.whyUz}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 4:
      return (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-bold text-neon">
              <ListOrdered className="h-5 w-5" /> 4-bosqich: Namuna — qadamma-qadam yechim
            </h3>
            <JarvisVoiceButton
              text={`Masala: ${topic.workedExample.problemUz}. Yechim qadamlari: ${topic.workedExample.steps.join('. ')}. Javob: ${topic.workedExample.answerUz}`}
              label="Yechimni tinglash"
            />
          </div>
          <div className="mt-4 rounded-xl border border-gold/40 bg-gold-soft/30 p-4 text-sm font-bold text-fg">
            📝 {topic.workedExample.problemUz}
          </div>
          <ol className="mt-4 space-y-2.5">
            {topic.workedExample.steps.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border bg-surface p-3.5 text-sm text-fg">
                <span className="shrink-0 font-mono text-xs font-bold text-neon">{i + 1}-qadam</span>
                <span className="font-mono">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-neon bg-neon-soft p-3.5 text-sm font-bold text-neon">
            <CheckCircle2 className="h-5 w-5" /> Javob: {topic.workedExample.answerUz}
          </div>
        </div>
      );

    case 5:
      return (
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-neon">
            <PenLine className="h-5 w-5" /> 5-bosqich: Mashq — SAT va olimpiada formati
          </h3>
          <p className="mt-1 text-xs text-fg-muted">
            Variantli savollarda to&apos;g&apos;ri javobni tanlang, ochiq savollarda esa sonni kiriting. Har bir to&apos;g&apos;ri
            yechim uchun <strong>+15 XP</strong> beriladi!
          </p>
          <div className="mt-4 space-y-4">
            {topic.practice.map((p, i) => (
              <PracticeCard key={p.id} index={i} problem={p} solved={solved.includes(p.id)} onSolved={onSolved} />
            ))}
          </div>
          {masteredAt ? (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold-soft/40 p-4 text-sm font-bold text-gold">
              <Trophy className="h-6 w-6 text-gold shrink-0" />
              <div>
                <p className="text-base">Ajoyib natija! Ushbu mavzuni to&apos;liq egalladingiz (+50 XP)!</p>
                <p className="text-xs font-normal text-fg-muted mt-0.5">
                  Endi 6-bosqichda tipik xatolar tahlili va takrorlash rejasini ko&apos;rib chiqing.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      );

    default: {
      const base = masteredAt ?? Date.now();
      return (
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-neon">
            <Brain className="h-5 w-5" /> 6-bosqich: Tahlil — xatolar va takrorlash
          </h3>
          <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-4">
            <p className="text-sm font-bold text-danger">⚠️ Eng ko&apos;p uchraydigan xatolar</p>
            <ul className="mt-2 space-y-1.5 text-sm text-fg">
              {topic.commonMistakesUz.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 rounded-xl border border-gold/40 bg-gold-soft/30 p-4">
            <p className="text-sm font-bold text-gold">⚡ SAT lifehack</p>
            <p className="mt-1.5 text-sm text-fg">{topic.satTipUz}</p>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-surface p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-neon">
              <CalendarClock className="h-4 w-4" /> Takrorlash rejasi (unutmaslik egri chizig&apos;iga qarshi)
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {REVIEW_SCHEDULE_DAYS.map((d) => (
                <div key={d} className="rounded-lg border border-border bg-elevated p-2.5 text-center">
                  <p className="font-mono text-sm font-bold text-fg">+{d} kun</p>
                  <p className="text-[11px] text-fg-muted">
                    {new Date(base + d * 86_400_000).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-fg-muted">
              Har bir takrorlashda 5-bosqichdagi mashqlarni qog&apos;ozda, formulaga qaramasdan qayta yeching.
            </p>
          </div>
        </div>
      );
    }
  }
}

function PracticeCard({
  index,
  problem,
  solved,
  onSolved,
}: {
  index: number;
  problem: MathTopic["practice"][number];
  solved: boolean;
  onSolved: (id: string) => void;
}) {
  const [value, setValue] = useState("");
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">(solved ? "correct" : "idle");
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const check = (overrideInput?: string) => {
    const toCheck = overrideInput ?? (selectedOption || value);
    if (!toCheck || !toCheck.trim()) return;

    if (checkMathProblemAnswer(toCheck, problem)) {
      setStatus("correct");
      onSolved(problem.id);
    } else {
      setStatus("wrong");
      setAttempts((a) => a + 1);
    }
  };

  const handleSelectOption = (optId: "A" | "B" | "C" | "D") => {
    if (status === "correct") return;
    setSelectedOption(optId);
    check(optId);
  };

  const levelLabel = problem.level === 1 ? "Oson" : problem.level === 2 ? "O'rta" : "Qiyin";

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        status === "correct"
          ? "border-neon bg-neon-soft/30 shadow-neon"
          : status === "wrong"
            ? "border-danger/60 bg-surface"
            : "border-border bg-surface hover:border-border-strong"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-fg-muted">
          {index + 1}-masala · <span className="text-gold">{levelLabel}</span>
          {problem.options && <span className="ml-2 text-neon font-mono">(SAT Multiple Choice)</span>}
        </span>
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-gold-soft px-2.5 py-1 text-[11px] font-bold text-gold"
        >
          <HelpCircle className="h-3.5 w-3.5" /> Maslahat
        </button>
      </div>

      <p className="mt-3 text-sm font-semibold text-fg sm:text-base">{problem.promptUz}</p>
      {showHint && <p className="mt-2 rounded-xl bg-gold-soft/30 p-3 text-xs text-gold">💡 {problem.hintUz}</p>}

      {/* Agar variantli (A, B, C, D) bo'lsa */}
      {problem.options && problem.options.length > 0 ? (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {problem.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isRight = problem.correctOption === opt.id;
            let btnClass = "border-border bg-canvas/80 text-fg hover:border-neon";

            if (status === "correct") {
              if (isRight) btnClass = "border-neon bg-neon-soft text-neon font-bold shadow-neon";
            } else if (status === "wrong" && isSelected) {
              btnClass = "border-danger bg-danger/15 text-danger font-semibold";
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={status === "correct"}
                onClick={() => handleSelectOption(opt.id)}
                className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-all ${btnClass}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-elevated font-mono text-xs font-extrabold text-neon">
                  {opt.id}
                </span>
                <span className="flex-1 font-medium">{opt.text}</span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Ochiq sonli kiritish (Grid-in) */
        <div className="mt-4 flex flex-wrap gap-2.5">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            disabled={status === "correct"}
            onChange={(e) => {
              setValue(e.target.value);
              if (status === "wrong") setStatus("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Javobingiz (masalan: 25)"
            aria-label={`${index + 1}-masala javobi`}
            className="w-48 rounded-xl border border-border bg-canvas px-3.5 py-2.5 font-mono text-sm text-fg focus:border-neon focus:outline-none disabled:opacity-60"
          />
          {status !== "correct" && (
            <button type="button" onClick={() => check()} className="btn-neon px-5 py-2.5 text-xs font-bold">
              Tekshirish (+15 XP)
            </button>
          )}
        </div>
      )}

      {status === "correct" && (
        <div className="mt-4 rounded-xl border border-neon bg-neon-soft/50 p-3.5 text-sm font-bold text-neon">
          <p className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> To&apos;g&apos;ri! +15 XP hisobingizga qo&apos;shildi.
          </p>
          <p className="mt-1 text-xs font-normal text-fg">{problem.solutionUz}</p>
        </div>
      )}

      {status === "wrong" && (
        <p className="mt-3 text-sm text-danger">
          ❌ Hali to&apos;g&apos;ri emas.{" "}
          {attempts >= 2 ? `Yechim: ${problem.solutionUz}` : "Maslahatni ko'ring va qayta urinib ko'ring."}
        </p>
      )}
    </div>
  );
}
