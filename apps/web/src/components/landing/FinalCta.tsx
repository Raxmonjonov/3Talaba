import { useRef } from "react";
import { animate, stagger } from "animejs";
import { useTranslation } from "@/i18n/useTranslation";
import { authPath } from "@/i18n/config";
import { Link } from "react-router-dom";
import { SparkIcon } from "./Icons";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

export function FinalCta() {
  const { locale, t } = useTranslation();
  const root = useRef<HTMLElement>(null);

  useAnimeScope(root, () => {
    const parts = root.current?.querySelectorAll<HTMLElement>("[data-cta-part]");
    if (!parts?.length) return;
    animate(parts, {
      opacity: [0, 1],
      y: [18, 0],
      delay: stagger(90, { start: 60 }),
      duration: 560,
      ease: "outCubic",
    });
  }, []);

  return (
    <section ref={root} className="py-16 sm:py-24">
      <div className="page-shell">
        <div className="relative isolate overflow-hidden rounded-3xl border bg-card px-6 py-14 text-center sm:px-12">
          <div aria-hidden="true" className="glow-violet absolute inset-0 -z-10" />
          <div aria-hidden="true" className="grid-motif absolute inset-0 -z-10 opacity-60" />

          <h2
            data-cta-part
            style={{ opacity: prefersReducedMotion() ? 1 : 0 }}
            className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {t.finalCta.title}
          </h2>
          <p
            data-cta-part
            style={{ opacity: prefersReducedMotion() ? 1 : 0 }}
            className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            {t.finalCta.subtitle}
          </p>

          <div
            data-cta-part
            style={{ opacity: prefersReducedMotion() ? 1 : 0 }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
          >
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

          <p
            data-cta-part
            style={{ opacity: prefersReducedMotion() ? 1 : 0 }}
            className="mt-5 text-sm text-muted-foreground"
          >
            {t.finalCta.note}
          </p>
        </div>
      </div>
    </section>
  );
}
