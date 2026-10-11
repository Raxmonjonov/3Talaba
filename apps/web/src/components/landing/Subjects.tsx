import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

/**
 * Subject cards that cascade in when scrolled into view, then lift and
 * fan on hover. Pure transform/opacity — cheap on mobile.
 */
export function Subjects() {
  const { t } = useTranslation();
  const listRef = useRef<HTMLUListElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useAnimeScope(sectionRef, () => {
    const cards = listRef.current?.querySelectorAll<HTMLElement>("[data-subject]");
    if (!cards?.length) return;

    // Entrance: stagger from left, settle flat.
    animate(cards, {
      opacity: [0, 1],
      y: [36, 0],
      rotateX: [-8, 0],
      duration: 700,
      delay: stagger(90, { start: 80 }),
      ease: "outCubic",
    });
  }, [t.subjects.items.length]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const cards = listRef.current?.querySelectorAll<HTMLElement>("[data-subject]");
    if (!cards?.length) return;

    const cleanups: (() => void)[] = [];
    cards.forEach((card) => {
      const enter = () => {
        animate(card, {
          y: -8,
          scale: 1.02,
          rotateY: 2,
          duration: 380,
          ease: "outCubic",
        });
      };
      const leave = () => {
        animate(card, {
          y: 0,
          scale: 1,
          rotateY: 0,
          duration: 450,
          ease: "outBack",
        });
      };
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, [t.subjects.items.length]);

  return (
    <Section
      id="subjects"
      eyebrow={t.subjects.eyebrow}
      title={t.subjects.title}
      subtitle={t.subjects.subtitle}
      tone="surface"
    >
      <div ref={sectionRef}>
        <ul
          ref={listRef}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          style={{ perspective: "1000px" }}
        >
          {t.subjects.items.map((subject, index) => (
            <li
              key={subject.name}
              data-subject
              className={`subject-scene ${index === 0 ? "lg:col-span-2" : ""}`}
              style={{ opacity: prefersReducedMotion() ? 1 : 0 }}
            >
              <div className="subject-plate h-full rounded-2xl border bg-card p-6 hover:border-primary/50">
                <div className="flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm font-bold text-primary"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-semibold">{subject.name}</h3>
                </div>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {subject.blurb}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
