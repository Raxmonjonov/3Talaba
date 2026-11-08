"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Layers,
  Compass,
  Sigma,
  FileText,
  Brain,
} from "lucide-react";
import { ChalkboardClassroom } from "@/components/classroom/ChalkboardClassroom";
import { UniversityPathwayAtlas } from "@/components/curriculum/UniversityPathwayAtlas";
import { MATH_15_MODULES } from "@/lib/curriculum/math-modules-data";
import { SEED_CURRICULUM } from "@/lib/curriculum/seed-content";
import {
  buildChalkboardFromLesson,
  buildChalkboardFromMathModule,
} from "@/lib/learning/chalkboard-builder";
import { useLearningAdaptation } from "@/lib/learning/easy-adaptation";

interface LessonSummary {
  id: string;
  slug: string;
  titleUz: string;
  summaryUz: string;
  estMinutes: number;
  xpReward: number;
  _count: { questions: number };
}

interface TopicSummary {
  id: string;
  slug: string;
  titleUz: string;
  descriptionUz: string;
  level: string;
  estHours: number;
  lessons: LessonSummary[];
}

interface SubjectSummary {
  id: string;
  slug: string;
  nameUz: string;
  descriptionUz: string;
  color: string;
  topics: TopicSummary[];
}

interface LessonsCatalogResponse {
  honorific: string;
  profile?: {
    xpTotal: number;
    levelNumber: number;
    currentStreakDays: number;
  };
  subjects: SubjectSummary[];
  completedLessonIds: string[];
  earnedBadges: Array<{ id: string; titleUz: string; xpBonus: number }>;
}

