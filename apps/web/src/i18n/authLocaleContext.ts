import { createContext } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./uz";

export type AuthLocaleValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: Dictionary;
};

export const AuthLocaleContext = createContext<AuthLocaleValue | null>(null);
