import { useTranslation } from "@/i18n/useTranslation";
import { authPath } from "@/i18n/config";
import { Link } from "react-router-dom";
import { SparkIcon } from "./Icons";

export function FinalCta() {
  const { locale, t } = useTranslation();

  return (
    <section className="py-16 sm:py-24">
      <div className="page-shell">
        <div className="relative isolate overflow-hidden rounded-3xl border bg-card px-6 py-14 text-center sm:px-12">
          <div aria-hidden="true" className="glow-violet absolute inset-0 -z-10" />
          <div aria-hidden="true" className="grid-motif absolute inset-0 -z-10 opacity-60" />

          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            {t.finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t.finalCta.subtitle}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={authPath("register", locale)} className="btn-primary btn-lg">
              <span className="inline-flex items-center gap-2">
                <SparkIcon className="h-5 w-5" />
                {t.finalCta.cta}
              </span>
            </Link>
            <Link to={authPath("login", locale)} className="btn-secondary btn-lg">
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">{t.finalCta.note}</p>
        </div>
      </div>
    </section>
  );
}
