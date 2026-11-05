"use client";

import React from "react";
import { Pause, Volume2 } from "lucide-react";

export function CoachSpeechButton({
  active,
  disabled = false,
  onToggle,
}: {
  active: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      aria-label={active ? "Ovozli o'qishni to'xtatish" : "Javobni ovozli eshitish"}
      data-speech-btn
      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-neon bg-neon-soft text-neon shadow-[0_0_18px_-4px_rgba(198,244,50,0.7)]"
          : "border-border bg-elevated/70 text-fg-muted hover:border-neon/50 hover:text-neon"
      }`}
    >
      {active ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      <span>{active ? "To'xtatish" : "Ovozli eshitish"}</span>
      {active && (
        <span className="ml-0.5 flex h-4 items-end gap-0.5" aria-hidden>
          {[9, 15, 7, 13, 10, 16, 6].map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="coach-wave-bar w-0.5 rounded-full bg-neon"
              style={{
                height: `${height}px`,
                animationDelay: `${index * 0.11}s`,
              }}
            />
          ))}
        </span>
      )}
    </button>
  );
}
