import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "3talab_theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * The initial theme is applied by an inline script in index.html to avoid a
 * flash of the wrong colours, so this hook only reads the already-applied state.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const apply = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private mode; the class still applies.
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      apply(next);
      return next;
    });
  }, [apply]);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return { theme, toggle };
}
