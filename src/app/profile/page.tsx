"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadSecureLocal } from "@/lib/security/client-storage";
import {
  Compass,
  History as HistoryIcon,
  HelpCircle,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Search,
  Filter,
  Sliders,
  ChevronRight,
  Volume2,
  ExternalLink,
  Flame,
  Target,
  GraduationCap,
  Settings as SettingsIcon,
  Layers,
  Brain,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { JarvisVoiceButton } from "@/components/voice/JarvisVoiceAgent";
import { SegmentLoading } from "@/components/layout/SegmentLoading";
import { UniversityPathwayAtlas } from "@/components/curriculum/UniversityPathwayAtlas";
import { TARGETS } from "@/lib/site-config";
import {
  generatePersonalizedRoadmap,
  calculateDailyTimeBreakdown,
  type DailyTimeBreakdown,
  type MonthOverview,
} from "@/lib/curriculum/roadmap-generator";
import { PRACTICE_QUESTIONS, type PracticeQuestion } from "@/lib/practice/practice-data";

type ProfileTab = "roadmap" | "history" | "questions" | "progress";

interface RoadmapItemDTO {
  id: string;
  monthNumber: number;
  weekNumber: number;
  dayOfWeek: number;
  titleUz: string;
  descriptionUz: string;
  taskType: "LESSON" | "PRACTICE" | "REVIEW" | "MOCK_TEST" | "WRITING";
  durationMinutes: number;
  xpReward: number;
  isCompleted: boolean;
}

interface RoadmapData {
  dailyMinutes: number;
  items: RoadmapItemDTO[];
  months: MonthOverview[];
  timeBreakdown: DailyTimeBreakdown;
  annualStudyHours: number;
}

interface LessonHistoryItem {
  id: string;
  slug: string;
  titleUz: string;
  summaryUz: string;
  theoryMarkdown: string;
  examples: Array<{
    title: string;
    problem: string;
    stepByStepSolution: string[];
    takeaway: string;
  }>;
  estMinutes: number;
  xpReward: number;
  subjectSlug: string;
  subjectNameUz: string;
  topicTitleUz: string;
  isCompleted: boolean;
}

const FALLBACK_LESSONS: LessonHistoryItem[] = [
  {
    id: "hist-1",
    slug: "sat-math-linear-equations",
    titleUz: "Digital SAT: Chiziqli Tenglamalar va Grafik Tahlili",
    summaryUz: "SAT Math 1-modulida eng ko'p uchraydigan chiziqli tenglamalar, burchak koeffitsiyenti (slope) va kesishish nuqtalarini topish sirlari.",
    theoryMarkdown: "Chiziqli tenglamalar ko'rinishi: y = mx + b. m = (y₂ - y₁) / (x₂ - x₁). Parallel to'g'ri chiziqlarning qiyaliklari teng: m₁ = m₂. Perpendikulyar to'g'ri chiziqlar uchun m₁ · m₂ = -1.",
    examples: [
      {
        title: "SAT Savoli: Burchak koeffitsiyenti",
        problem: "Agar to'g'ri chiziq (2, 5) va (6, 13) nuqtalardan o'tsa, uning burchak koeffitsiyentini va tenglamasini toping.",
        stepByStepSolution: [
          "1. Qiyalik: m = (13 - 5) / (6 - 2) = 8 / 4 = 2.",
          "2. y = mx + b ga (2, 5) nuqtani qo'yamiz: 5 = 2(2) + b => b = 1.",
          "3. Natija: y = 2x + 1.",
        ],
        takeaway: "SAT da qiyalikni hisoblash orqali to'g'ri javobni 10 soniyada variantlardan ajratib olish mumkin.",
      },
    ],
    estMinutes: 20,
    xpReward: 50,
    subjectSlug: "sat-math",
    subjectNameUz: "Digital SAT Matematika",
    topicTitleUz: "Algebraik Asoslar",
    isCompleted: true,
  },
  {
    id: "hist-2",
    slug: "kvadrat-tenglamalar-viyet",
    titleUz: "Algebra: Kvadrat Tenglamalar va Viyet Teoremasi",
    summaryUz: "Kvadrat tenglamalarni diskriminantsiz, Viyet teoremasi orqali tezkor yechish uslubi.",
    theoryMarkdown: "x² + px + q = 0 keltirilgan kvadrat tenglamada: x₁ + x₂ = -p va x₁ · x₂ = q. Agar a ≠ 1 bo'lsa, x₁ + x₂ = -b/a va x₁ · x₂ = c/a.",
    examples: [
      {
        title: "Tezkor Yechim Misoli",
        problem: "x² - 9x + 20 = 0 tenglamaning ildizlarini Viyet orqali toping.",
        stepByStepSolution: [
          "1. Ildizlar yig'indisi: 9.",
          "2. Ildizlar ko'paytmasi: 20.",
          "3. 20 = 4 · 5 va 4 + 5 = 9. Demak, x₁ = 4, x₂ = 5.",
        ],
        takeaway: "SAT imtihonida diskriminant hisoblashga vaqt sarflamasdan og'zaki ildizlarni topish 1.5 daqiqa vaqtni tejaydi.",
      },
    ],
    estMinutes: 25,
    xpReward: 60,
    subjectSlug: "sat-math",
    subjectNameUz: "Digital SAT Matematika",
    topicTitleUz: "Tenglamalar va Funksiyalar",
    isCompleted: true,
  },
  {
    id: "hist-3",
    slug: "ielts-writing-task2-structure",
    titleUz: "IELTS Academic: Task 2 Essay 4-Paragraf Qolipi",
    summaryUz: "Band 7.5+ insho yozishning aniq arxitekturasi: Kirish, 2 ta Asosiy Tanaviy Abzas va Xulosa.",
    theoryMarkdown: "Academic Essay tuzilishi: 1. Introduction (Savolni parafraz qilish + Thesis Statement) 2. Body 1 (Topic sentence + Explanation + Example) 3. Body 2 (Counter-argument / Second point) 4. Conclusion (Restatement).",
    examples: [
      {
        title: "Paraphrase Namunasi",
        problem: "Savol: Some people think universities should focus on employment, while others value education for its own sake.",
        stepByStepSolution: [
          "1. Parafraz: While it is argued that higher education institutions ought to prioritize career preparation, others believe knowledge possesses intrinsic value.",
          "2. Shaxsiy fikr: In my view, fostering critical thinking is the primary purpose of academia.",
        ],
        takeaway: "Boy leksik resurs va aniq topik gaplar orqali darhol Band 7.5+ ball kafolatlanadi.",
      },
    ],
    estMinutes: 30,
    xpReward: 70,
    subjectSlug: "ielts",
    subjectNameUz: "IELTS Academic",
    topicTitleUz: "Academic Writing",
    isCompleted: false,
  },
  {
    id: "hist-4",
    slug: "sat-rw-command-of-evidence",
    titleUz: "SAT Reading & Writing: 'Command of Evidence' Strategiyasi",
    summaryUz: "Ilmiy matnlar va jadvallardagi dalillarni muallif gipotezasiga to'g'ri bog'lash usuli.",
    theoryMarkdown: "Gipotezani aniqlash -> Argument yo'nalishini belgilash (qo'llab-quvvatlaydimi yoki inkor etadimi) -> Variantlar ichidan faqat to'g'ridan-to'g'ri bog'liq bo'lgan ma'lumotni tanlash.",
    examples: [
      {
        title: "Evidence Tahlili",
        problem: "Tadqiqotchi o'simliklarning qurg'oqchilikka chidamliligi fotosintez tezligi bilan bog'liqligini da'vo qilmoqda. Qaysi natija buni tasdiqlaydi?",
        stepByStepSolution: [
          "1. Gipoteza: Qurg'oqchilikda yuqori fotosintez = yuqori chidamlilik.",
          "2. Variantlarni tekshirish: Faqat suvsiz sharoitda fotosintezni saqlab qolgan turlar omon qolganini ko'rsatuvchi ma'lumot to'g'ri keladi.",
        ],
        takeaway: "Matnda aytilmagan umumiy haqiqatlarga tayanmasdan, faqat keltirilgan raqamlar va dalillarga ishoning.",
      },
    ],
    estMinutes: 25,
    xpReward: 65,
    subjectSlug: "sat-rw",
    subjectNameUz: "SAT Reading & Writing",
    topicTitleUz: "Information and Ideas",
    isCompleted: true,
  },
];

const DAY_NAMES = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // URL query param ?tab=roadmap|history|questions|progress
  const activeTabParam = (searchParams.get("tab") as ProfileTab) || "roadmap";
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    ["roadmap", "history", "questions", "progress"].includes(activeTabParam)
      ? activeTabParam
      : "roadmap"
  );

  // Sync tab with URL
  const switchTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  // ---------------------------------------------------------------------------
  // 1. Profil va foydalanuvchi ma'lumotlari
  // ---------------------------------------------------------------------------
  const [placementResult, setPlacementResult] = useState<{
    estimatedSat?: string;
    estimatedIelts?: string;
    compositePercent?: number;
    recommendedTrack?: string;
  } | null>(null);

  useEffect(() => {
    const saved = loadSecureLocal<{
      estimatedSat?: string;
      estimatedIelts?: string;
      compositePercent?: number;
      recommendedTrack?: string;
    }>("3talaba_placement_result");
    if (saved) {
      setPlacementResult(saved);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 2. 12 Oylik Xarita (Roadmap)
  // ---------------------------------------------------------------------------
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);
  const [roadmapNotice, setRoadmapNotice] = useState<string | null>(null);

  useEffect(() => {
    // Generate initial plan
    const gen = generatePersonalizedRoadmap({
      startLevel: "BEGINNER",
      dailyMinutes,
      targetSatScore: 1500,
      targetIeltsScore: 7.5,
      targetUniversity: "Top 100 Grant Universitetlari",
    });

    setRoadmapData({
      dailyMinutes,
      items: gen.items.map((it, idx) => ({
        ...it,
        id: `rm-item-${idx}`,
        isCompleted: idx < 3,
      })),
      months: gen.months,
      timeBreakdown: gen.timeBreakdown,
      annualStudyHours: gen.annualStudyHours,
    });
  }, []);

  const handleUpdateDailyMinutes = (minutes: number) => {
    setDailyMinutes(minutes);
    const gen = generatePersonalizedRoadmap({
      startLevel: "BEGINNER",
      dailyMinutes: minutes,
      targetSatScore: 1500,
      targetIeltsScore: 7.5,
      targetUniversity: "Top 100 Grant Universitetlari",
    });
    setRoadmapData((prev) => ({
      dailyMinutes: minutes,
      items: prev ? prev.items : gen.items.map((it, idx) => ({ ...it, id: `rm-item-${idx}`, isCompleted: false })),
      months: gen.months,
      timeBreakdown: gen.timeBreakdown,
      annualStudyHours: gen.annualStudyHours,
    }));
    setRoadmapNotice(`Kunlik reja ${minutes} daqiqaga moslashtirildi!`);
    setTimeout(() => setRoadmapNotice(null), 3000);
  };

  const handleToggleTask = (itemId: string) => {
    setRoadmapData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.id === itemId ? { ...it, isCompleted: !it.isCompleted } : it
        ),
      };
    });
  };

  // ---------------------------------------------------------------------------
  // 3. Dars Tarixi (Lesson History)
  // ---------------------------------------------------------------------------
  const [historyLessons] = useState<LessonHistoryItem[]>(FALLBACK_LESSONS);
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyFilterSubject, setHistoryFilterSubject] = useState<string>("all");

  const filteredHistory = useMemo(() => {
    return historyLessons.filter((item) => {
      const matchesSearch =
        item.titleUz.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.summaryUz.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.topicTitleUz.toLowerCase().includes(historySearch.toLowerCase());
      const matchesSubject =
        historyFilterSubject === "all" || item.subjectSlug === historyFilterSubject;
      return matchesSearch && matchesSubject;
    });
  }, [historyLessons, historySearch, historyFilterSubject]);

  // ---------------------------------------------------------------------------
  // 4. Savollar Banki (Question Bank)
  // ---------------------------------------------------------------------------
  const [questionsList] = useState<PracticeQuestion[]>(PRACTICE_QUESTIONS);
  const [questionSearch, setQuestionSearch] = useState<string>("");
  const [questionSubject, setQuestionSubject] = useState<string>("all");
  const [questionDifficulty, setQuestionDifficulty] = useState<string>("all");
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});

  const filteredQuestions = useMemo(() => {
    return questionsList.filter((q) => {
      const matchesSearch =
        q.prompt.toLowerCase().includes(questionSearch.toLowerCase()) ||
        q.topicTitle.toLowerCase().includes(questionSearch.toLowerCase());
      const matchesSubject =
        questionSubject === "all" || q.subjectSlug === questionSubject;
      const matchesDifficulty =
        questionDifficulty === "all" || q.difficulty === questionDifficulty;
      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [questionsList, questionSearch, questionSubject, questionDifficulty]);

  const toggleRevealAnswer = (id: string) => {
    setRevealedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Current selected month tasks for Roadmap
  const currentMonthTasks = useMemo(() => {
    if (!roadmapData) return [];
    return roadmapData.items.filter(
      (it) => it.monthNumber === selectedMonth && it.weekNumber === selectedWeek
    );
  }, [roadmapData, selectedMonth, selectedWeek]);

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 lg:px-10 space-y-8">
      {/* ====================================================================
          1. O'QUVCHI PROFILI YUQORI KARTASI (HERO PROFILE CARD)
          ==================================================================== */}
      <div className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-3xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-amber-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300">
                {session?.user?.name ? session.user.name[0].toUpperCase() : "3T"}
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-slate-950 ring-2 ring-slate-950">
                ✓
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                  3Talaba Campus O&apos;quvchisi
                </span>
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                  Bo&apos;lajak Grant Sohibi
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl tracking-tight">
                {session?.user?.name ?? "Aziz O'quvchi"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {session?.user?.email ?? "oquvchi@3talaba.uz"} • Shaxsiy Ta&apos;lim Markazi
              </p>

              {/* Akademik Maqsadlar */}
              <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span>Maqsad: <strong>{TARGETS.sat}</strong></span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200">
                  <GraduationCap className="h-4 w-4 text-amber-400" />
                  <span>IELTS: <strong>{TARGETS.ielts}</strong></span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span>Kunlik Reja: <strong className="text-emerald-400">{dailyMinutes} daqiqa</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* O'ng taraf: Tezkor harakatlar va XP */}
          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 lg:border-t-0 lg:pt-0">
            <Link
              href="/placement"
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Diagnostika Natijasi</span>
            </Link>

            <Link
              href="/settings"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 transition-all inline-flex items-center gap-1.5"
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Sozlamalar</span>
            </Link>
          </div>
        </div>

        {/* Diagnostika sinovi natijasi (agar mavjud bo'lsa) */}
        {placementResult && (
          <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300 font-bold">
                ✓
              </span>
              <div>
                <span className="font-bold text-white block">
                  Oxirgi Diagnostika Testi: {placementResult.recommendedTrack ?? "SAT & IELTS Intensiv"}
                </span>
                <span className="text-slate-300">
                  Taxminiy natija: <strong className="text-emerald-300">{placementResult.estimatedSat ?? "1420-1510"}</strong> | IELTS: <strong className="text-amber-300">{placementResult.estimatedIelts ?? "7.0-7.5"}</strong>
                </span>
              </div>
            </div>
            <Link
              href="/placement"
              className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              <span>Qayta topshirish</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ====================================================================
          2. ASOSIY 3 TA PROFIL TABLARI (TABS NAVIGATOR)
          ==================================================================== */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => switchTab("roadmap")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "roadmap"
              ? "bg-emerald-500 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.35)]"
              : "border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-white"
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>12 Oylik Xarita</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("history")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "history"
              ? "bg-emerald-500 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.35)]"
              : "border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-white"
          }`}
        >
          <HistoryIcon className="h-4 w-4" />
          <span>Dars Tarixi &amp; Konspektlar</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("questions")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "questions"
              ? "bg-emerald-500 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.35)]"
              : "border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-white"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Savollar Banki</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("progress")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "progress"
              ? "bg-emerald-500 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.35)]"
              : "border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-white"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Yutuqlar &amp; XP</span>
        </button>
      </div>

      {/* ====================================================================
          TAB 1: 12 OYLIK SHAXSIY YO'L XARITASI (ROADMAP)
          ==================================================================== */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          {/* Sarlavha va kunlik vaqt boshqaruvi */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                  <Compass className="h-3.5 w-3.5" />
                  <span>365 KUNLIK SHAXSIY TRAJEKTORIYA (48 HAFTA)</span>
                </span>
                <h2 className="mt-2 text-xl sm:text-2xl font-black text-white">
                  12 Oylik Shaxsiy Yo&apos;l Xaritangiz
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Kunlik {dailyMinutes} daqiqa • Yillik reja:{" "}
                  <strong className="text-emerald-400">{roadmapData?.annualStudyHours ?? 288} sof soat</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <JarvisVoiceButton
                  text={`12 oylik yo'l xaritangiz. Maqsadingiz: ${TARGETS.sat} va ${TARGETS.ielts}. Kuniga ${dailyMinutes} daqiqalik o'quv tartibi bilan yiliga ${roadmapData?.annualStudyHours ?? 288} sof soat shug'ullanasiz.`}
                  label="Xaritani tinglash"
                />
              </div>
            </div>

            {roadmapNotice && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 p-3 text-xs font-bold text-emerald-300">
                {roadmapNotice}
              </div>
            )}

            {/* Kunlik vaqt presetlari */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-2">
                Kunlik O&apos;qish Vaqtini Tanlang:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { m: 30, label: "30 daqiqa", desc: "Yengil marom" },
                  { m: 60, label: "60 daqiqa (1 soat)", desc: "Oltin o'rtalik" },
                  { m: 90, label: "90 daqiqa (1.5 soat)", desc: "Tezkor o'sish" },
                  { m: 120, label: "120 daqiqa (2 soat)", desc: "Intensiv tayyorgarlik" },
                ].map((preset) => (
                  <button
                    key={preset.m}
                    type="button"
                    onClick={() => handleUpdateDailyMinutes(preset.m)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      dailyMinutes === preset.m
                        ? "border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40"
                    }`}
                  >
                    <span className="block text-xs font-bold text-white">{preset.label}</span>
                    <span className="text-[11px] text-slate-400">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 12 oylik gorizontal oylar tanlash */}
            <div>
              <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Oylar Ro&apos;yxati (1-oydan 12-oygacha):
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => (
                  <button
                    key={monthNum}
                    type="button"
                    onClick={() => setSelectedMonth(monthNum)}
                    className={`rounded-xl border py-2.5 text-center transition-all ${
                      selectedMonth === monthNum
                        ? "border-emerald-400 bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-white font-bold"
                    } text-xs`}
                  >
                    <span>{monthNum}-oy</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tanlangan oyning 4 haftasi */}
            <div className="flex items-center gap-2 border-t border-white/10 pt-4">
              <span className="text-xs font-bold text-slate-400 mr-2">Haftalar:</span>
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeek(w)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedWeek === w
                      ? "bg-amber-400 text-slate-950 font-extrabold"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {w}-hafta
                </button>
              ))}
            </div>
          </div>

          {/* Tanlangan oy va haftaning kunlik vazifalari */}
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
              {selectedMonth}-Oy, {selectedWeek}-Haftaning Vazifalari ({currentMonthTasks.length} ta kunlik dars)
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentMonthTasks.map((task, idx) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    task.isCompleted
                      ? "border-emerald-400/60 bg-emerald-500/10"
                      : "border-white/10 bg-white/5 hover:border-emerald-400/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-extrabold uppercase text-amber-400">
                      {DAY_NAMES[idx % 6] ?? "Kunlik Mashq"}
                    </span>
                    <button
                      type="button"
                      className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                        task.isCompleted
                          ? "border-emerald-400 bg-emerald-500 text-slate-950"
                          : "border-white/20 bg-white/5"
                      }`}
                    >
                      {task.isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-white line-clamp-1">
                    {task.titleUz}
                  </h4>
                  <p className="mt-1 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {task.descriptionUz}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-400 border-t border-white/5 pt-2">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 text-emerald-400" />
                      <span>{task.durationMinutes} daqiqa</span>
                    </span>
                    <span className="text-amber-300 font-mono">+{task.xpReward} XP</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <Link
                href="/learn"
                className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
              >
                <span>Bugungi darsga o&apos;tish</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Xalqaro Universitet va Grantlar Talablari Atlasi */}
          <UniversityPathwayAtlas compact />
        </div>
      )}

      {/* ====================================================================
          TAB 2: DARS TARIXI VA KONSPEKTLAR (LESSON HISTORY)
          ==================================================================== */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                  <HistoryIcon className="h-3.5 w-3.5" />
                  <span>O&apos;TILGAN DARSLAR VA SHAXSIY KONSPEKTLAR</span>
                </span>
                <h2 className="mt-2 text-xl sm:text-2xl font-black text-white">
                  Dars Tarixi &amp; Muhim Formulalar
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Har bir darsning qisqacha nazariyasi, hayotiy SAT/IELTS namuna misollari va Talaba AI izohlari.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <JarvisVoiceButton
                  text="Darslar tarixi bo'limi. Bu yerda barcha o'rganilgan mavzular, formulalar va namunaviy misollar jamlangan."
                  label="Konspektni tinglash"
                />
              </div>
            </div>

            {/* Qidiruv va fanlar filtri */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Mavzu, formula yoki tushuncha qidiring..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: "Barchasi" },
                  { id: "sat-math", label: "SAT Math" },
                  { id: "sat-rw", label: "SAT RW" },
                  { id: "ielts", label: "IELTS" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHistoryFilterSubject(item.id)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      historyFilterSubject === item.id
                        ? "bg-emerald-500 text-slate-950 font-extrabold"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Darslar ro'yxati */}
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 text-sm">
                Qidiruvingiz bo&apos;yicha dars topilmadi.
              </div>
            ) : (
              filteredHistory.map((lesson) => (
                <div key={lesson.id} className="glass-card p-6 sm:p-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-300">
                          {lesson.subjectNameUz}
                        </span>
                        <span className="text-xs text-slate-400">{lesson.topicTitleUz}</span>
                      </div>
                      <h3 className="mt-1 text-base sm:text-lg font-bold text-white">
                        {lesson.titleUz}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <JarvisVoiceButton
                        text={`${lesson.titleUz}. ${lesson.summaryUz}. Nazariya: ${lesson.theoryMarkdown}`}
                        label="Tinglash"
                      />
                      <Link
                        href={`/learn/${lesson.slug}`}
                        className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 inline-flex items-center gap-1"
                      >
                        <span>Darsga o&apos;tish</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lesson.summaryUz}
                  </p>

                  {/* Asosiy Qoida / Formula Bloki */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[10px] font-mono font-extrabold uppercase text-amber-400 block mb-1">
                      Asosiy Qoida va Formulalar:
                    </span>
                    <p className="font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed">
                      {lesson.theoryMarkdown}
                    </p>
                  </div>

                  {/* Namunaviy SAT/IELTS Misoli */}
                  {lesson.examples.map((ex, exIdx) => (
                    <div key={exIdx} className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                        <span>{ex.title}</span>
                        <span className="text-slate-400 font-normal">Qadamma-qadam yechim</span>
                      </div>
                      <p className="text-white font-medium">{ex.problem}</p>
                      <ul className="space-y-1 text-slate-300 font-mono text-[11px] pl-2 border-l border-emerald-400/40">
                        {ex.stepByStepSolution.map((st, sIdx) => (
                          <li key={sIdx}>{st}</li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-amber-200/90 italic pt-1">
                        💡 <strong>Xulosa:</strong> {ex.takeaway}
                      </p>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: SAVOLLAR BANKI (QUESTION BANK)
          ==================================================================== */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>INTENSIV AMALIY SAVOLLAR BAZASI</span>
                </span>
                <h2 className="mt-2 text-xl sm:text-2xl font-black text-white">
                  Haqiqiy Imtihon Standartidagi Savollar Banki
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Digital SAT Math, Reading &amp; Writing va IELTS Academic savollari to&apos;plami.
                </p>
              </div>

              <Link
                href="/practice"
                className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Bluebook Test Rejimiga O&apos;tish</span>
              </Link>
            </div>

            {/* Qidiruv va Filtrlar */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative sm:col-span-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  placeholder="Savol qidiring..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Fan tanlash */}
              <select
                value={questionSubject}
                onChange={(e) => setQuestionSubject(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="all">Barcha Fanlar</option>
                <option value="sat-math">Digital SAT Math</option>
                <option value="sat-rw">Digital SAT Reading &amp; Writing</option>
                <option value="ielts">IELTS Academic</option>
              </select>

              {/* Qiyinlik darajasi */}
              <select
                value={questionDifficulty}
                onChange={(e) => setQuestionDifficulty(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="all">Barcha Darajalar</option>
                <option value="easy">Oson (Foundation)</option>
                <option value="medium">O&apos;rta (Medium)</option>
                <option value="hard">Qiyin (Hard 800)</option>
              </select>
            </div>
          </div>

          {/* Savollar kartochkalari */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-400 text-sm">
                Tanlangan filtrlar bo&apos;yicha savol topilmadi.
              </div>
            ) : (
              filteredQuestions.map((q, index) => {
                const isRevealed = Boolean(revealedQuestions[q.id]);
                return (
                  <div key={q.id} className="glass-card p-6 sm:p-7 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-bold">
                          Savol #{index + 1}
                        </span>
                        <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-300">
                          {q.subjectName}
                        </span>
                        <span className="text-slate-400">• {q.topicTitle}</span>
                      </div>

                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          q.difficulty === "easy"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : q.difficulty === "medium"
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {q.difficultyLabel}
                      </span>
                    </div>

                    {q.passage && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200 leading-relaxed font-serif">
                        {q.passage}
                      </div>
                    )}

                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {q.prompt}
                    </p>

                    {/* Javob variantlari */}
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`rounded-xl border p-3 text-xs flex items-center gap-2.5 transition-all ${
                            isRevealed && opt.id === q.correct
                              ? "border-emerald-400 bg-emerald-500/20 text-white font-bold"
                              : "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-lg font-bold text-xs ${
                              isRevealed && opt.id === q.correct
                                ? "bg-emerald-400 text-slate-950"
                                : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pastki tugmalar: Yechimni ko'rish va Amaliyot */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => toggleRevealAnswer(q.id)}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-amber-300 hover:border-amber-400/40 hover:bg-white/10 transition-all"
                      >
                        {isRevealed ? "Javobni Yashirish" : "To'g'ri Javob va Izohni Ko'rish"}
                      </button>

                      <Link
                        href={`/practice?subject=${q.subjectSlug}`}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                      >
                        <span>Imtihonda ishlash</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Ochilgan yechim va Talaba AI izohi */}
                    {isRevealed && (
                      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-extrabold uppercase text-[11px]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>To&apos;g&apos;ri Javob: {q.correct}</span>
                        </div>
                        <p className="text-white leading-relaxed">
                          <strong>Yechim Izohi:</strong> {q.explanation}
                        </p>
                        <p className="text-amber-200/90 italic pt-1">
                          💡 <strong>Talaba AI Maslahati:</strong> {q.hint}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: YUTUQLAR & XP (PROGRESS)
          ==================================================================== */}
      {activeTab === "progress" && (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                <Award className="h-3.5 w-3.5" />
                <span>AKADEMIK PROGRESS VA NISHONLAR</span>
              </span>
              <h2 className="mt-2 text-xl sm:text-2xl font-black text-white">
                Shaxsiy Ko&apos;rsatkichlar va Yutuqlar
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Platformadagi har bir mashq, dars va test orqali to&apos;plangan tajriba ballari (XP).
              </p>
            </div>

            <Link
              href="/progress"
              className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>To&apos;liq Tahliliy Dashboard</span>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 block">JAMI TAJRIBA</span>
              <span className="mt-2 block font-mono text-3xl font-black text-amber-300">450 XP</span>
              <span className="mt-1 block text-xs text-slate-400">2-Daraja (Izlanuvchi O&apos;quvchi)</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 block">KUNLIK SERIYA (STREAK)</span>
              <span className="mt-2 block font-mono text-3xl font-black text-emerald-400">5 Kun</span>
              <span className="mt-1 block text-xs text-slate-400">Ketma-ket to&apos;xtovsiz o&apos;qish</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 block">MAQSAD MASOFASI</span>
              <span className="mt-2 block font-mono text-3xl font-black text-cyan-300">82%</span>
              <span className="mt-1 block text-xs text-slate-400">SAT 1500+ sari yo&apos;l</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<SegmentLoading />}>
      <ProfileContent />
    </Suspense>
  );
}
