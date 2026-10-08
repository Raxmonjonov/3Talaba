import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_LOCALE, getDictionary, isLocale, type Locale } from "./config";
import { AuthLocaleContext } from "./authLocaleContext";

const STORAGE_KEY = "3talab_locale";

function detectLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? undefined;
    if (isLocale(stored)) return stored;
  } catch {
    // Storage can be unavailable in private mode; fall through to the browser.
  }

  const fromBrowser = typeof navigator !== "undefined" ? navigator.language : "";
  const lower = fromBrowser.toLowerCase();
  if (lower.startsWith("uz")) return "uz";
  if (lower.startsWith("ru")) return "ru";
  if (lower.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}

/**
 * The auth routes stay unprefixed (/login, /register), so they resolve their
 * language themselves: ?locale= query > stored preference > browser > uz.
 * Switching writes both the preference and the query string, so a link
 * shared from the auth page keeps its language.
 */
export function AuthLocaleProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [locale, setLocaleState] = useState<Locale>(() => {
    const fromQuery = searchParams.get("locale") ?? undefined;
    return isLocale(fromQuery) ? fromQuery : detectLocale();
  });

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Preference is best-effort; the query string still carries it.
      }
      const params = new URLSearchParams(searchParams);
      params.set("locale", next);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t: getDictionary(locale) }),
    [locale, setLocale]
  );

  return <AuthLocaleContext.Provider value={value}>{children}</AuthLocaleContext.Provider>;
}
