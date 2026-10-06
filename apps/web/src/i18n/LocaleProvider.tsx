import type { ReactNode } from "react";
import { LocaleContext } from "./useTranslation";
import type { Locale } from "./config";

type LocaleProviderProps = {
  locale: Locale;
  children: ReactNode;
};

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}