export default function LearnIndexPage() {
  const router = useRouter();
  const { pace, setPace, activeOption, options } = useLearningAdaptation();
  const [data, setData] = useState<LessonsCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string>("all");
  const [activeBoardId, setActiveBoardId] = useState<string>(
    SEED_CURRICULUM[0]?.topic.lesson.slug ?? "sat-math-linear-equations"
  );

  // Barcha dars va matematika modullarini yagona interaktiv doska uchun yig'amiz
  const allBoardSlides = useMemo(() => {
    const curriculumSlides = SEED_CURRICULUM.map((s) =>
      buildChalkboardFromLesson({
        slug: s.topic.lesson.slug,
        subjectName: s.nameUz,
        lessonTitle: s.topic.lesson.titleUz,
        theoryMarkdown: s.topic.lesson.theoryMarkdown,
        examples: s.topic.lesson.examples,
      })
    );
    const mathSlides = MATH_15_MODULES.filter((m) => m.id !== 1).map((m) =>
      buildChalkboardFromMathModule(m)
    );
    return [...curriculumSlides, ...mathSlides];
  }, []);

  const currentBoardSlide = useMemo(
    () =>
      allBoardSlides.find((s) => s.id === activeBoardId) ?? allBoardSlides[0]!,
    [activeBoardId, allBoardSlides]
  );

  useEffect(() => {
    fetch("/api/lessons")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <span className="text-sm font-semibold">Darslar katalogi yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  const { honorific, subjects, completedLessonIds } = data;
  const firstLessonSlug =
    subjects[0]?.topics[0]?.lessons[0]?.slug ?? "sat-math-linear-equations";

  const totalLessons = subjects.reduce(
    (acc, s) => acc + s.topics.reduce((tAcc, t) => tAcc + t.lessons.length, 0),
    0
  );
  const completedCount = completedLessonIds.length;

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-4 sm:px-6 lg:px-10 space-y-6">
      {/* JONLI DOSKA VA ANIMATSIYALI AI USTOZ: Faqat doskadagi mavzu almashadi! */}
      <ChalkboardClassroom
        slide={currentBoardSlide}
        availableSlides={allBoardSlides}
        onSelectSlide={(nextId) => setActiveBoardId(nextId)}
        honorific={honorific}
        lessonSlug={
          SEED_CURRICULUM.some((s) => s.topic.lesson.slug === currentBoardSlide.id)
            ? currentBoardSlide.id
            : undefined
        }
        onProceedNext={() => {
          const isCurriculumLesson = SEED_CURRICULUM.some(
            (s) => s.topic.lesson.slug === currentBoardSlide.id
          );
          if (isCurriculumLesson) {
            router.push(`/learn/${currentBoardSlide.id}`);
          } else {
            router.push("/math");
          }
        }}
        proceedLabel="Misol va Mashqlarni Ishlash"
      />

      {/* Yuqori sokin sinfxona peshlavhasi */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AKADEMIK KURSLAR • DARS VA AMALIYOT</span>
            </span>
            <h1 className="text-2xl font-black text-white sm:text-4xl tracking-tight">
              <span className="text-amber-300">{honorific}</span>, bugungi darslar rejasi
            </h1>
            <p className="text-xs text-slate-300 sm:text-sm max-w-4xl leading-relaxed">
              Har bir dars: <strong>Mavzu → Qisqa nazariya → Hayotiy misollar → Mashqlar → Tahlil</strong>{" "}
              ketma-ketligida tuzilgan. Talaba AI ovozli agenti darsni tushuntirishga yordam beradi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-pill rounded-2xl px-5 py-3 text-center">
              <span className="block font-mono text-xl font-black text-emerald-400">
                {completedCount} / {totalLessons}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Tugatilgan darslar
              </span>
            </div>

            <Link
              href="/history"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-white hover:border-emerald-400/50 hover:bg-white/10 transition-colors sm:text-sm"
            >
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Dars Tarixi &amp; Matnlar</span>
            </Link>

            <Link
              href="/math"
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-300 hover:border-amber-300 transition-colors sm:text-sm"
            >
              <Sigma className="h-4 w-4" />
              <span>Algebra &amp; Geometriya</span>
            </Link>

            <Link
              href={`/learn/${firstLessonSlug}`}
              id="start-first-lesson-btn"
              className="btn-neon inline-flex items-center gap-2 px-6 py-3 text-xs font-bold shadow-xl sm:text-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span>Darsni Boshlash</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Tezkor Filtrlar va Tushuntirish Moslagichi */}
        <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
          <div className="grid gap-3 md:grid-cols-3 rounded-2xl border border-[#c6f432]/30 bg-[#0b0b0c] p-4 text-xs">
            <div>
              <span className="font-mono font-black text-[#c6f432] block">1-QADAM: REJIM TANLANG</span>
              <p className="mt-1 text-slate-300">
                Agar endi boshlagan bo&apos;lsangiz, <strong className="text-white">«0 dan Sodda Tilda»</strong> rejimini yoqing.
              </p>
            </div>
            <div>
              <span className="font-mono font-black text-[#c6f432] block">2-QADAM: DARSNI OCHING</span>
              <p className="mt-1 text-slate-300">
                Har bir dars <strong className="text-white">Qoida → Namuna → Mashq → Tahlil</strong> bo&apos;yicha yetaklaydi.
              </p>
            </div>
            <div>
              <span className="font-mono font-black text-[#c6f432] block">3-QADAM: OVOZ VA AI YORDAM</span>
              <p className="mt-1 text-slate-300">
                Dars ichida <strong className="text-white">«Tinglash»</strong> va <strong className="text-white">«Sodda tushuntir»</strong> tugmalarini bosing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Fan filtri */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-400 mr-1">Yo&apos;nalish filtri:</span>
              <button
                type="button"
                onClick={() => setSelectedSubjectSlug("all")}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                  selectedSubjectSlug === "all"
                    ? "bg-[#c6f432] text-[#0b0b0c]"
                    : "glass-pill text-slate-300 hover:text-white"
                }`}
              >
                Barcha fanlar ({subjects.length})
              </button>
              {subjects.map((subj) => (
                <button
                  key={subj.slug}
                  type="button"
                  onClick={() => setSelectedSubjectSlug(subj.slug)}
                  className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                    selectedSubjectSlug === subj.slug
                      ? "bg-[#c6f432] text-[#0b0b0c]"
                      : "glass-pill text-slate-300 hover:text-white"
                  }`}
                >
                  {subj.nameUz}
                </button>
              ))}
            </div>

            {/* Tushuntirish darajasi */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-semibold">Uslub ({activeOption.badge}):</span>
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPace(opt.id)}
                  className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                    pace === opt.id
                      ? "border border-[#c6f432] bg-[#c6f432]/20 text-[#c6f432]"
                      : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {opt.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 0 dan Universitet va 100% Grantgacha 6 Bosqichli Yo'l Xaritasi va Grantlar Atlasi */}
      <UniversityPathwayAtlas />

      {/* Fanlar va Darslar Ro'yxati */}
      <div className="space-y-8">
        {subjects
          .filter((s) => selectedSubjectSlug === "all" || s.slug === selectedSubjectSlug)
          .map((subject) => (
          <div key={subject.id} className="glass-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{subject.nameUz}</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300">
                  {subject.descriptionUz}
                </p>
              </div>
              <Link
                href={`/practice?subject=${subject.slug}`}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-emerald-400 hover:border-emerald-400/50 hover:bg-white/10 transition-colors"
              >
                Ushbu fandan mashqlar →
              </Link>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {subject.topics.map((topic) =>
                topic.lessons.map((lesson) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className={`flex flex-col justify-between rounded-2xl border p-5 transition-all backdrop-blur-xl ${
                        isDone
                          ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(198,244,50,0.15)]"
                          : "border-white/10 bg-white/[0.03] hover:border-emerald-400/40 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="glass-pill rounded-lg px-2.5 py-1 font-mono font-bold text-emerald-300">
                            {topic.titleUz}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            {lesson.estMinutes} daqiqa
                          </span>
                        </div>

                        <h3 className="mt-3 text-base sm:text-lg font-black text-white">
                          {lesson.titleUz}
                        </h3>
                        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                          {lesson.summaryUz}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <Brain className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Talaba AI audio &amp; {lesson._count.questions} ta mashq</span>
                        </span>
                        <Link
                          href={`/learn/${lesson.slug}`}
                          className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Qayta ko&apos;rish</span>
                            </>
                          ) : (
                            <>
                              <span>Darsni ochish</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pastki yo'llanma */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              12 Oylik Shaxsiy Yo&apos;l Xaritangiz bilan bog&apos;langan
            </h3>
            <p className="text-xs text-slate-400">
              Qaysi ketma-ketlikda o&apos;qish kerakligini xaritada ko&apos;ring.
            </p>
          </div>
        </div>

        <Link
          href="/profile?tab=roadmap"
          className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
        >
          <span>Profil → Xaritaga o&apos;tish</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
