import { useTranslation } from "@/i18n/useTranslation";
import { AUTH_PATHS } from "@/i18n/config";
import { Link } from "react-router-dom";
import { ClockIcon, SparkIcon } from "./Icons";

/** Deterministic offsets keep the motif stable across renders. */
const COLUMNS = [
  { left: "4%", height: "38%", delay: "0s", duration: "26s" },
  { left: "13%", height: "62%", delay: "-4s", duration: "31s" },
  { left: "22%", height: "45%", delay: "-9s", duration: "22s" },
  { left: "31%", height: "70%", delay: "-2s", duration: "34s" },
  { left: "44%", height: "40%", delay: "-13s", duration: "28s" },
  { left: "55%", height: "58%", delay: "-6s", duration: "24s" },
  { left: "64%", height: "35%", delay: "-16s", duration: "30s" },
  { left: "73%", height: "66%", delay: "-8s", duration: "27s" },
  { left: "82%", height: "42%", delay: "-11s", duration: "33s" },
  { left: "91%", height: "55%", delay: "-3s", duration: "25s" },
];

/**
 * A quiet nod to time flowing through a study year: a grid, a glow and a few
 * drifting light columns. Fully decorative and silenced under reduced motion.
 */
export function TimeFlowMotif() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid-motif absolute inset-0" />
      <div className="glow-violet absolute inset-0" />
      <div className="absolute inset-0">
        {COLUMNS.map((column) => (
          <span
            key={column.left}
            className="animate-drift absolute bottom-0 w-px origin-bottom"
            style={{
              left: column.left,
              height: column.height,
              background:
                "linear-gradient(to top, transparent, hsl(var(--glow) / 0.55), transparent)",
              animationDelay: column.delay,
              animationDuration: column.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative isolate overflow-hidden">
      <TimeFlowMotif />
      <div className="page-shell relative py-16 sm:py-20 lg:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow animate-fade-up">
            <ClockIcon className="h-4 w-4" />
            {t.hero.eyebrow}
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t.hero.title}{" "}
            <span className="bg-gradient-to-r from-primary to-gradient-end bg-clip-text text-transparent">
              {t.hero.titleAccent}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t.hero.subtitle}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to={AUTH_PATHS.register} className="btn-primary btn-lg text-center">
              <span className="inline-flex items-center gap-2">
                <SparkIcon className="h-5 w-5" />
                {t.hero.ctaPrimary}
              </span>
            </Link>
            <Link to={AUTH_PATHS.login} className="btn-secondary btn-lg text-center">
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{t.hero.note}</p>

          <ul className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
            {t.hero.benefits.map((benefit) => (
              <li key={benefit.value} className="space-y-1">
                <p className="text-lg font-semibold text-foreground">{benefit.value}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{benefit.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
