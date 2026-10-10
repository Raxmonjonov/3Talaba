import { useState, useSyncExternalStore } from "react";
import { is3DEnabled, subscribe3D } from "@/lib/featureFlags";

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

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia("(min-width: 768px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The hero's split composition needs a real two-column width to clear the
 * headline; below that the globe would sit behind the copy, so those viewports
 * get the landing journey instead of a second canvas.
 */
export function useWideViewport() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
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

/** Picked once so a scene never has to renegotiate mid-session. */
export function useDeviceQuality() {
  const [quality] = useState(detectQuality);
  return quality;
}

/** The student's own switch in the dashboard settings. */
export function use3DEnabled() {
  return useSyncExternalStore(subscribe3D, is3DEnabled, () => true);
}

/**
 * Whether a 3D layer may mount at all. Low-power devices still get 3D — they
 * just get the simplified tier — so only a missing GPU, reduced motion or an
 * explicit opt-out sends the caller back to the 2D fallback.
 */
export function use3DReady() {
  const enabled = use3DEnabled();
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  return enabled && !reduced && webgl;
}
