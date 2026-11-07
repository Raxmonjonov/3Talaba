"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  Lightbulb,
  Send,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { JarvisVoiceButton, JarvisMicButton } from "@/components/voice/JarvisVoiceAgent";
import {
  explainFormulaSimply,
  useLearningAdaptation,
} from "@/lib/learning/easy-adaptation";

interface TheoryMethodCardsProps {
  theoryMarkdown: string;
  lessonTitle: string;
  honorific: string;
  lessonSlug: string;
  onProceedToExamples: () => void;
}

interface ParsedSection {
  index: number;
  title: string;
  formulas: string[];
  bulletPoints: string[];
  paragraphs: string[];
}

/**
 * Xom LaTeX va Markdown belgilarini toza insoniy matnga aylantirish
 */
function cleanSymbolicText(text: string): string {
  return text
    .replace(/\$\$(.*?)\$\$/g, "$1")
    .replace(/\$(.*?)\$/g, "$1")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / ($2)")
    .replace(/\\cdot/g, "·")
    .replace(/\\circ/g, "°")
    .replace(/\\neq/g, "≠")
    .replace(/[\*\_`]/g, "")
    .trim();
}

export function TheoryMethodCards({
  theoryMarkdown,
  lessonTitle,
  honorific,
  lessonSlug,
  onProceedToExamples,
}: TheoryMethodCardsProps) {
  const { pace, setPace, activeOption, options } = useLearningAdaptation();
  const [selectedTab, setSelectedTab] = useState<number | "ALL">("ALL");
  const [masteredRules, setMasteredRules] = useState<number[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestAiReply, setLatestAiReply] = useState<string | null>(null);

  // Xom matnni toza metod kartalariga ajratish
  const sections = useMemo<ParsedSection[]>(() => {
    if (!theoryMarkdown) return [];

    const rawSections = theoryMarkdown.split(/(?=###\s+)/).filter(Boolean);

    return rawSections.map((sec, idx) => {
      const lines = sec.trim().split("\n");
      const titleLine = lines[0] ?? "";
      const title = titleLine.replace(/###\s+\d*\.?\s*/, "").trim() || `Metod ${idx + 1}`;
      const bodyLines = lines.slice(1);

      const formulas: string[] = [];
      const bulletPoints: string[] = [];
      const paragraphs: string[] = [];

      let currentPara = "";

      for (const line of bodyLines) {
        const trimmed = line.trim();
        if (!trimmed) {
          if (currentPara) {
            paragraphs.push(cleanSymbolicText(currentPara));
            currentPara = "";
          }
          continue;
        }

        if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
          const f = trimmed.replace(/^\$\$|\$\$$/g, "").trim();
          formulas.push(cleanSymbolicText(f));
          continue;
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bp = trimmed.replace(/^[-*]\s+/, "").trim();
          bulletPoints.push(cleanSymbolicText(bp));
          continue;
        }

        currentPara = currentPara ? `${currentPara} ${trimmed}` : trimmed;
      }

      if (currentPara) {
        paragraphs.push(cleanSymbolicText(currentPara));
      }

      return {
        index: idx + 1,
        title,
        formulas,
        bulletPoints,
        paragraphs,
      };
    });
  }, [theoryMarkdown]);

  const toggleMastered = (ruleIndex: number) => {
    setMasteredRules((prev) =>
      prev.includes(ruleIndex)
        ? prev.filter((id) => id !== ruleIndex)
        : [...prev, ruleIndex],
    );
  };

  const handleAskCoach = async (presetText?: string) => {
    const rawQ = (presetText ?? question).trim();
    if (!rawQ || loading) return;

    if (!presetText) setQuestion("");
    setLoading(true);

    const requestMode =
      pace === "TEZKOR"
        ? "FAST_SOLUTION"
        : pace === "SODDA"
          ? "STEP_BY_STEP"
          : "SOCRATIC_TUTOR";

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${activeOption.aiPromptPrefix}${rawQ}`,
          mode: requestMode,
          lessonSlug,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          assistantMessage?: { content: string };
        };
        const reply =
          data.assistantMessage?.content ??
          `Juda yaxshi savol, ${honorific}! Ushbu metodda asosiysi qoidani 1-2-3 qadamda qo'llab ko'rishdir.`;
        setLatestAiReply(reply);
      }
    } catch {
      setLatestAiReply(
        `${honorific}, ushbu qoidani oson eslab qolish siri: avval masala shartidan berilgan qiymatlarni ajratib yozing, so'ng formulaga bittadan qo'yib tekshiring.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const activeSections = useMemo(() => {
    if (selectedTab === "ALL") return sections;
    return sections.filter((s) => s.index === selectedTab);
  }, [sections, selectedTab]);

  return (
    <div className="space-y-5">
      {/* 0. Oson Moslashish va Darsni O'zlashtirish Yo'l-Yo'rig'i */}
      <div className="rounded-2xl border border-[#c6f432]/35 bg-[#0b0b0c] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c6f432] text-[#0b0b0c]">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c6f432] block">
                Oson O&apos;rganish Yo&apos;l-Yo&apos;rig&apos;i • O&apos;zlashtirildi: {masteredRules.length} / {sections.length}
              </span>
              <p className="text-xs sm:text-sm font-bold text-white">
                1) Tushuntirish darajasini tanlang → 2) Har bir qoidani tinglang/o&apos;qing → 3) «Tushundim» belgisini qo&apos;ying → 4) Misollarga o&apos;ting
              </p>
            </div>
          </div>

          {/* 3 xil o'quvchi darajasiga moslashtirgich */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#121214] p-1">
            {options.map((opt) => {
              const active = pace === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPace(opt.id)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition-all ${
                    active
                      ? "bg-[#c6f432] text-[#0b0b0c]"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {opt.title}
                </button>
              );
            })}
          </div>
        </div>

        <p className="rounded-xl border border-white/10 bg-[#121214] px-3.5 py-2 text-xs text-slate-300">
          <strong className="text-[#c6f432]">{activeOption.title}:</strong> {activeOption.summary}
        </p>
      </div>

      {/* 1. Kengaytirilgan Qoidalar Paneli & Filtr Navigatsiyasi */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#121214] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c6f432]/20 text-[#c6f432]">
            <Zap className="h-4 w-4" />
          </span>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
            Talaba AI Metodlari ({sections.length} ta qoida kartasi)
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setSelectedTab("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "ALL"
                ? "bg-[#c6f432] text-[#0b0b0c] shadow-sm"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Barchasi
          </button>
          {sections.map((sec) => (
            <button
              key={sec.index}
              type="button"
              onClick={() => setSelectedTab(sec.index)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                selectedTab === sec.index
                  ? "bg-[#c6f432] text-[#0b0b0c] shadow-sm"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {sec.index}-Qoida {masteredRules.includes(sec.index) ? "✓" : ""}
            </button>
          ))}
        </div>

        <JarvisVoiceButton
          text={`${lessonTitle}. ${sections.map((s) => `${s.index}-qoida: ${s.title}`).join(". ")}.`}
          label="Barchasini tinglash"
        />
      </div>

      {/* 2. Darajaga Moslashuvchi Metod Kartalari */}
      <div
        className={`grid gap-4 lg:gap-6 ${
          selectedTab === "ALL" && sections.length >= 3
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            : selectedTab === "ALL" && sections.length === 2
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1"
        }`}
      >
        {activeSections.map((sec) => {
          const isMastered = masteredRules.includes(sec.index);
          return (
            <div
              key={sec.index}
              className={`flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all ${
                isMastered
                  ? "border-[#c6f432]/60 bg-[#c6f432]/[0.07]"
                  : "border-white/10 bg-[#121214] hover:border-[#c6f432]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <span className="font-mono text-xs font-black text-[#c6f432] uppercase tracking-wider">
                    {sec.index}-Qoida
                  </span>
                  <div className="flex items-center gap-1.5">
                    <JarvisVoiceButton
                      text={`${sec.title}. ${sec.paragraphs.join(". ")} ${sec.bulletPoints.join(". ")}`}
                      label=""
                    />
                    <button
                      type="button"
                      onClick={() => toggleMastered(sec.index)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${
                        isMastered
                          ? "border-[#c6f432] bg-[#c6f432] text-[#0b0b0c]"
                          : "border-white/15 bg-white/5 text-slate-300 hover:border-[#c6f432]/50 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{isMastered ? "Tushundim ✓" : "Tushundim"}</span>
                    </button>
                  </div>
                </div>

                <h4 className="mt-3 text-sm sm:text-base font-extrabold text-white leading-snug">
                  {sec.title}
                </h4>

                {/* Formula bloki + 0 dan boshlovchilar uchun belgi izohi */}
                {sec.formulas.length > 0 && (
                  <div className="my-3.5 space-y-2">
                    {sec.formulas.map((f, fIdx) => (
                      <div
                        key={fIdx}
                        className="rounded-xl border border-[#c6f432]/35 bg-[#0b0b0c] px-4 py-3 text-center space-y-1.5"
                      >
                        <span className="font-mono text-xs sm:text-sm font-black text-[#c6f432] block">
                          {f}
                        </span>
                        {pace === "SODDA" && (
                          <span className="block text-[11px] text-slate-300 leading-snug">
                            💡 Sodda izoh: {explainFormulaSimply(f)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Asosiy izoh */}
                {sec.paragraphs.length > 0 && (
                  <div className="mt-2.5 space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                )}

                {/* Asosiy nuqtalar */}
                {sec.bulletPoints.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-slate-300">
                    {sec.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c6f432] mt-2 shrink-0" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tanlangan rejimga mos "Qanday qo'llayman?" eslatmasi */}
                <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0b0c] p-3 text-xs space-y-1">
                  {pace === "SODDA" && (
                    <>
                      <span className="font-extrabold text-[#c6f432] block">
                        🪜 Oson 3 qadamda qo&apos;llash:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        1) Masala shartida berilgan sonlarni toping → 2) Yuqoridagi qoidaga shoshilmay qo&apos;ying → 3) Chiqqan javob mantiqan to&apos;g&apos;riligini tekshiring.
                      </p>
                    </>
                  )}
                  {pace === "STANDART" && (
                    <>
                      <span className="font-extrabold text-white block">
                        📌 Amalda ishlatish tartibi:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        Qoidani o&apos;qib bo&apos;lgach, 2-bosqichdagi tayyor yechilgan misolda aynan qaysi qatorda qo&apos;llanganiga e&apos;tibor bering.
                      </p>
                    </>
                  )}
                  {pace === "TEZKOR" && (
                    <>
                      <span className="font-extrabold text-[#c6f432] block">
                        ⚡ Imtihonda 10 soniyalik usul:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        Uzun hisob-kitobdan oldin javob variantlarining ishorasi va o&apos;lchamiga qarab kamida 2 ta xato variantni (50/50) chiqarib tashlang.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* 1-bosishda AI yordam tugmalari */}
              <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tushunmadingizmi? 1 bosishda so&apos;rang:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      void handleAskCoach(
                        `«${sec.title}» qoidasini mutlaqo 0 dan boshlagan o'quvchiga juda sodda hayotiy misol bilan tushuntirib ber.`,
                      )
                    }
                    className="rounded-lg border border-[#c6f432]/35 bg-[#c6f432]/10 px-2.5 py-1 text-[11px] font-bold text-[#c6f432] hover:bg-[#c6f432] hover:text-[#0b0b0c] transition-colors"
                  >
                    💡 Sodda tushuntir
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      void handleAskCoach(
                        `«${sec.title}» mavzusidan bitta juda oson misol yozib, 1-2-3 qadamda yechib ko'rsat.`,
                      )
                    }
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white hover:border-[#c6f432]/50 transition-colors"
                  >
                    ✏️ Oson misol ko&apos;rsat
                  </button>
                  {selectedTab === "ALL" && (
                    <button
                      type="button"
                      onClick={() => setSelectedTab(sec.index)}
                      className="inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                    >
                      <span>Keng ochish</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Jonli Talaba AI Murabbiy Muloqot Qatori */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-3.5 sm:p-4 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleAskCoach();
          }}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c6f432]/20 text-[#c6f432]">
            <Brain className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Talaba AI Ustozdan xohlagan narsani sodda tilda so'rang (masalan: Nega bu yerda minus bo'ldi?)..."
            className="flex-1 rounded-xl border border-white/10 bg-[#0b0b0c] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-[#c6f432] focus:outline-none"
          />

          <JarvisMicButton onTranscript={(txt) => setQuestion(txt)} />

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-neon flex h-10 items-center justify-center rounded-xl px-4 text-xs font-bold disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#c6f432] px-1">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>Talaba AI siz tanlagan «{activeOption.title}» uslubida javob tayyorlamoqda...</span>
          </div>
        )}

        {/* AI Javobi */}
        {latestAiReply && (
          <div className="rounded-xl border border-[#c6f432]/40 bg-[#0b0b0c] p-4 text-xs sm:text-sm text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider text-[#c6f432]">
                <Lightbulb className="h-3.5 w-3.5" />
                Talaba AI Ustoz ({activeOption.title})
              </span>
              <div className="flex items-center gap-2">
                <JarvisVoiceButton text={latestAiReply} label="Tinglash" />
                <button
                  type="button"
                  onClick={() => setLatestAiReply(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="leading-relaxed whitespace-pre-line">{latestAiReply}</p>
          </div>
        )}
      </div>

      {/* 4. Pastki Navigatsiya & 2-Bosqichga o'tish */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Link
          href="/profile?tab=history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#c6f432] transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span>Profil → Dars Tarixida to&apos;liq konspekt →</span>
        </Link>

        <button
          type="button"
          onClick={onProceedToExamples}
          className="btn-neon flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-lg"
        >
          <span>2-Bosqich: Hayotiy Misollarni Ko&apos;rish</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
