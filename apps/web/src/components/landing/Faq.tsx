import { useRef } from "react";
import { animate, stagger } from "animejs";
import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { ChevronIcon } from "./Icons";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

export function Faq() {
  const { t } = useTranslation();
  const root = useRef<HTMLDivElement>(null);

  useAnimeScope(root, () => {
    const rows = root.current?.querySelectorAll<HTMLElement>("[data-faq]");
    if (!rows?.length) return;
    animate(rows, {
      opacity: [0, 1],
      y: [12, 0],
      delay: stagger(60, { start: 40 }),
      duration: 420,
      ease: "outCubic",
    });
  }, []);

  return (
    <Section
      id="faq"
      eyebrow={t.faq.eyebrow}
      title={t.faq.title}
      subtitle={t.faq.subtitle}
    >
      <div
        ref={root}
        className="mx-auto max-w-3xl divide-y overflow-hidden rounded-2xl border bg-card shadow-[0_24px_60px_-44px_hsl(258_60%_12%/0.6)]"
      >
        {t.faq.items.map((item) => (
          <details key={item.q} data-faq className="group" style={{ opacity: prefersReducedMotion() ? 1 : 0 }}>
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-medium transition-colors hover:bg-surface group-open:bg-surface/70 sm:px-6 sm:py-5">
              <span>{item.q}</span>
              <ChevronIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 sm:px-6">
              <p className="prose-answer text-sm sm:text-base">{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
