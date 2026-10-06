import { createContext, useContext } from "react";
import {
  DEFAULT_LOCALE,
  getDictionary,
  getLocaleOption,
  type Locale,
  type LocaleOption,
} from "./config";
import type { Dictionary } from "./uz";

export const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export type Translation = {
  t: Dictionary;
  locale: Locale;
  localeOption: LocaleOption;
};

export function useTranslation(): Translation {
  const locale = useContext(LocaleContext);
  return {
    t: getDictionary(locale),
    locale,
    localeOption: getLocaleOption(locale),
  };
}
