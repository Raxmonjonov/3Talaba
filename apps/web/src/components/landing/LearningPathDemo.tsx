import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

type Step = { title: string; body: string };

/**
 * Scroll-drawn SVG path with a travelling marker. Completed steps light up
 * as the marker passes them. Uses anime.js for the stroke draw and plain
 * scroll math for progress (more reliable than deep scroll containers).
 */
export function LearningPathDemo({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const [progress, setProgress] = useState(0);

  useAnimeScope(root, () => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);
  }, [steps.length]);

  useEffect(() => {
    const path = pathRef.current;
    const marker = markerRef.current;
    const host = root.current;
    if (!path || !host) return;

    const length = path.getTotalLength();
    const reduced = prefersReducedMotion();
    let frame = 0;

    const place = (p: number) => {
      const clamped = Math.min(1, Math.max(0, p));
      const pt = path.getPointAtLength(length * clamped);
      if (marker) {
        marker.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
      }
      path.style.strokeDashoffset = String(length * (1 - clamped));
      setProgress(clamped);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = host.getBoundingClientRect();
        const view = window.innerHeight || 1;
        // 0 when the top of the block enters, 1 when the bottom leaves.
        const raw = (view * 0.75 - rect.top) / (rect.height + view * 0.35);
        const p = Math.min(1, Math.max(0, raw));
        if (reduced) {
          place(p);
        } else {
          // Light smoothing so the draw feels continuous, not stepped.
          place(p);
        }
      });
    };

    // Soft bloom when a stage becomes "done".
    const observer = new MutationObserver(() => {
      if (prefersReducedMotion()) return;
      animate(".anime-step.is-done .step-badge", {
        scale: [1, 1.12, 1],
        duration: 420,
        ease: "outBack",
      });
    });

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };
  }, [steps.length]);

  const activeIndex = Math.min(
    steps.length - 1,
    Math.floor(progress * steps.length + 0.0001),
  );

  return (
    <div ref={root} className="relative">
      <svg
        viewBox="0 0 40 400"
        className="pointer-events-none absolute left-4 top-0 hidden h-full w-10 sm:block"
        aria-hidden="true"
        preserveAspectRatio="xMidYMin meet"
      >
        <path
          d="M20 8 C 20 70, 36 90, 20 140 S 4 210, 20 260 S 34 330, 20 392"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-border"
          opacity="0.4"
        />
        <path
          ref={pathRef}
          d="M20 8 C 20 70, 36 90, 20 140 S 4 210, 20 260 S 34 330, 20 392"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-primary"
        />
        <g ref={markerRef}>
          <circle r="9" className="fill-primary/25" />
          <circle r="4.5" className="fill-primary" />
        </g>
      </svg>

      <ol className="space-y-10 sm:pl-14">
        {steps.map((step, index) => {
          const done = index <= activeIndex;
          return (
            <li
              key={step.title}
              className={`anime-step ${done ? "is-done" : ""}`}
              style={{
                opacity: done ? 1 : 0.42,
                transform: done
                  ? "translateY(0) scale(1)"
                  : "translateY(8px) scale(0.98)",
                transition:
                  "opacity 0.45s ease, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`step-badge inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold ${
                    done
                      ? "bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--glow)/0.45)]"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-px flex-1 bg-border"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
