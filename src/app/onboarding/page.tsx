"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { animate } from "animejs";
import {
  Sparkles,
  Trophy,
  Flame,
  GraduationCap,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Compass,
  Clock,
  Brain,
  Target,
  Sliders,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";
import { LEVEL_LABELS } from "@/lib/validations/onboarding";

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
  streak?: {
    currentStreak: number;
  };
}

const UNIVERSITY_PRESETS = [
  { uni: "MIT / Stanford / Ivy League", country: "AQSh" },
  { uni: "University of Oxford / Cambridge", country: "Buyuk Britaniya" },
  { uni: "KAIST / Yonsei University", country: "Janubiy Koreya" },
  { uni: "Nazarbayev University / Constructor", country: "Xalqaro / Yevropa" },
  { uni: "Yangi O'zbekiston / Westminster (WIUT)", country: "O'zbekiston" },
];

const SUBJECT_OPTIONS = [
  { slug: "sat-math", label: "SAT Matematika" },
  { slug: "sat-rw", label: "SAT Reading & Writing" },
  { slug: "ielts", label: "IELTS Academic (4 ko'nikma)" },
  { slug: "foundation-math", label: "Fundamental Matematika (Noldan)" },
  { slug: "academic-writing", label: "Akademik Yozuv & Insho" },
];

const LEARNING_STYLES = [
  {
    id: "VISUAL_PRACTICE" as const,
    title: "Vizual sxemalar + Ko'p amaliy mashq",
    desc: "Qisqa grafik tushuntirish va darhol test yechish orqali tez o'rganaman.",
  },
  {
    id: "SOCRATIC_CHAT" as const,
    title: "AI Murabbiy bilan savol-javob (Socratic)",
    desc: "Ustoz men bilan suhbatlashib, yo'naltiruvchi savollar bersa yaxshi tushunaman.",
  },
  {
    id: "DEEP_THEORY" as const,
    title: "Chuqur nazariya va qoidalar tahlili",
    desc: "Har bir formula va grammatik qoidaning negizini batafsil o'qishni yoqtiraman.",
  },
  {
    id: "POMODORO_SPRINT" as const,
    title: "Qisqa 25 daqiqalik intensiv bloklar",
    desc: "Tez-tez tanaffus bilan qisqa va diqqatli sprintlarda o'qish menga qulay.",
  },
];

