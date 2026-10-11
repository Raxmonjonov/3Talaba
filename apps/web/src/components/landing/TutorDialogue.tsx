import { useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";
import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

/**
 * AI tutor chat with a morphing SVG orb that "breathes" while the tutor
 * is "speaking". Bubbles fade in as a timeline.
 */
export function TutorDialogue() {
  const { t } = useTranslation();
  const root = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<SVGSVGElement>(null);

  useAnimeScope(root, () => {
    const bubbles = chatRef.current?.querySelectorAll<HTMLElement>("[data-bubble]");
    if (bubbles?.length) {
      animate(bubbles, {
        opacity: [0, 1],
        y: [16, 0],
        scale: [0.96, 1],
        delay: stagger(160, { start: 120 }),
        duration: 520,
        ease: "outCubic",
      });
    }

    const path = orbRef.current?.querySelector<SVGPathElement>("[data-orb-path]");
    const rings = orbRef.current?.querySelectorAll("[data-orb-ring]");
    if (path && rings?.length) {
      createTimeline({ defaults: { ease: "inOutSine", loop: true } })
        .add(path, {
          scaleX: [1, 1.08, 0.96, 1],
          scaleY: [1, 0.94, 1.06, 1],
          duration: 3200,
        })
        .add(
          rings,
          {
            scale: [1, 1.12, 1],
            opacity: [0.3, 0.65, 0.3],
            duration: 3200,
          },
          0,
        );
    }
  }, []);

  return (
    <Section
      id="dialogue"
      eyebrow={t.dialogue.eyebrow}
      title={t.dialogue.title}
      subtitle={t.dialogue.subtitle}
      tone="surface"
    >
      <div ref={root} className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div
            ref={chatRef}
            className="overflow-hidden rounded-2xl border bg-card"
          >
            <div className="flex items-center gap-2 border-b bg-surface px-4 py-3 text-xs font-medium text-muted-foreground">
              {t.dialogue.topic}
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {t.dialogue.bubbles.map((bubble, index) => {
                const isTutor = bubble.from === "tutor";
                return (
                  <div
                    key={index}
                    data-bubble
                    className={`flex ${isTutor ? "justify-start" : "justify-end"}`}
                    style={{ opacity: prefersReducedMotion() ? 1 : 0 }}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[78%] ${
                        isTutor
                          ? "rounded-bl-sm bg-secondary text-secondary-foreground"
                          : "rounded-br-sm bg-primary text-primary-foreground"
                      }`}
                    >
                      <p
                        className={`mb-1 text-[11px] font-semibold uppercase tracking-wide ${
                          isTutor
                            ? "text-muted-foreground"
                            : "text-primary-foreground"
                        }`}
                      >
                        {isTutor ? t.dialogue.tutor : t.dialogue.student}
                      </p>
                      {bubble.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 lg:col-span-5">
          <svg
            ref={orbRef}
            viewBox="0 0 64 64"
            className="h-24 w-24 self-start text-primary"
            aria-hidden="true"
          >
            <circle
              data-orb-ring
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.35"
            />
            <circle
              data-orb-ring
              cx="32"
              cy="32"
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.25"
            />
            <path
              data-orb-path
              d="M32 14 C44 14 50 24 48 34 C46 44 40 50 30 50 C18 50 14 40 14 30 C14 20 22 14 32 14 Z"
              fill="currentColor"
              opacity="0.18"
              style={{ transformOrigin: "32px 32px" }}
            />
            <circle cx="32" cy="32" r="7" fill="currentColor" />
          </svg>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t.dialogue.note}
          </p>
        </div>
      </div>
    </Section>
  );
}
