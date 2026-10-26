"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, createTimeline, stagger } from "animejs";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  Brain,
  Trophy,
  CheckCircle2,
  BookOpen,
  Calculator,
  Globe2,
  PenTool,
  ShieldCheck,
  Flame,
  Download,
  Sliders,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";

const STANDARD_TIME_OPTIONS = [
  { minutes: 30, label: "30 daqiqa", subtitle: "Yengil va barqaror odat" },
  { minutes: 60, label: "1 soat (60 daq)", subtitle: "Tavsiya etilgan muvozanat" },
  { minutes: 90, label: "1.5 soat (90 daq)", subtitle: "Tezlashtirilgan o'sish" },
  { minutes: 120, label: "2 soat (120 daq)", subtitle: "Standart maksimum" },
];

const SUBJECT_CARDS = [
  {
    slug: "sat-math",
    title: "SAT Matematika",
    badge: "800 ballgacha",
    level: "Noldan → Yuqori",
    desc: "Algebra, chiziqli tenglamalar, kvadratik funksiyalar, geometriya va ma'lumotlar tahlili o'zbek tilida sodda misollar bilan.",
    icon: Calculator,
    accent: "neon",
  },
  {
    slug: "sat-rw",
    title: "SAT Reading & Writing",
    badge: "Digital SAT formati",
    level: "Boshlang'ich → Yuqori",
    desc: "Akademik matnlarni tez tushunish, mantiqiy dalillar, tinish belgilari va grammatik qoliplar.",
    icon: BookOpen,
    accent: "gold",
  },
  {
    slug: "ielts",
    title: "IELTS Academic (4 ko'nikma)",
    badge: "Band 7.0 – 8.5+",
    level: "Noldan → C1",
    desc: "Reading va Listening tuzoqlari, Writing Task 1 & 2 AI tahlili hamda Speaking uchun tuzilmaviy javoblar.",
    icon: Globe2,
    accent: "neon",
  },
  {
    slug: "foundation-math",
    title: "Fundamental Matematika va Ingliz Tili",
    badge: "Noldan boshlovchilar uchun",
    level: "0-darajadan",
    desc: "Agar bazangiz bo'sh bo'lsa ham hech qanday uyalishsiz kasrlar, foizlar va ingliz tili alifbosi/zamonlaridan boshlaymiz.",
    icon: Compass,
    accent: "gold",
  },
  {
    slug: "academic-writing",
    title: "Akademik Yozuv va Personal Statement",
    badge: "Grant va Stipendiya",
    level: "O'rta → Yuqori",
    desc: "Xorijiy universitetlar qabul komissiyasi uchun ta'sirchan insho (Admission Essay) va ilmiy argumentatsiya.",
    icon: PenTool,
    accent: "neon",
  },
  {
    slug: "ai-socratic",
    title: "Shaxsiy Socratic AI Murabbiy",
    badge: "24/7 Ustoz",
    level: "Har bir darajada",
    desc: "Javobni tayyor aytib qo'ymaydi — o'zingiz topishingiz uchun iliq savollar bilan yo'naltiradi va xatolarni tushuntiradi.",
    icon: Brain,
    accent: "gold",
  },
];

const MORPH_SHAPES = [
  "140,30 230,80 210,180 90,190 50,95",
  "145,20 245,95 195,195 80,185 40,85",
  "135,35 225,75 215,175 95,195 55,90",
];

