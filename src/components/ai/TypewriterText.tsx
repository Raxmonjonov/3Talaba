"use client";

import React, { useEffect, useState } from "react";

interface TypewriterTextProps {
  content: string;
  speedMs?: number;
  onFinish?: () => void;
  className?: string;
}

/**
 * Tabiiy o'qish ritmiga moslashtirilgan matn animatsiyasi.
 * So'zlarni harfma-harf uzib qo'ymasdan, butun so'z bo'laklari bo'yicha silliq chiqaradi.
 */
export function TypewriterText({
  content,
  speedMs = 28,
  onFinish,
  className = "",
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!content) {
      setDisplayedText("");
      return;
    }

    const tokens = content.match(/\S+\s*/g) ?? [content];
    if (tokens.length <= 3) {
      setDisplayedText(content);
      onFinish?.();
      return;
    }

    let tokenIndex = 0;
    const wordsPerTick = tokens.length > 90 ? 3 : tokens.length > 40 ? 2 : 1;
    setDisplayedText(tokens.slice(0, wordsPerTick).join(""));
    tokenIndex = wordsPerTick;

    const interval = setInterval(() => {
      tokenIndex += wordsPerTick;
      if (tokenIndex >= tokens.length) {
        setDisplayedText(content);
        clearInterval(interval);
        onFinish?.();
      } else {
        setDisplayedText(tokens.slice(0, tokenIndex).join(""));
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [content, speedMs, onFinish]);

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
