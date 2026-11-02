import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { SECTION_IDS, TARGETS } from "@/lib/site-config";

const QUARTERS = [
  {
    period: "1-CHORAK (1–3 OY)",
    title: "Fundamental Poydevor",
    description:
      "Maktab algebrasini mustahkamlash, ingliz tili grammatikasi va bazaviy so'z boyligi.",
    border: "border-l-emerald-400",
    label: "text-emerald-400",
  },
  {
    period: "2-CHORAK (4–6 OY)",
    title: "SAT & IELTS Strategiyalari",
    description: "Test tuzoqlari, tezkor ishlash uslublari, Reading skanerlash va Writing qoidalari.",
    border: "border-l-teal-400",
    label: "text-teal-300",
  },
  {
    period: "3-CHORAK (7–9 OY)",
    title: "Intensiv Amaliyot",
    description: "Minglab savollar banki, xatolar tahlili va Sokratik murabbiy bilan qiyin mavzular.",
    border: "border-l-amber-400",
    label: "text-amber-300",
  },
  {
    period: "4-CHORAK (10–12 OY)",
    title: "Mock Testlar & Grant Qabuli",
    description:
      "To'liq vaqtli sinov imtihonlari, insholarni tekshirish va xorijiy universitetlarga ariza topshirish.",
    border: "border-l-emerald-400",
    label: "text-emerald-400",
  },
] as const;

export function RoadmapSection() {
  return (
    <section
      id={SECTION_IDS.roadmap}
      className="glass-card scroll-mt-28 p-6 sm:p-10"
      aria-labelledby="roadmap-title"
    >
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">STRATEGIYA</span>
        <h2 id="roadmap-title" className="mt-1 text-2xl font-black text-white sm:text-3xl">
          12 Oylik Tayyorgarlik Traektoriyasi
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {TARGETS.program}: bazaviy bilimdan {TARGETS.sat} va {TARGETS.ielts} natijalarigacha, so&apos;ng
          nufuzli universitetlarga grant arizasigacha bo&apos;lgan yo&apos;l.
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUARTERS.map((quarter) => (
          <li key={quarter.period} className={`glass-pill rounded-2xl border-l-4 p-5 ${quarter.border}`}>
            <span className={`text-xs font-extrabold uppercase ${quarter.label}`}>{quarter.period}</span>
            <h3 className="mt-1.5 text-base font-bold text-white">{quarter.title}</h3>
            <p className="mt-2 text-xs text-slate-300">{quarter.description}</p>
          </li>
        ))}
      </ol>

      {/* Boshlang'ich talablar (Prerequisites Banner) */}
      <div
        role="note"
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/20 text-amber-300">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Boshlang&apos;ich talablar
            </span>
            <p className="mt-1 text-sm leading-relaxed text-slate-200">
              Dasturni samarali boshlash uchun bazaviy matematika va ingliz tili (A2/B1) tavsiya etiladi.
              Darajangizni aniqlash uchun bepul Diagnostika testidan o&apos;ting.
            </p>
          </div>
        </div>
        <Link
          href="/placement"
          className="btn-gold inline-flex shrink-0 items-center justify-center gap-1.5 px-4 py-2.5 text-sm"
        >
          <span>Bepul Diagnostika</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
