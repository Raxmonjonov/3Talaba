import { lazy, Suspense } from "react";
import { use3DReady } from "../hooks/usePerfFlags";

const TutorOrbScene = lazy(() => import("../scenes/TutorOrbScene"));

/** No GPU: a lit circle that still breathes while the tutor is writing. */
function OrbFallback({ thinking }: { thinking: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-9 w-9 shrink-0 rounded-full ${
        thinking ? "orb-pulse" : ""
      }`}
      style={{
        background:
          "radial-gradient(circle at 32% 30%, #7de2ff, #47bfff 42%, #7e14ff 82%)",
        boxShadow: "0 0 16px 2px hsl(265 90% 65% / 0.4)",
      }}
    />
  );
}

/** The tutor's avatar. Decorative: the greeting already names the student. */
export function TutorOrb({ thinking }: { thinking: boolean }) {
  const ready = use3DReady();

  if (!ready) return <OrbFallback thinking={thinking} />;

  return (
    <Suspense fallback={<OrbFallback thinking={thinking} />}>
      <TutorOrbScene thinking={thinking} />
    </Suspense>
  );
}
