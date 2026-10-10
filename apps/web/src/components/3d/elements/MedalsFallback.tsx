import type { Achievement, AchievementTier } from "@/lib/types";

const TIER_RING: Record<AchievementTier, string> = {
  bronze: "border-amber-700/60 bg-amber-900/20",
  silver: "border-slate-400/60 bg-slate-400/15",
  gold: "border-[#ffd166]/70 bg-[#ffd166]/15",
};

const TIER_DISC: Record<AchievementTier, string> = {
  bronze: "bg-amber-700",
  silver: "bg-slate-400",
  gold: "bg-[#ffd166]",
};

const LOCKED = "border-border bg-secondary/40";

/**
 * The medal shelf without a GPU: earned medals are solid discs in their tier
 * colour, locked ones are empty rings. Same grid the 3D scene fills.
 */
export function MedalsFallback({ items }: { items: Achievement[] }) {
  return (
    <ul
      aria-label="Yutuqlar"
      className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
    >
      {items.map((item) => {
        const earned = item.earnedAt !== null;
        return (
          <li
            key={item.slug}
            title={item.description}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center ${
              earned ? TIER_RING[item.tier] : LOCKED
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-10 w-10 rounded-full border-2 ${
                earned
                  ? `${TIER_DISC[item.tier]} border-white/20 shadow-[0_0_12px_rgba(255,209,102,0.35)]`
                  : "border-dashed border-muted-foreground/30 bg-transparent"
              }`}
            />
            <span
              className={`text-[11px] leading-tight ${
                earned ? "text-foreground" : "text-muted-foreground/70"
              }`}
            >
              {item.title}
            </span>
            {!earned ? (
              <span className="sr-only">Hali yutilmagan</span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
