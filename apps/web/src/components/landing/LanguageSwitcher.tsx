import { useTranslation } from "@/i18n/useTranslation";
import { LOCALES, landingPath } from "@/i18n/config";
import { Link } from "react-router-dom";
import { GlobeIcon } from "./Icons";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useTranslation();

  return (
    <div
      className={`flex items-center gap-1 rounded-full border bg-surface p-1 ${
        compact ? "text-sm" : "text-sm"
      }`}
    >
      <GlobeIcon className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      {LOCALES.map((option) => {
        const isActive = option.code === locale;
        return (
          <Link
            key={option.code}
            to={landingPath(option.code)}
            hrefLang={option.hreflang}
            lang={option.code}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`}
          >
            <span className="sr-only">{option.label}</span>
            <span aria-hidden="true">{option.code.toUpperCase()}</span>
          </Link>
        );
      })}
      <span className="sr-only">{t.footer.language}</span>
    </div>
  );
}
