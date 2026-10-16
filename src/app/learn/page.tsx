"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  Layers,
  Compass,
  Award,
} from "lucide-react";

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
    dailyGoalMinutes: number;
  };
  subjects: SubjectSummary[];
  completedLessonIds: string[];
  earnedBadges: Array<{
    id: string;
    slug: string;
    titleUz: string;
    descriptionUz: string;
    xpBonus: number;
  }>;
}

export default function LearnCatalogPage() {
  const [data, setData] = useState<LessonsCatalogResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/lessons")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: LessonsCatalogResponse | null) => {
        setData(payload);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-fg-muted">Darslar katalogi yuklanmoqda...</p>
      </div>
    );
  }

  const { honorific, profile, subjects, completedLessonIds, earnedBadges } = data;
  const firstLessonSlug =
    subjects[0]?.topics[0]?.lessons[0]?.slug ?? "sat-math-linear-equations";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Yuqori sokin sinfxona peshlavhasi */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
              <Sparkles className="h-3.5 w-3.5" />
              <span>TINCH SINFXONA • DARS VA MASHQLAR TIZIMI</span>
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-4xl">
              <span className="text-gold">{honorific}</span>, bugungi darsga tayyormisiz?
            </h1>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">
              Har bir dars: <strong>Mavzu → Qisqa nazariya → Hayotiy misollar → Mashqlar → Tahlil</strong>{" "}
              ketma-ketligida olib boriladi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-gold/40 bg-gold-soft px-4 py-2.5 text-center">
              <div className="flex items-center gap-1.5 font-mono text-xl font-extrabold text-gold">
                <Trophy className="h-4 w-4" />
                <span>{profile?.xpTotal ?? 100} XP</span>
              </div>
              <span className="text-[11px] text-fg-muted">
                {profile?.levelNumber ?? 1}-daraja • {earnedBadges.length} ta nishon
              </span>
            </div>

            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-xs font-bold text-fg hover:border-neon sm:text-sm"
            >
              <Layers className="h-4 w-4 text-neon" />
              <span>Savollar Banki (34 ta savol)</span>
            </Link>

            <Link
              href={`/learn/${firstLessonSlug}`}
              id="start-first-lesson-btn"
              className="btn-neon inline-flex items-center gap-2 px-5 py-3 text-xs font-bold sm:text-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span>Kunlik Darsni Boshlash</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Qo'lga kiritilgan nishonlar */}
        {earnedBadges.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1 text-xs font-bold text-gold">
              <Award className="h-4 w-4" />
              <span>Nishonlaringiz:</span>
            </span>
            {earnedBadges.map((b) => (
              <span
                key={b.id}
                className="rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-bold text-gold"
              >
                🏅 {b.titleUz} (+{b.xpBonus} XP)
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Fanlar va Darslar Ro'yxati */}
      <div className="mt-8 space-y-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="glass-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-fg">{subject.nameUz}</h2>
                <p className="mt-0.5 text-xs text-fg-muted sm:text-sm">
                  {subject.descriptionUz}
                </p>
              </div>
              <Link
                href={`/practice?subject=${subject.slug}`}
                className="rounded-xl border border-border bg-elevated px-3.5 py-2 text-xs font-semibold text-neon hover:border-neon"
              >
                Shu fandan mashq ishlash →
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {subject.topics.map((topic) =>
                topic.lessons.map((lesson) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                        isDone
                          ? "border-neon/60 bg-neon-soft/15"
                          : "border-border bg-canvas/80 hover:border-neon/40"
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="rounded-md bg-elevated px-2.5 py-1 font-mono font-bold text-neon">
                            {topic.titleUz}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-mono text-fg-muted">
                              <Clock className="h-3.5 w-3.5" />
                              {lesson.estMinutes} daq
                            </span>
                            <span className="rounded-md bg-gold-soft px-2 py-0.5 font-mono font-bold text-gold">
                              +{lesson.xpReward} XP
                            </span>
                          </div>
                        </div>

                        <h3 className="mt-3 text-base font-extrabold text-fg sm:text-lg">
                          {lesson.titleUz}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-fg-muted sm:text-sm">
                          {lesson.summaryUz}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5">
                        <span className="text-xs text-fg-muted">
                          Nazariya + Misollar + {lesson._count.questions} ta mashq
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

      {/* Pastki tezkor yo'llanma */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-neon" />
          <div>
            <h3 className="text-sm font-bold text-fg">
              12 Oylik Shaxsiy Yo&apos;l Xaritangiz bilan bog&apos;langan
            </h3>
            <p className="text-xs text-fg-muted">
              Yakunlangan har bir dars avtomatik ravishda kunlik rejangiz va XP hisobingizga
              qo&apos;shiladi.
            </p>
          </div>
        </div>
        <Link
          href="/roadmap"
          className="rounded-xl border border-border bg-elevated px-4 py-2.5 text-xs font-bold text-fg hover:border-neon"
        >
          12 Oylik Xaritaga qaytish →
        </Link>
      </div>
    </div>
  );
}
