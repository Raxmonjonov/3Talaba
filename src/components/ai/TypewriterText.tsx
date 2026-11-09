"use client";

import React, { useEffect, useRef, useState } from "react";
import { jarvisVoice } from "@/lib/voice/jarvis-speech";

export interface TypewriterTextProps {
  content: string;
  speedMs?: number;
  onFinish?: () => void;
  className?: string;
  mode?: "sentence" | "phrase" | "word";
  syncWithVoice?: boolean;
}

/**
 * Tabiiy o'qish ritmiga moslashtirilgan matn animatsiyasi (Typewriter Effect).
 * 
 * 3-Talab:
 * - Matnni harfma-harf uzmasdan, gaplar va iboralar (sentence/phrase) bo'yicha silliq chiqaradi.
 * - Audio bilan sinxron bo'lganda audioni qayta boshlatib yubormaydi va so'zlarni uzib qo'ymaydi.
 * - Matn streaming orqali yangilanganda har safar boshidan (0 dan) qayta boshlamaydi.
 */
export function TypewriterText({
  content,
  speedMs = 28,
  onFinish,
  className = "",
  mode = "phrase",
  syncWithVoice = false,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const prevContentRef = useRef("");
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Audio bilan sinxronizatsiya: jarvisVoice ning currentSentence holatiga qarab silliq chiqaradi
  useEffect(() => {
    if (!syncWithVoice) return;

    const unsub = jarvisVoice.subscribe((voiceState) => {
      if (!voiceState.isSpeaking && !voiceState.isPaused) {
        if (content) {
          setDisplayedText(content);
          onFinishRef.current?.();
        }
      } else if (voiceState.currentSentence) {
        const sentence = voiceState.currentSentence.trim();
        const sentenceIdx = content.indexOf(sentence);
        if (sentenceIdx !== -1) {
          const targetLength = sentenceIdx + sentence.length;
          setDisplayedText((prev) => {
            if (prev.length < targetLength) {
              return content.slice(0, targetLength);
            }
            return prev;
          });
        }
      }
    });

    return unsub;
  }, [syncWithVoice, content]);

  useEffect(() => {
    if (syncWithVoice) return;

    if (!content) {
      setDisplayedText("");
      prevContentRef.current = "";
      return;
    }

    // Agar matn avvalgi ko'rsatilgan matnning bevosita davomi bo'lsa (streaming),
    // boshidan qayta boshlab sakramaydi
    const isExtension =
      prevContentRef.current &&
      content.startsWith(prevContentRef.current) &&
      content.length > prevContentRef.current.length;

    prevContentRef.current = content;

    // Ajratish usuli:
    // "sentence" -> to'liq gaplar bo'yicha
    // "phrase"   -> 2-3 so'zdan iborat ravon iboralar bo'yicha
    // "word"     -> so'zma-so'z
    let tokens: string[];
    if (mode === "sentence") {
      tokens = content.match(/[^.!?]+[.!?]*\s*/g) ?? [content];
    } else {
      tokens = content.match(/\S+\s*/g) ?? [content];
    }

    if (tokens.length <= 2) {
      setDisplayedText(content);
      onFinishRef.current?.();
      return;
    }

    let tokenIndex = 0;
    if (isExtension && displayedText.length > 0) {
      let accumulated = 0;
      for (let i = 0; i < tokens.length; i++) {
        accumulated += tokens[i].length;
        if (accumulated >= displayedText.length) {
          tokenIndex = i + 1;
          break;
        }
      }
    } else {
      const initialStep = mode === "sentence" ? 1 : tokens.length > 90 ? 3 : 2;
      tokenIndex = initialStep;
      setDisplayedText(tokens.slice(0, tokenIndex).join(""));
    }

    const step = mode === "sentence" ? 1 : tokens.length > 90 ? 3 : tokens.length > 40 ? 2 : 1;
    const intervalMs = mode === "sentence" ? Math.max(speedMs * 6, 240) : speedMs;

    const interval = setInterval(() => {
      tokenIndex += step;
      if (tokenIndex >= tokens.length) {
        setDisplayedText(content);
        clearInterval(interval);
        onFinishRef.current?.();
      } else {
        setDisplayedText(tokens.slice(0, tokenIndex).join(""));
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [content, speedMs, mode, syncWithVoice]);

  const isTyping = displayedText.length < content.length;

  return (
    <div className={`whitespace-pre-line leading-relaxed ${className}`}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-neon animate-pulse" />
      )}
    </div>
  );
}

export function ThinkingBubble({
  modeLabel = "Ustoz fikrlamoqda…",
}: {
  modeLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-neon/30 bg-surface/80 px-4 py-3 text-xs text-fg-muted shadow-sm animate-pulse">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-neon animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-neon animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-neon animate-bounce" />
      </div>
      <span className="font-semibold text-neon">{modeLabel}</span>
    </div>
  );
}
