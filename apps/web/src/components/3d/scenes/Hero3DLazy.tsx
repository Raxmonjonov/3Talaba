import { lazy, Suspense } from "react";
import { useReducedMotion, useWebGL, useDeviceQuality } from "../hooks/usePerfFlags";
import { featureFlags } from "@/lib/featureFlags";

const Hero3D = lazy(() => import("./Hero3D"));

export default function Hero3DLazy() {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const quality = useDeviceQuality();
  if (!featureFlags.enable3D || !webgl || reduced || quality === "low") {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <Hero3D />
    </Suspense>
  );
}

