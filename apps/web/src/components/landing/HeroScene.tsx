import { useEffect, useRef } from "react";

type RGB = [number, number, number];

/** The three tones the hero headline gradient already uses. */
const NODE_COLORS: RGB[] = [
  [126, 20, 255],
  [71, 191, 255],
  [166, 140, 255],
];

const FOCAL = 2.6;
const HALF_W = 0.34;
const HALF_H = 0.36;
const TAU = Math.PI * 2;

interface Dot {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: number;
  size: number;
  glow: boolean;
}

/** Deterministic so the field looks identical on every render and refresh. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A dependency-free "knowledge network": perspective-projected nodes drifting
 * through depth and linking up when they pass close to each other.
 *
 * Deliberately not three.js — the hero has to stay inside its performance
 * budget, so this is a few kB of code on a single canvas. devicePixelRatio is
 * capped at 1.5, rendering starts on idle, the loop stops when the hero
 * scrolls away or the tab is hidden, and nothing runs at all under
 * prefers-reduced-motion (the static TimeFlowMotif stands on its own).
 */
function runScene(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  ctx: CanvasRenderingContext2D,
) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  const random = seededRandom(0x37a1b2);
  const dots: Dot[] = [];
  const projX = new Float32Array(64);
  const projY = new Float32Array(64);
  const projS = new Float32Array(64);

  let width = 1;
  let height = 1;
  let heroHeight = 1;
  let dpr = 1;
  let dark = document.documentElement.classList.contains("dark");
  let frame = 0;
  let last = 0;
  let primed = false;
  let inView = false;
  let pointerX = 0;
  let pointerY = 0;
  let camX = 0;
  let camY = 0;

  const shouldRun = () =>
    primed && inView && !document.hidden && !motion.matches;

  function spawn(): Dot {
    return {
      x: random() * 2 - 1,
      y: random() * 2 - 1,
      z: random() * 1.4 - 0.7,
      vx: (random() - 0.5) * 0.05,
      vy: (random() - 0.5) * 0.05,
      vz: (random() - 0.5) * 0.024,
      color: Math.floor(random() * NODE_COLORS.length),
      size: 1.1 + random() * 2.3,
      glow: random() > 0.76,
    };
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    heroHeight = height;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round(
      Math.min(56, Math.max(20, (width * height) / 17000)),
    );
    while (dots.length < target) dots.push(spawn());
    dots.length = target;
  }

  function render(now: number) {
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
    last = now;

    camX += (pointerX * 16 - camX) * Math.min(dt * 3, 1);
    camY += (pointerY * 12 - camY) * Math.min(dt * 3, 1);

    const scrolled = window.scrollY;
    const fade = Math.max(0, 1 - scrolled / Math.max(heroHeight, 1));
    if (fade <= 0.01) return;
    const scrollShift = Math.min(scrolled, heroHeight) * 0.07;

    for (const dot of dots) {
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;
      dot.z += dot.vz * dt;
      if (dot.x > 1) dot.x = -1;
      else if (dot.x < -1) dot.x = 1;
      if (dot.y > 1) dot.y = -1;
      else if (dot.y < -1) dot.y = 1;
      if (dot.z > 0.7) {
        dot.z = 0.7;
        dot.vz *= -1;
      } else if (dot.z < -0.7) {
        dot.z = -0.7;
        dot.vz *= -1;
      }
    }

    const count = dots.length;
    const centreX = width / 2 + camX;
    const centreY = height / 2 + camY + scrollShift;
    for (let i = 0; i < count; i++) {
      const dot = dots[i];
      const scale = FOCAL / (FOCAL + dot.z);
      projS[i] = scale;
      projX[i] = centreX + dot.x * HALF_W * width * scale;
      projY[i] = centreY + dot.y * HALF_H * height * scale;
    }

    ctx.clearRect(0, 0, width, height);

    // Alpha budget: the headline sits on top of this layer, so the field may
    // only nudge the background luminance — never approach the text itself.
    const alphaScale = (dark ? 0.55 : 0.38) * fade;
    const linkDistance = Math.min(170, width * 0.15);
    const linkDistanceSq = linkDistance * linkDistance;

    ctx.lineWidth = 1;
    for (let i = 0; i < count; i++) {
      const color = NODE_COLORS[dots[i].color];
      const depthI = 0.35 + 0.65 * (1 - (dots[i].z + 0.7) / 1.4);
      for (let j = i + 1; j < count; j++) {
        const dx = projX[i] - projX[j];
        const dy = projY[i] - projY[j];
        const distSq = dx * dx + dy * dy;
        if (distSq > linkDistanceSq) continue;
        const depthJ = 0.35 + 0.65 * (1 - (dots[j].z + 0.7) / 1.4);
        const near = 1 - Math.sqrt(distSq) / linkDistance;
        const alpha = near * ((depthI + depthJ) / 2) * alphaScale * 0.45;
        if (alpha < 0.012) continue;
        const stroke =
          dots[i].color === dots[j].color
            ? color
            : NODE_COLORS[(dots[i].color + 1) % NODE_COLORS.length];
        ctx.strokeStyle = `rgba(${stroke[0]},${stroke[1]},${stroke[2]},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(projX[i], projY[i]);
        ctx.lineTo(projX[j], projY[j]);
        ctx.stroke();
      }
    }

    for (let i = 0; i < count; i++) {
      const dot = dots[i];
      const color = NODE_COLORS[dot.color];
      const scale = projS[i];
      const depth = 0.35 + 0.65 * (1 - (dot.z + 0.7) / 1.4);
      const x = projX[i];
      const y = projY[i];
      if (dot.glow) {
        const radius = dot.size * 7 * scale;
        if (
          x > -radius &&
          x < width + radius &&
          y > -radius &&
          y < height + radius
        ) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(
            0,
            `rgba(${color[0]},${color[1]},${color[2]},${alphaScale * depth * 0.3})`,
          );
          gradient.addColorStop(
            1,
            `rgba(${color[0]},${color[1]},${color[2]},0)`,
          );
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, TAU);
          ctx.fill();
        }
      }
      if (x < -8 || x > width + 8 || y < -8 || y > height + 8) continue;
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alphaScale * depth})`;
      ctx.beginPath();
      ctx.arc(x, y, dot.size * scale, 0, TAU);
      ctx.fill();
    }
  }

  function loop(now: number) {
    frame = 0;
    if (!shouldRun()) return;
    render(now);
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (frame || !shouldRun()) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function sync() {
    if (shouldRun()) start();
    else stop();
  }

  const onPointer = (event: PointerEvent) => {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = (event.clientY / window.innerHeight) * 2 - 1;
  };
  const onVisibility = () => sync();
  const onMotionChange = () => {
    sync();
    if (motion.matches) ctx.clearRect(0, 0, width, height);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      inView = entries[0]?.isIntersecting ?? false;
      sync();
    },
    { threshold: 0 },
  );
  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (!frame) ctx.clearRect(0, 0, width, height);
  });
  const themeObserver = new MutationObserver(() => {
    dark = document.documentElement.classList.contains("dark");
  });

  resize();
  observer.observe(canvas);
  resizeObserver.observe(host);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  motion.addEventListener("change", onMotionChange);
  document.addEventListener("visibilitychange", onVisibility);
  if (finePointer.matches) {
    window.addEventListener("pointermove", onPointer, { passive: true });
  }

  const idle: (callback: () => void) => number =
    "requestIdleCallback" in window
      ? window.requestIdleCallback.bind(window)
      : (callback) => window.setTimeout(callback, 120);
  const idleHandle = idle(() => {
    primed = true;
    sync();
  });

  return () => {
    stop();
    observer.disconnect();
    resizeObserver.disconnect();
    themeObserver.disconnect();
    motion.removeEventListener("change", onMotionChange);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointer);
    if (typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(idleHandle);
    } else {
      window.clearTimeout(idleHandle);
    }
  };
}

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    return runScene(canvas, host, ctx);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
