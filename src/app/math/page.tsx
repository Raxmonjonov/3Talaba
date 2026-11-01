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
} from "lucide-react";
import {
  DEEP_METHOD_STEPS,
  MATH_TOPICS,
  REVIEW_SCHEDULE_DAYS,
  checkMathAnswer,
  type MathBranch,
  type MathTopic,
} from "@/lib/curriculum/math-deep-dive";
import { MathVisualDiagram } from "@/components/math/MathVisualDiagram";

type TopicProgress = { solved: string[]; masteredAt?: number };
type ProgressMap = Record<string, TopicProgress>;

const STORAGE_KEY = "3talab-math-deep-progress";
const STEP_ICONS = [Lightbulb, Eye, Sigma, ListOrdered, PenLine, Brain];

function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as ProgressMap;
  } catch {
    return {};
  }
}

export default function MathDeepDivePage() {
  const [branch, setBranch] = useState<MathBranch>("algebra");
  const [activeSlug, setActiveSlug] = useState<string>(MATH_TOPICS[0].slug);
  const [step, setStep] = useState<number>(1);
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(loadProgress());
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

  const markSolved = (problemId: string) => {
    const current = progress[topic.slug] ?? { solved: [] };
    if (current.solved.includes(problemId)) return;
    const solved = [...current.solved, problemId];
    const masteredAt =
      solved.length >= topic.practice.length ? current.masteredAt ?? Date.now() : current.masteredAt;
    saveProgress({ ...progress, [topic.slug]: { solved, masteredAt } });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Sarlavha */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>MATEMATIKA LABORATORIYASI</span>
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              Algebra va Geometriya — chuqur o&apos;rganish
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-fg-muted">
              Har bir mavzu 6 bosqichli metod asosida o&apos;rganiladi: avval tushunasiz, keyin ko&apos;rasiz,
              formulani isbotlaysiz, namunani tahlil qilasiz, mustaqil yechasiz va xatolaringizni tahlil qilasiz.
            </p>
          </div>
          <div className="rounded-xl border border-gold/40 bg-gold-soft px-4 py-3 text-center">
            <span className="flex items-center justify-center gap-1.5 font-mono text-lg font-extrabold text-gold">
              <Trophy className="h-4 w-4" />
              {masteredCount} / {MATH_TOPICS.length}
            </span>
            <span className="text-[11px] font-semibold text-gold">o&apos;zlashtirilgan mavzu</span>
          </div>
        </div>

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

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Chap panel: fan va mavzular */}
        <aside className="glass-card h-fit p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => selectBranch("algebra")}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                branch === "algebra" ? "border-neon bg-neon-soft text-neon" : "border-border bg-surface text-fg-muted hover:text-fg"
              }`}
            >
              <Sigma className="h-4 w-4" />
              Algebra
            </button>
            <button
              type="button"
              onClick={() => selectBranch("geometry")}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                branch === "geometry" ? "border-neon bg-neon-soft text-neon" : "border-border bg-surface text-fg-muted hover:text-fg"
              }`}
            >
              <Shapes className="h-4 w-4" />
              Geometriya
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
                    <p className="mt-1 text-[11px] text-fg-muted">{t.summaryUz}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                      <div
                        className="h-full rounded-full bg-neon transition-all"
                        style={{ width: `${(solved / t.practice.length) * 100}%` }}
                      />
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
                      ? "border-neon bg-neon text-slate-950"
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
          <h3 className="flex items-center gap-2 text-base font-bold text-neon">
            <ListOrdered className="h-5 w-5" /> 4-bosqich: Namuna — qadamma-qadam yechim
          </h3>
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
            <PenLine className="h-5 w-5" /> 5-bosqich: Mashq — o&apos;zingiz yeching
          </h3>
          <p className="mt-1 text-xs text-fg-muted">
            Javobni son ko&apos;rinishida kiriting (masalan: 7, −3, 0,5 yoki 1/2). Barcha mashqlar yechilsa, mavzu
            o&apos;zlashtirilgan deb belgilanadi.
          </p>
          <div className="mt-4 space-y-4">
            {topic.practice.map((p, i) => (
              <PracticeCard key={p.id} index={i} problem={p} solved={solved.includes(p.id)} onSolved={onSolved} />
            ))}
          </div>
          {masteredAt ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-gold/40 bg-gold-soft p-3.5 text-sm font-bold text-gold">
              <Trophy className="h-5 w-5" /> Ajoyib! Ushbu mavzu o&apos;zlashtirildi. 6-bosqichda xatolar tahlilini ko&apos;ring.
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
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">(solved ? "correct" : "idle");
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const check = () => {
    if (!value.trim()) return;
    if (checkMathAnswer(value, problem.answer)) {
      setStatus("correct");
      onSolved(problem.id);
    } else {
      setStatus("wrong");
      setAttempts((a) => a + 1);
    }
  };

  const levelLabel = problem.level === 1 ? "Oson" : problem.level === 2 ? "O'rta" : "Qiyin";

  return (
    <div
      className={`rounded-xl border p-4 ${
        status === "correct" ? "border-neon bg-neon-soft/40" : status === "wrong" ? "border-danger/60 bg-surface" : "border-border bg-surface"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-fg-muted">
          {index + 1}-masala · <span className="text-gold">{levelLabel}</span>
        </span>
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-gold-soft px-2.5 py-1 text-[11px] font-bold text-gold"
        >
          <HelpCircle className="h-3.5 w-3.5" /> Maslahat
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold text-fg">{problem.promptUz}</p>
      {showHint && <p className="mt-2 rounded-lg bg-gold-soft/30 p-2.5 text-xs text-gold">💡 {problem.hintUz}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
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
          placeholder="Javobingiz"
          aria-label={`${index + 1}-masala javobi`}
          className="w-40 rounded-xl border border-border bg-canvas px-3 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none disabled:opacity-60"
        />
        {status !== "correct" && (
          <button type="button" onClick={check} className="btn-neon px-4 py-2 text-xs font-bold">
            Tekshirish
          </button>
        )}
      </div>

      {status === "correct" && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-neon">
          <CheckCircle2 className="h-4 w-4" /> To&apos;g&apos;ri! {problem.solutionUz}
        </p>
      )}
      {status === "wrong" && (
        <p className="mt-3 text-sm text-danger">
          ❌ Hali to&apos;g&apos;ri emas. {attempts >= 2 ? `Yechim: ${problem.solutionUz}` : "Maslahatni ko'ring va qayta urinib ko'ring."}
        </p>
      )}
    </div>
  );
}
