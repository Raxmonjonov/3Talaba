"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  RotateCcw,
  Sigma,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  XCircle,
  Zap,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";

// ============================================================================
// TIP VA MA'LUMOTLAR STRUKTURASI
// ============================================================================

export type PlacementStage = "SETUP" | "QUIZ" | "RESULT";

export type CurrentLevelChoice = "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";
export type TargetGoalChoice = "SAT_1450" | "IELTS_75" | "FULL_GRANT";

export interface DiagnosticQuestion {
  id: string;
  category: "algebra" | "geometry" | "sat_math" | "english_rw";
  categoryLabel: string;
  topic: string;
  prompt: string;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correct: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface DiagnosticResultRecord {
  completedAt: string;
  timeSpentSeconds: number;
  currentLevel: CurrentLevelChoice;
  targetGoal: TargetGoalChoice;
  totalScore: number; // 0..6
  mathScore: number; // 0..4
  englishScore: number; // 0..2
  estimatedSat: number;
  estimatedIelts: string;
  categoryStats: {
    algebra: boolean;
    geometry: boolean;
    satMath1: boolean;
    satMath2: boolean;
    englishRw1: boolean;
    englishRw2: boolean;
  };
}

// 6 ta sifatli savol (2 ta Algebra/Geometriya, 2 ta Digital SAT Math, 2 ta IELTS/SAT R&W)
const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "q-alg-1",
    category: "algebra",
    categoryLabel: "Algebra & Tenglamalar",
    topic: "Chiziqli tenglamalar va proporsiya",
    prompt: "Agar (2x - 3) / 5 = (x + 4) / 3 bo'lsa, x ning qiymatini toping:",
    options: [
      { id: "A", text: "x = 29" },
      { id: "B", text: "x = 17" },
      { id: "C", text: "x = 11" },
      { id: "D", text: "x = 35" },
    ],
    correct: "A",
    explanation:
      "Proporsiya bo'yicha ko'paytiramiz: 3(2x - 3) = 5(x + 4) ⇒ 6x - 9 = 5x + 20 ⇒ 6x - 5x = 20 + 9 ⇒ x = 29.",
  },
  {
    id: "q-geom-1",
    category: "geometry",
    categoryLabel: "Pifagor & Geometriya",
    topic: "To'g'ri burchakli uchburchak",
    prompt:
      "To'g'ri burchakli uchburchakning gipotenuzasi 25 ga, bitta kateti esa 7 ga teng. Ikkinchi katet uzunligini toping:",
    options: [
      { id: "A", text: "20" },
      { id: "B", text: "24" },
      { id: "C", text: "22" },
      { id: "D", text: "18" },
    ],
    correct: "B",
    explanation:
      "Pifagor teoremasi: b² = c² - a² = 25² - 7² = 625 - 49 = 576. Demak, b = √576 = 24 (7-24-25 mashhur Pifagor uchligi).",
  },
  {
    id: "q-sat-1",
    category: "sat_math",
    categoryLabel: "Digital SAT Math",
    topic: "Viyeta teoremasi va ildizlar",
    prompt:
      "Agar x² - 14x + c = 0 kvadrat tenglamaning bitta ildizi ikkinchisidan 4 ga katta bo'lsa, c koeffitsiyentini toping:",
    options: [
      { id: "A", text: "c = 40" },
      { id: "B", text: "c = 45" },
      { id: "C", text: "c = 48" },
      { id: "D", text: "c = 52" },
    ],
    correct: "B",
    explanation:
      "Viyeta bo'yicha: x₁ + x₂ = 14. Shartga ko'ra x₁ - x₂ = 4. Tizimni qo'shsak: 2x₁ = 18 ⇒ x₁ = 9, x₂ = 5. Demak, c = x₁ · x₂ = 9 · 5 = 45.",
  },
  {
    id: "q-sat-2",
    category: "sat_math",
    categoryLabel: "Digital SAT Math",
    topic: "Eksponensial funksiyalar",
    prompt:
      "Bank omonati M(t) = 1200 · (1.06)^t funksiya bilan berilgan (t — yillar). Bu model nimani anglatadi?",
    options: [
      { id: "A", text: "Boshlang'ich summa 1200$, har yili 6% ga o'smoqda" },
      { id: "B", text: "Boshlang'ich summa 106$, har yili 12% ga o'smoqda" },
      { id: "C", text: "Boshlang'ich summa 1200$, har yili 1.06% ga o'smoqda" },
      { id: "D", text: "Boshlang'ich summa 1260$, har yili 6% ga o'smoqda" },
    ],
    correct: "A",
    explanation:
      "Eksponensial o'sish qolipi: A · (1 + r)^t. Boshlang'ich miqdor A = 1200$, o'sish koeffitsiyenti 1.06 = 1 + 0.06, ya'ni yillik 6% foiz.",
  },
  {
    id: "q-rw-1",
    category: "english_rw",
    categoryLabel: "SAT Reading & Writing",
    topic: "Mantiqiy bog'lovchilar (Transitions)",
    prompt:
      "\"Many universities prioritize high SAT Math scores for STEM majors. ________, strong academic writing and communication skills are equally essential for research grants.\" Bo'shliqqa qaysi so'z mos keladi?",
    options: [
      { id: "A", text: "In contrast" },
      { id: "B", text: "However" },
      { id: "C", text: "Furthermore" },
      { id: "D", text: "Otherwise" },
    ],
    correct: "C",
    explanation:
      "Ikkinchi jumla birinchi fikrga qo'shimcha muhim jihatni qo'shmoqda (kuchaytiruvchi mantiq). Shuning uchun \"Furthermore\" (bundan tashqari / shuningdek) to'g'ri keladi.",
  },
  {
    id: "q-rw-2",
    category: "english_rw",
    categoryLabel: "IELTS Academic (Band 7.5+)",
    topic: "Akademik parafraz va leksika",
    prompt:
      "Academic inshoda \"Traditional teaching methods have many disadvantages\" fikrini Band 7.5+ darajasida qaysi jumla eng professional ifodalaydi?",
    options: [
      {
        id: "A",
        text: "Conventional instructional approaches exhibit numerous inherent limitations.",
      },
      {
        id: "B",
        text: "Old teaching ways are totally bad for students in universities.",
      },
      {
        id: "C",
        text: "Disadvantages of traditional methods are very big and dangerous.",
      },
      {
        id: "D",
        text: "Traditional teaching is not good because modern technology exists.",
      },
    ],
    correct: "A",
    explanation:
      "A varianti boy akademik leksikaga ega: \"conventional instructional approaches\" (an'anaviy ta'lim metodlari) va \"inherent limitations\" (ichki kamchiliklar). Bu Band 7.5+ rasmiy registeridir.",
  },
];

