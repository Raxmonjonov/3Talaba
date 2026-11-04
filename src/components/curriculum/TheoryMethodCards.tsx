"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Sparkles,
  ArrowRight,
  FileText,
  MessageSquare,
  Send,
  Zap,
  CheckCircle2,
  ChevronRight,
  X,
} from "lucide-react";
import { JarvisVoiceButton, JarvisMicButton } from "@/components/voice/JarvisVoiceAgent";

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
  const [selectedTab, setSelectedTab] = useState<number | "ALL">("ALL");
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

        // Formula bloklari ($$...$$)
        if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
          const f = trimmed.replace(/^\$\$|\$\$$/g, "").trim();
          formulas.push(cleanSymbolicText(f));
          continue;
        }

        // Ro'yxat elementlari (- ...)
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

  const handleAskCoach = async (presetText?: string) => {
    const q = (presetText ?? question).trim();
    if (!q || loading) return;

    if (!presetText) setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          mode: "SOCRATIC_TUTOR",
          lessonSlug,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          assistantMessage?: { content: string };
        };
        const reply =
          data.assistantMessage?.content ??
          `Juda yaxshi savol, ${honorific}! Ushbu metodda asosiysi formulani eslab qolish va keyingi misollarda qo'llashdir.`;
        setLatestAiReply(reply);
      }
    } catch {
      setLatestAiReply(
        `Kechirasiz ${honorific}, aloqada qisqa uzilish bo'ldi. Qaytadan urinib ko'ring.`
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
      {/* 1. Kengaytirilgan Qoidalar Paneli & Filtr Navigatsiyasi */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 sm:px-5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <Zap className="h-4 w-4" />
          </span>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
            Talaba AI Metodlari ({sections.length} ta asosiy qoida)
          </span>
        </div>

        {/* Tablar: Barchasi yoki alohida metodlar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setSelectedTab("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "ALL"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
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
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {sec.index}-Qoida
            </button>
          ))}
        </div>

        <JarvisVoiceButton
          text={`${lessonTitle}. ${sections.map((s) => s.title).join(". ")}.`}
          label="Tinglash"
        />
      </div>

      {/* 2. Eniga kengaytirilgan Metod Kartalari */}
      <div
        className={`grid gap-4 lg:gap-6 ${
          selectedTab === "ALL" && sections.length >= 3
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            : selectedTab === "ALL" && sections.length === 2
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {activeSections.map((sec) => (
          <div
            key={sec.index}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md hover:border-emerald-400/40 transition-colors shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="font-mono text-xs font-black text-emerald-400 uppercase tracking-wider">
                  {sec.index}-Qoida
                </span>
                <JarvisVoiceButton
                  text={`${sec.title}. ${sec.paragraphs.join(". ")} ${sec.bulletPoints.join(". ")}`}
                  label=""
                />
              </div>

              <h4 className="mt-3 text-sm sm:text-base font-extrabold text-white leading-snug">
                {sec.title}
              </h4>

              {/* Formula bloki */}
              {sec.formulas.length > 0 && (
                <div className="my-3.5 space-y-2">
                  {sec.formulas.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-center shadow-[0_0_12px_rgba(16,185,129,0.12)]"
                    >
                      <span className="font-mono text-xs sm:text-sm font-black text-emerald-300">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Asosiy izoh / abzaslar */}
              {sec.paragraphs.length > 0 && (
                <div className="mt-2.5 space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>
                      {p}
                    </p>
                  ))}
                </div>
              )}

              {/* Asosiy nuqtalar */}
              {sec.bulletPoints.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-slate-300">
                  {sec.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedTab === "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedTab(sec.index)}
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 self-start"
              >
                <span>Alohida keng ekranda ko&apos;rish</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 3. Jonli Talaba AI Murabbiy Muloqot Qatori */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskCoach();
          }}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <Brain className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Talaba AI Murabbiyga savol bering (masalan: Bu formulaning amaliy siri nima?)..."
            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
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

        {/* AI Javobi */}
        {latestAiReply && (
          <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3.5 text-xs sm:text-sm text-emerald-200">
            <div className="flex items-center justify-between border-b border-emerald-400/20 pb-1.5 mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                Talaba AI Murabbiy
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
            <p className="leading-relaxed">{latestAiReply}</p>
          </div>
        )}
      </div>

      {/* 4. Pastki Navigatsiya & 2-Bosqichga o'tish */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Link
          href="/profile?tab=history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span>Profil → Dars Tarixida to&apos;liq konspekt →</span>
        </Link>

        <button
          type="button"
          onClick={onProceedToExamples}
          className="btn-neon flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-lg"
        >
          <span>2-Bosqich: Misollarni Ko&apos;rish</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
