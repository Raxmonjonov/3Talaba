import { lazy, Suspense } from "react";
import { use3DReady } from "../hooks/usePerfFlags";

const StairsScene = lazy(() => import("../scenes/StairsScene"));

/**
 * The same staircase read without a GPU: eleven treads, the ones behind you
 * filled in. Used while the WebGL chunk loads and whenever 3D is unavailable,
 * so the progress picture is never missing.
 */
export function StairsFallback({ level }: { level: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-40 items-end gap-1.5 sm:h-48"
    >
      {Array.from({ length: 11 }, (_, index) => (
        <div
          key={index}
          className={`flex-1 rounded-t-md ${
            index <= level ? "bg-primary" : "bg-secondary"
          }`}
          style={{ height: `${22 + index * 7}%` }}
        />
      ))}
    </div>
  );
}

/** Lazy wrapper: mounts the WebGL staircase only when the device allows it. */
export function ProgressStairs3D({ level }: { level: number }) {
  const ready = use3DReady();

  if (!ready) return <StairsFallback level={level} />;

  return (
    <Suspense fallback={<StairsFallback level={level} />}>
      <StairsScene level={level} />
    </Suspense>
  );
}
