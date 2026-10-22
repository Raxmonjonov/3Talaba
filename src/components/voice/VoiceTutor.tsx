"use client";

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
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

interface VoiceTutorProps {
  lessonTitle: string;
  summaryUz: string;
  theoryText: string;
  honorific: string;
  lessonSlug: string;
}

export function VoiceTutor({
  lessonTitle,
  summaryUz,
  theoryText,
  honorific,
  lessonSlug,
}: VoiceTutorProps) {
  const {
    speaking,
    listening,
    speak,
    stop,
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

  const handleStartVoiceLesson = () => {
    if (speaking) {
      stop();
      return;
    }

    const script = `Assalomu alaykum, ${honorific}! Bugun siz bilan «${lessonTitle}» mavzusini o'rganamiz. ${summaryUz}. Keling, asosiy qoidalarni birma-bir ko'rib chiqamiz: ${theoryText}. Savollaringiz bo'lsa, mikrofon orqali bemalol so'rang!`;
    speak(script);
  };

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
        speak(replyText);
      }
    } catch {
      const fallback = `Albatta, ${honorific}, savolingizni qabul qildim. Keling, darsdagi misollarni ko'rib chiqamiz.`;
      setTutorReply(fallback);
      speak(fallback);
    } finally {
      setAsking(false);
    }
  };

  const handleToggleMic = () => {
    if (listening) {
      stopListening();
    } else {
      stop();
      startListening((text) => {
        if (text) {
          handleSendQuestion(text);
        }
      });
    }
  };

  const handleTestVoice = (gender: "female" | "male") => {
    setSettings((prev) => ({ ...prev, voiceGender: gender }));
    const sample =
      gender === "female"
        ? `Salom! Men Madinaman. Darsingizni birgalikda o'rganishga tayyorman.`
        : `Salom! Men Sardorman. Darsingizni birgalikda o'rganishga tayyorman.`;
    speak(sample);
  };

  return (
    <div className="rounded-2xl border-2 border-neon/40 bg-neon-soft/10 p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all ${
              speaking
                ? "border-neon bg-neon text-canvas shadow-neon animate-pulse"
                : "border-neon/40 bg-neon-soft text-neon"
            }`}
          >
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neon/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-neon">
                OVOZLI AI USTOZ
              </span>
              <span className="text-xs text-fg-muted">Tabiiy insoniy ovoz rejimi</span>
            </div>
            <h3 className="mt-0.5 text-sm font-bold text-fg sm:text-base">
              {speaking
                ? "Ustoz darsni tushuntiryapti…"
                : listening
                  ? "Sizni tinglayapman… gapiring"
                  : `Ustoz bilan jonli dars (${honorific})`}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ovoz sozlamalari tugmasi */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            title="Ovozni sozlash"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg hover:border-neon"
          >
            <Settings2 className="h-3.5 w-3.5 text-neon" />
            <span className="hidden sm:inline">Ovoz sozlamasi</span>
          </button>

          <button
            type="button"
            onClick={handleStartVoiceLesson}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              speaking
                ? "border border-danger/60 bg-danger/20 text-danger hover:bg-danger/30"
                : "btn-neon"
            }`}
          >
            {speaking ? (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Ovozni to&apos;xtatish</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                <span>▶ Darsni Ovozli Tinglash</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleMic}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
              listening
                ? "border-danger bg-danger text-white animate-pulse"
                : "border-border bg-surface text-fg hover:border-neon"
            }`}
          >
            {listening ? (
              <>
                <MicOff className="h-4 w-4" />
                <span>To&apos;xtatish</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 text-neon" />
                <span>🎤 Ustozga savol berish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ovoz sozlamalari paneli */}
      {showSettings && (
        <div className="mt-4 rounded-xl border border-neon/30 bg-surface/95 p-4 text-xs transition-all animate-fadeIn">
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
            <div className="flex items-center gap-2 font-bold text-fg">
              <Sliders className="h-4 w-4 text-neon" />
              <span>Ovoz va O'qish Tebranishini Moslash</span>
            </div>
            <span className="text-[11px] text-fg-muted">Odamdek tabiiy talaffuz uchun</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Ovoz turi (Erkak / Ayol) */}
            <div>
              <label className="block text-fg-muted font-medium mb-1">Ustoz ovozi:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestVoice("female")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    settings.voiceGender === "female"
                      ? "border-neon bg-neon/20 text-neon"
                      : "border-border bg-surface text-fg hover:border-fg-muted"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  Madina (Ayol)
                </button>
                <button
                  type="button"
                  onClick={() => handleTestVoice("male")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    settings.voiceGender === "male"
                      ? "border-neon bg-neon/20 text-neon"
                      : "border-border bg-surface text-fg hover:border-fg-muted"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  Sardor (Erkak)
                </button>
              </div>
            </div>

            {/* Nutq tezligi */}
            <div>
              <div className="flex justify-between text-fg-muted mb-1">
                <span>Nutq tezligi:</span>
                <span className="font-mono text-neon font-bold">{settings.rate}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.05"
                value={settings.rate}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, rate: parseFloat(e.target.value) }))
                }
                className="w-full accent-neon cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-fg-muted mt-0.5">
                <span>Sekin</span>
                <span>Odamdek (0.95x)</span>
                <span>Tez</span>
              </div>
            </div>

            {/* Brauzer ovozini qo'lda tanlash */}
            <div>
              <label className="block text-fg-muted font-medium mb-1">Brauzer ovozi:</label>
              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-[11px] text-fg focus:border-neon focus:outline-none"
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

      {tutorReply && (
        <div className="mt-4 rounded-xl border border-neon/30 bg-surface/90 p-4 text-xs leading-relaxed text-fg sm:text-sm">
          <div className="mb-1 flex items-center gap-1.5 font-bold text-neon">
            <MessageCircle className="h-4 w-4" />
            <span>Ustoz javobi:</span>
          </div>
          <p>{tutorReply}</p>
        </div>
      )}

      {/* Yozma ravishda savol berish imkoniyati */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuestion(inputText);
        }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ustozga dars bo'yicha savol bering, ${honorific}…`}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs text-fg placeholder:text-fg-muted focus:border-neon focus:outline-none"
        />
        <button
          type="submit"
          disabled={asking || !inputText.trim()}
          className="btn-neon px-4 py-2.5 text-xs font-bold disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
