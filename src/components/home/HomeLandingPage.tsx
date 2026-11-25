"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  Compass,
  Crown,
  Globe2,
  HelpCircle,
  Layers,
  Maximize2,
  Mic,
  Pause,
  Search,
  Sigma,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { getCountryProfile } from "@/lib/data/methodology";
import { filterUniversities, TOP_300_UNIVERSITIES } from "@/lib/data/universities";
import { LessonAudioEngine } from "@/lib/voice/lesson-audio-engine";
import { CampusFooter, CampusNavbar, DynamicAmbientBackground } from "@/components/layout/CampusChrome";

interface HomeLandingPageProps {
  user: SessionUser | null;
}

const HERO_STATS = [
  { value: "Top 300", label: "Jahon Oliygohlari", color: "text-[#c6f432]" },
  { value: "1500+", label: "SAT (Math 800)", color: "text-white" },
  { value: "7.5+", label: "IELTS Academic", color: "text-[#c6f432]" },
  { value: "24/7 AI", label: "Ovozli Ustoz", color: "text-white" },
] as const;

const FEATURED_HERO_RANKS = [1, 4, 34, 53, 98];

const PROGRAMS = [
  {
    href: "/dars",
    title: "7 Qadamli Kirish Metodi",
    badge: "Top 300",
    description:
      "Universitet, sinf va qobiliyatni ketma-ket aniqlab, Fullscreen matnsiz muhitda AI ustoz bilan jonli tayyorgarlik.",
    cta: "AI darsni boshlash",
    icon: Compass,
    lime: true,
  },
  {
    href: "/dars",
    title: "SAT Matematika & Mantiq",
    badge: "Math 800",
    description:
      "Xatolar daftari usuli, murakkab masalalar tahlili va yuqori bir foizlik natijaga olib chiquvchi amaliy metod.",
    cta: "Yo'nalishni tanlash",
    icon: Sigma,
    lime: false,
  },
  {
    href: "/dars",
    title: "IELTS & Xalqaro Tillar",
    badge: "IELTS 7.5+",
    description:
      "Quruq qoida yodlamasdan, o'z sohangizdagi ilmiy kontent va yozma amaliyot orqali tabiiy ravishda ball oshirish.",
    cta: "Til rejasini olish",
    icon: Globe2,
    lime: true,
  },
  {
    href: "/dars",
    title: "Spike Loyiha & 100% Grant",
    badge: "Full-Ride",
    description:
      "Personal Statement, tavsiyanoma, shaxsiy portfolio hamda GKS, MEXT, CSC, DSU va Need-blind grantlar strategiyasi.",
    cta: "Grant yo'lini ko'rish",
    icon: BookOpen,
    lime: false,
  },
] as const;