// ============================================================================
// ASOSIY KOMPONENT
// ============================================================================

export default function PlacementTestPage() {
  const { reduceMotion } = useUIPreferences();

  // Bosqich holati
  const [stage, setStage] = useState<PlacementStage>("SETUP");

  // 1-bosqich: Sozlamalar
  const [currentLevel, setCurrentLevel] = useState<CurrentLevelChoice>("INTERMEDIATE");
  const [targetGoal, setTargetGoal] = useState<TargetGoalChoice>("SAT_1450");

  // 2-bosqich: Quiz holati
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, "A" | "B" | "C" | "D">
  >({});
  const [tempChoice, setTempChoice] = useState<"A" | "B" | "C" | "D" | null>(null);

  // Jonli taymer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // 3-bosqich: Natija
  const [resultRecord, setResultRecord] = useState<DiagnosticResultRecord | null>(null);

  // Jonli taymer hisoblagichi
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Taymerni mm:ss formatiga o'tkazish
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [timerSeconds]);

  // LocalStoragedan oldingi natijani tekshirish (ixtiyoriy)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("3talaba_placement_result");
      if (saved) {
        const parsed = JSON.parse(saved) as DiagnosticResultRecord;
        if (parsed && typeof parsed.totalScore === "number") {
          // agar foydalanuvchi to'g'ridan-to'g'ri ko'rmoqchi bo'lsa state'da saqlab turamiz
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // 1-bosqichdan 2-bosqichga o'tish
  const handleStartTest = () => {
    setStage("QUIZ");
    setCurrentIndex(0);
    setSelectedAnswers({});
    setTempChoice(null);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  const activeQuestion = DIAGNOSTIC_QUESTIONS[currentIndex];

  // Tanlangan variantni belgilash
  const handleSelectOption = (optId: "A" | "B" | "C" | "D") => {
    setTempChoice(optId);
  };

  // Keyingi savolga o'tish
  const handleNextQuestion = () => {
    if (!tempChoice) return;

    const newAnswers = {
      ...selectedAnswers,
      [activeQuestion.id]: tempChoice,
    };
    setSelectedAnswers(newAnswers);

    if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTempChoice(newAnswers[DIAGNOSTIC_QUESTIONS[currentIndex + 1]?.id] || null);
    } else {
      // Test yakunlandi! Natijani hisoblash
      setIsTimerRunning(false);
      calculateAndFinishResult(newAnswers);
    }
  };

  // Natijani hisoblash va 3-bosqichga o'tish
  const calculateAndFinishResult = (
    answers: Record<string, "A" | "B" | "C" | "D">
  ) => {
    let totalScore = 0;
    let mathScore = 0;
    let englishScore = 0;

    const categoryStats = {
      algebra: false,
      geometry: false,
      satMath1: false,
      satMath2: false,
      englishRw1: false,
      englishRw2: false,
    };

    DIAGNOSTIC_QUESTIONS.forEach((q) => {
      const given = answers[q.id];
      const isCorrect = given === q.correct;
      if (isCorrect) {
        totalScore += 1;
        if (q.category === "algebra" || q.category === "geometry" || q.category === "sat_math") {
          mathScore += 1;
        } else {
          englishScore += 1;
        }
      }

      if (q.id === "q-alg-1") categoryStats.algebra = isCorrect;
      if (q.id === "q-geom-1") categoryStats.geometry = isCorrect;
      if (q.id === "q-sat-1") categoryStats.satMath1 = isCorrect;
      if (q.id === "q-sat-2") categoryStats.satMath2 = isCorrect;
      if (q.id === "q-rw-1") categoryStats.englishRw1 = isCorrect;
      if (q.id === "q-rw-2") categoryStats.englishRw2 = isCorrect;
    });

    // Taxminiy SAT va IELTS hisoblash
    // Matematika: 4 ta savol (har biri 80-100 ball qo'shadi)
    const baseSat =
      currentLevel === "ADVANCED" ? 520 : currentLevel === "INTERMEDIATE" ? 460 : 400;
    const estimatedSat = Math.min(800, baseSat + mathScore * 80);

    // Ingliz tili: 2 ta savol
    let estimatedIelts = "B1 (IELTS ~5.5)";
    if (englishScore === 2) {
      estimatedIelts = currentLevel === "ADVANCED" ? "C1 (IELTS 7.5+)" : "B2/C1 (IELTS 7.0)";
    } else if (englishScore === 1) {
      estimatedIelts = "B1/B2 (IELTS ~6.0)";
    } else {
      estimatedIelts = "A2 (IELTS ~4.5 - 5.0)";
    }

    const record: DiagnosticResultRecord = {
      completedAt: new Date().toISOString(),
      timeSpentSeconds: timerSeconds,
      currentLevel,
      targetGoal,
      totalScore,
      mathScore,
      englishScore,
      estimatedSat,
      estimatedIelts,
      categoryStats,
    };

    setResultRecord(record);
    setStage("RESULT");

    // LocalStorage ga saqlaymiz
    try {
      localStorage.setItem("3talaba_placement_result", JSON.stringify(record));
    } catch {
      // ignore
    }

    // Backend API ga ham xotirjamlik bilan yuboramiz (agar tizimga kirgan bo'lsa profiliga yoziladi)
    fetch("/api/placement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([qId, ans]) => ({
          questionId: qId,
          subjectSlug: qId.startsWith("q-rw") ? "sat-rw" : "sat-math",
          difficulty: 2,
          givenAnswer: ans,
          timeSpentSec: Math.max(5, Math.floor(timerSeconds / 6)),
        })),
        speakingComfort: "MODERATE",
        writingExperience: "PARAGRAPHS",
      }),
    }).catch(() => {});
  };

  // Testni boshidan qayta topshirish
  const handleRetake = () => {
    setStage("SETUP");
    setCurrentIndex(0);
    setSelectedAnswers({});
    setTempChoice(null);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 lg:px-10">
      {/* ====================================================================
          1-BOSQICH: MAQSADNI SOZLASH (SETUP SCREEN)
          ==================================================================== */}
      {stage === "SETUP" && (
        <div className="glass-card space-y-8 p-6 sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-extrabold text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span>3TALABA CAMPUS • ADAPTIV DIAGNOSTIKA</span>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              12 Oylik Shaxsiy Rejangizni Tuzamiz
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Ushbu 6 ta tezkor savoldan iborat diagnostika testi yordamida hozirgi darajangizni
              aniqlab, kuchli va zaif nuqtalaringizga mos traektoriya quramiz.
            </p>
          </div>

          <div className="space-y-6">
            {/* 1. Hozirgi holat tanlash */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                1. Hozirgi darajangiz qanday?
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    id: "FOUNDATION" as CurrentLevelChoice,
                    title: "Boshlang'ich (Foundation)",
                    desc: "Maktab algebrasini va ingliz tili grammatikasini noldan mustahkamlashim kerak.",
                    badge: "Noldan",
                  },
                  {
                    id: "INTERMEDIATE" as CurrentLevelChoice,
                    title: "O'rta (Intermediate)",
                    desc: "Asosiy mavzularni bilaman, lekin SAT va IELTS imtihon tuzoqlariga tayyorman.",
                    badge: "Tavsiya etiladi",
                  },
                  {
                    id: "ADVANCED" as CurrentLevelChoice,
                    title: "Yuqori (Advanced)",
                    desc: "SAT Math 800 va IELTS 7.5+ uchun eng qiyin misollar va tezlik ustida ishlayman.",
                    badge: "1500+ Maqsad",
                  },
                ].map((item) => {
                  const isSelected = currentLevel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentLevel(item.id)}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-500/15 text-white shadow-[0_0_24px_rgba(16,185,129,0.3)]"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{item.title}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                        </div>
                        <p className="mt-2 text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                      </div>
                      <span className="mt-4 inline-block font-mono text-[10px] font-extrabold uppercase text-emerald-400">
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Asosiy maqsad tanlash */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-300">
                2. Asosiy akademik maqsadingiz:
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    id: "SAT_1450" as TargetGoalChoice,
                    title: "SAT 1500+ (Math 800)",
                    desc: "Top universitetlar uchun matematika va Reading & Writing imtihoniga urg'u berish.",
                  },
                  {
                    id: "IELTS_75" as TargetGoalChoice,
                    title: "IELTS 7.5+",
                    desc: "Academic Writing Task 1/2 va ravon Speaking ko'nikmalarini egallash.",
                  },
                  {
                    id: "FULL_GRANT" as TargetGoalChoice,
                    title: "Kompleks (SAT + IELTS + Grant)",
                    desc: "Xalqaro universitetlarga to'liq grant yutish uchun har tomonlama tayyorgarlik.",
                  },
                ].map((item) => {
                  const isSelected = targetGoal === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTargetGoal(item.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-500/15 text-white shadow-[0_0_24px_rgba(245,158,11,0.25)]"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/40 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{item.title}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-amber-300" />}
                      </div>
                      <p className="mt-2 text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 pt-4 border-t border-white/10 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>O'rtacha vaqt: 4–6 daqiqa • 6 ta sifatli savol</span>
            </div>

            <button
              type="button"
              onClick={handleStartTest}
              className="btn-neon inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-xl w-full sm:w-auto justify-center"
            >
              <span>Diagnostikani boshlash</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          2-BOSQICH: INTERAKTIV TEST JARAYONI (QUIZ ENGINE)
          ==================================================================== */}
      {stage === "QUIZ" && activeQuestion && (
        <div className="glass-card space-y-6 p-6 sm:p-8">
          {/* Yuqori boshqaruv paneli: Progress bar va Jonli taymer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 font-mono text-sm font-black text-emerald-400">
                {currentIndex + 1}
              </span>
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  {activeQuestion.categoryLabel}
                </span>
                <span className="block text-xs font-medium text-slate-300">
                  Mavzu: {activeQuestion.topic}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Jonli taymer */}
              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-amber-300">
                <Clock className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                <span>{formattedTime}</span>
              </div>

              {/* Progress hisoblagich */}
              <span className="glass-pill rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-slate-300">
                {currentIndex + 1} / {DIAGNOSTIC_QUESTIONS.length}
              </span>
            </div>
          </div>

          {/* Progress chizig'i */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%`,
              }}
            />
          </div>

          {/* Savol kartochkasi */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-white sm:text-xl leading-relaxed">
                {activeQuestion.prompt}
              </h2>
              <JarvisVoiceButton
                text={activeQuestion.prompt}
                label="Eshitish"
                className="shrink-0"
              />
            </div>

            {/* Variantlar */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {activeQuestion.options.map((opt) => {
                const isSelected = tempChoice === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-500/20 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                        : "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-400/50 hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-extrabold ${
                        isSelected
                          ? "bg-emerald-400 text-slate-950"
                          : "bg-white/10 text-emerald-400"
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-sm font-semibold">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pastki harakat tugmalari */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs text-slate-400">
              {tempChoice ? "Javob belgilandi" : "Davom etish uchun variantni tanlang"}
            </span>

            <button
              type="button"
              disabled={!tempChoice}
              onClick={handleNextQuestion}
              className={`btn-neon inline-flex items-center gap-2 px-6 py-3 text-xs font-bold transition-all ${
                !tempChoice ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              <span>
                {currentIndex < DIAGNOSTIC_QUESTIONS.length - 1
                  ? "Keyingi savol"
                  : "Natijani hisoblash"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          3-BOSQICH: TAHLILIY NATIJA VA SHAXSIY REJA (RESULT SCREEN)
          ==================================================================== */}
      {stage === "RESULT" && resultRecord && (
        <div className="glass-card space-y-8 p-6 sm:p-10">
          {/* Yuqori tabrik va umumiy xulosa */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/50 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
              <Trophy className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Diagnostika Muvaffaqiyatli Yakunlandi!
            </h1>
            <p className="text-sm text-slate-300">
              Siz 6 ta savoldan{" "}
              <strong className="text-emerald-400 font-bold font-mono">
                {resultRecord.totalScore} tasiga
              </strong>{" "}
              to&apos;g&apos;ri javob berdingiz ({Math.round((resultRecord.totalScore / 6) * 100)}%).
              Vaqt: <span className="font-mono text-amber-300">{formattedTime}</span>.
            </p>
          </div>

          {/* Taxminiy Boshlang'ich Daraja Kartochkalari */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* SAT Matematika */}
            <div className="glass-pill rounded-2xl p-5 border-l-4 border-l-emerald-400 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-emerald-400">
                  Taxminiy SAT Matematika
                </span>
                <h3 className="text-2xl font-black text-white font-mono mt-1">
                  {resultRecord.estimatedSat} / 800
                </h3>
                <span className="text-xs text-slate-300 mt-1 block">
                  Matematikadan: {resultRecord.mathScore} / 4 ta to&apos;g&apos;ri
                </span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sigma className="h-6 w-6" />
              </div>
            </div>

            {/* IELTS / Akademik Ingliz tili */}
            <div className="glass-pill rounded-2xl p-5 border-l-4 border-l-amber-400 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-amber-300">
                  Taxminiy Ingliz Tili Darajasi
                </span>
                <h3 className="text-2xl font-black text-white font-mono mt-1">
                  {resultRecord.estimatedIelts}
                </h3>
                <span className="text-xs text-slate-300 mt-1 block">
                  Reading &amp; Writing: {resultRecord.englishScore} / 2 ta to&apos;g&apos;ri
                </span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                <Brain className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Kuchli va zaif tomonlar tahlili */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Bo&apos;limlar bo&apos;yicha diagnostika tahlili</span>
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Algebra & Proporsiya",
                  passed: resultRecord.categoryStats.algebra,
                  desc: "Chiziqli tenglamalar va tezkor soddalashtirish",
                },
                {
                  label: "Geometriya & Pifagor",
                  passed: resultRecord.categoryStats.geometry,
                  desc: "To'g'ri burchakli uchburchak va Pifagor uchliklari",
                },
                {
                  label: "Digital SAT Math (Viyeta & Funksiya)",
                  passed: resultRecord.categoryStats.satMath1 && resultRecord.categoryStats.satMath2,
                  desc: "Viyeta teoremasi va eksponensial o'sish modellari",
                },
                {
                  label: "Akademik Ingliz Tili (R&W & IELTS)",
                  passed: resultRecord.categoryStats.englishRw1 && resultRecord.categoryStats.englishRw2,
                  desc: "Mantiqiy bog'lovchilar va Band 7.5+ akademik leksika",
                },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  className="glass-pill rounded-xl p-3.5 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{cat.label}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{cat.desc}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-extrabold uppercase ${
                      cat.passed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    }`}
                  >
                    {cat.passed ? "Mustahkam" : "Takrorlash kerak"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Avtomatik 12 Oylik Shaxsiy Tavsiya */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
                  SIZNING TRAEKTORIYANGIZ
                </span>
                <h3 className="text-lg font-black text-white sm:text-xl">
                  12 Oylik Shaxsiy Qadamlar Rejasi
                </h3>
              </div>
              <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-amber-300">
                Maqsad: {resultRecord.targetGoal.replace("_", " ")}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-pill rounded-xl p-4 border-l-4 border-l-emerald-400">
                <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">
                  1-CHORAK (1–3 OY)
                </span>
                <h4 className="text-xs font-bold text-white mt-1">Fundamental Poydevor</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {resultRecord.mathScore < 3
                    ? "Maktab algebrasini to'liq mustahkamlash, 15 ta matematika modulini noldan o'rganish."
                    : "Murakkab funksiyalar va formulalar isbotiga o'tish."}
                </p>
              </div>

              <div className="glass-pill rounded-xl p-4 border-l-4 border-l-teal-400">
                <span className="text-[10px] font-extrabold uppercase text-teal-300 block">
                  2-CHORAK (4–6 OY)
                </span>
                <h4 className="text-xs font-bold text-white mt-1">SAT &amp; IELTS Strategiyasi</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  SAT Math 10 soniyalik shortcutlari, IELTS Writing Task 2 shaxsiy qoliplari va
                  Desmos kalkulyatori sirlari.
                </p>
              </div>

              <div className="glass-pill rounded-xl p-4 border-l-4 border-l-amber-400">
                <span className="text-[10px] font-extrabold uppercase text-amber-300 block">
                  3-CHORAK (7–9 OY)
                </span>
                <h4 className="text-xs font-bold text-white mt-1">Intensiv Savollar Banki</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Minglab haqiqiy savollarni yechish va Talaba AI Sokratik murabbiyi bilan barcha
                  xatolarni chuqur tahlil qilish.
                </p>
              </div>

              <div className="glass-pill rounded-xl p-4 border-l-4 border-l-emerald-400">
                <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">
                  4-CHORAK (10–12 OY)
                </span>
                <h4 className="text-xs font-bold text-white mt-1">Full Mock &amp; Grant Qabuli</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Haqiqiy vaqt sinovlari (SAT 1500+, IELTS 7.5+), universitet insholari va xorijga grant
                  hujjatlarini topshirish.
                </p>
              </div>
            </div>
          </div>

          {/* Pastki 2 ta asosiy CTA va Qayta topshirish */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Testni qayta topshirish</span>
            </button>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href="/coach"
                className="btn-gold flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold shadow-lg"
              >
                <Brain className="h-4 w-4" />
                <span>Natijani Talaba AI bilan muhokama qilish</span>
              </Link>

              <Link
                href="/math"
                className="btn-neon flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold shadow-lg"
              >
                <BookOpen className="h-4 w-4" />
                <span>Tavsiya etilgan 1-darsni boshlash</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
