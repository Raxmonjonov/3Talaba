"use client";

import React, { useMemo, useState } from "react";
import {
  Calculator,
  Search,
  Sigma,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  CircleDot,
} from "lucide-react";
import { MATH_TOPICS } from "@/lib/curriculum/math-deep-dive";

export function FormulaSheetView() {
  const [query, setQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<"all" | "algebra" | "geometry">("all");
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const allFormulas = useMemo(() => {
    const list: Array<{
      topicTitle: string;
      topicSlug: string;
      branch: "algebra" | "geometry";
      nameUz: string;
      formula: string;
      whyUz: string;
    }> = [];

    for (const t of MATH_TOPICS) {
      for (const f of t.formulas) {
        list.push({
          topicTitle: t.titleUz,
          topicSlug: t.slug,
          branch: t.branch,
          nameUz: f.nameUz,
          formula: f.formula,
          whyUz: f.whyUz,
        });
      }
    }
    return list;
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allFormulas.filter((item) => {
      if (selectedBranch !== "all" && item.branch !== selectedBranch) return false;
      if (!q) return true;
      return (
        item.nameUz.toLowerCase().includes(q) ||
        item.formula.toLowerCase().includes(q) ||
        item.topicTitle.toLowerCase().includes(q) ||
        item.whyUz.toLowerCase().includes(q)
      );
    });
  }, [allFormulas, query, selectedBranch]);

  const handleCopy = (formulaText: string) => {
    try {
      navigator.clipboard.writeText(formulaText);
      setCopiedFormula(formulaText);
      setTimeout(() => setCopiedFormula(null), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="flex items-center gap-2 text-lg font-bold text-neon">
              <BookOpen className="h-5 w-5" /> Barcha Formulalar Spravochnigi (Formula Sheet)
            </h3>
            <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gold/50 bg-gold-soft px-3 py-1.5 text-xs font-bold text-gold hover:border-gold"
            title="Formulalar varaqasini chop etish yoki PDF sifatida saqlash"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Chop etish / PDF</span>
          </button>
          </div>
          <p className="text-xs text-fg-muted mt-0.5">
            SAT va xalqaro imtihonlar uchun zarur bo&apos;lgan barcha asosiy formulalar va ularning isbot g&apos;oyasi.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedBranch("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              selectedBranch === "all" ? "bg-neon text-slate-950" : "border border-border bg-surface text-fg-muted"
            }`}
          >
            Hammasi ({allFormulas.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedBranch("algebra")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              selectedBranch === "algebra" ? "bg-neon text-slate-950" : "border border-border bg-surface text-fg-muted"
            }`}
          >
            Algebra
          </button>
          <button
            type="button"
            onClick={() => setSelectedBranch("geometry")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              selectedBranch === "geometry" ? "bg-neon text-slate-950" : "border border-border bg-surface text-fg-muted"
            }`}
          >
            Geometriya
          </button>
        </div>
      </div>

      {/* Qidiruv */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-fg-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Formulani qidiring (masalan: Pifagor, diskriminant, sinus, foiz, hajm, vektor)..."
          className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted focus:border-neon focus:outline-none"
        />
      </div>

      {/* Formulalar ro'yxati */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-border-strong"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
                  {item.topicTitle}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(item.formula)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-fg-muted hover:text-neon"
                  title="Formulani nusxalash"
                >
                  {copiedFormula === item.formula ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-neon" />
                      <span className="text-neon">Nusxalandi</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Nusxa</span>
                    </>
                  )}
                </button>
              </div>
              <h4 className="mt-1 text-sm font-bold text-fg">{item.nameUz}</h4>
              <div className="mt-2.5 rounded-lg border border-border/70 bg-canvas/80 px-3.5 py-2 font-mono text-sm font-bold text-neon">
                {item.formula}
              </div>
            </div>
            <p className="mt-2.5 text-xs text-fg-muted leading-relaxed">
              <strong className="text-gold">Nega to&apos;g&apos;ri?</strong> {item.whyUz}
            </p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-canvas/60 p-8 text-center text-sm text-fg-muted">
          Qidiruvingiz bo&apos;yicha formula topilmadi.
        </div>
      )}
    </div>
  );
}

export function InteractiveSolversView() {
  const [activeTool, setActiveTool] = useState<"quadratic" | "pythagoras" | "percent" | "circle">("quadratic");
  const [circleR, setCircleR] = useState("6");
  const [circleAngle, setCircleAngle] = useState("60");

  // 1. Kvadrat tenglama holatlari
  const [qa, setQa] = useState("1");
  const [qb, setQb] = useState("-5");
  const [qc, setQc] = useState("6");

  // 2. Pifagor holatlari
  const [pa, setPa] = useState("3");
  const [pb, setPb] = useState("4");

  // 3. Foiz holatlari
  const [pctInitial, setPctInitial] = useState("100");
  const [pctChange, setPctChange] = useState("20");


  // 4. Doira va sektor hisobi
  const circleResult = useMemo(() => {
    const r = parseFloat(circleR);
    const angle = parseFloat(circleAngle);
    if (isNaN(r) || isNaN(angle) || r <= 0 || angle <= 0) return null;

    const area = Math.PI * r * r;
    const circumference = 2 * Math.PI * r;
    const sectorArea = (angle / 360) * area;
    const arcLength = (angle / 360) * circumference;

    return {
      area,
      circumference,
      sectorArea,
      arcLength,
      explanation: `Radiusi ${r} bo'lgan doira: S = π·${r}² ≈ ${area.toFixed(2)}, Aylana uzunligi C = 2π·${r} ≈ ${circumference.toFixed(2)}. ${angle}° li sektor: S_sektor = (${angle}/360)·${area.toFixed(2)} ≈ ${sectorArea.toFixed(2)}, Yoy uzunligi L = (${angle}/360)·${circumference.toFixed(2)} ≈ ${arcLength.toFixed(2)}.`,
    };
  }, [circleR, circleAngle]);

  // Kvadrat tenglama hisobi
  const quadraticResult = useMemo(() => {
    const a = parseFloat(qa);
    const b = parseFloat(qb);
    const c = parseFloat(qc);
    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return null;

    const D = b * b - 4 * a * c;
    if (D < 0) {
      return { D, roots: [], explanation: `D = (${b})² − 4·(${a})·(${c}) = ${D} < 0. Haqiqiy ildizlar mavjud emas.` };
    }
    if (D === 0) {
      const root = -b / (2 * a);
      return {
        D,
        roots: [root],
        explanation: `D = 0. Bitta takroriy ildiz: x = -(${b}) / (2·${a}) = ${root.toFixed(3)}`,
      };
    }
    const r1 = (-b + Math.sqrt(D)) / (2 * a);
    const r2 = (-b - Math.sqrt(D)) / (2 * a);
    return {
      D,
      roots: [r1, r2],
      explanation: `D = ${D}. Ildizlar: x₁ = (${-b} + √${D}) / ${2 * a} = ${r1.toFixed(3)}, x₂ = (${-b} − √${D}) / ${2 * a} = ${r2.toFixed(3)}`,
    };
  }, [qa, qb, qc]);

  // Pifagor hisobi
  const pythagorasResult = useMemo(() => {
    const a = parseFloat(pa);
    const b = parseFloat(pb);
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return null;

    const cSquared = a * a + b * b;
    const c = Math.sqrt(cSquared);
    const area = (a * b) / 2;
    return {
      c,
      area,
      explanation: `c² = a² + b² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${cSquared} ⇒ c = √${cSquared} = ${c.toFixed(3)}`,
    };
  }, [pa, pb]);

  // Foiz hisobi
  const percentResult = useMemo(() => {
    const initial = parseFloat(pctInitial);
    const change = parseFloat(pctChange);
    if (isNaN(initial) || isNaN(change)) return null;

    const finalVal = initial * (1 + change / 100);
    const delta = finalVal - initial;
    return {
      finalVal,
      delta,
      explanation: `${initial} · (1 + ${change}/100) = ${initial} · ${(1 + change / 100).toFixed(2)} = ${finalVal.toFixed(2)}`,
    };
  }, [pctInitial, pctChange]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-neon">
          <Calculator className="h-5 w-5" /> Interaktiv Matematika Kalkulyatori & Yechuvchisi
        </h3>
        <p className="text-xs text-fg-muted mt-0.5">
          Qadamma-qadam yechim algoritmi bilan formulalarning qanday ishlashini amalda tekshiring.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTool("quadratic")}
          className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTool === "quadratic"
              ? "border-neon bg-neon-soft text-neon"
              : "border-border bg-surface text-fg-muted hover:text-fg"
          }`}
        >
          Kvadrat Tenglama (ax² + bx + c = 0)
        </button>
        <button
          type="button"
          onClick={() => setActiveTool("pythagoras")}
          className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTool === "pythagoras"
              ? "border-neon bg-neon-soft text-neon"
              : "border-border bg-surface text-fg-muted hover:text-fg"
          }`}
        >
          Pifagor Teoremasi (a² + b² = c²)
        </button>
        <button
          type="button"
          onClick={() => setActiveTool("circle")}
          className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTool === "circle"
              ? "border-neon bg-neon-soft text-neon"
              : "border-border bg-surface text-fg-muted hover:text-fg"
          }`}
        >
          Aylana & Sektor (S = πr², L = 2πr)
        </button>
        <button
          type="button"
          onClick={() => setActiveTool("percent")}
          className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTool === "percent"
              ? "border-neon bg-neon-soft text-neon"
              : "border-border bg-surface text-fg-muted hover:text-fg"
          }`}
        >
          Foiz & O&apos;sish (A = P(1+r)ᵗ)
        </button>
      </div>

      {/* 1. Kvadrat tenglama */}
      {activeTool === "quadratic" && (
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4">
          <h4 className="text-sm font-bold text-fg">ax² + bx + c = 0 tenglamani yechish</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-fg-muted">a koeffitsiyent:</label>
              <input
                type="number"
                value={qa}
                onChange={(e) => setQa(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-fg-muted">b koeffitsiyent:</label>
              <input
                type="number"
                value={qb}
                onChange={(e) => setQb(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-fg-muted">c ozod had:</label>
              <input
                type="number"
                value={qc}
                onChange={(e) => setQc(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          {quadraticResult && (
            <div className="rounded-xl border border-neon/50 bg-neon-soft/30 p-4 space-y-2">
              <p className="text-xs font-bold text-neon uppercase tracking-wide">Qadamma-qadam tahlil:</p>
              <p className="font-mono text-sm font-bold text-fg">
                Diskriminant: D = b² − 4ac = <span className="text-gold">{quadraticResult.D}</span>
              </p>
              <p className="text-sm text-fg leading-relaxed">{quadraticResult.explanation}</p>
              {quadraticResult.roots.length > 0 && (
                <div className="pt-1 flex gap-4">
                  {quadraticResult.roots.map((r, i) => (
                    <span key={i} className="rounded-lg bg-elevated px-3 py-1 font-mono text-sm font-bold text-neon">
                      x{i + 1} = {Number.isInteger(r) ? r : r.toFixed(3)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Pifagor kalkulyatori */}
      {activeTool === "pythagoras" && (
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4">
          <h4 className="text-sm font-bold text-fg">To&apos;g&apos;ri burchakli uchburchak gipotenuzasini topish</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-fg-muted">a katet uzunligi:</label>
              <input
                type="number"
                value={pa}
                onChange={(e) => setPa(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-fg-muted">b katet uzunligi:</label>
              <input
                type="number"
                value={pb}
                onChange={(e) => setPb(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          {pythagorasResult && (
            <div className="rounded-xl border border-gold/50 bg-gold-soft/30 p-4 space-y-2">
              <p className="text-xs font-bold text-gold uppercase tracking-wide">Pifagor hisobi:</p>
              <p className="text-sm text-fg leading-relaxed">{pythagorasResult.explanation}</p>
              <div className="pt-1 flex flex-wrap gap-4">
                <span className="rounded-lg bg-elevated px-3 py-1 font-mono text-sm font-bold text-gold">
                  Gipotenuza c = {Number.isInteger(pythagorasResult.c) ? pythagorasResult.c : pythagorasResult.c.toFixed(3)}
                </span>
                <span className="rounded-lg bg-elevated px-3 py-1 font-mono text-sm font-bold text-neon">
                  Yuzi S = {pythagorasResult.area.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Foiz kalkulyatori */}
      {activeTool === "percent" && (
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4">
          <h4 className="text-sm font-bold text-fg">Foizli o&apos;sish yoki kamayishni hisoblash</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-fg-muted">Boshlang&apos;ich miqdor (P):</label>
              <input
                type="number"
                value={pctInitial}
                onChange={(e) => setPctInitial(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-fg-muted">O&apos;zgarish foizi (r %, masalan: +20 yoki -15):</label>
              <input
                type="number"
                value={pctChange}
                onChange={(e) => setPctChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          {percentResult && (
            <div className="rounded-xl border border-neon/50 bg-neon-soft/30 p-4 space-y-2">
              <p className="text-xs font-bold text-neon uppercase tracking-wide">Natija:</p>
              <p className="text-sm text-fg leading-relaxed">{percentResult.explanation}</p>
              <div className="pt-1 flex flex-wrap gap-4">
                <span className="rounded-lg bg-elevated px-3 py-1 font-mono text-sm font-bold text-neon">
                  Yangi qiymat = {percentResult.finalVal.toFixed(2)}
                </span>
                <span className="rounded-lg bg-elevated px-3 py-1 font-mono text-sm font-bold text-gold">
                  O&apos;zgarish = {percentResult.delta >= 0 ? `+${percentResult.delta.toFixed(2)}` : percentResult.delta.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {/* 4. Doira va sektor kalkulyatori */}
      {activeTool === "circle" && (
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4">
          <h4 className="text-sm font-bold text-fg">Aylana uzunligi, doira va sektor yuzini hisoblash</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-fg-muted">Radius (r):</label>
              <input
                type="number"
                value={circleR}
                onChange={(e) => setCircleR(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-fg-muted">Markaziy burchak (α gradusda, masalan: 60°):</label>
              <input
                type="number"
                value={circleAngle}
                onChange={(e) => setCircleAngle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-canvas px-3.5 py-2 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          {circleResult && (
            <div className="rounded-xl border border-neon/50 bg-neon-soft/30 p-4 space-y-2">
              <p className="text-xs font-bold text-neon uppercase tracking-wide">Aylana va sektor hisoblari:</p>
              <p className="text-sm text-fg leading-relaxed">{circleResult.explanation}</p>
              <div className="pt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-elevated p-2.5 text-center">
                  <p className="text-[10px] text-fg-muted uppercase">Doira Yuzi (S)</p>
                  <p className="font-mono text-sm font-bold text-neon">{circleResult.area.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-elevated p-2.5 text-center">
                  <p className="text-[10px] text-fg-muted uppercase">Aylana Uzunligi (C)</p>
                  <p className="font-mono text-sm font-bold text-gold">{circleResult.circumference.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-elevated p-2.5 text-center">
                  <p className="text-[10px] text-fg-muted uppercase">Sektor Yuzi (S_sek)</p>
                  <p className="font-mono text-sm font-bold text-neon">{circleResult.sectorArea.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-elevated p-2.5 text-center">
                  <p className="text-[10px] text-fg-muted uppercase">Yoy Uzunligi (L_yoy)</p>
                  <p className="font-mono text-sm font-bold text-gold">{circleResult.arcLength.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
