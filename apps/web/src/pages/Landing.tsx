import { LocaleProvider } from "@/i18n/LocaleProvider";
import { useTranslation } from "@/i18n/useTranslation";
import { useSeo } from "@/lib/seo";
import type { User } from "@/lib/types";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { TutorDialogue } from "@/components/landing/TutorDialogue";
import { WeeklyPlan } from "@/components/landing/WeeklyPlan";
import { Subjects } from "@/components/landing/Subjects";
import { Faq } from "@/components/landing/Faq";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCta } from "@/components/landing/FinalCta";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { LandingJourney } from "@/components/3d/elements/LandingJourney";
import type { Locale } from "@/i18n/config";

type LandingProps = {
  locale: Locale;
  user: User | null;
  onLogout: () => void;
};

function LandingContent({ user, onLogout }: Omit<LandingProps, "locale">) {
  const { t } = useTranslation();

  return (
    // `isolate` keeps the fixed journey backdrop (-z-10) above this wrapper's
    // own background but below every section, so it shows through transparent
    // sections without ever touching their text.
    <div className="flex min-h-screen flex-col isolate bg-background">
      <LandingJourney />
      <a href="#main" className="skip-link">
        {t.nav.skipToContent}
      </a>

      <SiteHeader user={user} onLogout={onLogout} />

      <main id="main" className="flex-1">
        <Hero />
        <HowItWorks />
        <ProductPreview />
        <TutorDialogue />
        <WeeklyPlan />
        <Subjects />
        <Faq />
        <Testimonials />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}

export default function Landing({ locale, user, onLogout }: LandingProps) {
  useSeo(locale);

  return (
    <LocaleProvider locale={locale}>
      <LandingContent user={user} onLogout={onLogout} />
    </LocaleProvider>
  );
}
