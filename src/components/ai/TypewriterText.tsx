"use client";

import React, { useEffect, useState } from "react";

interface TypewriterTextProps {
  content: string;
  speedMs?: number;
  onFinish?: () => void;
  className?: string;
}

export function TypewriterText({
  content,
  speedMs = 15,
  onFinish,
  className = "",
}: TypewriterTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    setDisplayedLength(0);
    if (!content) return;

    let currentIndex = 0;
    const totalLength = content.length;
    // Har bir intervalda tezlikni matn hajmiga qarab moslashtirish
    // Agar matn uzun bo'lsa (500+ belgi), foydalanuvchi ko'p kutib qolmasligi uchun 2-3 tadan harf chiqariladi
    const stepSize = totalLength > 600 ? 4 : totalLength > 300 ? 2 : 1;

    const interval = setInterval(() => {
      currentIndex += stepSize;
      if (currentIndex >= totalLength) {
        setDisplayedLength(totalLength);
        clearInterval(interval);
        onFinish?.();
      } else {
        setDisplayedLength(currentIndex);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [content, speedMs, onFinish]);

  const isTyping = displayedLength < content.length;

  return (
    <div className={`whitespace-pre-line leading-relaxed ${className}`}>
      {content.slice(0, displayedLength)}
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
