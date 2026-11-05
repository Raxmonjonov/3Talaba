"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Compass,
  FileText,
  Globe2,
  GraduationCap,
  Layers,
  Sigma,
  Sparkles,
  Target,
} from "lucide-react";

interface PathwayStage {
  step: string;
  months: string;
  title: string;
  goal: string;
  description: string;
  href: string;
  ctaLabel: string;
  accent: "emerald" | "amber" | "cyan";
}

interface UniversityTrack {
  id: string;
  flag: string;
  region: string;
  universities: string;
  grantType: string;
  coverage: string;
  satTarget: string;
  ieltsTarget: string;
  deadline: string;
  checklist: string[];
  aiPrompt: string;
}

const SIX_STAGES: PathwayStage[] = [
  {
    step: "01",
    months: "1-hafta",
    title: "Adaptiv Diagnostika va Maqsad",
    goal: "Boshlang'ich nuqtani aniqlash",
    description:
      "6 savollik adaptiv test orqali matematika va ingliz tili darajangiz o'lchanib, maqsadli universitetga mos 12 oylik shaxsiy traektoriya tuziladi.",
    href: "/placement",
    ctaLabel: "Diagnostika topshirish",
    accent: "emerald",
  },
  {
    step: "02",
    months: "1–3-oylar",
    title: "Fundamental Matematika va Academic English",
    goal: "15 ta modul va kuchli poydevor",
    description:
      "Algebra, funksiyalar, Viyet teoremasi va geometriya isbotlari 6 bosqichli metod hamda interaktiv SVG grafiklar yordamida chuqur o'zlashtiriladi.",
    href: "/math",
    ctaLabel: "15 modulni ochish",
    accent: "cyan",
  },
  {
    step: "03",
    months: "4–6-oylar",
    title: "Digital SAT 1500+ (Math 800)",
    goal: "Bluebook strategiyasi va tezlik",
    description:
      "Haqiqiy Digital SAT formatida split-screen mashqlar, 50/50 eliminatsiya, Desmos sirlari va tipik tuzoqlardan qochish ko'nikmalari shakllantiriladi.",
    href: "/practice?subject=sat-math",
    ctaLabel: "SAT mashqlarini boshlash",
    accent: "emerald",
  },
  {
    step: "04",
    months: "6–8-oylar",
    title: "IELTS Academic 7.5+ Tayyorgarlik",
    goal: "Writing, Reading va Speaking",
    description:
      "Academic Writing Task 2 uchun 4-paragraf arxitekturasi, Band 7.5+ leksika va Talaba AI Ustoz tomonidan insho tahlili orqali yuqori ballga chiqiladi.",
    href: "/practice?subject=ielts",
    ctaLabel: "IELTS amaliyotiga o'tish",
    accent: "amber",
  },
  {
    step: "05",
    months: "9–10-oylar",
    title: "Portfolio va Personal Statement",
    goal: "Common App & Motivatsion insho",
    description:
      "Top universitetlar qabul komissiyasi uchun 650 so'zlik Personal Statement, Extracurricular loyihalar ro'yxati va ustozlar tavsiyanomalari tayyorlanadi.",
    href: "/coach?subject=admissions&mode=STEP_BY_STEP&q=Common%20App%20Personal%20Statement%20inshosini%20qanday%20qilib%20100%25%20grant%20yutadigan%20darajada%20yozaman%3F",
    ctaLabel: "AI Ustoz bilan insho tuzish",
    accent: "cyan",
  },
  {
    step: "06",
    months: "11–12-oylar",
    title: "Hujjat Topshirish va 100% Grant",
    goal: "Full-Ride & Stipendiya qabuli",
    description:
      "Early Action / Regular Decision muddatlarida hujjat topshirish, CSS Profile moliyaviy arizasi, suhbatdan o'tish va grant taklifnomasini (Offer Letter) olish.",
    href: "/coach?subject=admissions&mode=STEP_BY_STEP&q=Menga%20100%25%20Full-Ride%20grant%20va%20CSS%20Profile%20topshirish%20bo'yicha%20qadamma-qadam%20reja%20tuzib%20bering.",
    ctaLabel: "Grant strategiyasini olish",
    accent: "amber",
  },
];