const PLANS = [
  {
    id: "free",
    name: "Boshlang'ich",
    price: "Bepul",
    period: "doimiy",
    description: "Platformani sinab ko'rish, yo'nalishni aniqlash va ilk jonli AI darsni o'tish uchun.",
    features: [
      "Top 300 universitet talablarini tekshirish",
      "3 savolli yo'nalish diagnostikasi",
      "Fullscreen ovozli AI ustoz darsi (Probel suhbati bilan)",
      "Bluetooth va Dinamik ovoz rejimlari",
      "Shaxsiy 7 qadamli kirish checklisti",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro Campus",
    price: "149 000 so'm",
    period: "oyiga",
    description: "To'liq mentorlik kuzatuvi, cheksiz ovozli savol-javob va hujjatlar tahlili uchun.",
    features: [
      "Cheksiz Fullscreen AI ustoz muloqotlari",
      "Barcha 300 ta universitet bo'yicha chuqur grant rejasi",
      "Personal Statement va motivatsion xat tahlili",
      "SAT 1500+ va IELTS 7.5+ haftalik nazorat grafigi",
      "Mutaxassis bilan shaxsiy qabul konsultatsiyasi",
    ],
    highlighted: true,
  },
] as const;

const FAQ_ITEMS = [
  {
    id: "fullscreen-ai",
    question: "Flux Fullscreen AI darsi qanday ishlaydi?",
    answer:
      "Universitet, sinf va yo'nalishni tanlaganingizdan so'ng ekran to'liq oyna (glass) rejimiga o'tadi va ekranda sizni chalg'ituvchi bitta ham matn bo'lmaydi. AI ustoz 7 ta kirish elementini tabiiy, oddiy o'zbek tilida tushuntiradi. Istalgan payt klaviaturadagi Probel tugmasini bosib turib gapirsangiz, AI sizni tinglab savolingizga ovozli javob beradi.",
  },
  {
    id: "audio-bt",
    question: "Bluetooth quloqchin yoki oddiy dinamikda ishlatsa bo'ladimi?",
    answer:
      "Ha! Dars bo'limida ham, Fullscreen dars ichida ham maxsus tugma orqali ovozni bir bosishda Bluetooth quloqchinga yoki kompyuter/telefon dinamigiga o'tkazishingiz mumkin. Probel qo'yib yuborilishi bilan mikrofon yopiladi, shuning uchun Bluetooth ovoz sifati aslo buzilmaydi.",
  },
  {
    id: "grades",
    question: "Nechanchi sinfdan boshlagan ma'qul?",
    answer:
      "Platforma 5-sinfdan 11-sinfgacha hamda litsey/bitiruvchilar uchun moslashgan. Qabulgacha qolgan yillaringizga qarab AI ustoz nimalarga ulgurish kerakligini aniq rejalashtirib beradi.",
  },
  {
    id: "grants",
    question: "Haqiqatan ham Top 300 universitetda 100% grantda o'qisa bo'ladimi?",
    answer:
      "Albatta. AQSHning Need-blind universitetlari, Koreyaning GKS va KAIST dasturlari, Xitoyning CSC, Yaponiyaning MEXT, Italiyaning DSU, Saudiya Arabistonining KFUPM hamda O'zbekistonning El-yurt umidi jamg'armasi o'qish va yashash xarajatlarini to'liq qoplovchi grantlar beradi — AI darsda har bir davlat uchun aniq yo'lni o'rganasiz.",
  },
];

export function HomeLandingPage({ user }: HomeLandingPageProps) {
  const [heroRank, setHeroRank] = useState<number>(1);
  const [checkerQuery, setCheckerQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>("fullscreen-ai");
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const demoEngineRef = useRef<LessonAudioEngine | null>(null);

  const heroUni = useMemo(
    () => TOP_300_UNIVERSITIES.find((u) => u.rank === heroRank) ?? TOP_300_UNIVERSITIES[0],
    [heroRank],
  );
  const heroProfile = getCountryProfile(heroUni.country);

  const demoSpeechText = useMemo(
    () =>
      `Salom! ${heroUni.name} dunyoda ${heroUni.rank}-o'rinda turadi. Bu yerga kirish uchun ${heroProfile.languageSpoken}, hamda ${heroProfile.scholarshipSpoken}. Keling, dars bo'limida hammasini birga o'rganamiz!`,
    [heroUni, heroProfile],
  );

  const checkerResults = useMemo(
    () => filterUniversities({ query: checkerQuery }).slice(0, 6),
    [checkerQuery],
  );

  useEffect(() => {
    return () => {
      demoEngineRef.current?.destroy();
    };
  }, []);

  const handleToggleHeroVoice = async () => {
    if (isPlayingDemo) {
      demoEngineRef.current?.stopSpeech();
      setIsPlayingDemo(false);
      return;
    }
    if (!demoEngineRef.current) {
      demoEngineRef.current = new LessonAudioEngine();
    }
    setIsPlayingDemo(true);
    await demoEngineRef.current.speak(demoSpeechText, () => {
      setIsPlayingDemo(false);
    });
  };

  const startHref = user ? "/dars" : "/register";

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden">
      <DynamicAmbientBackground isAuthenticated={Boolean(user)} />
      <CampusNavbar user={user} />

      <main className="relative z-10 mx-auto w-full max-w-[1440px] flex-1 space-y-20 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* 1. HERO SECTION (v1 12-col Campus Layout + Flux Live AI Methodology Showcase) */}
        <section className="grid items-center gap-8 lg:grid-cols-12" aria-labelledby="hero-title">
          {/* Left 7 columns */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c6f432]/35 bg-[#c6f432]/10 px-3.5 py-1.5 font-mono text-xs font-bold text-[#c6f432]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>TOP 300 UNIVERSITET · FULLSCREEN OVOZLI AI</span>
            </div>

            <h1
              id="hero-title"
              className="text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Top Universitetlar Sari{" "}
              <span className="bg-gradient-to-r from-[#c6f432] via-[#dcfa72] to-[#ffffff] bg-clip-text text-transparent">
                Jonli AI Metodologiya
              </span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Quruq yozuv va zerikarli darslar yo&apos;q. Universitet, sinf va yo&apos;nalishingizni
              ketma-ket tanlang — <strong className="text-white">Flux AI ustoz</strong> to&apos;liq
              ekranda oddiy o&apos;zbek tilida dars o&apos;tadi,{" "}
              <strong className="text-[#c6f432]">Probel</strong>ni bossangiz sizni tinglab savolingizga
              javob beradi.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={startHref}
                className="btn-neon inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 text-sm font-extrabold sm:text-base"
              >
                <Maximize2 className="h-5 w-5" />
                <span>{user ? "AI Dars Bo'limini Ochish" : "Hoziroq Boshlash (Bepul)"}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#tekshirgich"
                className="glass-card inline-flex items-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold text-white transition hover:text-[#c6f432] sm:text-base"
              >
                <Search className="h-4 w-4 text-[#c6f432]" />
                <span>Top 300 Talablar</span>
              </a>

              <a
                href="#dasturlar"
                className="glass-pill inline-flex items-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-200 hover:text-white"
              >
                <Layers className="h-4 w-4 text-[#c6f432]" />
                <span>7 Qadamli Metod</span>
              </a>
            </div>

            {/* 4 Signature Glass-Pill Stats */}
            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="glass-pill rounded-2xl p-3.5 text-center">
                  <span className={`block font-mono text-lg font-black ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 columns: v1 Interactive Voice Card + Top-300 Selector */}
          <div className="lg:col-span-5">
            <div className="glass-card relative space-y-5 overflow-hidden rounded-[1.75rem] p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 animate-pulse rounded-full bg-[#c6f432]" />
                  <span className="font-mono text-xs font-bold text-[#c6f432]">
                    JONLI AI USTOZ VITRINASI
                  </span>
                </div>
                <span className="glass-pill rounded-full px-3 py-0.5 font-mono text-xs font-bold text-white">
                  #{heroUni.rank} · {heroUni.country}
                </span>
              </div>

              {/* Quick Top-300 Sample Chips */}
              <div className="flex flex-wrap gap-1.5">
                {FEATURED_HERO_RANKS.map((r) => {
                  const label =
                    r === 1
                      ? "#1 MIT"
                      : r === 4
                        ? "#4 Oxford"
                        : r === 34
                          ? "#34 TU Munich"
                          : r === 53
                            ? "#53 KAIST"
                            : "#98 KFUPM";
                  const active = heroRank === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        if (isPlayingDemo) {
                          demoEngineRef.current?.stopSpeech();
                          setIsPlayingDemo(false);
                        }
                        setHeroRank(r);
                      }}
                      className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition ${
                        active
                          ? "border border-[#c6f432]/70 bg-[#c6f432]/20 text-[#c6f432] shadow-[0_0_18px_rgba(198,244,50,0.28)]"
                          : "border border-white/12 bg-white/5 text-zinc-300 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Tanlangan maqsad:
                  </span>
                  <h2 className="mt-0.5 text-xl font-black text-white">{heroUni.name}</h2>
                </div>

                {/* Requirements Breakdown */}
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs sm:text-sm">
                  <div className="flex items-center justify-between gap-2 text-zinc-300">
                    <span>1. Til sertifikati:</span>
                    <strong className="text-white">{heroProfile.minIelts}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-zinc-300">
                    <span>2. Kirish testi:</span>
                    <strong className="text-[#c6f432]">{heroProfile.examBadge}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-zinc-300">
                    <span>3. Grant imkoni:</span>
                    <strong className="text-[#c6f432]">{heroProfile.grantBadge}</strong>
                  </div>
                </div>

                {/* v1 Signature Live AI Voice Demo Box */}
                <div className="space-y-2 rounded-2xl border border-[#c6f432]/35 bg-[#c6f432]/10 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c6f432]/20 text-[#c6f432]">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white">
                          Flux AI Ovozli Tushuntirish
                        </span>
                        <span className="block text-[11px] text-zinc-300">
                          {isPlayingDemo
                            ? "AI ustoz gapirmoqda..."
                            : "Tabiiy o'zbek tilida tinglab ko'ring"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleToggleHeroVoice()}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                        isPlayingDemo
                          ? "border-[#c6f432] bg-[#c6f432]/25 text-[#c6f432]"
                          : "border-white/15 bg-white/5 text-white hover:border-[#c6f432]/60 hover:text-[#c6f432]"
                      }`}
                    >
                      {isPlayingDemo ? (
                        <>
                          <Pause className="h-3.5 w-3.5" />
                          <span>To&apos;xtatish</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 text-[#c6f432]" />
                          <span>Tinglash</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <Link
                  href={user ? `/dars?uni=${heroUni.rank}` : "/register"}
                  className="btn-neon flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-center text-sm font-extrabold"
                >
                  <Mic className="h-4 w-4" />
                  <span>Fullscreen Matnsiz AI Darsni Boshlash</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. TOP 300 UNIVERSITY REQUIREMENTS CHECKER */}
        <section id="tekshirgich" className="glass-panel scroll-mt-24 rounded-[1.75rem] p-6 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#c6f432]">
                <Trophy className="h-3.5 w-3.5" />
                TOP 300 REYTING BAZASI
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                300 ta universitet talablarini tezkor tekshiring
              </h2>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={checkerQuery}
                onChange={(e) => setCheckerQuery(e.target.value)}
                placeholder="MIT, Oxford, Koreya, Germaniya..."
                className="glass-input w-full rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {checkerResults.map((uni) => {
              const p = getCountryProfile(uni.country);
              return (
                <Link
                  key={uni.rank}
                  href={user ? `/dars?uni=${uni.rank}` : "/register"}
                  className="glass-card glass-card-interactive flex flex-col justify-between rounded-2xl p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg border border-[#c6f432]/40 bg-[#c6f432]/15 px-2.5 py-0.5 font-mono text-xs font-bold text-[#c6f432]">
                        #{uni.rank}
                      </span>
                      <span className="font-mono text-xs text-zinc-400">{uni.country}</span>
                    </div>
                    <h3 className="mt-2.5 line-clamp-2 text-base font-bold text-white">
                      {uni.name}
                    </h3>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-3 font-mono text-[11px]">
                    <span className="rounded-md border border-white/12 bg-white/5 px-2 py-0.5 text-white">
                      {p.minIelts}
                    </span>
                    <span className="rounded-md border border-[#c6f432]/30 bg-[#c6f432]/10 px-2 py-0.5 text-[#c6f432]">
                      {p.examBadge}
                    </span>
                    <span className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-zinc-200">
                      {p.grantBadge}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 3. KURSLAR VA METODOLOGIYA (v1 ProgramsSection 4-card Obsidian Grid) */}
        <section id="dasturlar" className="scroll-mt-24 space-y-6" aria-labelledby="programs-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#c6f432]">
                TIZIMLI MODULLAR
              </span>
              <h2
                id="programs-title"
                className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl"
              >
                Kirish metodologiyasi va dasturlar
              </h2>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMS.map((program) => {
              const Icon = program.icon;
              return (
                <Link
                  key={program.title}
                  href={user ? program.href : "/register"}
                  className="glass-card glass-card-interactive group flex flex-col justify-between rounded-[1.5rem] p-6"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105 ${
                          program.lime
                            ? "border-[#c6f432]/45 bg-[#c6f432]/15 text-[#c6f432]"
                            : "border-white/25 bg-white/10 text-white"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span
                        className={`glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold ${
                          program.lime ? "text-[#c6f432]" : "text-white"
                        }`}
                      >
                        {program.badge}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-white transition group-hover:text-[#c6f432]">
                      {program.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      {program.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-[#c6f432]">
                    <span>{program.cta}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. TARIFLAR (v1 PricingSection Obsidian-Lime Cards) */}
        <section id="pricing" className="scroll-mt-24 space-y-8" aria-labelledby="pricing-title">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[#c6f432]">
              <Award className="h-4 w-4" /> TARIFLAR
            </span>
            <h2
              id="pricing-title"
              className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl"
            >
              Ochiq va tushunarli obuna tizimi
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-[1.75rem] p-7 ${
                  plan.highlighted ? "glass-card-selected" : "glass-card"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                    {plan.highlighted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#c6f432] px-3 py-1 font-mono text-[11px] font-black text-[#0b0b0c]">
                        <Crown className="h-3.5 w-3.5" /> TAVSIYA ETILADI
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-zinc-400">/ {plan.period}</span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-300">{plan.description}</p>

                  <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-zinc-200 sm:text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c6f432]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={startHref}
                  className={`mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold ${
                    plan.highlighted ? "btn-neon" : "btn-gold"
                  }`}
                >
                  <span>{user ? "Dars bo'limiga o'tish" : "Hoziroq Boshlash"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 5. FAQ ACCORDION (v1 FaqSection Smooth Grid Transition) */}
        <section id="faq" className="scroll-mt-24 space-y-8" aria-labelledby="faq-title">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[#c6f432]">
              <HelpCircle className="h-4 w-4" /> FAQ
            </span>
            <h2
              id="faq-title"
              className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl"
            >
              Ko&apos;p beriladigan savollar
            </h2>
          </div>

          <div className="mx-auto w-full max-w-4xl space-y-3">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className={`glass-card overflow-hidden rounded-2xl transition-colors ${
                    isOpen ? "border-[#c6f432]/55" : ""
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqId((cur) => (cur === item.id ? null : item.id))}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                    >
                      <span
                        className={`text-sm font-bold sm:text-base ${
                          isOpen ? "text-[#c6f432]" : "text-white"
                        }`}
                      >
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-[#c6f432] transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-relaxed text-zinc-300 sm:px-6">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <CampusFooter />
    </div>
  );
}
