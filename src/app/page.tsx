import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProgramsSection } from "@/components/landing/ProgramsSection";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { AiCoachSection } from "@/components/landing/AiCoachSection";
import { DailyPracticeSection } from "@/components/landing/DailyPracticeSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FAQ_ITEMS } from "@/components/landing/faq-data";
import { BRAND, TARGETS } from "@/lib/site-config";

/**
 * Landing sahifa build vaqtida statik HTML sifatida tayyorlanadi —
 * hech qanday loading holatisiz, to'liq kontent bilan (SEO uchun).
 */
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: {
    absolute: `${BRAND.fullName} — ${TARGETS.sat} va ${TARGETS.ielts} ga tizimli tayyorgarlik`,
  },
  description: `${TARGETS.program}: Digital ${TARGETS.sat}, ${TARGETS.ielts} va chuqur Matematika. ${BRAND.aiName} murabbiy, shaxsiy yo'l xaritasi va tushuntirishlar 100% o'zbek tilida.`,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function HomePage() {
  return (
    <div className="relative z-10 mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HeroSection />
      <ProgramsSection />
      <RoadmapSection />
      <AiCoachSection />
      <DailyPracticeSection />
      <PricingSection />
      <FaqSection items={FAQ_ITEMS} />
    </div>
  );
}