const STUDY_TIME_SLOTS = [
  { id: "MORNING" as const, label: "🌅 Ertalab (06:00 – 10:00)", note: "Tiniq xotira vaqti" },
  { id: "AFTERNOON" as const, label: "☀️ Kunduzi (13:00 – 17:00)", note: "Darsdan so'ng" },
  { id: "EVENING" as const, label: "🌆 Kechqurun (18:00 – 22:00)", note: "Eng ommabop sokin vaqt" },
  { id: "NIGHT" as const, label: "🌙 Tungi sokinlik (22:00+)", note: "Chuqur konsentratsiya" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { reduceMotion } = useUIPreferences();

  const stepCardRef = useRef<HTMLDivElement | null>(null);
  const xpRef = useRef<HTMLSpanElement | null>(null);

  const [userData, setUserData] = useState<ProfileResponse | null>(null);
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Onboarding form state
  const [targetUniversity, setTargetUniversity] = useState("MIT / Westminster / Top OTM");
  const [targetCountry, setTargetCountry] = useState("AQSh va O'zbekiston");
  const [targetSatScore, setTargetSatScore] = useState<number>(1480);
  const [targetIeltsScore, setTargetIeltsScore] = useState<number>(7.5);
  const [selfAssessedLevel, setSelfAssessedLevel] = useState<
    "ZERO" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  >("BEGINNER");
  const [strongSubjects, setStrongSubjects] = useState<string[]>(["foundation-math"]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>(["sat-rw", "ielts"]);
  const [learningStyle, setLearningStyle] = useState<
    "VISUAL_PRACTICE" | "SOCRATIC_CHAT" | "DEEP_THEORY" | "POMODORO_SPRINT"
  >("VISUAL_PRACTICE");
  const [preferredStudyTime, setPreferredStudyTime] = useState<
    "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT"
  >("EVENING");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ProfileResponse | null) => {
        if (!data) return;
        setUserData(data);
        if (data.profile) {
          if (data.profile.targetUniversity) setTargetUniversity(data.profile.targetUniversity);
          if (data.profile.targetCountry) setTargetCountry(data.profile.targetCountry);
          if (data.profile.targetSatScore) setTargetSatScore(data.profile.targetSatScore);
          if (data.profile.targetIeltsScore) setTargetIeltsScore(data.profile.targetIeltsScore);
          if (data.profile.selfAssessedLevel) setSelfAssessedLevel(data.profile.selfAssessedLevel);
          if (data.profile.learningStyle) setLearningStyle(data.profile.learningStyle);
          if (data.profile.preferredStudyTime) {
            setPreferredStudyTime(data.profile.preferredStudyTime);
          }
        }
      })
      .catch(() => {});
  }, []);

  // XP hisoblagich animatsiyasi
  useEffect(() => {
    if (!xpRef.current || !userData?.profile) return;
    const targetXp = userData.profile.xpTotal || 50;
    if (reduceMotion) {
      xpRef.current.textContent = String(targetXp);
      return;
    }
    const obj = { val: 0 };
    animate(obj, {
      val: targetXp,
      duration: 900,
      ease: "outQuart",
      onUpdate: () => {
        if (xpRef.current) xpRef.current.textContent = String(Math.round(obj.val));
      },
    });
  }, [userData, reduceMotion]);

  // Qadam almashganda karta animatsiyasi
  useEffect(() => {
    if (reduceMotion || !stepCardRef.current) return;
    animate(stepCardRef.current, {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 480,
      ease: "outExpo",
    });
  }, [step, reduceMotion]);

  const toggleSubjectInList = (
    slug: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (list.includes(slug)) {
      setList(list.filter((item) => item !== slug));
    } else {
      setList([...list, slug]);
    }
  };

  const handleFinishOnboarding = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUniversity,
          targetCountry,
          targetSatScore,
          targetIeltsScore,
          selfAssessedLevel,
          strongSubjects,
          weakSubjects,
          learningStyle,
          preferredStudyTime,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? "Saqlashda xatolik yuz berdi");
        setSaving(false);
        return;
      }

      router.push("/placement");
    } catch {
      setErrorMsg("Tarmoq xatoligi yuz berdi. Qayta urinib ko'ring.");
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">Profilingiz yuklanmoqda...</p>
      </div>
    );
  }

  const honorific = userData?.honorific ?? session?.user?.honorific ?? "Shag'zodam";
  const displayName = userData?.name ?? session?.user?.name ?? "O'quvchi";

  return (
    <div className="classroom-grid-bg mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Yuqori salomlashuv va profil kartasi */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SHAXSIY SINFXONA VA TANISHUV</span>
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              Xush kelibsiz, <span className="text-gold">{honorific}</span> ({displayName})!
            </h1>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">
              12 oylik shaxsiy yo&apos;l xaritangizni aniq tuzishimiz uchun 4 ta qisqa savolga
              javob bering.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-gold/40 bg-gold-soft px-4 py-2 text-center">
              <div className="flex items-center gap-1.5 font-mono text-lg font-extrabold text-gold">
                <Trophy className="h-4 w-4" />
                <span ref={xpRef}>{userData?.profile?.xpTotal ?? 50}</span>
                <span>XP</span>
              </div>
              <span className="text-[10px] text-fg-muted">1-daraja • Ilk qadam</span>
            </div>

            <div className="rounded-xl border border-neon/40 bg-neon-soft px-4 py-2 text-center">
              <div className="flex items-center gap-1.5 font-mono text-lg font-extrabold text-neon">
                <Flame className="h-4 w-4" />
                <span>{userData?.streak?.currentStreak ?? 1} kun</span>
              </div>
              <span className="text-[10px] text-fg-muted">Kunlik Streak</span>
            </div>
          </div>
        </div>

        {/* O'quvchi profili qisqa ma'lumoti */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-elevated/50 px-3.5 py-2.5 text-xs">
            <GraduationCap className="h-4 w-4 text-neon" />
            <span className="text-fg-muted">Sinf:</span>
            <strong className="text-fg">
              {userData?.profile?.grade ?? "10-sinf"} • {userData?.profile?.age ?? 16} yosh
            </strong>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-elevated/50 px-3.5 py-2.5 text-xs">
            <MapPin className="h-4 w-4 text-gold" />
            <span className="text-fg-muted">Hudud:</span>
            <strong className="text-fg">{userData?.profile?.region ?? "Toshkent sh."}</strong>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-elevated/50 px-3.5 py-2.5 text-xs">
            <CheckCircle2 className="h-4 w-4 text-neon" />
            <span className="text-fg-muted">AI Murojaati:</span>
            <strong className="text-neon">«{honorific}» (Socratic)</strong>
          </div>
        </div>

        {/* Bosqich indikatori (1..4) */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-fg-muted">
            <span>Shaxsiy savollar bosqichi: {step} / 4</span>
            <span className="font-mono text-neon">{step * 25}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon to-gold transition-all duration-300"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-danger/50 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {errorMsg}
          </div>
        )}

        {/* ====================================================================
            INTERAKTIV QADAMLAR (1..4)
            ==================================================================== */}
        <div ref={stepCardRef} className="mt-6 rounded-2xl border border-border bg-canvas/70 p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <Target className="h-5 w-5 text-neon" />
                <h2 className="text-lg font-extrabold text-fg">
                  1-qadam: Maqsadli Universitet, Mamlakat va Ko&apos;zlangan Ball
                </h2>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-fg-muted">
                  Mashhur yo&apos;nalishlardan birini tanlang yoki o&apos;zingiz yozing:
                </p>
                <div className="flex flex-wrap gap-2">
                  {UNIVERSITY_PRESETS.map((preset) => (
                    <button
                      key={preset.uni}
                      type="button"
                      onClick={() => {
                        setTargetUniversity(preset.uni);
                        setTargetCountry(preset.country);
                      }}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                        targetUniversity === preset.uni
                          ? "border-neon bg-neon-soft text-neon"
                          : "border-border bg-surface text-fg-muted hover:text-fg"
                      }`}
                    >
                      🎓 {preset.uni} ({preset.country})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="onb-uni"
                    className="mb-1.5 block text-xs font-semibold text-fg-muted"
                  >
                    Maqsadli Universitet(lar)ingiz
                  </label>
                  <input
                    id="onb-uni"
                    type="text"
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    placeholder="Masalan: MIT, Harvard, Westminster..."
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-fg focus:border-neon focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="onb-country"
                    className="mb-1.5 block text-xs font-semibold text-fg-muted"
                  >
                    Maqsadli Mamlakat
                  </label>
                  <input
                    id="onb-country"
                    type="text"
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    placeholder="Masalan: AQSh, Buyuk Britaniya, Janubiy Koreya"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-fg focus:border-neon focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="onb-sat" className="text-xs font-bold text-fg">
                      Maqsadli SAT Ball
                    </label>
                    <span className="font-mono text-lg font-extrabold text-neon">
                      {targetSatScore} / 1600
                    </span>
                  </div>
                  <input
                    id="onb-sat"
                    type="range"
                    min={1100}
                    max={1600}
                    step={20}
                    value={targetSatScore}
                    onChange={(e) => setTargetSatScore(Number(e.target.value))}
                    className="mt-3 w-full accent-emerald-500"
                  />
                </div>

                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="onb-ielts" className="text-xs font-bold text-fg">
                      Maqsadli IELTS Band
                    </label>
                    <span className="font-mono text-lg font-extrabold text-gold">
                      Band {targetIeltsScore.toFixed(1)}
                    </span>
                  </div>
                  <input
                    id="onb-ielts"
                    type="range"
                    min={5.5}
                    max={9.0}
                    step={0.5}
                    value={targetIeltsScore}
                    onChange={(e) => setTargetIeltsScore(Number(e.target.value))}
                    className="mt-3 w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <Compass className="h-5 w-5 text-gold" />
                <h2 className="text-lg font-extrabold text-fg">
                  2-qadam: Hozirgi darajangizni qanday baholaysiz?
                </h2>
              </div>
              <p className="text-xs text-fg-muted sm:text-sm">
                Hech tortinmasdan haqiqiy holatingizni belgilang — saralash testi shunga qarab
                savollarni moslashtiradi.
              </p>

              <div className="grid gap-3.5 sm:grid-cols-2">
                {(["ZERO", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((lvl) => {
                  const info = LEVEL_LABELS[lvl];
                  const active = selfAssessedLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelfAssessedLevel(lvl)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        active
                          ? "border-neon bg-neon-soft shadow-neon"
                          : "border-border bg-surface hover:border-neon/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gold">
                          {info.badge}
                        </span>
                        {active && <CheckCircle2 className="h-4 w-4 text-neon" />}
                      </div>
                      <p className="mt-1.5 text-base font-bold text-fg">{info.uz}</p>
                      <p className="mt-1 text-xs leading-relaxed text-fg-muted">{info.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-neon" />
                <h2 className="text-lg font-extrabold text-fg">
                  3-qadam: Kuchli va yordam kerak bo&apos;lgan (zaif) fanlaringiz
                </h2>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neon">
                  O&apos;zingizni nisbatan kuchli his qiladigan fanlar:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const selected = strongSubjects.includes(subj.slug);
                    return (
                      <button
                        key={subj.slug}
                        type="button"
                        onClick={() =>
                          toggleSubjectInList(subj.slug, strongSubjects, setStrongSubjects)
                        }
                        className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                          selected
                            ? "border-neon bg-neon-soft text-neon shadow-neon"
                            : "border-border bg-surface text-fg-muted"
                        }`}
                      >
                        ✓ {subj.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gold">
                  Ko&apos;proq qiynaladigan va kuchaytirmoqchi bo&apos;lgan fanlaringiz:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const selected = weakSubjects.includes(subj.slug);
                    return (
                      <button
                        key={subj.slug}
                        type="button"
                        onClick={() =>
                          toggleSubjectInList(subj.slug, weakSubjects, setWeakSubjects)
                        }
                        className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                          selected
                            ? "border-gold bg-gold-soft text-gold shadow-gold"
                            : "border-border bg-surface text-fg-muted"
                        }`}
                      >
                        ⚡ {subj.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <Brain className="h-5 w-5 text-gold" />
                <h2 className="text-lg font-extrabold text-fg">
                  4-qadam: O&apos;qish uslubingiz va qulay vaqtingiz
                </h2>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-fg-muted">
                  Sizga qaysi o&apos;rganish uslubi eng yoqadi?
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {LEARNING_STYLES.map((style) => {
                    const active = learningStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setLearningStyle(style.id)}
                        className={`rounded-xl border p-3.5 text-left transition-all ${
                          active
                            ? "border-neon bg-neon-soft shadow-neon"
                            : "border-border bg-surface hover:border-neon/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-fg">{style.title}</span>
                          {active && <CheckCircle2 className="h-4 w-4 text-neon" />}
                        </div>
                        <p className="mt-1 text-xs text-fg-muted">{style.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-fg-muted">
                  <Clock className="h-3.5 w-3.5 text-gold" />
                  <span>Kun davomida qaysi vaqtda dars qilish sizga qulay?</span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {STUDY_TIME_SLOTS.map((slot) => {
                    const active = preferredStudyTime === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPreferredStudyTime(slot.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          active
                            ? "border-gold bg-gold-soft text-gold"
                            : "border-border bg-surface text-fg"
                        }`}
                      >
                        <p className="text-xs font-bold sm:text-sm">{slot.label}</p>
                        <p className="mt-0.5 text-[11px] text-fg-muted">{slot.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigatsiya tugmalari */}
          <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-fg hover:border-neon/40 sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Orqaga</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                id="onboarding-next-btn"
                className="btn-neon inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold sm:text-sm"
              >
                <span>Keyingi qadam</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                id="onboarding-finish-btn"
                disabled={saving}
                onClick={handleFinishOnboarding}
                className="btn-neon inline-flex items-center gap-2 px-7 py-3 text-xs font-bold sm:text-sm"
              >
                <span>
                  {saving
                    ? "Saqlanmoqda..."
                    : "Saqlash va Adaptiv Saralash Testini Boshlash (+50 XP)"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
