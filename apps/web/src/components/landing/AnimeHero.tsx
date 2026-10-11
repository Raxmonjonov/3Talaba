import { useMemo, useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";
import { useTranslation } from "@/i18n/useTranslation";
import { authPath } from "@/i18n/config";
import { Link } from "react-router-dom";
import { SparkIcon, ClockIcon } from "./Icons";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";
import { useTilt3D } from "@/components/3d/hooks/useTilt3D";

const GRID = 13;

/** Hero in the anime.js demo language: huge type + a living dot field. */
export function Hero() {
  const { locale, t } = useTranslation();
  const root = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useTilt3D<HTMLAnchorElement>();
  const reduced = prefersReducedMotion();

  const headline = `${t.hero.title} ${t.hero.titleAccent}`;
  const letters = useMemo(
    () => Array.from(headline).map((ch, i) => ({ ch, i })),
    [headline],
  );

  useAnimeScope(root, () => {
    const chars = titleRef.current?.querySelectorAll<HTMLElement>("[data-letter]");
    if (chars?.length) {
      animate(chars, {
        opacity: [0, 1],
        y: [32, 0],
        rotateX: [-50, 0],
        duration: 750,
        delay: stagger(26, { start: 100 }),
        ease: "outExpo",
      });
    }

    const dots = gridRef.current?.querySelectorAll<HTMLElement>("[data-dot]");
    if (dots?.length) {
      createTimeline({ defaults: { ease: "inOutSine" } }).add(dots, {
        scale: [0.4, 1.05, 0.4],
        opacity: [0.12, 0.65, 0.12],
        delay: stagger(16, { from: "center", grid: [GRID, GRID] }),
        duration: 2400,
        loop: true,
      });
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !gridRef.current) return;
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      gridRef.current.style.setProperty("--mx", String(x));
      gridRef.current.style.setProperty("--my", String(y));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [headline]);

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-background"
      aria-label="Hero"
    >
      <div
        ref={gridRef}
        aria-hidden="true"
        className="anime-grid pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity: reduced ? 0.3 : 1 }}
      >
        {Array.from({ length: GRID * GRID }, (_, i) => (
          <span
            key={i}
            data-dot
            className="anime-dot"
            style={{
              left: `${((i % GRID) / (GRID - 1)) * 100}%`,
              top: `${(Math.floor(i / GRID) / (GRID - 1)) * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="page-shell relative z-10 py-20 sm:py-28 lg:py-36">
        <div className="max-w-4xl">
          <p className="eyebrow">
            <ClockIcon className="h-4 w-4" />
            {t.hero.eyebrow}
          </p>

          <h1
            ref={titleRef}
            className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            style={{ perspective: "900px" }}
          >
            {reduced ? (
              <span className="bg-gradient-to-r from-primary via-foreground to-gradient-end bg-clip-text text-transparent">
                {headline}
              </span>
            ) : (
              letters.map(({ ch, i }) => (
                <span
                  key={i}
                  data-letter
                  className="inline-block will-change-transform"
                  style={{ opacity: 0 }}
                >
                  {ch === " " ? " " : ch}
                </span>
              ))
            )}
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {t.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              ref={ctaRef}
              to={authPath("register", locale)}
              className="btn-primary btn-lg btn-tilt text-center"
            >
              <span className="inline-flex items-center gap-2">
                <SparkIcon className="h-5 w-5" />
                {t.hero.ctaPrimary}
              </span>
            </Link>
            <Link
              to={authPath("login", locale)}
              className="btn-secondary btn-lg text-center"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">{t.hero.note}</p>

          <ul className="mt-14 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
            {t.hero.benefits.map(
              (benefit: { value: string; label: string }) => (
                <li key={benefit.value} className="space-y-1">
                  <p className="font-mono text-lg font-semibold text-foreground">
                    {benefit.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {benefit.label}
                  </p>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
