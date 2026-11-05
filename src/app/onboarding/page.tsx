"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { animate } from "animejs";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  GraduationCap,
  Target,
  BookOpen,
  Brain,
  Clock,
  Compass,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";

interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  honorific: string;
  profile?: {
    gender: string;
    age: number;
    grade: string;
    region: string;
    targetUniversity?: string | null;
    targetCountry?: string | null;
    targetSatScore?: number | null;
    targetIeltsScore?: number | null;
    selfAssessedLevel: "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    strongSubjectsJson: string;
    weakSubjectsJson: string;
    learningStyle: "VISUAL_PRACTICE" | "SOCRATIC_CHAT" | "DEEP_THEORY" | "POMODORO_SPRINT";
    preferredStudyTime: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
    onboardingDone: boolean;
    placementDone: boolean;
    xpTotal: number;
    levelNumber: number;
  };
}

const UNIVERSITY_OPTIONS = [
  {
    title: "AQSh & Ivy League",
    subtitle: "MIT, Stanford, Harvard, Columbia",
    country: "AQSh",
    icon: "🇺🇸",
  },
  {
    title: "Buyuk Britaniya (Russell Group)",
    subtitle: "University of Oxford, Cambridge, Imperial",
    country: "Buyuk Britaniya",
    icon: "🇬🇧",
  },
  {
    title: "Janubiy Koreya & Osiyo",
    subtitle: "KAIST, Yonsei, Seoul National, NUS",
    country: "Janubiy Koreya",
    icon: "🇰🇷",
  },
  {
    title: "O'zbekiston Top OTM",
    subtitle: "Yangi O'zbekiston, Westminster (WIUT), Turin",
    country: "O'zbekiston",
    icon: "🇺🇿",
  },
];

const LEVEL_OPTIONS: Array<{
  id: "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  title: string;
  badge: string;
  desc: string;
  icon: string;
}> = [
  {
    id: "ZERO",
    title: "Noldan (Fundamental)",
    badge: "0-bosqich",
    desc: "Asosiy algebra qoidalari va ingliz tili asoslarini boshidan tartibli o'rganmoqchiman.",
    icon: "🌱",
  },
  {
    id: "BEGINNER",
    title: "Boshlang'ich",
    badge: "1-bosqich",
    desc: "Maktab dasturidan asosiy bilimlarim bor. Xalqaro imtihon formatiga moslashmoqchiman.",
    icon: "📖",
  },
  {
    id: "INTERMEDIATE",
    title: "O'rta (Mustahkam)",
    badge: "2-bosqich",
    desc: "Poydevorim mustahkam. Asosiy e'tiborimni SAT va IELTS strategiyalariga qaratmoqchiman.",
    icon: "⚡",
  },
  {
    id: "ADVANCED",
    title: "Yuqori (Ilg'or)",
    badge: "3-bosqich",
    desc: "1500+ SAT va 8.0+ IELTS uchun eng qiyin masalalar va yuqori tezlik ustida ishlayman.",
    icon: "🏆",
  },
];

const SUBJECT_OPTIONS = [
  {
    id: "sat-math",
    title: "SAT Matematika (Digital SAT)",
    desc: "Algebra, Chiziqli va kvadratik tenglamalar, Funksiyalar, Geometriya",
    icon: "📐",
  },
  {
    id: "sat-rw",
    title: "SAT Reading & Writing",
    desc: "Akademik matnlar, xulosalar, grammatika va so'z boyligi",
    icon: "📚",
  },
  {
    id: "ielts",
    title: "IELTS Academic",
    desc: "Listening, Reading, Academic Writing va Speaking ko'nikmalari",
    icon: "🎧",
  },
  {
    id: "foundation-math",
    title: "Fundamental Matematika",
    desc: "Maktab algebrasini noldan chuqur isbotlar bilan o'rganish",
    icon: "🧮",
  },
];

