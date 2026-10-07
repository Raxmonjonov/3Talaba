import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";
import { ClockIcon, SparkIcon } from "./Icons";

function WindowFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_20px_60px_-30px_hsl(var(--glow)/0.55),inset_0_1px_0_0_hsl(var(--border)/0.7)]">
      <div className="flex items-center gap-2 border-b bg-gradient-to-b from-surface to-surface/60 px-4 py-3">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-border" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-border" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-2 truncate text-xs text-muted-foreground">3talab.app</span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function ProductPreview() {
  const { t } = useTranslation();

  return (
    <Section
      id="preview"
      eyebrow={t.preview.eyebrow}
      title={t.preview.title}
      subtitle={t.preview.subtitle}
    >
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <WindowFrame>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {t.preview.placementLabel}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t.preview.placementProgress}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-semibold">{t.preview.placementTitle}</h3>

            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="presentation"
            >
              <div className="shimmer h-full w-[35%] rounded-full bg-primary" />
            </div>

            <div className="question-stack mt-5 rounded-xl border bg-surface px-4 py-3.5">
              <p className="font-medium leading-relaxed">
                {t.preview.placementQuestion}
              </p>
            </div>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {t.preview.placementOptions.map((option, index) => (
                <li
                  key={option}
                  className={`rounded-xl border px-4 py-3 text-sm transition-colors ${
                    index === 1
                      ? "border-primary bg-secondary font-semibold"
                      : "bg-surface text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`inline-block h-4 w-4 rounded-full border-2 ${
                        index === 1 ? "border-primary" : "border-border"
                      }`}
                    />
                    {option}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-strong p-3 text-xs leading-relaxed text-muted-foreground">
              <SparkIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {t.preview.placementHint}
            </p>
          </WindowFrame>
        </div>

        <div className="lg:col-span-5 lg:mt-12">
          <WindowFrame>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {t.preview.planLabel}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t.preview.planDay}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-semibold">{t.preview.planTitle}</h3>

            <ul className="mt-4 space-y-2.5">
              {t.preview.planItems.map((item, index) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-bold text-primary"
                  >
                    {index + 1}
                  </span>
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
              <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {t.preview.planNote}
            </p>
          </WindowFrame>
        </div>
      </div>
    </Section>
  );
}
