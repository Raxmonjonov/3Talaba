import { useTranslation } from "@/i18n/useTranslation";
import { Section } from "./Section";

export function TutorDialogue() {
  const { t } = useTranslation();

  return (
    <Section
      id="dialogue"
      eyebrow={t.dialogue.eyebrow}
      title={t.dialogue.title}
      subtitle={t.dialogue.subtitle}
      tone="surface"
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex items-center gap-2 border-b bg-surface px-4 py-3 text-xs font-medium text-muted-foreground">
              {t.dialogue.topic}
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {t.dialogue.bubbles.map((bubble, index) => {
                const isTutor = bubble.from === "tutor";
                return (
                  <div
                    key={index}
                    className={`flex ${isTutor ? "justify-start" : "justify-end"}`}
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
                          isTutor ? "text-muted-foreground" : "text-primary-foreground/80"
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

        <div className="flex flex-col justify-center lg:col-span-5">
          <p className="text-lg leading-relaxed text-muted-foreground">{t.dialogue.note}</p>
        </div>
      </div>
    </Section>
  );
}
