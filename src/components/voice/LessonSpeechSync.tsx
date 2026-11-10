"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Sparkles,
  CheckCircle2,
  Brain,
  AudioLines,
} from "lucide-react";
import {
  cleanTextForSpeech,
  pickBestTeacherVoice,
} from "@/lib/voice/jarvis-speech";

export interface LessonSpeechSyncProps {
  lessonTitle?: string;
  lessonText: string;
  honorific?: string;
  autoStart?: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * AI Dars matnini to'liq gaplarga ajratish:
 * Regex: /[^.!?]+[.!?]+|[^.!?]+/g
 * Bitta harfli yoki mikr-bo'laklar (length <= 1) butunlay filtrlanadi.
 */
export function splitLessonIntoSentences(text: string): string[] {
  if (!text || typeof text !== "string") return [];
  const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+/g);
  if (!matches) return [];
  return matches
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

/**
 * LessonSpeechSync (Dars va Ovozni Gapma-gap Sinxronizatsiya Qilish Komponenti)
 * --------------------------------------------------------------------------
 * 1. Bitta harfli yoki so'z tokenlarida nutq sintezini ishga tushirmaydi.
 * 2. Matnni /[^.!?]+[.!?]+|[^.!?]+/g regexi orqali to'liq gaplarga ajratadi.
 * 3. Gapma-gap audio oqimi: har bir gap tugagach (utterance.onend), u ekranda
 *    ochiladi va keyingi gapga silliq o'tiladi.
 * 4. Aniq boshqaruv tugmalari: Start, Pause va Stop (audio takrorlanmasligi uchun
 *    speechSynthesis.cancel() toza chaqiriladi).
 * 5. isSpeaking true bo'lganda animatsiya qilinuvchi pulsatsiyalovchi AI Ustoz avatar indikatori.
 */
export function LessonSpeechSync({
  lessonTitle = "AI Ustoz Darsi",
  lessonText,
  honorific = "Bo'lajak Talaba",
  autoStart = false,
  onComplete,
  className = "",
}: LessonSpeechSyncProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [revealedSentences, setRevealedSentences] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const sentences = useMemo(() => {
    return splitLessonIntoSentences(lessonText);
  }, [lessonText]);

  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const serverAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextSentenceTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isAbortedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Brauzer ovozlarini olish va eng sifatli Natural ovozni tanlash
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const best = pickBestTeacherVoice(voices, "uz-UZ");
        setSelectedVoice(best);
      }
    };

    updateVoice();
    window.speechSynthesis.addEventListener?.("voiceschanged", updateVoice);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", updateVoice);
    };
  }, []);

  const clearTimers = useCallback(() => {
    if (nextSentenceTimerRef.current) {
      clearTimeout(nextSentenceTimerRef.current);
      nextSentenceTimerRef.current = null;
    }
  }, []);

  // Xavfsiz to'xtatish (speechSynthesis.cancel chaqirib, audiolarni bir-biriga minishini oldini oladi)
  const cancelAudioPlayback = useCallback(() => {
    clearTimers();
    if (serverAudioRef.current) {
      try {
        serverAudioRef.current.pause();
        serverAudioRef.current.currentTime = 0;
        serverAudioRef.current.src = "";
      } catch {
        // ignore
      }
      serverAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    activeUtteranceRef.current = null;
  }, [clearTimers]);

  // Tabiiy insoniy ovoz: Server Neural Audio (Gemini TTS) orqali o'qish
  const playServerAudio = useCallback(
    (sentence: string, onEnded: () => void, onErrorFallback?: () => void) => {
      if (isAbortedRef.current || typeof window === "undefined" || typeof Audio === "undefined") {
        if (onErrorFallback) onErrorFallback();
        else onEnded();
        return;
      }

      try {
        const audioUrl = `/api/tts?text=${encodeURIComponent(sentence)}&voice=Aoede&speed=0.95`;
        const audio = new Audio(audioUrl);
        serverAudioRef.current = audio;

        audio.onplay = () => {
          if (isAbortedRef.current) return;
          setIsSpeaking(true);
          setIsPaused(false);
        };

        audio.onended = () => {
          serverAudioRef.current = null;
          onEnded();
        };

        audio.onerror = () => {
          serverAudioRef.current = null;
          if (onErrorFallback) onErrorFallback();
          else onEnded();
        };

        void audio.play().catch(() => {
          serverAudioRef.current = null;
          if (onErrorFallback) onErrorFallback();
          else onEnded();
        });
      } catch {
        if (onErrorFallback) onErrorFallback();
        else onEnded();
      }
    },
    []
  );

  // Gapma-gap nutq ijrosi
  const speakSentence = useCallback(
    (index: number) => {
      if (isAbortedRef.current) return;

      if (index >= sentences.length) {
        setIsSpeaking(false);
        setIsPaused(false);
        activeUtteranceRef.current = null;
        onCompleteRef.current?.();
        return;
      }

      const rawSentence = sentences[index];
      // 1-Qoida: Bitta harf yoki token bo'lsa nutq boshlamasdan keyingisiga o'tish
      if (!rawSentence || rawSentence.trim().length <= 1) {
        speakSentence(index + 1);
        return;
      }

      const cleaned = cleanTextForSpeech(rawSentence);

      const advanceNext = () => {
        if (isAbortedRef.current) return;
        setRevealedSentences((prev) =>
          prev.includes(rawSentence) ? prev : [...prev, rawSentence]
        );
        const nextIndex = index + 1;
        if (nextIndex < sentences.length) {
          nextSentenceTimerRef.current = setTimeout(() => {
            speakSentence(nextIndex);
          }, 60);
        } else {
          setIsSpeaking(false);
          setIsPaused(false);
          onCompleteRef.current?.();
        }
      };

      setCurrentSentenceIndex(index);

      // 1-USTUVORLIK: Gemini Neural Multilingual TTS (Tabiiy o'zbek tili)
      playServerAudio(
        cleaned,
        advanceNext,
        () => {
          // Zaxira: Web Speech API (faqat server mavjud bo'lmaganda)
          if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            advanceNext();
            return;
          }

          const availableVoices = window.speechSynthesis.getVoices();
          const voice =
            selectedVoice ||
            pickBestTeacherVoice(availableVoices, "uz-UZ") ||
            availableVoices[0];

          const utter = new SpeechSynthesisUtterance(cleaned);

          if (voice) {
            utter.voice = voice;
            utter.lang = voice.lang;
          } else {
            utter.lang = typeof navigator !== "undefined" ? navigator.language : "uz-UZ";
          }

          utter.rate = 0.95;
          utter.pitch = 1.0;
          utter.volume = 1.0;

          activeUtteranceRef.current = utter;

          utter.onstart = () => {
            if (isAbortedRef.current) return;
            setIsSpeaking(true);
            setIsPaused(false);
          };

          utter.onend = () => {
            activeUtteranceRef.current = null;
            advanceNext();
          };

          utter.onerror = () => {
            activeUtteranceRef.current = null;
            advanceNext();
          };

          try {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
            window.speechSynthesis.speak(utter);
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          } catch {
            advanceNext();
          }
        }
      );
    },
    [playServerAudio, selectedVoice, sentences]
  );

  // Komponent yopilganda audioni to'liq to'xtatish
  useEffect(() => {
    return () => {
      isAbortedRef.current = true;
      cancelAudioPlayback();
    };
  }, [cancelAudioPlayback]);

  // autoStart yoqilgan bo'lsa
  useEffect(() => {
    if (autoStart && sentences.length > 0) {
      isAbortedRef.current = false;
      speakSentence(0);
    }
  }, [autoStart, sentences, speakSentence]);

  // 4-Qoida: Aniq boshqaruv nazoratchilari (Start, Pause, Stop)
  const handleStart = () => {
    isAbortedRef.current = false;

    if (isPaused) {
      // Pauzadan davom ettirish
      setIsPaused(false);
      speakSentence(currentSentenceIndex);
    } else {
      // Boshidan toza boshlash (oldingi audioni to'liq cancel qilib)
      cancelAudioPlayback();
      setRevealedSentences([]);
      setCurrentSentenceIndex(0);
      setTimeout(() => {
        if (!isAbortedRef.current) {
          speakSentence(0);
        }
      }, 50);
    }
  };

  const handlePause = () => {
    clearTimers();
    isAbortedRef.current = true;
    if (serverAudioRef.current && !serverAudioRef.current.paused) {
      serverAudioRef.current.pause();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsSpeaking(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    isAbortedRef.current = true;
    cancelAudioPlayback();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSentenceIndex(0);
    setRevealedSentences([]);
  };

  const isCurrentSentence = (idx: number) =>
    isSpeaking && currentSentenceIndex === idx;

  return (
    <div
      className={`rounded-2xl border-2 border-neon/40 bg-surface/90 p-5 shadow-lg backdrop-blur-md transition-all ${className}`}
    >
      {/* 5-Qoida: Pulsatsiyalovchi AI Ustoz Avatar Indikatori va Ma'lumot */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar State with glowing pulse indicator */}
          <div className="relative flex items-center justify-center">
            {isSpeaking && (
              <>
                <span className="absolute -inset-1 rounded-2xl bg-neon/30 animate-ping opacity-60" />
                <span className="absolute -inset-1.5 rounded-2xl border border-neon/60 animate-pulse" />
              </>
            )}
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all ${
                isSpeaking
                  ? "border-neon bg-neon text-canvas shadow-[0_0_20px_rgba(198,244,50,0.6)]"
                  : isPaused
                    ? "border-gold bg-gold-soft text-gold"
                    : "border-border bg-elevated text-fg-muted"
              }`}
            >
              {isSpeaking ? (
                <Brain className="h-6 w-6 animate-pulse" />
              ) : isPaused ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${
                  isSpeaking
                    ? "bg-neon/20 text-neon animate-pulse"
                    : isPaused
                      ? "bg-gold/20 text-gold"
                      : "bg-surface text-fg-muted border border-border"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <AudioLines className="h-3 w-3 animate-spin" />
                    <span>Ustoz gapirmoqda</span>
                  </>
                ) : isPaused ? (
                  <span>Pauzada</span>
                ) : (
                  <span>Tinglashga tayyor</span>
                )}
              </span>

              {isSpeaking && (
                <div className="flex items-end gap-0.5 h-3.5 ml-1">
                  <span className="w-0.5 bg-neon rounded-full animate-bounce h-2 [animation-delay:-0.3s]" />
                  <span className="w-0.5 bg-neon rounded-full animate-bounce h-3.5 [animation-delay:-0.15s]" />
                  <span className="w-0.5 bg-neon rounded-full animate-bounce h-2.5 [animation-delay:-0.45s]" />
                </div>
              )}
            </div>

            <h3 className="mt-1 text-sm font-extrabold text-fg sm:text-base">
              {lessonTitle}
            </h3>
            <p className="text-xs text-fg-muted">
              Gapma-gap sinxronizatsiya • {honorific} uchun
            </p>
          </div>
        </div>

        {/* 4-Qoida: Aniq Boshqaruv Tugmalari (Start, Pause, Stop) */}
        <div className="flex items-center gap-2">
          {/* Start / Resume */}
          <button
            type="button"
            onClick={handleStart}
            disabled={isSpeaking}
            aria-label="Darsni boshlash"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              isSpeaking
                ? "border border-border bg-surface text-fg-muted"
                : "btn-neon shadow-neon"
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{isPaused ? "Davom ettirish" : "Start"}</span>
          </button>

          {/* Pause */}
          <button
            type="button"
            onClick={handlePause}
            disabled={!isSpeaking}
            aria-label="Ovozni vaqtincha to'xtatish"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gold/50 bg-gold-soft px-3.5 py-2.5 text-xs font-bold text-gold transition-all hover:bg-gold/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Pause className="h-4 w-4" />
            <span>Pause</span>
          </button>

          {/* Stop */}
          <button
            type="button"
            onClick={handleStop}
            disabled={!isSpeaking && !isPaused && revealedSentences.length === 0}
            aria-label="Ovozni butunlay to'xtatish"
            className="inline-flex items-center gap-1.5 rounded-xl border border-danger/50 bg-danger/10 px-3.5 py-2.5 text-xs font-bold text-danger transition-all hover:bg-danger/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Square className="h-4 w-4 fill-current" />
            <span>Stop</span>
          </button>
        </div>
      </div>

      {/* 3-Qoida: Gapma-gap oqim ko'rinishi (Audio tugagach ekranda ochiladi) */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-fg-muted mb-2 font-semibold">
          <span>O'rganilgan gaplar:</span>
          <span>
            {revealedSentences.length} / {sentences.length} gap
          </span>
        </div>

        <div className="space-y-2.5 min-h-[140px] max-h-72 overflow-y-auto rounded-xl border border-border/80 bg-canvas/90 p-4">
          {revealedSentences.length === 0 && !isSpeaking && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-fg-muted">
              <Volume2 className="h-8 w-8 text-neon/60 mb-2" />
              <p className="text-xs font-semibold">
                Darsni boshlash uchun «Start» tugmasini bosing.
              </p>
              <p className="text-[11px] text-fg-muted/70 mt-1">
                AI Ustoz gaplarni ovozda o'qib beradi va har bir gap tugagach
                ekranda ochiladi.
              </p>
            </div>
          )}

          {revealedSentences.map((sentence, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 rounded-lg border border-neon/20 bg-neon-soft/10 p-2.5 text-xs sm:text-sm leading-relaxed text-fg animate-fadeIn transition-all"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-neon mt-0.5" />
              <p>{sentence}</p>
            </div>
          ))}

          {/* Hozir ovozda aytilayotgan gap (Active Pulsing Indicator) */}
          {isSpeaking &&
            sentences[currentSentenceIndex] &&
            !revealedSentences.includes(sentences[currentSentenceIndex]) && (
              <div className="flex items-start gap-2.5 rounded-lg border-2 border-neon bg-neon-soft/20 p-3 text-xs sm:text-sm font-semibold leading-relaxed text-white shadow-neon animate-pulse">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neon text-[10px] font-black text-canvas mt-0.5">
                  ▶
                </span>
                <p>{sentences[currentSentenceIndex]}</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
