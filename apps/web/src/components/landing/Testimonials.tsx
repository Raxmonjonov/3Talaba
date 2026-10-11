import { useRef } from "react";
import { animate, stagger } from "animejs";
import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

export function Testimonials() {
  const { t } = useTranslation();
  const root = useRef<HTMLDivElement>(null);

  useAnimeScope(root, () => {
    const cards = root.current?.querySelectorAll<HTMLElement>("[data-card]");
    if (!cards?.length) return;
    animate(cards, {
      opacity: [0, 1],
      y: [22, 0],
      rotateX: [-4, 0],
      delay: stagger(100, { start: 60 }),
      duration: 560,
      ease: "outCubic",
    });
  }, []);

  return (
    <Section
      id="results"
      eyebrow={t.testimonials.eyebrow}
      title={t.testimonials.title}
      subtitle={t.testimonials.subtitle}
      tone="surface"
    >
      <div ref={root} className="grid gap-5 md:grid-cols-3" style={{ perspective: "1000px" }}>
        {[0, 1, 2].map((slot) => (
          <div
            key={slot}
            data-card
            aria-hidden="true"
            style={{ opacity: prefersReducedMotion() ? 1 : 0 }}
            className="rounded-2xl border border-dashed bg-card/60 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-5/6 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed bg-card p-5">
        <p className="text-sm font-semibold text-foreground">{t.testimonials.placeholder}</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t.testimonials.note}
        </p>
      </div>
    </Section>
  );
}
