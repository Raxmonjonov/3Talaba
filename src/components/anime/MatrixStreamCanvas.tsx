"use client";

import React, { useEffect, useRef } from "react";
import { useUIPreferences } from "@/components/providers/AppProviders";

const GLYPHS = [
  "0",
  "1",
  "3",
  "7",
  "8.5",
  "1550",
  "1600",
  "SAT",
  "IELTS",
  "∑",
  "∫",
  "π",
  "√",
  "Δ",
  "∞",
  "f(x)",
  "x²",
  "O'",
  "G'",
  "A+",
  "B2",
  "C1",
];

export function MatrixStreamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reduceMotion, theme } = useUIPreferences();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (reduceMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationFrameId = 0;
    let lastDrawTime = 0;

    // Past quvvatli qurilma yoki mobil ekranda zarrachalar zichligini kamaytirish
    const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
    const isLowPower = cores <= 4 || window.innerWidth < 768;
    const columnSpacing = isLowPower ? 68 : 44;
    const targetFpsInterval = isLowPower ? 1000 / 24 : 1000 / 36;

    let columns = 0;
    let drops: number[] = [];
    let speeds: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.max(6, Math.floor(canvas.width / columnSpacing));
      drops = Array.from({ length: columns }, () => Math.random() * -40);
      speeds = Array.from({ length: columns }, () => 0.16 + Math.random() * 0.28);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const render = (timestamp: number) => {
      animationFrameId = window.requestAnimationFrame(render);

      if (timestamp - lastDrawTime < targetFpsInterval) return;
      lastDrawTime = timestamp;

      // Yumshoq iz qoldirish
      ctx.fillStyle =
        theme === "dark" ? "rgba(5, 10, 14, 0.18)" : "rgba(244, 248, 246, 0.24)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "500 12px monospace";

      for (let i = 0; i < columns; i++) {
        const glyph = GLYPHS[(i * 7 + Math.floor(drops[i])) % GLYPHS.length];
        const x = i * columnSpacing + 14;
        const y = drops[i] * 22;

        const isGoldAccent = i % 7 === 0;
        if (theme === "dark") {
          ctx.fillStyle = isGoldAccent
            ? "rgba(245, 158, 11, 0.20)"
            : "rgba(16, 185, 129, 0.16)";
        } else {
          ctx.fillStyle = isGoldAccent
            ? "rgba(217, 119, 6, 0.16)"
            : "rgba(5, 150, 105, 0.13)";
        }

        ctx.fillText(glyph, x, y);

        drops[i] += speeds[i];
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = -2;
        }
      }
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion, theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
    />
  );
}
