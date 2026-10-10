import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Achievement } from "@/lib/types";

const SEEN_KEY = "3talab_achievements_seen";

function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((s): s is string => typeof s === "string"));
  } catch {
    return new Set();
  }
}

function writeSeen(slugs: Iterable<string>): void {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...slugs]));
  } catch {
    /* private mode: celebration just may repeat once */
  }
}

/**
 * Fetches the medal catalog and tracks which medals are new since the last
 * visit, so the dashboard can fire confetti exactly once per achievement.
 */
export function useAchievements() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [fresh, setFresh] = useState<Achievement[]>([]);
  const [celebration, setCelebration] = useState(0);
  const [loading, setLoading] = useState(true);
  const seenRef = useRef<Set<string> | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    api<Achievement[]>("/api/user/achievements?locale=uz")
      .then((data) => {
        if (cancelled) return;
        const seen = seenRef.current ?? readSeen();
        seenRef.current = seen;
        const newly = data.filter(
          (item) => item.earnedAt !== null && !seen.has(item.slug),
        );
        setItems(data);
        setFresh(newly);
        if (newly.length > 0) {
          for (const item of newly) seen.add(item.slug);
          writeSeen(seen);
          setCelebration((n) => n + 1);
        }
      })
      .catch(() => {
        /* the shelf is optional decoration */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  return { items, fresh, celebration, loading, reload: load };
}
