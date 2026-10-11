import { useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { ClockIcon, SparkIcon } from "./Icons";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

function WindowFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_20px_60px_-30px_hsl(var(--glow)/0.55),inset_0_1px_0_0_hsl(var(--border)/0.7)]">
      <div className="flex items-center gap-2 border-b bg-gradient-to-b from-surface to-surface/60 px-4 py-3">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-border" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-border" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-2 truncate text-xs text-muted-foreground">3talab.app</span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

/**
 * Placement preview with a live option picker: clicking an option draws a
 * green check line (or a red nudge) the same way the real quiz does.
 */
export function ProductPreview() {
  const { t } = useTranslation();
  const optionsRef = useRef<HTMLUListElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<number | null>(1);

  useAnimeScope(optionsRef, () => {
    const items = optionsRef.current?.querySelectorAll<HTMLElement>("[data-option]");
    if (!items?.length) return;

    animate(items, {
      opacity: [0, 1],
      y: [14, 0],
      delay: stagger(70, { start: 100 }),
      duration: 480,
      ease: "outCubic",
    });

    if (progressRef.current) {
      animate(progressRef.current, {
        width: ["0%", "35%"],
        duration: 900,
        delay: 200,
        ease: "outCubic",
      });
    }
  }, []);

  const pick = (index: number) => {
    setPicked(index);
    if (prefersReducedMotion()) return;
    const items = optionsRef.current?.querySelectorAll<HTMLElement>("[data-option]");
    const el = items?.[index];
    if (!el) return;
    if (index === 1) {
      animate(el, {
        scale: [1, 1.03, 1],
        duration: 380,
        ease: "outBack",
      });
    } else {
      animate(el, {
        x: [
          { value: -4 },
          { value: 4 },
          { value: 0 },
        ],
        duration: 280,
        ease: "outQuad",
      });
    }
  };

  return (
    <Section
      id="preview"
      eyebrow={t.preview.eyebrow}
      title={t.preview.title}
      subtitle={t.preview.subtitle}
    >
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <WindowFrame>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {t.preview.placementLabel}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t.preview.placementProgress}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-semibold">{t.preview.placementTitle}</h3>

            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="presentation"
            >
              <div
                ref={progressRef}
                className="h-full rounded-full bg-primary"
                style={{ width: prefersReducedMotion() ? "35%" : "0%" }}
              />
            </div>

            <div className="question-stack mt-5 rounded-xl border bg-surface px-4 py-3.5">
              <p className="font-medium leading-relaxed">
                {t.preview.placementQuestion}
              </p>
            </div>

            <ul ref={optionsRef} className="mt-4 grid gap-2 sm:grid-cols-2">
              {t.preview.placementOptions.map((option, index) => (
                <li key={option} data-option style={{ opacity: prefersReducedMotion() ? 1 : 0 }}>
                  <button
                    type="button"
                    onClick={() => pick(index)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      index === picked
                        ? "border-primary bg-secondary font-semibold"
                        : "bg-surface text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`inline-block h-4 w-4 rounded-full border-2 ${
                          index === picked ? "border-primary" : "border-border"
                        }`}
                      />
                      {option}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-strong p-3 text-xs leading-relaxed text-muted-foreground">
              <SparkIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {t.preview.placementHint}
            </p>
          </WindowFrame>
        </div>

        <div className="lg:col-span-5 lg:mt-12">
          <WindowFrame>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {t.preview.planLabel}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t.preview.planDay}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-semibold">{t.preview.planTitle}</h3>

            <ul className="mt-4 space-y-2.5">
              {t.preview.planItems.map((item, index) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/12 font-mono text-[11px] font-bold text-primary"
                  >
                    {index + 1}
                  </span>
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
              <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {t.preview.planNote}
            </p>
          </WindowFrame>
        </div>
      </div>
    </Section>
  );
}
