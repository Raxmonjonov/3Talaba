import { useState, useSyncExternalStore } from "react";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Tracks the OS-level reduced-motion preference without an effect. */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/** False when the browser has no WebGL context: callers fall back to 2D. */
export function useWebGL() {
  const [supported] = useState(detectWebGL);
  return supported;
}

/** coarse | fine | low — picked once so the scene never has to renegotiate. */
export type Quality = "low" | "medium" | "high";

function detectQuality(): Quality {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  const cores = navigator.hardwareConcurrency ?? 2;
  const dpr = window.devicePixelRatio ?? 1;
  if (isMobile || cores <= 2 || dpr > 2.5) return "low";
  if (cores <= 4) return "medium";
  return "high";
}

export function useDeviceQuality() {
  const [quality] = useState(detectQuality);
  return quality;
}
