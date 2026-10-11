import { useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";
import { useTranslation } from "@/i18n/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

const YEAR = new Date().getFullYear();

/** A quiet 12-tick clock that advances a hand once per "second" (slow demo). */
function FooterClock() {
  const root = useRef<HTMLDivElement>(null);
  const handRef = useRef<SVGLineElement>(null);
  const ticksRef = useRef<SVGGElement>(null);

  useAnimeScope(root, () => {
    const ticks = ticksRef.current?.querySelectorAll<HTMLElement>("[data-tick]");
    if (ticks?.length) {
      animate(ticks, {
        opacity: [0.25, 0.9, 0.25],
        delay: stagger(80, { from: "center" }),
        duration: 1800,
        loop: true,
        ease: "inOutSine",
      });
    }

    if (handRef.current) {
      createTimeline({ defaults: { ease: "inOutSine", loop: true } }).add(
        handRef.current,
        {
          rotate: [0, 360],
          duration: 12000,
          ease: "linear",
        },
      );
    }
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="relative h-16 w-16 shrink-0"
      title="3Talab"
    >
      <svg viewBox="0 0 64 64" className="h-full w-full text-muted-foreground">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.35"
        />
        <g ref={ticksRef}>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x1 = 32 + Math.cos(angle) * 24;
            const y1 = 32 + Math.sin(angle) * 24;
            const x2 = 32 + Math.cos(angle) * 27;
            const y2 = 32 + Math.sin(angle) * 27;
            return (
              <line
                key={i}
                data-tick
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={prefersReducedMotion() ? 0.6 : 0.25}
              />
            );
          })}
        </g>
        <line
          ref={handRef}
          x1="32"
          y1="32"
          x2="32"
          y2="18"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          style={{ transformOrigin: "32px 32px" }}
        />
        <circle cx="32" cy="32" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-surface">
      <div className="page-shell py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-sm items-start gap-4">
            <FooterClock />
            <div>
              <p className="text-lg font-bold tracking-tight">{t.nav.brand}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t.footer.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <p className="text-sm font-semibold">{t.footer.contact}</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="/privacy"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-border"
                      aria-hidden="true"
                    />
                    {t.footer.privacy}
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-border"
                      aria-hidden="true"
                    />
                    {t.footer.terms}
                  </a>
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
