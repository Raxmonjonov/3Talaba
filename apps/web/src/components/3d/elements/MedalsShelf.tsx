import { lazy, Suspense, useMemo } from "react";
import type { Achievement } from "@/lib/types";
import { use3DReady } from "../hooks/usePerfFlags";
import { MedalsFallback } from "./MedalsFallback";
import { SceneLoader } from "./SceneLoader";

const MedalsScene = lazy(() => import("../scenes/MedalsScene"));

/**
 * Lazy wrapper: mounts the WebGL medal shelf only when the device allows it.
 * The CSS shelf is the permanent view on low-power or opted-out devices, so
 * the trophies are never missing. While the WebGL chunk loads, a ring stands
 * in — the title list below already names every medal.
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

  if (items.length === 0 || !ready) return <MedalsFallback items={items} />;

  return (
    <div className="space-y-3">
      <div className="relative h-56 w-full">
        <Suspense fallback={<SceneLoader />}>
          <MedalsScene items={sceneItems} />
        </Suspense>
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {items.map((item) => (
          <li
            key={item.slug}
            title={item.description}
            className={`text-[11px] ${
              item.earnedAt !== null
                ? "text-foreground"
                : "text-muted-foreground/70"
            }`}
          >
            {item.title}
            {item.earnedAt === null ? (
              <span className="sr-only"> (hali yutilmagan)</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
