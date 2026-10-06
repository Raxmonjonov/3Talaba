import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { ChevronIcon } from "./Icons";

export function Faq() {
  const { t } = useTranslation();

  return (
    <Section
      id="faq"
      eyebrow={t.faq.eyebrow}
      title={t.faq.title}
      subtitle={t.faq.subtitle}
    >
      <div className="mx-auto max-w-3xl divide-y overflow-hidden rounded-2xl border bg-card">
        {t.faq.items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-medium transition-colors hover:bg-surface sm:px-6 sm:py-5">
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