const UNIVERSITY_TRACKS: UniversityTrack[] = [
  {
    id: "usa-fullride",
    flag: "🇺🇸",
    region: "AQSH • Ivy League & Top-50",
    universities: "MIT, Harvard, Stanford, Yale, Princeton, Duke, Amherst",
    grantType: "Need-Blind / Full-Ride Financial Aid",
    coverage: "100% o'qish kontrakti + yotoqxona + ovqatlanish + tibbiy sug'urta",
    satTarget: "SAT 1500–1560+ (Math 790–800)",
    ieltsTarget: "IELTS 7.5+ (yoki TOEFL 105+)",
    deadline: "Early Action / ED: 1-Noyabr • Regular Decision: 1–5-Yanvar",
    checklist: [
      "Common App portali va 650 so'zlik shaxsiy hikoya (Personal Statement)",
      "Har bir universitet uchun qo'shimcha Why Us? insholari (Supplemental Essays)",
      "CSS Profile va ota-ona daromadlari bo'yicha moliyaviy grant arizasi",
      "Maktab baholari (GPA 4.8+/5.0) va 2 nafar fan o'qituvchisidan tavsiyanoma",
      "Kamida 3–5 ta kuchli Extracurricular loyiha, olimpiada yoki volontyorlik ishi",
    ],
    aiPrompt:
      "Ustoz, men AQSHning Top-50 universitetlariga 100% Full-Ride (CSS Profile) granti asosida kirmoqchiman. Hozirdan boshlab SAT, IELTS, Extracurricular portfolio va Common App inshosi bo'yicha aniq oyma-oy reja tuzib bering.",
  },
  {
    id: "korea-asia",
    flag: "🇰🇷",
    region: "Janubiy Koreya & Osiyo",
    universities: "KAIST, UNIST, Yonsei, HKUST, NUS (Singapur), CUHK",
    grantType: "Full Tuition Scholarship + Monthly Stipend",
    coverage: "100% kontrakt + oyiga $300–$500 stipendiya + yotoqxona imtiyozi",
    satTarget: "SAT 1460–1530+ (Math 780–800 juda muhim)",
    ieltsTarget: "IELTS 7.0–7.5+",
    deadline: "Early Track: Sentabr–Oktabr • Regular Track: Dekabr–Yanvar",
    checklist: [
      "KAIST / HKUST ichki portali orqali Study Plan va shaxsiy motivatsiya insholari",
      "Matematika, Fizika yoki Informatika bo'yicha yuqori ko'rsatkich (SAT Math 800)",
      "Ilmiy loyiha, dasturlash portfoliisi yoki fan olimpiadasi sertifikatlari",
      "9–11-sinf/litsey baholaridan ingliz tiliga tasdiqlangan transkript",
      "Matematika yoki tabiiy fan ustozidan akademik tavsiyanoma (Recommendation Letter)",
    ],
    aiPrompt:
      "Ustoz, KAIST va Osiyoning top texnologiya universitetlariga 100% grant yutish uchun SAT Math 800, IELTS va Study Plan inshosini qanday tayyorlashim kerak?",
  },
  {
    id: "europe-stipendium",
    flag: "🇪🇺",
    region: "Yevropa & Vengriya / Italiya / Germaniya",
    universities: "BME Budapest, ELTE, Bocconi University, TU Munich, KU Leuven",
    grantType: "Stipendium Hungaricum / DSU / Merit Grant",
    coverage: "Bepul ta'lim + yotoqxona + oylik yashash stipendiyasi + tibbiy sug'urta",
    satTarget: "SAT 1400–1480+ (Bocconi va texnik OTMlar uchun)",
    ieltsTarget: "IELTS 6.5–7.5+",
    deadline: "Stipendium Hungaricum: 15-Yanvar • Yevropa OTMlari: Yanvar–Mart",
    checklist: [
      "1–2 sahifalik aniq maqsadga yo'naltirilgan Motivation Letter",
      "Europass formatidagi akademik CV va sertifikatlar to'plami",
      "SAT sertifikati yoki OTMning ichki matematika/mantiq kirish imtihoni",
      "Onlayn Skype/Zoom akademik suhbatiga (Interview) tayyorgarlik",
      "Maktab shahodatnomasi / baholar transkripti va xalqaro pasport nusxasi",
    ],
    aiPrompt:
      "Ustoz, Yevropaning Stipendium Hungaricum va Bocconi kabi grant dasturlariga Motivation Letter yozish hamda suhbatdan (interview) muvaffaqiyatli o'tish sirlarini o'rgating.",
  },
  {
    id: "middle-east-ca",
    flag: "🌍",
    region: "Yaqin Sharq & Markaziy Osiyo Kampuslari",
    universities: "NYU Abu Dhabi, Georgetown / CMU Qatar, Nazarbayev University",
    grantType: "100% Global Leader Full-Ride Grant",
    coverage: "100% o'qish + kampus yotoqxonasi + ovqatlanish + yillik aviachiptalar",
    satTarget: "SAT 1480–1540+ (Nazarbayev Univ: 1400+)",
    ieltsTarget: "IELTS 7.0–7.5+",
    deadline: "Early Decision: 1-Noyabr • Regular: Yanvar–Mart",
    checklist: [
      "Common App (NYUAD) yoki universitetning maxsus onlayn qabul arizasi",
      "Xalqaro muhitda yetakchilik va madaniyatlararo muloqotni ko'rsatuvchi insho",
      "Candidate Weekend (saralangan nomzodlar suhbati) bosqichiga tayyorgarlik",
      "CSS Profile / Financial Support hujjatlari",
      "Yuqori maktab GPA ko'rsatkichi va maktab direktori/maslahatchisi tavsiyasi",
    ],
    aiPrompt:
      "Ustoz, NYU Abu Dhabi, Qatar kampuslari va Nazarbayev University'ga 100% grant asosida qabul qilinish uchun qanday ball va insho strategiyasi kerak?",
  },
  {
    id: "uzbekistan-grants",
    flag: "🇺🇿",
    region: "\"El-Yurt Umidi\" va Milliy Grantlar",
    universities: "QS / THE Top-300 Xorijiy OTMlar & Top Xalqaro Filiallar",
    grantType: "Davlat Prezident Stipendiyasi / 100% Davlat Granti",
    coverage: "100% xorijdagi kontrakt + yashash xarajatlari + aviachipta va viza",
    satTarget: "Top-300 OTM qabuli uchun SAT 1450–1500+",
    ieltsTarget: "IELTS 7.0+ (xorijiy OTM Unconditional Offer talabi)",
    deadline: "Yilda 2 marta ochiq respublika tanlovi (Bahor va Kuz)",
    checklist: [
      "Xorijiy Top-300 universitetdan olingan rasmiy qabul xati (Offer Letter)",
      "Top-100 universitetga kirgan nomzodlar uchun imtiyozli suhbat tartibi",
      "Tanlangan soha bo'yicha O'zbekiston rivojiga hissa qo'shish loyiha-inshosi",
      "Milliy va xalqaro sertifikatlar (IELTS 7.0+, SAT 1450+)",
      "Ekspertlar komissiyasi bilan yakuniy intellektual va ma'naviy suhbat",
    ],
    aiPrompt:
      "Ustoz, avval xorijning Top-100/Top-300 universitetidan Offer Letter olib, so'ngra El-Yurt Umidi 100% grantini yutish bo'yicha qadamma-qadam yo'l xaritasini tushuntirib bering.",
  },
];

