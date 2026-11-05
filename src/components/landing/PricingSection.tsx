import Link from "next/link";
import { Check, Crown, Sparkles } from "lucide-react";
import { BRAND, SECTION_IDS } from "@/lib/site-config";

interface PricingPlan {
  id: "free" | "pro";
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: { href: string; label: string };
  highlighted: boolean;
}

/**
 * DIQQAT: Pro Campus narxini haqiqiy tarifingizga moslab yangilang.
 */
const PRO_MONTHLY_PRICE = "149 000 so'm";

const PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Boshlang'ich",
    price: "Bepul",
    period: "doimiy",
    description: "Platformani sinab ko'rish va darajangizni aniqlash uchun.",
    features: [
      "Diagnostika testi",
      "Dastlabki 2 ta matematika moduli",
      "Kunlik 5 ta mashq",
      "AI Murabbiy (cheklangan)",
    ],
    cta: { href: "/register", label: "Bepul boshlash" },
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro Campus",
    price: PRO_MONTHLY_PRICE,
    period: "oyiga",
    description: "To'liq 12 oylik tizim va cheksiz AI murabbiy bilan jiddiy tayyorgarlik.",
    features: [
      "Barcha 15+ modullar",
      "SAT & IELTS to'liq baza",
      `24/7 cheksiz ${BRAND.aiName} murabbiy va ovozli tushuntirish`,
      "Full Mock testlar",
      "Grant strategiyasi",
    ],
    cta: { href: "/register?plan=pro", label: "Pro Campus'ga o'tish" },
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <section
      id={SECTION_IDS.pricing}
      className="scroll-mt-28 space-y-8"
      aria-labelledby="pricing-title"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">TARIFLAR</span>
        <h2 id="pricing-title" className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
          O&apos;zingizga mos rejani tanlang
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Bepul boshlang, tayyor bo&apos;lganingizda Pro Campus&apos;ga o&apos;ting. Obunani istalgan vaqtda
          bekor qilish mumkin.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:gap-8 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`glass-card relative flex flex-col p-6 sm:p-8 ${
              plan.highlighted
                ? "border-emerald-400/60 shadow-[0_0_48px_-12px_rgba(198,244,50,0.55)]"
                : ""
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full border border-[#c6f432] bg-[#c6f432] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-950 shadow-gold">
                <Crown className="h-3.5 w-3.5" />
                Eng mashhur
              </span>
            )}

            <div className="flex items-center gap-2">
              {plan.highlighted ? (
                <Sparkles className="h-5 w-5 text-emerald-400" />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              )}
              <h3 className="text-lg font-black text-white">{plan.name}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-300">{plan.description}</p>

            <div className="mt-6 flex items-end gap-2">
              <span
                className={`font-mono text-3xl font-black sm:text-4xl ${
                  plan.highlighted ? "text-emerald-400" : "text-white"
                }`}
              >
                {plan.price}
              </span>
              <span className="pb-1 text-sm font-semibold text-slate-400">/ {plan.period}</span>
            </div>

            <ul className="mt-6 flex-1 space-y-3 border-t border-white/10 pt-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      plan.highlighted ? "bg-emerald-500/25 text-emerald-300" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.cta.href}
              className={
                plan.highlighted
                  ? "btn-neon mt-8 flex items-center justify-center py-3 text-sm"
                  : "mt-8 flex items-center justify-center rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold text-white transition-colors hover:border-emerald-400/40 hover:text-emerald-400"
              }
            >
              {plan.cta.label}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
