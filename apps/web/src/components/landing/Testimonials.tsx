import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";

export function Testimonials() {
  const { t } = useTranslation();

  return (
    <Section
      id="results"
      eyebrow={t.testimonials.eyebrow}
      title={t.testimonials.title}
      subtitle={t.testimonials.subtitle}
      tone="surface"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((slot) => (
          <div
            key={slot}
            aria-hidden="true"
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
