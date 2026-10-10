import { lazy, Suspense, useMemo } from "react";
import type { Achievement } from "@/lib/types";
import { use3DReady, useWideViewport } from "../hooks/usePerfFlags";
import { MedalsFallback } from "./MedalsFallback";
import { SceneLoader } from "./SceneLoader";

const MedalsScene = lazy(() => import("../scenes/MedalsScene"));

/**
 * Lazy wrapper: mounts the WebGL medal shelf only when the device allows it.
 * Phones get the CSS shelf — same pattern as the hero — because a narrow
 * portrait FOV cannot frame the discs without swallowing the card.
 * The title list under the 3D view names every medal either way.
 */
export function MedalsShelf({ items }: { items: Achievement[] }) {
  const ready = use3DReady();
  const wide = useWideViewport();
  const sceneItems = useMemo(
    () =>
      items.map((item) => ({
        slug: item.slug,
        tier: item.tier,
        earned: item.earnedAt !== null,
      })),
    [items],
  );

  if (items.length === 0 || !ready || !wide) {
    return <MedalsFallback items={items} />;
  }

  return (
    <div className="space-y-3">
      <Suspense
        fallback={
          <div className="relative h-40 w-full sm:h-56">
            <SceneLoader />
          </div>
        }
      >
        <MedalsScene items={sceneItems} />
      </Suspense>
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
