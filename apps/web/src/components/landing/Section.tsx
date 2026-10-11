import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/anime";

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  tone?: "default" | "surface";
  headingAlign?: "start" | "center";
};

/** Fades the heading block in the first time the section scrolls into view. */
function useSectionReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const heading = el.querySelector<HTMLElement>("[data-section-head]");
    if (!heading) return;

    let played = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played) {
            played = true;
            animate(heading, {
              opacity: [0, 1],
              y: [18, 0],
              duration: 520,
              ease: "outCubic",
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );

    heading.style.opacity = "0";
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  tone = "default",
  headingAlign = "start",
}: SectionProps) {
  const toneClass = tone === "surface" ? "bg-surface border-y border-border/60" : "";
  const root = useRef<HTMLElement>(null);
  useSectionReveal(root);

  return (
    <section
      ref={root}
      id={id}
      className={`scroll-mt-20 py-16 sm:py-20 ${toneClass}`}
    >
      <div className="page-shell">
        <div
          data-section-head
          className={`max-w-2xl ${headingAlign === "center" ? "mx-auto text-center" : ""}`}
          style={{ opacity: prefersReducedMotion() ? 1 : undefined }}
        >
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-4">{title}</h2>
          {subtitle ? (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="mt-10 sm:mt-12">{children}</div>
      </div>
    </section>
  );
}
