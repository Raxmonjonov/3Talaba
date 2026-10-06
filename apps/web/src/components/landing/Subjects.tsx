import type { PointerEvent } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Subjects() {
  const { t } = useTranslation();

  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 11).toFixed(2)}deg) translateZ(6px)`;
  };

  const settle = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.transform = "";
  };

  return (
    <Section
      id="subjects"
      eyebrow={t.subjects.eyebrow}
      title={t.subjects.title}
      subtitle={t.subjects.subtitle}
      tone="surface"
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {t.subjects.items.map((subject, index) => (
          <li
            key={subject.name}
            className={`subject-scene ${index === 0 ? "lg:col-span-2" : ""}`}
          >
            <div
              className="subject-plate h-full rounded-2xl border bg-card p-6 hover:border-primary/50"
              onPointerMove={tilt}
              onPointerLeave={settle}
              onPointerCancel={settle}
            >
              <div className="flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  className="text-sm font-bold text-primary"
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
    </Section>
  );
}
