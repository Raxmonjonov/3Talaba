"use client";

import React, { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useUIPreferences } from "@/components/providers/AppProviders";

const COLORS = ["#10B981", "#00E676", "#F59E0B", "#FBBF24", "#38BDF8", "#A855F7"];

export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { reduceMotion } = useUIPreferences();

  useEffect(() => {
    if (!trigger || reduceMotion || !containerRef.current) return;

    const pieces = containerRef.current.querySelectorAll<HTMLElement>("[data-confetti]");
    pieces.forEach((el, idx) => {
      const angle = (idx / pieces.length) * Math.PI * 2;
      const dist = 70 + (idx % 5) * 32;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 40;

      animate(el, {
        opacity: [1, 1, 0],
        translateX: [0, tx],
        translateY: [0, ty],
        rotate: [0, (idx % 2 === 0 ? 1 : -1) * 260],
        scale: [0.4, 1.15, 0.6],
        duration: 1350,
        ease: "outQuart",
      });
    });
  }, [trigger, reduceMotion]);

  if (!trigger || reduceMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      {Array.from({ length: 28 }).map((_, idx) => (
        <span
          key={idx}
          data-confetti
          style={{
            backgroundColor: COLORS[idx % COLORS.length],
          }}
          className="absolute h-2.5 w-2.5 rounded-sm opacity-0"
        />
      ))}
    </div>
  );
}
