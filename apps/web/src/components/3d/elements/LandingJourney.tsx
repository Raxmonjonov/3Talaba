import { lazy, Suspense, useEffect, useState } from "react";
import { use3DReady } from "../hooks/usePerfFlags";

const LandingJourneyScene = lazy(() => import("../scenes/LandingJourneyScene"));

/**
 * The scroll journey: one fixed backdrop behind the whole landing page whose
 * camera walks Kirish → Placement → Darslar → Natijalar → Universitetlar as the
 * reader scrolls. The chunk is fetched at idle, but the scene itself only
 * mounts once the reader has actually scrolled — by then the shared three.js
 * bundle is already warm from the hero, so the journey costs nothing on a page
 * that is never scrolled.
 */
export function LandingJourney() {
  const ready = use3DReady();
  const [idle, setIdle] = useState(false);
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    if (!ready || awake) return;

    const read = () => {
      if (window.scrollY > 64) setAwake(true);
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, [ready, awake]);

  useEffect(() => {
    if (!ready) return;

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
  }, [ready]);

  if (!ready || !idle || !awake) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-60"
    >
      <Suspense fallback={null}>
        <LandingJourneyScene />
      </Suspense>
    </div>
  );
}
