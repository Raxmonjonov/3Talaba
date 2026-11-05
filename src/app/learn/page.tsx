"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
import { UniversityPathwayAtlas } from "@/components/curriculum/UniversityPathwayAtlas";

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
  const [data, setData] = useState<LessonsCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="mx-auto w-full max-w-[1480px] px-4 py-8 sm:px-6 lg:px-10 space-y-8">
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

        {/* Tezkor Filtrlar va Asboblar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Yo&apos;nalishlar:</span>
            <span className="glass-pill rounded-lg px-2.5 py-1 text-emerald-300 font-bold">
              Digital SAT (800)
            </span>
            <span className="glass-pill rounded-lg px-2.5 py-1 text-amber-300 font-bold">
              IELTS Academic (7.5+)
            </span>
            <span className="glass-pill rounded-lg px-2.5 py-1 text-cyan-300 font-bold">
              Algebra &amp; Geometriya
            </span>
          </div>

          <Link
            href="/profile?tab=questions"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Savollar Bankiga o&apos;tish →</span>
          </Link>
        </div>
      </div>

      {/* 0 dan Universitet va 100% Grantgacha 6 Bosqichli Yo'l Xaritasi va Grantlar Atlasi */}
      <UniversityPathwayAtlas />

      {/* Fanlar va Darslar Ro'yxati */}
      <div className="space-y-8">
        {subjects.map((subject) => (
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
