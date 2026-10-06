import { useTranslation } from "@/i18n/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-surface">
      <div className="page-shell py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-bold tracking-tight">{t.nav.brand}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t.footer.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <p className="text-sm font-semibold">{t.footer.contact}</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  {/* Placeholder until the official Telegram channel is created. */}
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    {t.footer.telegram}
                    <span className="text-xs text-muted-foreground/70">
                      ({t.footer.telegramPlaceholder})
                    </span>
                  </span>
                </li>
                <li>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
                    {t.footer.privacy}
                    <span className="text-xs text-muted-foreground/70">
                      ({t.footer.telegramPlaceholder})
                    </span>
                  </span>
                </li>
                <li>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
                    {t.footer.terms}
                    <span className="text-xs text-muted-foreground/70">
                      ({t.footer.telegramPlaceholder})
                    </span>
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold">{t.footer.language}</p>
              <div className="mt-3">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {YEAR} {t.nav.brand}. {t.footer.rights}
          </p>
          <p>{t.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
