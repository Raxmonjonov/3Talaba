import { useEffect, useRef } from "react";
import { createScope, animate } from "animejs";
import type { RefObject } from "react";
import { isMotionReduced } from "./featureFlags";

/** True when the OS or the student's Settings toggle asks us to cut motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (isMotionReduced()) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Mounts an Anime.js v4 scope against a DOM root and reverts it on unmount.
 * Timelines, draggables and scroll observers created inside `setup` are
 * registered on this scope so they never leak after the section unmounts.
 */
export function useAnimeScope(
  root: RefObject<HTMLElement | null>,
  setup: () => void,
  deps: unknown[] = [],
) {
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const scope = createScope({ root: el });
    scope.execute(() => {
      setupRef.current();
    });

    return () => {
      scope.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Quiz verdict feedback: a green line draws across the correct panel, or the
 * wrong panel shakes once. Both respect the motion opt-out.
 */
export function animateVerdict(
  panel: HTMLElement | null,
  verdict: "correct" | "wrong" | null,
): void {
  if (!panel || !verdict || prefersReducedMotion()) return;

  const line = panel.querySelector<HTMLElement>("[data-verdict-line]");
  if (verdict === "correct") {
    if (line) {
      line.style.transformOrigin = "left center";
      animate(line, {
        scaleX: [0, 1],
        opacity: [0.4, 1],
        duration: 480,
        ease: "outCubic",
      });
    }
    animate(panel, {
      scale: [1, 1.02, 1],
      duration: 420,
      ease: "outBack",
    });
  } else {
    animate(panel, {
      x: [
        { value: -7 },
        { value: 7 },
        { value: -5 },
        { value: 5 },
        { value: 0 },
      ],
      duration: 360,
      ease: "outQuad",
    });
  }
}

/** Format minutes as "1 soat 20 daqiqa" in Uzbek. */
export function formatMinutesShort(minutes: number): string {
  if (minutes < 60) return `${minutes} daq`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} soat` : `${h} soat ${m} daq`;
}
