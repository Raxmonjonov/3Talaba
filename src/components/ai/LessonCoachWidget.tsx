"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Brain, ExternalLink, MessageCircle, Send, Sparkles, X } from "lucide-react";

interface LessonCoachWidgetProps {
  lessonSlug: string;
  lessonTitle: string;
  honorific: string;
  currentPromptUz?: string;
}

export function LessonCoachWidget({
  lessonSlug,
  lessonTitle,
  honorific,
  currentPromptUz,
}: LessonCoachWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [honorificUsed, setHonorificUsed] = useState<string>(honorific);

  const handleAsk = async (presetText?: string) => {
    const text = (presetText ?? question).trim();
    if (!text || loading) return;

    setLoading(true);
    if (!presetText) setQuestion("");

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: "SOCRATIC_TUTOR",
          lessonSlug,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          assistantMessage?: {
            content: string;
            metadata?: { honorificUsed?: string };
          };
        };
        if (data.assistantMessage) {
          setReply(data.assistantMessage.content);
          if (data.assistantMessage.metadata?.honorificUsed) {
            setHonorificUsed(data.assistantMessage.metadata.honorificUsed);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-gold/40 bg-gold-soft/10 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-soft text-gold">
            <Brain className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold sm:text-sm">
              Dars Ichidagi Socratic AI Murabbiy ({honorificUsed})
            </h3>
            <p className="text-xs text-fg-muted">
              Mavzu bo&apos;yicha savol tug&apos;ildimi? Ustoz javobni darrov bermasdan,
              yo&apos;l ko&apos;rsatadi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="toggle-lesson-ai-coach-btn"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gold/50 bg-gold-soft px-3.5 py-2 text-xs font-bold text-gold transition-all hover:bg-gold hover:text-canvas"
          >
            {isOpen ? (
              <>
                <X className="h-3.5 w-3.5" />
                <span>Yopish</span>
              </>
            ) : (
              <>
                <MessageCircle className="h-3.5 w-3.5" />
                <span>AI Ustozdan so&apos;rash</span>
              </>
            )}
          </button>

          <Link
            href="/coach"
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg hover:border-neon"
          >
            <span>To&apos;liq AI Xona</span>
            <ExternalLink className="h-3.5 w-3.5 text-neon" />
          </Link>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleAsk(
                  currentPromptUz
                    ? `Ustoz, ushbu savolda qaysi formuladan boshlashim kerak: "${currentPromptUz}"`
                    : `Ustoz, "${lessonTitle}" mavzusining eng asosiy siri nimada?`
                )
              }
              className="rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-neon hover:border-neon"
            >
              <Sparkles className="mr-1 inline h-3.5 w-3.5" />
              Shu joyini Socratic usulda tushuntiring
            </button>
            <button
              type="button"
              onClick={() =>
                handleAsk("Ustoz, biroz charchadim, diqqatimni qanday jamlayman?")
              }
              className="rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-gold hover:border-gold"
            >
              ☕ Diqqat va motivatsiya maslahati
            </button>
          </div>

          {reply && (
            <div
              id="lesson-ai-coach-reply"
              className="rounded-xl border border-neon/40 bg-canvas p-4 text-xs leading-relaxed text-fg sm:text-sm"
            >
              <div className="mb-1.5 font-bold text-neon">
                🤖 AI Ustoz ({honorificUsed}):
              </div>
              <div className="whitespace-pre-line">{reply}</div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`${honorific}, dars bo'yicha savolingizni yozing...`}
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2 text-xs text-fg focus:border-neon focus:outline-none sm:text-sm"
            />
            <button
              type="button"
              disabled={loading || !question.trim()}
              onClick={() => handleAsk()}
              className="btn-neon inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-bold disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? "..." : "So'rash"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
