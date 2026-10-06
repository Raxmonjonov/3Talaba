import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  tone?: "default" | "surface";
  headingAlign?: "start" | "center";
};

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

  return (
    <section id={id} className={`scroll-mt-20 py-16 sm:py-20 ${toneClass}`}>
      <div className="page-shell">
        <div className={`max-w-2xl ${headingAlign === "center" ? "mx-auto text-center" : ""}`}>
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