const LEARNING_STYLES: Array<{
  id: "VISUAL_PRACTICE" | "SOCRATIC_CHAT" | "DEEP_THEORY";
  title: string;
  desc: string;
  icon: string;
}> = [
  {
    id: "VISUAL_PRACTICE",
    title: "Vizual amaliyot va tezkor mashqlar",
    desc: "Qisqa tushuntirish va ko'p amaliy testlar orqali tez o'zlashtiraman.",
    icon: "👁️",
  },
  {
    id: "SOCRATIC_CHAT",
    title: "AI Sokratik Murabbiy bilan muloqot",
    desc: "AI ustoz yo'naltiruvchi savollar berib, xatolarimni tushuntirishini xohlayman.",
    icon: "🤖",
  },
  {
    id: "DEEP_THEORY",
    title: "Chuqur nazariya va isbotlar",
    desc: "Har bir formula va qoidaning kelib chiqishini batafsil o'rganishni yoqtiraman.",
    icon: "📖",
  },
];

const TIME_SLOTS: Array<{
  id: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  label: string;
  time: string;
  icon: string;
}> = [
  { id: "MORNING", label: "Ertalab", time: "06:00 – 10:00", icon: "🌅" },
  { id: "AFTERNOON", label: "Kunduzi", time: "13:00 – 17:00", icon: "☀️" },
  { id: "EVENING", label: "Kechqurun", time: "18:00 – 22:00", icon: "🌆" },
  { id: "NIGHT", label: "Tungi sokinlik", time: "22:00+", icon: "🌙" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { reduceMotion } = useUIPreferences();

  const stepCardRef = useRef<HTMLDivElement | null>(null);

  // 1..5 Page to Page
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [targetUniversity, setTargetUniversity] = useState("MIT / Stanford / Ivy League");
  const [targetCountry, setTargetCountry] = useState("AQSh");
  const [customUni, setCustomUni] = useState("");
  const [targetSatScore, setTargetSatScore] = useState<number>(1480);
  const [targetIeltsScore, setTargetIeltsScore] = useState<number>(7.5);
  const [selfAssessedLevel, setSelfAssessedLevel] = useState<
    "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  >("BEGINNER");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "sat-math",
    "foundation-math",
  ]);
  const [learningStyle, setLearningStyle] = useState<
    "VISUAL_PRACTICE" | "SOCRATIC_CHAT" | "DEEP_THEORY"
  >("VISUAL_PRACTICE");
  const [preferredStudyTime, setPreferredStudyTime] = useState<
    "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT"
  >("EVENING");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ProfileResponse | null) => {
        if (!data?.profile) return;
        if (data.profile.targetUniversity) setTargetUniversity(data.profile.targetUniversity);
        if (data.profile.targetCountry) setTargetCountry(data.profile.targetCountry);
        if (data.profile.targetSatScore) setTargetSatScore(data.profile.targetSatScore);
        if (data.profile.targetIeltsScore) setTargetIeltsScore(data.profile.targetIeltsScore);
        if (data.profile.selfAssessedLevel) setSelfAssessedLevel(data.profile.selfAssessedLevel);
        if (data.profile.preferredStudyTime) setPreferredStudyTime(data.profile.preferredStudyTime);
      })
      .catch(() => {});
  }, []);

  // Animate card on step change
  useEffect(() => {
    if (reduceMotion || !stepCardRef.current) return;
    animate(stepCardRef.current, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 380,
      ease: "outExpo",
    });
  }, [step, reduceMotion]);

  const toggleSubject = (id: string) => {
    if (selectedSubjects.includes(id)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== id));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    setErrorMsg(null);

    const finalUni = customUni.trim() || targetUniversity;

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUniversity: finalUni,
          targetCountry,
          targetSatScore,
          targetIeltsScore,
          selfAssessedLevel,
          strongSubjects: selectedSubjects,
          weakSubjects: ["sat-rw"],
          learningStyle,
          preferredStudyTime,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? "Ma'lumotlarni saqlashda xatolik yuz berdi");
        setSaving(false);
        return;
      }

      router.push("/placement");
    } catch {
      setErrorMsg("Tarmoq xatoligi. Qayta urinib ko'ring.");
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <span className="text-base font-medium">Profilingiz tayyorlanmoqda...</span>
        </div>
      </div>
    );
  }

  const studentName = session?.user?.name ?? "O'quvchi";

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-8 sm:px-6">
      {/* Yuqori Qadam Navigatsiyasi (Page to Page) */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300 mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>QADAM {step} / 5</span>
          </span>
          <span className="text-slate-400">
            {step === 1 && "Maqsadli Universitet"}
            {step === 2 && "Maqsadli Ballar"}
            {step === 3 && "Bilim Darajangiz"}
            {step === 4 && "Asosiy Fanlar"}
            {step === 5 && "O'rganish Uslubi"}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#c6f432] via-[#dcfa72] to-[#ffffff] transition-all duration-400"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Shisha Karta (Glassmorphic Step Card) */}
      <div
        ref={stepCardRef}
        className="w-full max-w-4xl rounded-3xl border border-white/15 bg-slate-900/55 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]"
      >
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
            {errorMsg}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 1: MAQSADLI UNIVERSITET VA MAMLAKAT */}
        {/* ------------------------------------------------------------------ */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Xush kelibsiz, {studentName}!
              </span>
              <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                Qaysi nufuzli universitetda o&apos;qishni maqsad qildingiz?
              </h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                12 oylik ta&apos;lim xaritangiz tanlangan oliygoh va mamlakat talablariga moslashtiriladi.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {UNIVERSITY_OPTIONS.map((opt) => {
                const isSelected = targetUniversity === opt.title;
                return (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => {
                      setTargetUniversity(opt.title);
                      setTargetCountry(opt.country);
                      setCustomUni("");
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-emerald-400/80 bg-emerald-500/15 shadow-[0_0_20px_rgba(198,244,50,0.25)] ring-1 ring-emerald-400/40"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <h3 className="text-base font-bold text-white sm:text-lg">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-slate-300 sm:text-sm">
                          {opt.subtitle}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-500 text-slate-950"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Boshqa OTM kiritish */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Yoki boshqa shaxsiy OTM nomini kiriting:
              </label>
              <input
                type="text"
                value={customUni}
                onChange={(e) => {
                  setCustomUni(e.target.value);
                  if (e.target.value.trim()) {
                    setTargetUniversity(e.target.value.trim());
                  }
                }}
                placeholder="Masalan: Harvard University, KAIST yoki Westminster"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 2: MAQSADLI BALLAR (SAT VA IELTS) */}
        {/* ------------------------------------------------------------------ */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Natijalar rejasi
              </span>
              <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                Ko&apos;zlangan imtihon ballaringizni belgilang
              </h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                AI murabbiy ushbu ballarga erishishingiz uchun kerakli kunlik yuklama va testlar sonini belgilaydi.
              </p>
            </div>

            <div className="space-y-6">
              {/* SAT Slayderi */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-400" />
                    <span className="text-base font-bold text-white">Maqsadli SAT Ball</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono text-2xl font-black text-emerald-400">
                    <span>{targetSatScore}</span>
                    <span className="text-xs text-slate-400">/ 1600</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1100}
                  max={1600}
                  step={10}
                  value={targetSatScore}
                  onChange={(e) => setTargetSatScore(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-400"
                />

                <div className="mt-3.5 flex flex-wrap gap-2">
                  {[1350, 1450, 1550].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetSatScore(preset)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        targetSatScore === preset
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-white/5 text-slate-300 hover:text-white"
                      }`}
                    >
                      {preset}+ {preset >= 1500 ? "(Ivy League)" : "(Top Grant)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* IELTS Slayderi */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-amber-400" />
                    <span className="text-base font-bold text-white">Maqsadli IELTS Band</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono text-2xl font-black text-amber-300">
                    <span>Band {targetIeltsScore.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">/ 9.0</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={5.5}
                  max={9.0}
                  step={0.5}
                  value={targetIeltsScore}
                  onChange={(e) => setTargetIeltsScore(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-amber-400"
                />

                <div className="mt-3.5 flex flex-wrap gap-2">
                  {[6.5, 7.5, 8.5].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetIeltsScore(preset)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        targetIeltsScore === preset
                          ? "border-amber-400 bg-amber-400/20 text-amber-300"
                          : "border-white/10 bg-white/5 text-slate-300 hover:text-white"
                      }`}
                    >
                      Band {preset} {preset >= 8 ? "(C2 daraja)" : "(Akademik qabul)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 3: HOZIRGI BILIM DARAJANGIZ */}
        {/* ------------------------------------------------------------------ */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Boshlang&apos;ich nuqta
              </span>
              <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                Hozirgi tayyorgarlik darajangiz qanday?
              </h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                Boshlang&apos;ich darajani to&apos;g&apos;ri tanlash darslarning sizga mos tezlikda borishini ta&apos;minlaydi.
              </p>
            </div>

            <div className="space-y-3">
              {LEVEL_OPTIONS.map((lvl) => {
                const isSelected = selfAssessedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelfAssessedLevel(lvl.id)}
                    className={`flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-emerald-400/80 bg-emerald-500/15 shadow-[0_0_20px_rgba(198,244,50,0.25)] ring-1 ring-emerald-400/40"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="text-2xl mt-0.5">{lvl.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white sm:text-lg">
                            {lvl.title}
                          </h3>
                          <span className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                            {lvl.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                          {lvl.desc}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border mt-1 ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-500 text-slate-950"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 4: ASOSIY E'TIBOR QARATILADIGAN FANLAR */}
        {/* ------------------------------------------------------------------ */}
        {step === 4 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Yo&apos;nalishlar
              </span>
              <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                Qaysi fanlardan ko&apos;proq mashq qilmoqchisiz?
              </h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                O&apos;zingiz kuchaytirmoqchi bo&apos;lgan modullarni belgilang (bir nechta tanlash mumkin):
              </p>
            </div>

            <div className="space-y-3">
              {SUBJECT_OPTIONS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub.id)}
                    className={`flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-emerald-400/80 bg-emerald-500/15 shadow-[0_0_20px_rgba(198,244,50,0.25)] ring-1 ring-emerald-400/40"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="text-2xl mt-0.5">{sub.icon}</span>
                      <div>
                        <h3 className="text-base font-bold text-white sm:text-lg">
                          {sub.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                          {sub.desc}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border mt-1 ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-500 text-slate-950"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PAGE 5: O'RGANISH USLUBI VA QULAY VAQT */}
        {/* ------------------------------------------------------------------ */}
        {step === 5 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Yakuniy qadam
              </span>
              <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                O&apos;qish uslubi va Qulay vaqtingiz
              </h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                Sizga qaysi metod bilan o&apos;qish va kunning qaysi vaqtida shug&apos;ullanish qulay?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Afzal ko&apos;rgan ta&apos;lim formatingiz:
                </label>
                <div className="space-y-2.5">
                  {LEARNING_STYLES.map((style) => {
                    const isSelected = learningStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setLearningStyle(style.id)}
                        className={`flex w-full items-start justify-between rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-emerald-400/80 bg-emerald-500/15 ring-1 ring-emerald-400/40"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl mt-0.5">{style.icon}</span>
                          <div>
                            <h4 className="text-sm font-bold text-white sm:text-base">
                              {style.title}
                            </h4>
                            <p className="text-xs text-slate-300">
                              {style.desc}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border mt-0.5 ${
                            isSelected
                              ? "border-emerald-400 bg-emerald-500 text-slate-950"
                              : "border-white/20 bg-transparent"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Kunlik shug&apos;ullanish uchun eng qulay vaqt:
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = preferredStudyTime === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPreferredStudyTime(slot.id)}
                        className={`rounded-xl border p-3 text-center transition-all ${
                          isSelected
                            ? "border-amber-400 bg-amber-400/20 text-amber-300"
                            : "border-white/10 bg-white/5 text-slate-300 hover:text-white"
                        }`}
                      >
                        <span className="block text-xl mb-1">{slot.icon}</span>
                        <strong className="block text-xs font-bold text-white">{slot.label}</strong>
                        <span className="text-[10px] text-slate-400">{slot.time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PASTKI TUGMALAR (PAGE TO PAGE NAVIGATSIYA) */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Orqaga</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className={`btn-neon inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold shadow-lg ${
              saving ? "cursor-not-allowed opacity-75" : ""
            }`}
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Reja tuzilmoqda...</span>
              </>
            ) : step === 5 ? (
              <>
                <span>12 Oylik Shaxsiy Rejani Boshlash</span>
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Keyingi qadam</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
