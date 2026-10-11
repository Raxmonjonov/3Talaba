import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { CheckIcon } from "./Icons";
import { LearningPathDemo } from "./LearningPathDemo";
import { DailyTimeDemo, GamificationDemo } from "./AnimeDemos";

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
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <LearningPathDemo steps={t.howItWorks.steps} />
        </div>
        <div className="space-y-6 lg:col-span-5">
          <DailyTimeDemo />
          <GamificationDemo />
        </div>
      </div>

      <p className="mt-10 inline-flex items-start gap-2 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {t.hero.note}
      </p>
    </Section>
  );
}
