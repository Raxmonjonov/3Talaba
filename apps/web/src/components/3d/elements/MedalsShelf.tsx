import { lazy, Suspense, useMemo } from "react";
import type { Achievement } from "@/lib/types";
import { use3DReady } from "../hooks/usePerfFlags";
import { MedalsFallback } from "./MedalsFallback";

const MedalsScene = lazy(() => import("../scenes/MedalsScene"));

/**
 * Lazy wrapper: mounts the WebGL medal shelf only when the device allows it.
 * The CSS shelf is the loading fallback and the permanent view on low-power
 * or opted-out devices, so the trophies are never missing.
 */
export function MedalsShelf({ items }: { items: Achievement[] }) {
  const ready = use3DReady();
  const sceneItems = useMemo(
    () =>
      items.map((item) => ({
        slug: item.slug,
        tier: item.tier,
        earned: item.earnedAt !== null,
      })),
    [items],
  );

  if (!ready || items.length === 0) return <MedalsFallback items={items} />;

  return (
    <Suspense fallback={<MedalsFallback items={items} />}>
      <MedalsScene items={sceneItems} />
    </Suspense>
  );
}
