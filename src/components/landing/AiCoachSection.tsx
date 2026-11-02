import Link from "next/link";
import { ArrowRight, Brain, Clock, MessageCircleQuestion, Volume2 } from "lucide-react";
import { BRAND, SECTION_IDS } from "@/lib/site-config";

const AI_FEATURES = [
  {
    icon: MessageCircleQuestion,
    title: "Sokratik usul",
    description:
      "Tayyor javobni berib qo'ymaydi — yo'naltiruvchi savollar bilan sizni mustaqil yechimga olib boradi.",
    accent: "border-emerald-400/40 bg-emerald-500/20 text-emerald-400",
  },
  {
    icon: Volume2,
    title: "Ovozli tushuntirish",
    description: "Formula va yechimlarni o'zbek tilida ovoz bilan tushuntiradi, savolni ovozda o'qib beradi.",
    accent: "border-amber-400/40 bg-amber-400/20 text-amber-300",
  },
  {
    icon: Clock,
    title: "24/7 shaxsiy murabbiy",
    description: "Xatolaringizni tahlil qilib, 12 oylik xaritangizdagi zaif mavzularni avtomatik takrorlatadi.",
    accent: "border-teal-400/40 bg-teal-500/20 text-teal-300",
  },
] as const;

export function AiCoachSection() {
  return (
    <section
      id={SECTION_IDS.aiCoach}
      className="scroll-mt-28 space-y-6"
      aria-labelledby="ai-coach-title"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-amber-300">
            <Brain className="h-4 w-4" /> AI MURABBIY
          </span>
          <h2 id="ai-coach-title" className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {BRAND.aiName} — har doim yoningizdagi ustoz
          </h2>
        </div>
        <Link
          href="/coach"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300"
        >
          <span>{BRAND.aiName} bilan suhbat</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {AI_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="glass-card p-6">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${feature.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
