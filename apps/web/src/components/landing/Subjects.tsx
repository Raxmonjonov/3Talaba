import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";

export function Subjects() {
  const { t } = useTranslation();

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
            className={`rounded-2xl border bg-card p-6 transition-colors hover:border-primary/50 ${
              index === 0 ? "lg:col-span-2" : ""
            }`}
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
            <p className="mt-3 leading-relaxed text-muted-foreground">{subject.blurb}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
