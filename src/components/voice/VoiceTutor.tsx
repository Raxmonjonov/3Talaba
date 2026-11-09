"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  MessageCircle,
  Send,
  Settings2,
  User,
  Sliders,
} from "lucide-react";
import { useBrowserSpeech } from "@/lib/voice/useBrowserSpeech";
import {
  LessonSpeechSync,
  splitLessonIntoSentences,
} from "./LessonSpeechSync";

export { LessonSpeechSync, splitLessonIntoSentences };

export interface VoiceTutorProps {
  lessonTitle: string;
  summaryUz: string;
  theoryText: string;
  honorific: string;
  lessonSlug: string;
  lessonText?: string;
}

/**
 * VoiceTutor — AI Ustoz dars va ovoz sinxronizatsiyasi komponenti
 */
export function VoiceTutor({
  lessonTitle,
  summaryUz,
  theoryText,
  honorific,
  lessonSlug,
  lessonText,
}: VoiceTutorProps) {
  const {
    listening,
    stop: stopVoice,
    startListening,
    stopListening,
    settings,
    setSettings,
    availableVoices,
    selectedVoiceName,
    setSelectedVoiceName,
  } = useBrowserSpeech("uz-UZ");

  const [tutorReply, setTutorReply] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Butun dars ssenariysi matni
  const fullLessonText =
    lessonText ||
    `Assalomu alaykum, ${honorific}! Bugun siz bilan «${lessonTitle}» mavzusini o'rganamiz. ${summaryUz}. Keling, asosiy qoidalarni birma-bir ko'rib chiqamiz: ${theoryText}. Savollaringiz bo'lsa, mikrofon orqali bemalol so'rang!`;

  const handleSendQuestion = async (userQuestion: string) => {
    const text = userQuestion.trim();
    if (!text || asking) return;

    setAsking(true);
    setInputText("");

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
        const data = await res.json();
        const replyText =
          data?.assistantMessage?.content ||
          `Barakalla, ${honorific}! Savolingiz juda to'g'ri. Bu masalada asosiy qoidaga diqqat qiling.`;
        setTutorReply(replyText);
      }
    } catch {
      const fallback = `Albatta, ${honorific}, savolingizni qabul qildim. Keling, darsdagi misollarni ko'rib chiqamiz.`;
      setTutorReply(fallback);
    } finally {
      setAsking(false);
    }
  };

  const handleToggleMic = () => {
    if (listening) {
      stopListening();
    } else {
      stopVoice();
      startListening((text) => {
        if (text) {
          handleSendQuestion(text);
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Gapma-gap sinxronizatsiya qilingan asosiy audio pleyer */}
      <LessonSpeechSync
        lessonTitle={lessonTitle}
        lessonText={fullLessonText}
        honorific={honorific}
      />

      {/* Qo'shimcha mikrofon va ustoz bilan interaktiv muloqot paneli */}
      <div className="rounded-2xl border border-neon/30 bg-surface/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-soft text-neon">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-fg">
                Ustoz bilan savol-javob ({honorific})
              </p>
              <p className="text-[11px] text-fg-muted">
                Dars yuzasidan savol berish uchun mikrofon yoki yozuvdan foydalaning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              title="Ovozni sozlash"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:border-neon"
            >
              <Settings2 className="h-3.5 w-3.5 text-neon" />
              <span className="hidden sm:inline">Sozlamalar</span>
            </button>

            <button
              type="button"
              onClick={handleToggleMic}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                listening
                  ? "border-danger bg-danger text-white animate-pulse"
                  : "border-border bg-surface text-fg hover:border-neon"
              }`}
            >
              {listening ? (
                <>
                  <MicOff className="h-3.5 w-3.5" />
                  <span>To&apos;xtatish</span>
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5 text-neon" />
                  <span>🎤 Savol berish</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ovoz sozlamalari paneli */}
        {showSettings && (
          <div className="mt-3 rounded-xl border border-neon/30 bg-surface/95 p-3.5 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
              <div className="flex items-center gap-2 font-bold text-fg">
                <Sliders className="h-4 w-4 text-neon" />
                <span>Ovoz sozlamalari</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-fg-muted font-medium mb-1">
                  Ustoz ovozi turi:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, voiceGender: "female" }))
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-bold transition-all ${
                      settings.voiceGender === "female"
                        ? "border-neon bg-neon/20 text-neon"
                        : "border-border bg-surface text-fg"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    Madina (Ayol)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, voiceGender: "male" }))
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-bold transition-all ${
                      settings.voiceGender === "male"
                        ? "border-neon bg-neon/20 text-neon"
                        : "border-border bg-surface text-fg"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    Sardor (Erkak)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-fg-muted mb-1">
                  <span>Nutq tezligi:</span>
                  <span className="font-mono text-neon font-bold">
                    {settings.rate}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={settings.rate}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      rate: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-neon cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-fg-muted font-medium mb-1">
                  Brauzer ovozi:
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] text-fg focus:border-neon focus:outline-none"
                >
                  {availableVoices.length === 0 && (
                    <option value="">Standart tizim ovozi</option>
                  )}
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Ustoz javobi va savol yuborish formasi */}
        {tutorReply && (
          <div className="mt-3">
            <p className="text-xs font-bold text-neon mb-1.5 flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              Ustoz javobi:
            </p>
            <LessonSpeechSync
              lessonTitle="Ustoz tushuntirishi"
              lessonText={tutorReply}
              honorific={honorific}
              autoStart
            />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion(inputText);
          }}
          className="mt-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ustozga dars bo'yicha savol bering, ${honorific}…`}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-xs text-fg placeholder:text-fg-muted focus:border-neon focus:outline-none"
          />
          <button
            type="submit"
            disabled={asking || !inputText.trim()}
            className="btn-neon px-3.5 py-2 text-xs font-bold disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
