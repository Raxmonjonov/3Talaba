import { useEffect, useRef } from "react";
import { createScope } from "animejs";
import type { RefObject } from "react";

/** True when the OS asks us to cut motion to a minimum. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
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

/** Format minutes as "1 soat 20 daqiqa" in Uzbek. */
export function formatMinutesShort(minutes: number): string {
  if (minutes < 60) return `${minutes} daq`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} soat` : `${h} soat ${m} daq`;
}
