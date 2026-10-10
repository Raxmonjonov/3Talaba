import { lazy, Suspense, useEffect, useState } from "react";
import { use3DReady, useWideViewport } from "../hooks/usePerfFlags";
import { SceneLoader } from "../elements/SceneLoader";

const Hero3D = lazy(() => import("./Hero3D"));

/**
 * Mounts the three.js bundle only once the browser is idle, so the ~265 kB
 * gzip payload never competes with the headline for the first paint. A device
 * that cannot run 3D, or a screen too narrow to keep the globe clear of the
 * copy, never reaches this point — the landing journey carries those instead.
 */
export default function Hero3DLazy() {
  const ready = use3DReady();
  const wide = useWideViewport();
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!ready || !wide) return;

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
  }, [ready, wide]);

  if (!ready || !wide || !idle) return null;

  return (
    <Suspense fallback={<SceneLoader />}>
      <Hero3D />
    </Suspense>
  );
}
