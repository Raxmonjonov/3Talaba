import { useRef } from "react";
import { animate, createTimeline, morphTo, stagger } from "animejs";
import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { useAnimeScope, prefersReducedMotion } from "@/lib/anime";

/** Resting blob shape. Morph targets live as hidden siblings. */
const ORB_A =
  "M32 14 C44 14 50 24 48 34 C46 44 40 50 30 50 C18 50 14 40 14 30 C14 20 22 14 32 14 Z";
const ORB_B =
  "M32 12 C48 12 54 22 52 34 C50 48 42 54 30 54 C16 54 10 44 10 32 C10 18 18 12 32 12 Z";
const ORB_C =
  "M32 16 C46 16 52 26 50 36 C48 46 38 52 28 52 C16 52 12 42 12 30 C12 20 20 16 32 16 Z";

/**
 * AI tutor chat with an SVG orb that morphTo()s between blob shapes while
 * the tutor is "speaking". Bubbles fade in as a timeline.
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
    if (!path) return;

    if (rings?.length) {
      animate(rings, {
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.65, 0.3],
        duration: 3200,
        loop: true,
        ease: "inOutSine",
      });
    }

    if (prefersReducedMotion()) return;

    // Speak cycle: A → B → C → A. morphTo resolves the alternate path nodes.
    createTimeline({ defaults: { ease: "inOutSine", loop: true } })
      .add(path, { d: morphTo("[data-orb-b]"), duration: 1600 })
      .add(path, { d: morphTo("[data-orb-c]"), duration: 1600 })
      .add(path, { d: morphTo("[data-orb-a]"), duration: 1600 });
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
          <div ref={chatRef} className="overflow-hidden rounded-2xl border bg-card">
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
            {/* Hidden morph targets for morphTo. */}
            <path data-orb-a d={ORB_A} fill="none" stroke="none" />
            <path data-orb-b d={ORB_B} fill="none" stroke="none" />
            <path data-orb-c d={ORB_C} fill="none" stroke="none" />

            <circle
              data-orb-ring
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.35"
              style={{ transformOrigin: "32px 32px" }}
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
              style={{ transformOrigin: "32px 32px" }}
            />
            <path
              data-orb-path
              d={ORB_A}
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