export function UniversityPathwayAtlas({ compact = false }: { compact?: boolean }) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(UNIVERSITY_TRACKS[0].id);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const activeTrack =
    UNIVERSITY_TRACKS.find((t) => t.id === selectedTrackId) ?? UNIVERSITY_TRACKS[0];

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="glass-card p-6 sm:p-8 lg:p-10 space-y-8">
      {/* Sarlavha qismi */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2 max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
            <GraduationCap className="h-4 w-4" />
            <span>0 DAN TOP UNIVERSITET VA 100% GRANTGACHA TO&apos;LIQ YO&apos;L</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Universitetga Qabul Qilinishning 6 Bosqichli Aniq Tizimi
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            3Talaba shunchaki testlar to&apos;plami emas — bu boshlang&apos;ich darajangizdan boshlab{" "}
            <strong className="text-emerald-300">SAT 1500+</strong>,{" "}
            <strong className="text-amber-300">IELTS 7.5+</strong>,{" "}
            <strong className="text-white">Personal Statement</strong> va{" "}
            <strong className="text-emerald-300">100% Grant (Offer Letter)</strong> olguningizcha har bir
            qadamni boshqaruvchi shaxsiy AI Ustoz tizimidir.
          </p>
        </div>

        <Link
          href={`/coach?subject=admissions&mode=STEP_BY_STEP&q=${encodeURIComponent(activeTrack.aiPrompt)}`}
          className="btn-gold inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold shadow-lg shrink-0"
        >
          <Brain className="h-4 w-4" />
          <span>AI Ustoz Bilan OTM Reja Tuzish</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 1-QISM: 6 ta Ketma-ket Bosqich */}
      {!compact && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SIX_STAGES.map((item) => {
            const borderAccent =
              item.accent === "amber"
                ? "hover:border-amber-400/50"
                : item.accent === "cyan"
                  ? "hover:border-cyan-400/50"
                  : "hover:border-emerald-400/50";
            const badgeAccent =
              item.accent === "amber"
                ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                : item.accent === "cyan"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";

            return (
              <div
                key={item.step}
                className={`flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all ${borderAccent}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs font-extrabold ${badgeAccent}`}
                    >
                      BOSQICH {item.step}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      {item.months}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base sm:text-lg font-extrabold text-white">
                    {item.title}
                  </h3>
                  <span className="mt-0.5 block text-xs font-bold text-emerald-400">
                    Maqsad: {item.goal}
                  </span>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={item.href}
                  className="mt-5 inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:text-emerald-300"
                >
                  <span>{item.ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* 2-QISM: Xalqaro Universitet va Grant Yo'nalishlari Atlasi */}
      <div className="rounded-2xl border border-white/10 bg-[#07111d]/90 p-5 sm:p-7 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
              <Globe2 className="h-4 w-4" /> XALQARO GRANT YO&apos;NALISHLARI ATLASI
            </span>
            <h3 className="mt-1 text-lg sm:text-xl font-black text-white">
              Maqsadli davlat va grant turini tanlang — barcha talablarni tekshiring:
            </h3>
          </div>
        </div>

        {/* Davlatlar Tablari */}
        <div className="flex flex-wrap gap-2">
          {UNIVERSITY_TRACKS.map((track) => {
            const active = track.id === activeTrack.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrackId(track.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? "border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:text-white"
                }`}
              >
                <span className="text-base">{track.flag}</span>
                <span>{track.region}</span>
              </button>
            );
          })}
        </div>

        {/* Tanlangan Grant Yo'nalishi Tafsilotlari */}
        <div className="grid gap-6 lg:grid-cols-12 items-start pt-2">
          {/* Chap: Ballar, OTMlar va Muddatlar */}
          <div className="lg:col-span-5 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                Nufuzli Universitetlar
              </span>
              <p className="mt-1 text-sm sm:text-base font-extrabold text-white">
                {activeTrack.flag} {activeTrack.universities}
              </p>
            </div>

            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3.5">
              <span className="text-[11px] font-extrabold uppercase text-amber-300 block">
                {activeTrack.grantType}
              </span>
              <p className="mt-1 text-xs text-slate-200 leading-relaxed">
                {activeTrack.coverage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  SAT Maqsad
                </span>
                <span className="mt-1 block font-mono text-xs font-extrabold text-emerald-300">
                  {activeTrack.satTarget}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  IELTS Maqsad
                </span>
                <span className="mt-1 block font-mono text-xs font-extrabold text-amber-300">
                  {activeTrack.ieltsTarget}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-slate-300">
              <Calendar className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Qabul muddatlari (Deadlines):</span>
                <span>{activeTrack.deadline}</span>
              </div>
            </div>
          </div>

          {/* O'ng: Hujjatlar Ro'yxati (Interaktiv Checklist) va AI Ustoz tugmasi */}
          <div className="lg:col-span-7 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Talab qilinadigan hujjatlar va qadamlar (Belgilab boring)</span>
              </span>
            </div>

            <div className="space-y-2.5">
              {activeTrack.checklist.map((stepText, idx) => {
                const key = `${activeTrack.id}-${idx}`;
                const isChecked = Boolean(checkedItems[key]);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCheck(key)}
                    className={`w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      isChecked
                        ? "border-emerald-400/50 bg-emerald-500/15 text-white"
                        : "border-white/10 bg-black/25 text-slate-200 hover:border-white/25"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-black ${
                        isChecked
                          ? "border-emerald-400 bg-emerald-400 text-slate-950"
                          : "border-white/25 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isChecked ? "line-through text-emerald-200" : ""
                      }`}
                    >
                      {stepText}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <span className="text-xs text-slate-400">
                Talaba AI Ustoz sizga Personal Statement va hujjatlarni birma-bir tayyorlashda yordam beradi.
              </span>
              <Link
                href={`/coach?subject=admissions&mode=STEP_BY_STEP&q=${encodeURIComponent(activeTrack.aiPrompt)}`}
                className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Shu yo&apos;nalish bo&apos;yicha AI Ustozdan so&apos;rash</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
