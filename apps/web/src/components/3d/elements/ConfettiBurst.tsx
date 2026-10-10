import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/usePerfFlags";

/** Fractional part — deterministic scatter, no Math.random at module scope. */
const frac = (n: number) => n - Math.floor(n);

const PALETTE = ["#3ddc84", "#ffd166", "#47bfff", "#c8a2ff", "#ff6b9d"] as const;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
}

const COUNT = 48;
const LIFE_MS = 1600;

/**
 * A short canvas confetti burst. Purely 2D — the student's "disable 3D"
 * switch leaves it alone — but it never runs under reduced motion.
 * `trigger` is a counter: bump it to fire once more.
 */
export function ConfettiBurst({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (trigger <= 0 || reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const originX = width / 2;
    const originY = height * 0.35;
    const start = performance.now();

    const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const t = (i + 1) * 0.618033988749895;
      const angle = -Math.PI / 2 + (frac(t) - 0.5) * 1.8;
      const speed = 3.2 + frac(t * 1.7) * 4.5;
      return {
        x: originX + (frac(t * 2.3) - 0.5) * 40,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: frac(t * 3.1) * Math.PI,
        vr: (frac(t * 4.3) - 0.5) * 0.35,
        w: 5 + frac(t * 5.7) * 5,
        h: 3 + frac(t * 6.1) * 4,
        color: PALETTE[i % PALETTE.length],
      };
    });

    const tick = (now: number) => {
      const elapsed = now - start;
      const alpha = Math.max(0, 1 - elapsed / LIFE_MS);
      ctx.clearRect(0, 0, width, height);
      if (alpha <= 0) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      ctx.globalAlpha = alpha;
      for (const p of particles) {
        p.vy += 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [trigger, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
