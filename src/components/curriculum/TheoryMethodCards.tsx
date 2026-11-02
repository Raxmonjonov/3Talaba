"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Sparkles,
  BookOpen,
  ArrowRight,
  FileText,
  HelpCircle,
  MessageSquare,
  Send,
  Zap,
  CheckCircle2,
  Sigma,
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
  // Sokratik AI Murabbiy bilan jonli muloqot
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "USER" | "AI"; text: string }>
  >([]);

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

    const newHist = [...chatHistory, { role: "USER" as const, text: q }];
    setChatHistory(newHist);
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
        setChatHistory((prev) => [...prev, { role: "AI" as const, text: reply }]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "AI" as const,
          text: `Kechirasiz ${honorific}, aloqada uzilish bo'ldi. Qaytadan urinib ko'ring.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Yuqori E'lon & Dars Maqsadi (Matnsiz, toza intellektual vitrina) */}
      <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-slate-900/80 to-slate-950 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-black text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  <span>AI MURABBIY METODLARI</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {sections.length} ta asosiy qoida
                </span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">
                {lessonTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <JarvisVoiceButton
              text={`${lessonTitle}. ${sections.map((s) => s.title).join(". ")}.`}
              label="Bosh rejani tinglash"
            />
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          Ushbu darsning asosiy formulalari va qoidalari alohida intellektual kartalarga
          ajratilgan. Xom matnni o&apos;qish shart emas — har bir qoidani qisqa o&apos;rganib,
          AI murabbiydan tushunmagan joyingizni so&apos;rashingiz mumkin.
        </p>
      </div>

      {/* ====================================================================
          METOD KARTALARI (Xom matn o'rniga strukturalangan shisha kartalar)
          ==================================================================== */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((sec) => (
          <div
            key={sec.index}
            className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-emerald-400/40 transition-colors shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs font-extrabold text-emerald-400 uppercase">
                  {sec.index}-Qoida
                </span>
                <JarvisVoiceButton
                  text={`${sec.title}. ${sec.paragraphs.join(". ")} ${sec.bulletPoints.join(". ")}`}
                  label=""
                />
              </div>

              <h3 className="mt-3 text-base sm:text-lg font-black text-white">
                {sec.title}
              </h3>

              {/* Formulalar */}
              {sec.formulas.length > 0 && (
                <div className="my-3 space-y-2">
                  {sec.formulas.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    >
                      <span className="font-mono text-base sm:text-lg font-black text-emerald-300">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matn / Abzaslar */}
              {sec.paragraphs.length > 0 && (
                <div className="mt-2 space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
              )}

              {/* Ro'yxat punktlari */}
              {sec.bulletPoints.length > 0 && (
                <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-300">
                  {sec.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ====================================================================
          DARSDAGI JONLI AI MURABBIY MULOQOT MAYDONI
          ==================================================================== */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">
                Sokratik AI Murabbiyga Savol Berish
              </h4>
              <p className="text-xs text-slate-400">
                Mavzu bo&apos;yicha istalgan savolingizni so&apos;rang — ustoz yo&apos;l ko&apos;rsatadi
              </p>
            </div>
          </div>

          <span className="glass-pill rounded-full px-3 py-1 text-xs font-mono font-bold text-emerald-300">
            24/7 Tayyor
          </span>
        </div>

        {/* Tezkor savol takliflari */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Imtihonda bu mavzudan qanday tuzoqlar tushadi?",
            "Ushbu metodning hayotiy misolini ko'rsating",
            "Formulani eslab qolishning eng oson yo'li nima?",
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => handleAskCoach(prompt)}
              className="glass-pill rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:border-emerald-400/40 transition-colors"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Suhbat tarixi */}
        {chatHistory.length > 0 && (
          <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto pr-2">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === "USER"
                    ? "ml-8 border border-white/15 bg-white/5 text-white"
                    : "mr-8 border border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                    {msg.role === "USER" ? "Siz" : "AI Murabbiy"}
                  </span>
                  {msg.role === "AI" && (
                    <JarvisVoiceButton text={msg.text} label="Tinglash" />
                  )}
                </div>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Savol yuborish maydoni */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskCoach();
          }}
          className="mt-4 flex items-center gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="AI Murabbiyga savolingizni yozing..."
            className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
          />

          <JarvisMicButton onTranscript={(txt) => setQuestion(txt)} />

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-neon flex items-center justify-center rounded-2xl px-5 py-3.5 text-xs font-bold disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* ====================================================================
          PASTKI HARAKAT VA DARS TARIXIGA HAVOLA
          ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-300 transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span>To&apos;liq matnli darslikni Dars Tarixida o&apos;qish →</span>
        </Link>

        <button
          type="button"
          onClick={onProceedToExamples}
          className="btn-neon flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold shadow-xl"
        >
          <span>2-Bosqich: Hayotiy Misollarni Ko&apos;rish</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
