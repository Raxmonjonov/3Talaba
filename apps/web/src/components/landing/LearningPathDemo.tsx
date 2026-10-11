import { useRef, useState } from "react";
import {
  animate,
  createDrawable,
  createMotionPath,
  onScroll,
} from "animejs";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

type Step = { title: string; body: string };

const PATH_D =
  "M20 8 C 20 70, 36 90, 20 140 S 4 210, 20 260 S 34 330, 20 392";

/**
 * Scroll-drawn SVG path with a travelling marker (createMotionPath).
 * Completed steps light up as the marker passes them. Both the stroke draw
 * and the marker ride the same anime.js ScrollObserver with `sync: true`.
 */
export function LearningPathDemo({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const [progress, setProgress] = useState(0);

  useAnimeScope(root, () => {
    const host = root.current;
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!host || !path || !marker) return;

    const scrollOpts = {
      container: host,
      enter: "bottom-=80 top",
      leave: "top bottom+=40",
      sync: true as const,
      onUpdate: (self: { progress: number }) => {
        setProgress(self.progress);
      },
    };

    if (prefersReducedMotion()) {
      // Static full draw; progress still tracks scroll for step highlighting.
      const [drawable] = createDrawable(path);
      drawable.setAttribute("draw", "0 1");
      onScroll(scrollOpts);
      return;
    }

    const [drawable] = createDrawable(path);
    animate(drawable, {
      draw: "0 1",
      ease: "linear",
      autoplay: onScroll(scrollOpts),
    });

    // Marker rides the same curve via createMotionPath.
    const motion = createMotionPath(path);
    animate(marker, {
      translateX: motion.translateX,
      translateY: motion.translateY,
      ease: "linear",
      autoplay: onScroll(scrollOpts),
    });
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
          d={PATH_D}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-border"
          opacity="0.4"
        />
        <path
          ref={pathRef}
          d={PATH_D}
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
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
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