export function LandingExperience() {
  const { reduceMotion } = useUIPreferences();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const svgPathRef = useRef<SVGPathElement | null>(null);
  const morphPolygonRef = useRef<SVGPolygonElement | null>(null);
  const xpCounterSpanRef = useRef<HTMLSpanElement | null>(null);

  // Interaktiv kunlik vaqt kalkulyatori holati (standart <=120 daq + qo'lda kiritish)
  const [selectedMinutes, setSelectedMinutes] = useState<number>(60);
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>("180");

  // AI Murabbiy demo: Interaktiv savol-javob
  const [demoGender, setDemoGender] = useState<"FEMALE" | "MALE">("FEMALE");

  const effectiveMinutes = customMode
    ? Math.min(480, Math.max(125, Number(customMinutesInput) || 150))
    : selectedMinutes;

  const annualHours = Math.round((effectiveMinutes * 6 * 48) / 60);
  const projectedSat = Math.min(1580, 1180 + Math.round(effectiveMinutes * 2.6));
  const projectedIelts = Math.min(8.5, Number((6.0 + effectiveMinutes * 0.016).toFixed(1)));

  // 1. Hero anime.js v4 timeline (Staggered text + SVG path drawing + Floating badges + Polygon morphing)
  useEffect(() => {
    if (reduceMotion || !heroRef.current) return;

    const words = heroRef.current.querySelectorAll<HTMLElement>("[data-hero-word]");
    const badges = heroRef.current.querySelectorAll<HTMLElement>("[data-float-badge]");
    const cards = heroRef.current.querySelectorAll<HTMLElement>("[data-hero-card]");

    const tl = createTimeline({
      defaults: { ease: "outExpo" },
    });

    if (words.length > 0) {
      tl.add(words, {
        opacity: [0, 1],
        translateY: [28, 0],
        rotateX: [-35, 0],
        duration: 820,
        delay: stagger(55),
      });
    }

    if (cards.length > 0) {
      tl.add(
        cards,
        {
          opacity: [0, 1],
          translateY: [24, 0],
          scale: [0.96, 1],
          duration: 750,
          delay: stagger(90),
        },
        "-=520",
      );
    }

    // SVG yo'l xaritasi chizig'ini chizish (line drawing)
    if (svgPathRef.current) {
      const length = svgPathRef.current.getTotalLength?.() || 620;
      svgPathRef.current.style.strokeDasharray = `${length}`;
      svgPathRef.current.style.strokeDashoffset = `${length}`;

      animate(svgPathRef.current, {
        strokeDashoffset: [length, 0],
        duration: 1100,
        delay: 150,
        ease: "inOutQuart",
      });
    }

    // Suzib yuruvchi SAT/IELTS/Matematika belgilari
    if (badges.length > 0) {
      animate(badges, {
        translateY: [-6, 6],
        rotate: [-1.5, 1.5],
        duration: 2600,
        delay: stagger(280),
        direction: "alternate",
        loop: true,
        ease: "inOutSine",
      });
    }

    // SVG Geometrik morphing (anime.js uslubida)
    let morphIndex = 0;
    const morphInterval = window.setInterval(() => {
      if (!morphPolygonRef.current) return;
      morphIndex = (morphIndex + 1) % MORPH_SHAPES.length;
      animate(morphPolygonRef.current, {
        points: MORPH_SHAPES[morphIndex],
        duration: 1600,
        ease: "inOutQuad",
      });
    }, 2400);

    return () => {
      window.clearInterval(morphInterval);
    };
  }, [reduceMotion]);

  // 2. Kunlik vaqt o'zgarganda XP / Soat ko'rsatkichini anime.js bilan sanash
  useEffect(() => {
    if (!xpCounterSpanRef.current) return;
    if (reduceMotion) {
      xpCounterSpanRef.current.textContent = String(annualHours);
      return;
    }

    const counterObj = { val: Math.max(60, annualHours - 80) };
    animate(counterObj, {
      val: annualHours,
      duration: 650,
      ease: "outQuart",
      onUpdate: () => {
        if (xpCounterSpanRef.current) {
          xpCounterSpanRef.current.textContent = String(Math.round(counterObj.val));
        }
      },
    });
  }, [annualHours, reduceMotion]);

  // 3. Scroll bilan bog'langan bo'limlar ketma-ket ochilishi (IntersectionObserver + anime.js stagger)
  useEffect(() => {
    if (reduceMotion) return;

    const sections = document.querySelectorAll<HTMLElement>("[data-scroll-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          if (el.dataset.animated === "true") return;
          el.dataset.animated = "true";

          const items = el.querySelectorAll<HTMLElement>("[data-scroll-item]");
          if (items.length > 0) {
            animate(items, {
              opacity: [0, 1],
              translateY: [28, 0],
              duration: 720,
              delay: stagger(95),
              ease: "outExpo",
            });
          }
        });
      },
      { threshold: 0.14 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [reduceMotion]);

  const headlineWords = [
    "12",
    "Oyda",
    "Noldan",
    "Nufuzli",
    "Xorijiy",
    "Universitetlargacha",
  ];

  return (
    <div className="relative z-10">
      {/* ====================================================================
          HERO QISMI (Stagger sarlavha + SVG chizilishi + Suzib yuruvchi belgilar)
          ==================================================================== */}
      <section
        ref={heroRef}
        className="classroom-grid-bg relative overflow-hidden pb-20 pt-10 sm:pb-28 sm:pt-16"
        aria-label="Asosiy tanishtiruv"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Chap ustun: Matn va CTA */}
            <div className="lg:col-span-7">
              <div
                data-hero-card
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon-soft px-3.5 py-1.5 text-xs font-semibold text-neon"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>O'zbek tilidagi adaptiv SAT, IELTS va Akademik tayyorgarlik</span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-fg sm:text-5xl lg:text-6xl">
                {headlineWords.map((word, idx) => (
                  <span
                    key={word}
                    data-hero-word
                    className={`mr-3 inline-block ${
                      idx === 2
                        ? "text-gold"
                        : idx >= 4
                          ? "bg-gradient-to-r from-neon via-emerald-400 to-gold bg-clip-text text-transparent"
                          : ""
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </h1>

              <p
                data-hero-card
                className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg"
              >
                Qaysi darajada bo'lsangiz ham — hatto{" "}
                <strong className="font-semibold text-fg">mutlaqo noldan</strong>{" "}
                boshlasangiz ham — <strong className="font-semibold text-neon">3Talab</strong>{" "}
                sizning kuchli va zaif tomonlaringizni aniqlaydi, kunlik vaqtingizga mos{" "}
                <strong className="font-semibold text-gold">12 oylik shaxsiy yo'l xaritasi</strong>{" "}
                tuzadi va har bir qadamda iliq Socratic AI murabbiy bilan yetaklaydi.
              </p>

              {/* Asosiy CTA tugmalar */}
              <div
                data-hero-card
                className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center"
              >
                <Link
                  href="/register"
                  className="btn-neon inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-bold"
                >
                  <span>Boshlash — Bepul Diagnostika</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#vaqt-kalkulyator"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/90 px-6 py-4 text-sm font-semibold text-fg transition-all hover:border-neon/50 hover:text-neon"
                >
                  <Clock className="h-4 w-4 text-gold" />
                  <span>Kunlik vaqt rejasini ko'rish</span>
                </a>
                <Link
                  href="/download"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-neon/50 bg-neon-soft px-5 py-4 text-sm font-bold text-neon transition-all hover:bg-neon hover:text-canvas shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Desktop (.exe / Mac / Linux)</span>
                </Link>
              </div>

              {/* Ishonch ko'rsatkichlari */}
              <div
                data-hero-card
                className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 sm:max-w-xl"
              >
                <div>
                  <p className="font-mono text-2xl font-extrabold text-neon sm:text-3xl">
                    0 → 1500+
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    SAT Math & Reading bosqichma-bosqich
                  </p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-extrabold text-gold sm:text-3xl">
                    Band 8.0+
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    IELTS 4 ko'nikma + AI Writing tahlili
                  </p>
                </div>
                <div>
                  <p className="font-mono text-2xl font-extrabold text-fg sm:text-3xl">
                    12 Oy
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    48 hafta → Kunlik aniq vazifalar
                  </p>
                </div>
              </div>
            </div>

            {/* O'ng ustun: Interaktiv SVG Trajektoriya + Suzib yuruvchi SAT/IELTS/Matematika belgilari */}
            <div className="relative lg:col-span-5">
              {/* Suzib yuruvchi belgilar */}
              <div
                data-float-badge
                className="glass-card absolute -left-3 -top-5 z-20 flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-neon shadow-neon sm:-left-6"
              >
                <Calculator className="h-4 w-4" />
                <span>SAT Math • ∫ f(x)dx = 800</span>
              </div>

              <div
                data-float-badge
                className="glass-card absolute -top-5 right-2 z-20 flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gold shadow-gold sm:right-4"
              >
                <Globe2 className="h-4 w-4" />
                <span>IELTS Academic • 8.5</span>
              </div>

              <div
                data-float-badge
                className="glass-card absolute -bottom-5 left-6 z-20 flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-fg"
              >
                <Flame className="h-4 w-4 text-gold" />
                <span>Kunlik Streak • +50 XP</span>
              </div>

              {/* Asosiy Vizual Karta */}
              <div
                data-hero-card
                className="glass-card relative overflow-hidden p-5 sm:p-6"
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neon">
                      JONLI YO'L XARITASI SIMULYATORI
                    </span>
                    <h2 className="mt-0.5 text-base font-bold text-fg">
                      Shaxsiy O'sish Trajektoriyasi
                    </h2>
                  </div>
                  <span className="rounded-lg bg-gold-soft px-2.5 py-1 font-mono text-xs font-bold text-gold">
                    365 KUN
                  </span>
                </div>

                {/* SVG Trajektoriya va Morphing Geometriya */}
                <div className="relative my-4 rounded-xl border border-border bg-canvas/80 p-3">
                  <svg
                    viewBox="0 0 380 210"
                    className="h-48 w-full overflow-visible"
                    role="img"
                    aria-label="12 oylik o'sish grafigi"
                  >
                    <defs>
                      <linearGradient id="trajectoryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="60%" stopColor="#00E676" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>

                    {/* Orqa fondagi morphing ko'pburchak */}
                    <polygon
                      ref={morphPolygonRef}
                      points={MORPH_SHAPES[0]}
                      fill="rgba(16, 185, 129, 0.07)"
                      stroke="rgba(245, 158, 11, 0.22)"
                      strokeWidth="1.2"
                    />

                    {/* Setka chiziqlari */}
                    <line x1="20" y1="180" x2="360" y2="180" stroke="rgba(148,163,184,0.2)" strokeDasharray="4 4" />
                    <line x1="20" y1="115" x2="360" y2="115" stroke="rgba(148,163,184,0.16)" strokeDasharray="4 4" />
                    <line x1="20" y1="50" x2="360" y2="50" stroke="rgba(148,163,184,0.16)" strokeDasharray="4 4" />

                    {/* Asosiy 12 oylik egri chiziq */}
                    <path
                      ref={svgPathRef}
                      d="M 28 175 C 95 168, 130 130, 190 108 C 250 86, 295 48, 350 28"
                      fill="none"
                      stroke="url(#trajectoryGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Bosqich nuqtalari */}
                    <g>
                      <circle cx="28" cy="175" r="6" fill="#10B981" />
                      <text x="18" y="198" fill="currentColor" className="text-[10px] font-mono opacity-80">
                        1-oy: Noldan
                      </text>
                    </g>
                    <g>
                      <circle cx="190" cy="108" r="6" fill="#00E676" />
                      <text x="152" y="132" fill="currentColor" className="text-[10px] font-mono opacity-85">
                        6-oy: B2 / 1320
                      </text>
                    </g>
                    <g>
                      <circle cx="350" cy="28" r="7" fill="#F59E0B" />
                      <text x="275" y="18" fill="#F59E0B" className="text-[11px] font-mono font-bold">
                        12-oy: 1540+ / 8.0
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Kunlik dars holati namunasi */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-elevated/70 px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-neon" />
                      <span className="font-medium text-fg">
                        1-qadam: Adaptiv saralash testi (12 daqiqa)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-neon">Tayyor</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-elevated/70 px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <span className="font-medium text-fg">
                        AI Murabbiy: Socratic individual ko'mak
                      </span>
                    </div>
                    <span className="font-mono font-bold text-gold">Faol</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4 BOSQICHLI FOYDALANUVCHI YO'LI (#tizim)
          ==================================================================== */}
      <section
        id="tizim"
        data-scroll-section
        className="scroll-reveal-css border-t border-border bg-surface/40 py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-neon">
              QANDAY ISHLAYDI?
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-fg sm:text-4xl">
              Har bir o'quvchi uchun individual moslashuvchan tizim
            </h2>
            <p className="mt-3 text-sm text-fg-muted sm:text-base">
              Tayyor shablon emas — sizning yoshingiz, maqsadli universitetingiz, hozirgi
              bilimingiz va kunlik bo'sh vaqtingizga qarab quriladigan o'quv jarayoni.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Tanishuv va Maqsad",
                desc: "Ismingiz, sinfingiz, maqsadli davlat/OTM va ko'zlagan SAT/IELTS ballingizni belgilaysiz.",
                icon: Compass,
              },
              {
                step: "02",
                title: "Adaptiv Placement Test",
                desc: "Qisqa aqlli test javobingizga qarab moslashadi va darajangizni (Noldan → Yuqorigacha) aniqlaydi.",
                icon: Sliders,
              },
              {
                step: "03",
                title: "12 Oylik Shaxsiy Reja",
                desc: "Oylar → Haftalar → Kunlik vazifalar kesimida aniq yo'l xaritasi tuziladi.",
                icon: Clock,
              },
              {
                step: "04",
                title: "Kunlik Dars + AI Ustoz",
                desc: "Nazariya, misol, mashq va Socratic AI murabbiy bilan o'rganib, XP va nishonlar yig'asiz.",
                icon: Trophy,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  data-scroll-item
                  className="glass-card glass-card-interactive relative flex flex-col justify-between p-6"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon/40 bg-neon-soft text-neon">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-2xl font-extrabold text-gold/70">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-fg">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-5 border-t border-border pt-3 text-xs font-semibold text-neon">
                    To'liq o'zbek tilida →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          KUNLIK O'QISH VAQTI TANLAGICHI DEMO (#vaqt-kalkulyator)
          Standart <= 2 soat (120 daq) + Maxsus qo'lda kiritish (> 120 daq)
          ==================================================================== */}
      <section
        id="vaqt-kalkulyator"
        data-scroll-section
        className="scroll-reveal-css border-t border-border py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6" data-scroll-item>
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                MOSLASHUVCHAN VAQT REJASI
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-fg sm:text-4xl">
                Kunlik o'qish vaqtini o'zingiz boshqaring
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted sm:text-base">
                Sog'lom va barqaror o'qish uchun standart variantlar kuniga{" "}
                <strong className="text-fg">eng ko'pi bilan 2 soat (120 daqiqa)</strong>{" "}
                etib belgilangan. Agar sizda ko'proq vaqt va ishtiyoq bo'lsa, maxsus maydonga
                o'zingiz qo'lda kiritishingiz mumkin — 12 oylik reja darhol moslashadi.
              </p>

              {/* Standart 4 variant (30, 60, 90, 120 daqiqa) */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {STANDARD_TIME_OPTIONS.map((opt) => {
                  const active = !customMode && selectedMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => {
                        setCustomMode(false);
                        setSelectedMinutes(opt.minutes);
                      }}
                      className={`rounded-xl border p-3.5 text-left transition-all ${
                        active
                          ? "border-neon bg-neon-soft shadow-neon"
                          : "border-border bg-surface hover:border-neon/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-fg">
                          {opt.label}
                        </span>
                        {active && <CheckCircle2 className="h-4 w-4 text-neon" />}
                      </div>
                      <p className="mt-1 text-xs text-fg-muted">{opt.subtitle}</p>
                    </button>
                  );
                })}
              </div>

              {/* 2 soatdan ko'proq vaqtni qo'lda kiritish maydoni */}
              <div className="mt-4 rounded-xl border border-gold/40 bg-gold-soft/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <label
                      htmlFor="custom-study-minutes"
                      className="block text-xs font-bold uppercase tracking-wider text-gold"
                    >
                      2 soatdan ko'proq o'qimoqchimisiz? (Qo'lda kiritish)
                    </label>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      125 daqiqadan 480 daqiqagacha (8 soatgacha) erkin kiriting:
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="custom-study-minutes"
                      type="number"
                      min={125}
                      max={480}
                      step={15}
                      value={customMinutesInput}
                      onFocus={() => setCustomMode(true)}
                      onChange={(e) => {
                        setCustomMode(true);
                        setCustomMinutesInput(e.target.value);
                      }}
                      className="w-24 rounded-lg border border-gold bg-canvas px-3 py-2 text-center font-mono text-sm font-bold text-fg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <span className="text-xs font-semibold text-fg">daqiqa / kun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* O'ng ustun: Avtomatik hisoblangan 12 oylik natija */}
            <div className="lg:col-span-6" data-scroll-item>
              <div className="glass-card p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-xs font-semibold text-fg-muted">
                      Tanlangan kunlik rejim:
                    </span>
                    <p className="font-mono text-xl font-extrabold text-neon">
                      Kuniga {effectiveMinutes} daqiqa (
                      {(effectiveMinutes / 60).toFixed(1)} soat)
                    </p>
                  </div>
                  <span className="rounded-xl border border-neon/40 bg-neon-soft px-3 py-1.5 text-xs font-bold text-neon">
                    {customMode ? "Maxsus intensiv rejim" : "Standart sog'lom rejim"}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-xl border border-border bg-elevated/60 p-4">
                    <span
                      ref={xpCounterSpanRef}
                      className="font-mono text-2xl font-extrabold text-fg sm:text-3xl"
                    >
                      {annualHours}
                    </span>
                    <p className="mt-1 text-xs text-fg-muted">Yillik sof o'quv soati</p>
                  </div>
                  <div className="rounded-xl border border-border bg-elevated/60 p-4">
                    <span className="font-mono text-2xl font-extrabold text-neon sm:text-3xl">
                      {projectedSat}+
                    </span>
                    <p className="mt-1 text-xs text-fg-muted">Kutilayotgan SAT salohiyati</p>
                  </div>
                  <div className="rounded-xl border border-border bg-elevated/60 p-4">
                    <span className="font-mono text-2xl font-extrabold text-gold sm:text-3xl">
                      {projectedIelts}
                    </span>
                    <p className="mt-1 text-xs text-fg-muted">Kutilayotgan IELTS Band</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2.5 text-xs text-fg-muted">
                  <p className="flex items-center justify-between rounded-lg bg-canvas/70 px-3.5 py-2">
                    <span>Kunlik nazariya va misollar:</span>
                    <strong className="font-mono text-fg">
                      {Math.round(effectiveMinutes * 0.35)} daqiqa
                    </strong>
                  </p>
                  <p className="flex items-center justify-between rounded-lg bg-canvas/70 px-3.5 py-2">
                    <span>Adaptiv test va mashqlar:</span>
                    <strong className="font-mono text-neon">
                      {Math.round(effectiveMinutes * 0.45)} daqiqa
                    </strong>
                  </p>
                  <p className="flex items-center justify-between rounded-lg bg-canvas/70 px-3.5 py-2">
                    <span>AI Murabbiy bilan xatolar tahlili:</span>
                    <strong className="font-mono text-gold">
                      {Math.round(effectiveMinutes * 0.2)} daqiqa
                    </strong>
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    href="/register"
                    className="btn-neon flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold"
                  >
                    <span>Shu vaqt asosida shaxsiy rejamni tuzish</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FANLAR VITRINASI (#fanlar)
          ==================================================================== */}
      <section
        id="fanlar"
        data-scroll-section
        className="scroll-reveal-css border-t border-border bg-surface/40 py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-neon">
              O'QUV DASTURI
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-fg sm:text-4xl">
              Nufuzli universitetga kirish uchun barcha fanlar bitta joyda
            </h2>
            <p className="mt-3 text-sm text-fg-muted sm:text-base">
              Barcha darslar va savollar mualliflik huquqiga rioya qilgan holda original tarzda
              o'zbek tilida ishlab chiqilgan.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECT_CARDS.map((subj) => {
              const Icon = subj.icon;
              return (
                <div
                  key={subj.slug}
                  data-scroll-item
                  className="glass-card glass-card-interactive flex flex-col justify-between p-6"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                          subj.accent === "gold"
                            ? "border-gold/40 bg-gold-soft text-gold"
                            : "border-neon/40 bg-neon-soft text-neon"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-border bg-elevated px-3 py-1 font-mono text-xs font-semibold text-fg">
                        {subj.badge}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-fg">{subj.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">{subj.desc}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs">
                    <span className="text-fg-muted">Bosqich:</span>
                    <span className="font-mono font-bold text-neon">{subj.level}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          AI MURABBIY (Socratic Muloqot) (#ai-murabbiy)
          ==================================================================== */}
      <section
        id="ai-murabbiy"
        data-scroll-section
        className="scroll-reveal-css border-t border-border py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5" data-scroll-item>
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                SOCRATIC AI USTOZ
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-fg sm:text-4xl">
                Hurmatli, iliq va o'ylashga o'rgatuvchi AI Murabbiy
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted sm:text-base">
                3Talab AI murabbiyi har bir o'quvchiga samimiy va hurmat bilan yondashadi. U tayyor javobni berib qo'ymasdan, sizni mustaqil fikrlashga va kashfiyot qilishga yetaklaydi.
              </p>

              {/* Murojaat uslubini sinab ko'rish tugmalari */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDemoGender("FEMALE")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-xs font-bold transition-all ${
                    demoGender === "FEMALE"
                      ? "border-gold bg-gold-soft text-gold shadow-gold"
                      : "border-border bg-surface text-fg-muted"
                  }`}
                >
                  👩 Qiz o'quvchi rejimi
                </button>
                <button
                  type="button"
                  onClick={() => setDemoGender("MALE")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-xs font-bold transition-all ${
                    demoGender === "MALE"
                      ? "border-neon bg-neon-soft text-neon shadow-neon"
                      : "border-border bg-surface text-fg-muted"
                  }`}
                >
                  👨 O'g'il o'quvchi rejimi
                </button>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-fg-muted sm:text-sm">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neon" />
                  <span>Xato qilganda hech qachon kamsitmaydi — o'sish nuqtasini ko'rsatadi</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neon" />
                  <span>IELTS Writing insholaringizni mezonlar bo'yicha tekshiradi</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neon" />
                  <span>Charchaganingizda qisqa dam olishni tavsiya qiladi va ruhlantiradi</span>
                </li>
              </ul>
            </div>

            {/* Suhbat oynasi namunasi */}
            <div className="lg:col-span-7" data-scroll-item>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-soft text-neon">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-fg">3Talab AI Murabbiy</p>
                      <p className="text-[11px] text-neon">
                        Socratic rejim • SAT Matematika darsi
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-elevated px-2.5 py-1 font-mono text-xs text-fg-muted">
                    Rejim: {demoGender === "FEMALE" ? "Qiz bola" : "O'g'il bola"}
                  </span>
                </div>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="ml-auto max-w-md rounded-2xl rounded-tr-none border border-border bg-elevated p-3.5 text-fg">
                    Ustoz, <code className="font-mono text-neon">3x + 7 = 22</code> tenglamada
                    x ni topishda 22 ga 7 ni qo'shib yuboribman, nega xato chiqdi?
                  </div>

                  <div className="max-w-xl rounded-2xl rounded-tl-none border border-neon/40 bg-neon-soft/50 p-4 text-fg">
                    <p className="font-semibold text-neon">
                      "Barakalla! Savolni mustaqil tahlil qilib, xatoni o'zingiz payqaganingizning o'zi katta yutuq."
                    </p>
                    <p className="mt-2 leading-relaxed text-fg">
                      Keling, tarozi misolida o'ylab ko'ramiz: chap pallada{" "}
                      <code className="font-mono font-bold">3x</code> yonida{" "}
                      <code className="font-mono font-bold">+7</code> turibdi. Agar{" "}
                      <code className="font-mono font-bold">3x</code> ni yolg'iz qoldirmoqchi
                      bo'lsak, chap tomondagi ortiqcha <code className="font-mono">+7</code> ni
                      yo'qotish uchun ikkala palladan 7 ni{" "}
                      <strong>qo'shamizmi yoki ayiramizmi</strong>?
                    </p>
                  </div>

                  <div className="ml-auto max-w-md rounded-2xl rounded-tr-none border border-border bg-elevated p-3.5 text-fg">
                    Aha! Ikkala tomondan 7 ni ayiramiz, shunda{" "}
                    <code className="font-mono text-gold">3x = 15</code> va{" "}
                    <code className="font-mono text-neon">x = 5</code> bo'ladi!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FOOTER VA YAKUNIY CHAQIRIQ
          ==================================================================== */}
      <footer className="border-t border-border bg-surface/80 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <p className="text-lg font-extrabold text-fg">
                3<span className="text-neon">Talab</span> — O'zbek tilidagi xalqaro ta'lim
                platformasi
              </p>
              <p className="mt-1 text-xs text-fg-muted">
                SAT • IELTS • Matematika • Akademik yozuv • 12 oylik shaxsiy yo'l xaritasi
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl border border-border bg-elevated px-5 py-2.5 text-sm font-semibold text-fg hover:border-neon/50"
              >
                Kirish
              </Link>
              <Link href="/register" className="btn-neon px-6 py-2.5 text-sm font-bold">
                Hoziroq Boshlash
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
