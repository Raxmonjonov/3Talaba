import { useEffect, useRef, useState } from "react";
import {
  animate,
  createAnimatable,
  createDraggable,
  createSpring,
  stagger,
} from "animejs";
import type { AnimatableObject } from "animejs";
import {
  useAnimeScope,
  prefersReducedMotion,
  formatMinutesShort,
} from "@/lib/anime";
import { ClockIcon } from "./Icons";

const MIN = 15;
const MAX = 180;
const STEP = 15;
const CUSTOM_BEYOND = 120;

function snap(value: number): number {
  const clamped = Math.min(MAX, Math.max(MIN, value));
  return Math.round(clamped / STEP) * STEP;
}

/**
 * Daily study-time picker in the anime.js demo language: a draggable knob
 * on a rail. Releasing snaps with a spring. Values above 2 hours switch to
 * a free number input so a motivated student can go further.
 */
export function DailyTimeDemo() {
  const root = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const animatableRef = useRef<AnimatableObject | null>(null);
  const [minutes, setMinutes] = useState(60);
  const [custom, setCustom] = useState(false);
  const suppressSync = useRef(false);

  const railWidth = () => {
    const track = knobRef.current?.parentElement;
    if (!track || !knobRef.current) return 0;
    return track.clientWidth - knobRef.current.clientWidth;
  };
  const toX = (m: number) => ((m - MIN) / (MAX - MIN)) * railWidth();
  const fromX = (x: number) => {
    const w = railWidth();
    return w > 0 ? MIN + (x / w) * (MAX - MIN) : MIN;
  };
  const toPct = (m: number) => ((m - MIN) / (MAX - MIN)) * 100;

  const paint = (m: number) => {
    if (fillRef.current) fillRef.current.style.width = `${toPct(m)}%`;
    if (valueRef.current) valueRef.current.textContent = formatMinutesShort(m);
    const knob = knobRef.current;
    if (knob) {
      knob.setAttribute("aria-valuenow", String(m));
      knob.setAttribute("aria-valuetext", formatMinutesShort(m));
    }
  };

  const moveKnob = (m: number, instant = false) => {
    const knob = knobRef.current;
    if (!knob) return;
    const x = toX(m);
    const animatable = animatableRef.current;
    if (instant || prefersReducedMotion() || !animatable) {
      knob.style.transform = `translate3d(${x}px, 0, 0)`;
      return;
    }
    animatable.x(x, 420, "outCubic");
  };

  const goTo = (m: number) => {
    const next = snap(m);
    suppressSync.current = true;
    setMinutes(next);
    setCustom(next >= CUSTOM_BEYOND);
    paint(next);
    moveKnob(next);
  };

  useAnimeScope(root, () => {
    const knob = knobRef.current;
    if (!knob) return;

    const spring = createSpring({ stiffness: 150, damping: 16 });
    const animatable = createAnimatable(knob, {
      x: 420,
      ease: "outCubic",
    });
    animatableRef.current = animatable;

    // initial placement without animation
    moveKnob(60, true);
    paint(60);

    if (prefersReducedMotion()) return;

    const draggable = createDraggable(knob, {
      y: false,
      x: { snap: (d) => toX(snap(fromX(Number(d.x) || 0))) },
      container: knob.parentElement!,
      releaseEase: spring,
      onDrag: () => {
        const raw = fromX(Number(draggable.x) || 0);
        // fill follows the raw pointer for a smooth continuous feel
        if (fillRef.current) fillRef.current.style.width = `${toPct(raw)}%`;
        if (valueRef.current)
          valueRef.current.textContent = formatMinutesShort(snap(raw));
      },
      onRelease: () => {
        const x = Number(draggable.x) || 0;
        const m = snap(fromX(x));
        moveKnob(m);
        paint(m);
        suppressSync.current = true;
        setMinutes(m);
        setCustom(m >= CUSTOM_BEYOND);
      },
    });

    return () => {
      animatableRef.current = null;
      animatable.revert();
      draggable.revert();
    };
  }, []);

  // Sync knob when minutes changes from keyboard / preset / custom input.
  useEffect(() => {
    if (suppressSync.current) {
      suppressSync.current = false;
      return;
    }
    paint(minutes);
    moveKnob(minutes);
  }, [minutes]);

  const ticks = [15, 30, 45, 60, 90, 120, 150, 180];

  return (
    <div ref={root} className="rounded-2xl border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">
          <ClockIcon className="h-4 w-4" />
          Kunlik o‘qish vaqti
        </p>
        <span
          ref={valueRef}
          className="font-mono text-2xl font-semibold tabular-nums text-primary"
        >
          {formatMinutesShort(minutes)}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Standart maksimal 2 soat. Kerak bo‘lsa — o‘zingiz ko‘proq kiriting.
        Slayderni sudrab bering.
      </p>

      <div className="relative mt-8 h-12 select-none">
        {/* Rail */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-secondary" />
        <div
          ref={fillRef}
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ width: "33%" }}
        />
        {/* Knob */}
        <div
          ref={knobRef}
          className="absolute left-0 top-1/2 z-10 -ml-5 h-10 w-10 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-primary bg-card shadow-[0_8px_24px_hsl(var(--glow)/0.35)] active:cursor-grabbing"
          role="slider"
          aria-label="Kunlik o‘qish vaqti"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={minutes}
          aria-valuetext={formatMinutesShort(minutes)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              goTo(minutes + STEP);
            }
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              goTo(minutes - STEP);
            }
          }}
        >
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-primary/10" />
        </div>
      </div>

      {/* Scale */}
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
        {ticks.map((tick) => (
          <span key={tick}>{tick >= 60 ? `${tick / 60}h` : tick}</span>
        ))}
      </div>

      {custom || minutes >= CUSTOM_BEYOND ? (
        <label className="mt-6 block space-y-2">
          <span className="text-sm font-medium">
            O‘z daqiqangizni kiriting
          </span>
          <input
            type="number"
            min={MIN}
            max={480}
            step={STEP}
            value={minutes}
            onChange={(e) => goTo(Number(e.target.value) || MIN)}
            className="field font-mono"
          />
        </label>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {[30, 60, 90, 120].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => goTo(preset)}
            className={`rounded-full border px-4 py-1.5 font-mono text-sm transition-colors ${
              minutes === preset
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-secondary"
            }`}
          >
            {formatMinutesShort(preset)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Animated XP / level / streak counters that count up when scrolled into view. */
export function GamificationDemo() {
  const root = useRef<HTMLDivElement>(null);
  const xpRef = useRef<HTMLSpanElement>(null);
  const levelRef = useRef<HTMLSpanElement>(null);
  const streakRef = useRef<HTMLSpanElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useAnimeScope(root, () => {
    const xp = xpRef.current;
    const level = levelRef.current;
    const streak = streakRef.current;
    if (!xp || !level || !streak) return;

    const counter = (el: HTMLElement, to: number) => {
      const state = { v: 0 };
      animate(state, {
        v: to,
        duration: 1400,
        ease: "outExpo",
        modifier: (val: number) => {
          const rounded = Math.round(val);
          el.textContent = String(rounded);
          return rounded;
        },
      });
    };

    counter(xp, 2480);
    counter(level, 7);
    counter(streak, 12);

    // Confetti burst on the "level up" chip.
    const pieces = confettiRef.current?.querySelectorAll<HTMLElement>("[data-piece]");
    if (pieces?.length) {
      animate(pieces, {
        y: [0, -40 - Math.random() * 30],
        x: () => (Math.random() - 0.5) * 80,
        rotate: [0, 360],
        opacity: [1, 0],
        scale: [0.6, 1],
        delay: stagger(40, { from: "center" }),
        duration: 900,
        ease: "outCubic",
        loop: false,
      });
    }
  }, []);

  const stats = [
    { label: "XP", ref: xpRef, value: "0", tone: "text-primary" },
    { label: "Daraja", ref: levelRef, value: "0", tone: "text-foreground" },
    { label: "Ketma-ket kun", ref: streakRef, value: "0", tone: "text-emerald-500" },
  ];

  return (
    <div ref={root} className="relative rounded-2xl border bg-card p-6 sm:p-8">
      <p className="eyebrow">Yutuqlar jonlanadi</p>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <p className={`font-mono text-3xl font-bold tabular-nums sm:text-4xl ${stat.tone}`}>
              <span ref={stat.ref}>0</span>
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div ref={confettiRef} className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            data-piece
            className="absolute h-2 w-1.5 rounded-sm"
            style={{
              background:
                i % 3 === 0 ? "#ffd166" : i % 3 === 1 ? "#3ddc84" : "#7e14ff",
              left: `${20 + (i % 9) * 7}%`,
              top: 0,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        XP to‘plang, daraja oshiring va medallar oching — har bir yutuq
        sizning mehnatingizning belgisi.
      </p>
    </div>
  );
}
