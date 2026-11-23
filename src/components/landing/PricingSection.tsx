"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Check, CheckCircle2, Crown, Sparkles } from "lucide-react";
import { BRAND, SECTION_IDS } from "@/lib/site-config";
import { loadSecureLocal } from "@/lib/security/client-storage";
import {
  loadStoredPlan,
  subscribeStoredPlan,
  type PlanId,
} from "@/lib/billing/plan-storage";

interface PricingPlan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
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
    highlighted: true,
  },
];

const BILLING_UPGRADE_URL = "/settings?tab=billing&upgrade=pro";
const BILLING_MANAGE_URL = "/settings?tab=billing";

export function PricingSection() {
  const { data: session } = useSession();
  const [localLoggedIn, setLocalLoggedIn] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");

  useEffect(() => {
    const localUser = loadSecureLocal<{ name?: string; email?: string; isLoggedIn?: boolean }>(
      "3talaba_user"
    );
    if (localUser?.name || localUser?.email || localUser?.isLoggedIn) {
      setLocalLoggedIn(true);
    }

    setCurrentPlan(loadStoredPlan().plan);
    return subscribeStoredPlan((state) => setCurrentPlan(state.plan));
  }, []);

  const isLoggedIn = Boolean(session?.user) || localLoggedIn;

  const getCtaForPlan = (plan: PricingPlan): { href: string; label: string; isCurrent: boolean } => {
    if (!isLoggedIn) {
      return plan.id === "pro"
        ? { href: "/register?plan=pro", label: "Pro Campus'ga o'tish", isCurrent: false }
        : { href: "/register", label: "Bepul boshlash", isCurrent: false };
    }

    if (plan.id === "pro") {
      if (currentPlan === "pro") {
        return { href: BILLING_MANAGE_URL, label: "Faol tarifingiz • Boshqarish", isCurrent: true };
      }
      return { href: BILLING_UPGRADE_URL, label: "Pro Campus'ga o'tish", isCurrent: false };
    }

    if (currentPlan === "free") {
      return { href: "/learn", label: "Joriy tarifingiz • Darslarga o'tish", isCurrent: true };
    }
    return { href: BILLING_MANAGE_URL, label: "Tarifni boshqarish", isCurrent: false };
  };

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
          {isLoggedIn
            ? "Hisobingizga kirilgansiz — qayta ro'yxatdan o'tmasdan bir klikda Pro Campus tarifiga o'tishingiz mumkin."
            : "Bepul boshlang, tayyor bo'lganingizda Pro Campus'ga o'ting. Obunani istalgan vaqtda bekor qilish mumkin."}
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:gap-8 md:grid-cols-2">
        {PLANS.map((plan) => {
          const cta = getCtaForPlan(plan);
          return (
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
                  {isLoggedIn && currentPlan === "pro" ? "Faol tarif" : "Eng mashhur"}
                </span>
              )}

              <div className="flex items-center gap-2">
                {plan.highlighted ? (
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                )}
                <h3 className="text-lg font-black text-white">{plan.name}</h3>
                {cta.isCurrent && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Faol
                  </span>
                )}
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
                href={cta.href}
                className={
                  plan.highlighted
                    ? "btn-neon mt-8 flex items-center justify-center gap-2 py-3 text-sm"
                    : "mt-8 flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold text-white transition-colors hover:border-emerald-400/40 hover:text-emerald-400"
                }
              >
                <span>{cta.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {!isLoggedIn && plan.id === "pro" && (
                <p className="mt-3 text-center text-xs text-slate-400">
                  Allaqachon ro&apos;yxatdan o&apos;tganmisiz?{" "}
                  <Link
                    href={`/login?next=${encodeURIComponent(BILLING_UPGRADE_URL)}`}
                    className="font-bold text-[#c6f432] hover:underline"
                  >
                    Hisobga kirib Pro&apos;ga o&apos;ting →
                  </Link>
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
