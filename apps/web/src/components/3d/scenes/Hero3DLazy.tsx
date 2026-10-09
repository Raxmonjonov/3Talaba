import { lazy, Suspense, useEffect, useState } from "react";
import { useReducedMotion, useWebGL, useDeviceQuality } from "../hooks/usePerfFlags";
import { featureFlags } from "@/lib/featureFlags";

const Hero3D = lazy(() => import("./Hero3D"));

/**
 * Mounts the three.js bundle only once the browser is idle, so the ~265 kB
 * gzip payload never competes with the headline for the first paint.
 */
export default function Hero3DLazy() {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const quality = useDeviceQuality();
  const [idle, setIdle] = useState(false);

  const enabled = featureFlags.enable3D && webgl && !reduced && quality !== "low";

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const wake = () => {
      if (!cancelled) setIdle(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(wake, { timeout: 900 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(handle);
      };
    }

    const handle = window.setTimeout(wake, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [enabled]);

  if (!enabled || !idle) return null;

  return (
    <Suspense fallback={null}>
      <Hero3D />
    </Suspense>
  );
}
