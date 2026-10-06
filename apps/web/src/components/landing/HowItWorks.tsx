import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { CheckIcon } from "./Icons";

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <Section
      id="how-it-works"
      eyebrow={t.howItWorks.eyebrow}
      title={t.howItWorks.title}
      subtitle={t.howItWorks.subtitle}
      tone="surface"
    >
      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {t.howItWorks.steps.map((step, index) => (
          <li key={step.title} className="relative">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
              >
                {index + 1}
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10 inline-flex items-start gap-2 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {t.hero.note}
      </p>
    </Section>
  );
}
