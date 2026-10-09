import { useEffect, useState } from "react";
import type { RefObject } from "react";

/**
 * True while the host element is on screen and the tab is in front. Scenes use
 * it to park their frame loop, so an off-screen canvas costs nothing.
 */
export function useActiveView<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled = true,
) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const host = ref.current;
    if (!host) return;

    let inView = true;
    let hidden = document.hidden;
    const sync = () => setActive(inView && !hidden);

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(host);

    const onVisibility = () => {
      hidden = document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref, enabled]);

  return active;
}
