"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadSecureLocal, saveSecureLocal } from "@/lib/security/client-storage";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Crown,
  Eye,
  HelpCircle,
  Lightbulb,
  ListOrdered,
  Lock,
  PenLine,
  RotateCcw,
  Sigma,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { MATH_15_MODULES, type MathModuleLesson } from "@/lib/curriculum/math-modules-data";
import { MathInteractiveCanvas } from "@/components/math/MathInteractiveCanvas";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";
import { useLearningAdaptation } from "@/lib/learning/easy-adaptation";

const STORAGE_KEY = "3talaba_math_completed_modules";

export default function MathAcademyPage() {
  const { pace, setPace, activeOption, options } = useLearningAdaptation();

  // Tanlangan modul id si (default: 1-modul)
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [tierFilter, setTierFilter] = useState<"ALL" | "FOUNDATION" | "MID" | "ADV">("ALL");

  // 6 ta tabdan qaysi biri ochiq: 1..6
  const [activeTab, setActiveTab] = useState<number>(1);

  // Tugallangan modullar ro'yxati (masalan, [1, 2])
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  // Mini-amaliyot javoblari
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [showPracticeSolution, setShowPracticeSolution] = useState<Record<string, boolean>>({});

  // Shifrlangan LocalStoragedan progressni yuklash
  useEffect(() => {
    const parsed = loadSecureLocal<number[]>(STORAGE_KEY);
    if (Array.isArray(parsed)) {
      setCompletedModules(parsed);
    }
  }, []);

  // Faol modul ma'lumotlari
  const currentModule = useMemo(() => {
    return MATH_15_MODULES.find((m) => m.id === activeModuleId) || MATH_15_MODULES[0];
  }, [activeModuleId]);

  // Modulni tugallangan deb belgilash
  const handleMarkCompleted = (modId: number) => {
    const updated = Array.from(new Set([...completedModules, modId]));
    setCompletedModules(updated);
    saveSecureLocal(STORAGE_KEY, updated);
  };

  // Modul tanlanganda
  const handleSelectModule = (mod: MathModuleLesson) => {
    setActiveModuleId(mod.id);
    setActiveTab(1);
    setPracticeAnswers({});
    setShowPracticeSolution({});
  };

  // Mini-amaliyot javobini belgilash
  const handleAnswerPractice = (problemId: string, optId: "A" | "B" | "C" | "D") => {
    setPracticeAnswers((prev) => ({ ...prev, [problemId]: optId }));
    setShowPracticeSolution((prev) => ({ ...prev, [problemId]: true }));
  };

  // Umumiy progress foizi
  const progressPercent = Math.round((completedModules.length / MATH_15_MODULES.length) * 100);

  return (
    <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 lg:px-10 space-y-8">
      {/* ====================================================================
          Yuqori Sarlavha va Umumiy Progress Bar
          ==================================================================== */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-300">
              <Sigma className="h-3.5 w-3.5" />
              <span>ALGEBRA &amp; GEOMETRIYA AKADEMIYASI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              6 Bosqichli Chuqur Matematika Metodi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              15 ta modul orqali maktab algebrasidan tortib Digital SAT 800 darajasigacha bo&apos;lgan
              barcha formulalar isboti va vizual SVG modellari.
            </p>
          </div>

          {/* Progress bloki */}
          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Tugallangan modullar:</span>
              <span className="font-mono text-sm font-black text-emerald-400">
                {completedModules.length} / {MATH_15_MODULES.length}
              </span>
            </div>
            <div className="h-2.5 w-full sm:w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#c6f432] to-[#ffffff] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400">{progressPercent}% o&apos;zlashtirildi</span>
          </div>
        </div>

        {/* Oson o'rganish yo'l-yo'rig'i va tushuntirish darajasi */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c6f432]/30 bg-[#0b0b0c] p-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-200">
            <Compass className="h-4 w-4 shrink-0 text-[#c6f432]" />
            <span>
              <strong className="text-[#c6f432]">Oson Yo&apos;l-Yo&apos;riq:</strong> Chapdan darajangizga mos modulni tanlang → 1 dan 6 gacha qadamlarni ketma-ket o&apos;ting (3-qadamda slayderlarni surib grafikni jonlantiring!).
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPace(opt.id)}
                className={`rounded-lg px-2.5 py-1 font-extrabold transition-all ${
                  pace === opt.id
                    ? "bg-[#c6f432] text-[#0b0b0c]"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:text-white"
                }`}
              >
                {opt.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================
          Asosiy Tuzilma: Chap Panel (15 ta Modul) + O'ng Oyna (6 Bosqich)
          ==================================================================== */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-12 items-start">
        {/* ====================================================================
            CHAP PANEL: 15 ta Modul Ro'yxati (3-4 Ustun)
            ==================================================================== */}
        <aside className="lg:col-span-4 xl:col-span-3 glass-card p-4 sm:p-5 space-y-4">
          <div className="space-y-2.5 border-b border-white/10 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                O&apos;quv Dasturi (15 ta Modul)
              </span>
              <span className="font-mono text-[11px] text-[#c6f432]">Barchasi ochiq</span>
            </div>

            {/* Daraja bo'yicha saralash */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {[
                { id: "ALL" as const, label: "Barchasi (15)" },
                { id: "FOUNDATION" as const, label: "0 dan Poydevor (1–5)" },
                { id: "MID" as const, label: "O'rta SAT (6–10)" },
                { id: "ADV" as const, label: "SAT 800 (11–15)" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTierFilter(t.id)}
                  className={`rounded-lg px-2 py-1.5 font-bold transition-all ${
                    tierFilter === t.id
                      ? "bg-[#c6f432] text-[#0b0b0c]"
                      : "border border-white/10 bg-[#0b0b0c] text-slate-300 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[780px] overflow-y-auto pr-1">
            {MATH_15_MODULES.filter((mod) => {
              if (tierFilter === "FOUNDATION") return mod.id <= 5;
              if (tierFilter === "MID") return mod.id >= 6 && mod.id <= 10;
              if (tierFilter === "ADV") return mod.id >= 11;
              return true;
            }).map((mod) => {
              const isSelected = mod.id === activeModuleId;
              const isDone = completedModules.includes(mod.id);
              const levelTag =
                mod.id <= 5 ? "Poydevor" : mod.id <= 10 ? "O'rta" : "SAT 800";

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModule(mod)}
                  className={`w-full flex items-start justify-between gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(198,244,50,0.25)]"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:bg-white/10"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{mod.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{mod.shortDesc}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                    {isDone ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-400/40"
                        title="Tugallandi"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-[#c6f432] border border-[#c6f432]/30">
                        {levelTag}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ====================================================================
            O'NG OYNA: 6 Bosqichli Darslik Interfeysi (8-9 Ustun)
            ==================================================================== */}
        <main className="lg:col-span-8 xl:col-span-9 glass-card p-6 sm:p-8 lg:p-10 space-y-6">
          {/* Modul Sarlavhasi va Pro Banneri (agar Pro bo'lsa) */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                  Modul {currentModule.id} / 15
                </span>
                {!currentModule.isFree && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                    <Crown className="h-3 w-3" />
                    Pro Campus Mavzusi
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">{currentModule.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <JarvisVoiceButton
                text={`${currentModule.title}. ${currentModule.theory.headline}. ${currentModule.theory.intuition}`}
                label="Mavzuni tinglash"
              />
              <button
                type="button"
                onClick={() => handleMarkCompleted(currentModule.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  completedModules.includes(currentModule.id)
                    ? "border-emerald-400 bg-emerald-500/25 text-emerald-300"
                    : "border-white/15 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {completedModules.includes(currentModule.id) ? "✓ Tugallangan" : "Tugallandi deb belgilash"}
                </span>
              </button>
            </div>
          </div>

          {/* 6 Bosqichli Metodika Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
            {[
              { id: 1, label: "1. Nazariya", icon: Lightbulb },
              { id: 2, label: "2. Isbot (Proof)", icon: Sigma },
              { id: 3, label: "3. Vizual SVG Model", icon: Eye },
              { id: 4, label: "4. SAT Tuzoqlari", icon: Zap },
              { id: 5, label: "5. Mini-Amaliyot", icon: PenLine },
              { id: 6, label: "6. Talaba AI Xulosasi", icon: Brain },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "border border-emerald-400 bg-emerald-500/25 text-white shadow-neon"
                      : "border border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ==================================================================
              TAB 1: NAZARIYA VA KONSEPSIYA
              ================================================================== */}
          {activeTab === 1 && (
            <div className="space-y-6">
              {/* 0 dan boshlovchilar uchun eng avval hayotiy o'xshatish va 30-soniyalik xotira qoidasi chiqadi */}
              {pace === "SODDA" && (
                <div className="rounded-2xl border border-[#c6f432]/50 bg-[#0b0b0c] p-5 space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#c6f432] px-2.5 py-0.5 text-[11px] font-black text-[#0b0b0c]">
                    0 DAN SODDA TUSHUNTIRISH: AVVAL TASAVVUR QILING
                  </span>
                  <p className="text-sm text-white leading-relaxed">
                    {currentModule.theory.realWorldAnalogy}
                  </p>
                  {currentModule.aiSummary.quickRules[0] && (
                    <p className="border-t border-white/10 pt-2 text-xs text-[#c6f432] font-bold">
                      🔑 30 soniyalik oltin qoida: {currentModule.aiSummary.quickRules[0]}
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Asosiy g&apos;oya ({activeOption.title})
                </span>
                <h3 className="mt-1 text-lg font-bold text-white">{currentModule.theory.headline}</h3>
                <p className="mt-2 text-sm text-slate-200 leading-relaxed">{currentModule.theory.intuition}</p>
              </div>

              <div className="space-y-3">
                {currentModule.theory.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-sm text-slate-300 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {pace !== "SODDA" && (
                <div className="glass-pill rounded-xl p-4 border-l-4 border-l-[#c6f432]">
                  <span className="text-xs font-bold uppercase text-[#c6f432] block">Hayotiy o&apos;xshatish:</span>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">{currentModule.theory.realWorldAnalogy}</p>
                </div>
              )}

              {pace === "TEZKOR" && (
                <div className="rounded-2xl border border-[#c6f432]/40 bg-[#0b0b0c] p-4 space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#c6f432] block">
                    ⚡ Imtihonda 10 soniyada ishlatiladigan tezkor qoidalar:
                  </span>
                  <ul className="space-y-1 text-xs text-white">
                    {currentModule.aiSummary.quickRules.map((rule, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <span className="text-[#c6f432] font-black">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
                >
                  <span>2-qadam: Formulalar Isboti</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 2: FORMULA VA ISBOT (PROOF)
              ================================================================== */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">{currentModule.proof.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Matematikani yodlamasdan, nega aynan shu formula hosil bo&apos;lishini qadamma-qadam tushunamiz.
                </p>
              </div>

              {/* Asosiy formulalar qutisi */}
              <div className="grid gap-3 sm:grid-cols-2">
                {currentModule.proof.mainFormulas.map((f, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-[#0b0b0c] p-4 font-mono">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold block">{f.label}</span>
                    <div className="text-base font-black text-white mt-1">{f.formula}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block font-sans">{f.note}</span>
                  </div>
                ))}
              </div>

              {/* Isbot qadamlari */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase text-amber-300 tracking-wider">
                  Isbotning qadam-baqadam yechimi:
                </span>
                {currentModule.proof.proofSteps.map((step) => (
                  <div key={step.stepNumber} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <span className="text-xs font-bold text-white">{step.title}</span>
                    </div>
                    <div className="rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-emerald-300">
                      {step.latex}
                    </div>
                    <p className="text-xs text-slate-300">{step.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200 font-medium">
                <strong>Xulosa: </strong>
                {currentModule.proof.conclusion}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Nazariyaga qaytish</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(3)}
                  className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
                >
                  <span>3-qadam: Vizual SVG Model</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 3: VIZUAL SVG MODEL (INTERAKTIV PARAMETRIK GRAFIK)
              ================================================================== */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <MathInteractiveCanvas
                visualType={currentModule.visualType}
                title={currentModule.title}
              />

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Formulalarga qaytish</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(4)}
                  className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
                >
                  <span>4-qadam: SAT Tuzoqlari</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 4: SAT TUZOQLARI (COMMON TRAPS)
              ================================================================== */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Xalqaro SAT Imtihonida Eng Ko&apos;p Uchraydigan Tuzoqlar</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ko&apos;pchilik o&apos;quvchilar bilmaganidan emas, balki test tuzuvchilarning hiylasiga tushgani uchun ball yo&apos;qotadi.
                </p>
              </div>

              <div className="space-y-4">
                {currentModule.satTraps.map((trap, idx) => (
                  <div key={idx} className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span>{trap.trapTitle}</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-slate-300">
                        <span className="text-red-400 font-bold block mb-1">❌ Keng tarqalgan xato:</span>
                        {trap.mistakeText}
                      </div>
                      <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 p-3 text-slate-200">
                        <span className="text-emerald-400 font-bold block mb-1">✓ To&apos;g&apos;ri yondashuv:</span>
                        {trap.correctWay}
                      </div>
                    </div>

                    <div className="glass-pill rounded-xl p-3 border-l-4 border-l-amber-400 text-xs">
                      <strong className="text-amber-300">💡 SAT Lifehack: </strong>
                      <span className="text-slate-200">{trap.satLifehack}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Grafikga qaytish</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(5)}
                  className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
                >
                  <span>5-qadam: Mini-Amaliyot</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 5: MINI-AMALIYOT (CHECK UNDERSTANDING)
              ================================================================== */}
          {activeTab === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Mavzuni Mustahkamlash: 2 ta Test Savoli</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Variantni tanlang — javobingiz to&apos;g&apos;ri yoki noto&apos;g&apos;ri ekanligi va to&apos;liq yechimi darhol ko&apos;rinadi.
                </p>
              </div>

              <div className="space-y-6">
                {currentModule.miniPractice.map((problem, pIdx) => {
                  const chosen = practiceAnswers[problem.id];
                  const hasAnswered = showPracticeSolution[problem.id];
                  const isCorrect = chosen === problem.correct;

                  return (
                    <div key={problem.id} className="glass-card p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                          Savol {pIdx + 1}
                        </span>
                        {hasAnswered && (
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${
                              isCorrect ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            {isCorrect ? "To'g'ri!" : "Xato"}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-white">{problem.prompt}</p>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {problem.options.map((opt) => {
                          const isOptChosen = chosen === opt.id;
                          const isOptCorrect = opt.id === problem.correct;

                          let btnClass = "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-400/40 hover:bg-white/10";
                          if (hasAnswered) {
                            if (isOptCorrect) {
                              btnClass = "border-emerald-400 bg-emerald-500/25 text-emerald-300 font-bold shadow-neon";
                            } else if (isOptChosen) {
                              btnClass = "border-red-400 bg-red-500/20 text-red-300";
                            } else {
                              btnClass = "border-white/5 bg-white/[0.02] text-slate-500 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              disabled={hasAnswered}
                              onClick={() => handleAnswerPractice(problem.id, opt.id)}
                              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left text-xs transition-all ${btnClass}`}
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-[11px] font-extrabold text-emerald-400">
                                {opt.id}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-slate-300 space-y-1">
                          <span className="text-emerald-400 font-bold block">Yechim izohi:</span>
                          <p>{problem.solution}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(4)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Tuzoqlarga qaytish</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(6)}
                  className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
                >
                  <span>6-qadam: Talaba AI Xulosasi</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================================
              TAB 6: TALABA AI XULOSASI (CHEAT SHEET)
              ================================================================== */}
          {activeTab === 6 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 to-transparent p-5 space-y-4">
                <div className="flex items-center gap-2.5 text-amber-300">
                  <Brain className="h-5 w-5" />
                  <h3 className="text-base font-black text-white">{currentModule.aiSummary.cheatSheetTitle}</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
                    <span className="text-emerald-400 font-bold uppercase text-[10px] block">
                      📌 Asosiy xulosalar:
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {currentModule.aiSummary.takeaways.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
                    <span className="text-amber-300 font-bold uppercase text-[10px] block">
                      ⚡ Tezkor qoidalar:
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {currentModule.aiSummary.quickRules.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-300">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Talaba AI bilan muhokama qilish CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    Mavzu bo&apos;yicha savollaringiz bormi?
                  </span>
                  <p className="text-xs text-slate-300">
                    Talaba AI bilan Sokratik rejimda tushunmagan qadamlaringizni muhokama qiling.
                  </p>
                </div>

                <Link
                  href={`/coach?mode=SOCRATIC_TUTOR&subject=sat-math&q=${encodeURIComponent(
                    currentModule.aiSummary.suggestedAiPrompt
                  )}`}
                  className="btn-gold inline-flex items-center gap-2 px-5 py-3 text-xs font-bold shrink-0"
                >
                  <Brain className="h-4 w-4" />
                  <span>Talaba AI ga savol berish</span>
                </Link>
              </div>

              {/* Modulni yakunlash tugmasi */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab(5)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Amaliyotga qaytish</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkCompleted(currentModule.id)}
                  className="btn-neon inline-flex items-center gap-2 px-6 py-3 text-xs font-bold"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Modulni Yakunlash</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
