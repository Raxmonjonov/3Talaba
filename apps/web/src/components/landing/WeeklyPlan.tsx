import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { CheckIcon, ClockIcon } from "./Icons";

export function WeeklyPlan() {
  const { t } = useTranslation();

  const tracks = [
    { track: t.weekly.regular, featured: true },
    { track: t.weekly.beginner, featured: false },
  ];

  return (
    <Section
      id="plans"
      eyebrow={t.weekly.eyebrow}
      title={t.weekly.title}
      subtitle={t.weekly.subtitle}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {tracks.map(({ track, featured }) => (
          <article
            key={track.title}
            className={`relative rounded-2xl border p-6 sm:p-8 ${
              featured
                ? "border-primary/40 bg-card shadow-[0_24px_60px_-40px_hsl(var(--glow)/0.7)]"
                : "bg-surface"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold">{track.title}</h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  featured
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <ClockIcon className="h-3.5 w-3.5" />
                {track.schedule}
              </span>
            </div>

            <p className="mt-3 leading-relaxed text-muted-foreground">{track.description}</p>

            <ul className="mt-6 space-y-3">
              {track.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-foreground/90">{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {t.weekly.note}
      </p>
    </Section>
  );
}
