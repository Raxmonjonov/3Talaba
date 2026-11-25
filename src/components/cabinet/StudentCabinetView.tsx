"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  Lock,
  MailCheck,
  Maximize2,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import type { EvaluatedEnrollmentStatus } from "@/lib/applications/store";
import { DIRECTION_TRACKS, getCountryProfile } from "@/lib/data/methodology";
import { CampusFooter, CampusNavbar, DynamicAmbientBackground } from "@/components/layout/CampusChrome";

interface StudentCabinetViewProps {
  user: SessionUser;
  status: EvaluatedEnrollmentStatus | null;
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function StudentCabinetView({ user, status }: StudentCabinetViewProps) {
  const router = useRouter();
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const enrollment = status?.enrollment ?? null;

  useEffect(() => {
    if (!enrollment) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      const startMs = new Date(enrollment.nextLessonStartAt).getTime();
      const endMs = new Date(enrollment.nextLessonEndAt).getTime();

      // If lesson window just opened right now, trigger email notification & refresh UI!
      if (current >= startMs && current < endMs && !status?.isLessonOpenNow) {
        void fetch("/api/cron/lesson-notifications").finally(() => {
          router.refresh();
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [enrollment, router, status?.isLessonOpenNow]);

  const toggleTask = (key: string) => {
    setCheckedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const liveStartMs = enrollment ? new Date(enrollment.nextLessonStartAt).getTime() : 0;
  const liveEndMs = enrollment ? new Date(enrollment.nextLessonEndAt).getTime() : 0;
  const isOpenLive = enrollment ? nowMs >= liveStartMs && nowMs < liveEndMs : false;
  const msUntilOpen = enrollment && !isOpenLive ? Math.max(0, liveStartMs - nowMs) : 0;
  const msRemainingInLesson = enrollment && isOpenLive ? Math.max(0, liveEndMs - nowMs) : 0;

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden">
      <DynamicAmbientBackground isAuthenticated={true} />
      <CampusNavbar user={user} />

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#c6f432]">
              SHAXSIY O&apos;QUV KABINETI · YAGONA MAQSAD
            </span>
            <h1 className="text-lg font-black text-white sm:text-xl">
              {user.name} · Kunlik AI Dars Jadvali
            </h1>
          </div>

          <span className="glass-pill inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold text-zinc-200">
            <Lock className="h-3.5 w-3.5 text-[#c6f432]" />
            <span>1 kunda 1 marta · 2 soat</span>
          </span>
        </div>

        {!enrollment ? (
          <section className="glass-panel rounded-[1.75rem] p-8 text-center sm:p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c6f432]/40 bg-[#c6f432]/15 text-[#c6f432]">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-white sm:text-2xl">
              Maqsadli universitetingiz hali tanlanmagan
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Top 300 universitetdan bitta yagona maqsadni tanlab, birinchi 2 soatlik AI darsingizni
              boshlang (tanlov faqat 1 marta amalga oshiriladi).
            </p>
            <Link
              href="/dars"
              className="btn-neon mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Universitet tanlash va Darsni boshlash</span>
            </Link>
          </section>
        ) : (
          (() => {
            const profile = getCountryProfile(enrollment.country);
            const track =
              DIRECTION_TRACKS.find((d) => d.id === enrollment.directionId) ?? DIRECTION_TRACKS[0]!;

            const checklist = [
              `Maktab chorak baholarini beshga tortish (${track.coreSubjects.join(", ")})`,
              `Til sertifikati maqsadi: ${profile.minIelts}`,
              `Kirish imtihoni tayyorgarligi: ${profile.examBadge}`,
              `Amaliy loyiha (Spike): ${track.spikeProjectIdea}`,
              `Maktab yoki jamoa doirasida liderlik to'garagi ochish`,
              `Personal Statement xati va 2 nafar ustozdan tavsiyanoma olish`,
              `Grant va stipendiya hujjatlari (${profile.grantBadge})`,
            ];

            return (
              <section className="glass-panel space-y-6 rounded-[1.75rem] p-6 sm:p-8">
                {/* SINGLE LOCKED UNIVERSITY HEADER */}
                <div className="flex flex-col justify-between gap-4 border-b border-white/12 pb-5 sm:flex-row sm:items-center">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-[#c6f432]/45 bg-[#c6f432]/15 px-2.5 py-0.5 font-bold text-[#c6f432]">
                        <Trophy className="h-3.5 w-3.5" />#{enrollment.universityRank}
                      </span>
                      <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-0.5 font-semibold text-white">
                        {enrollment.country}
                      </span>
                      <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-0.5 text-zinc-300">
                        {enrollment.grade}
                      </span>
                      <span className="rounded-lg border border-[#c6f432]/30 bg-[#c6f432]/10 px-2.5 py-0.5 text-[#c6f432]">
                        {enrollment.currentDayNumber}-kun darsi
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-white sm:text-2xl">
                      {enrollment.universityName}
                    </h2>
                    <p className="flex items-center gap-2 text-xs font-semibold text-zinc-300 sm:text-sm">
                      <GraduationCap className="h-4 w-4 text-[#c6f432]" />
                      <span>{enrollment.directionTitle}</span>
                    </p>
                  </div>

                  <div className="glass-pill rounded-2xl px-4 py-2.5 text-center">
                    <p className="text-[11px] text-zinc-400">Dars davomiyligi</p>
                    <p className="font-mono text-sm font-black text-[#c6f432]">2 soat (120 daq)</p>
                  </div>
                </div>

                {/* DAILY LESSON SCHEDULE & LOCK BANNER */}
                {isOpenLive ? (
                  <div className="glass-card-selected flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase text-[#c6f432]">
                        <span className="h-2.5 w-2.5 animate-ping rounded-full bg-[#c6f432]" />
                        DARS BOSHLANDI · KIRISH OCHIQ
                      </span>
                      <p className="text-lg font-black text-white">
                        Bugungi 2 soatlik AI darsingiz faol holatda!
                      </p>
                      <p className="font-mono text-xs text-zinc-300">
                        Dars tugashigacha qolgan vaqt:{" "}
                        <strong className="text-[#c6f432]">
                          {formatCountdown(msRemainingInLesson)}
                        </strong>
                      </p>
                    </div>

                    <Link
                      href="/dars"
                      className="btn-neon inline-flex shrink-0 items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold"
                    >
                      <Maximize2 className="h-4 w-4" />
                      <span>2 Soatlik AI Darsga Kirish</span>
                    </Link>
                  </div>
                ) : (
                  <div className="glass-card space-y-4 rounded-2xl border-[#c6f432]/35 p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c6f432]/40 bg-[#c6f432]/12 px-3 py-1 font-mono text-[11px] font-bold text-[#c6f432]">
                          <Clock className="h-3.5 w-3.5" />
                          KUNIGA 1 MARTA · AVTOMATIK JADVAL
                        </span>
                        <h3 className="text-xl font-black text-white sm:text-2xl">
                          Keyingi darsga tayyorgarlik qiling
                        </h3>
                      </div>

                      <div className="glass-pill rounded-2xl px-4 py-3 text-center">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Boshlanishigacha
                        </span>
                        <span className="font-mono text-xl font-black text-[#c6f432]">
                          {formatCountdown(msUntilOpen)}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span className="inline-flex items-center gap-1.5 font-semibold">
                            <CalendarClock className="h-3.5 w-3.5 text-[#c6f432]" />
                            Keyingi dars vaqti (Avto):
                          </span>
                          <Lock className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                        <p className="mt-1 font-mono text-sm font-bold text-white">
                          {status?.formattedWindowLabel} (2 soat)
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                          <MailCheck className="h-3.5 w-3.5 text-[#c6f432]" />
                          <span>Email xabarnoma:</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-200">
                          Vaqt bo&apos;lganda <strong className="text-white">{user.email}</strong>{" "}
                          manziliga <strong className="text-[#c6f432]">&ldquo;Dars boshlandi&rdquo;</strong>{" "}
                          xati yuboriladi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7-ELEMENT PREPARATION CHECKLIST */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#c6f432]">
                    <Award className="h-4 w-4" />
                    <span>Keyingi darsgacha amaliy tayyorgarlik vazifalari</span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {checklist.map((item, idx) => {
                      const key = `${enrollment.id}-${idx}`;
                      const done = Boolean(checkedTasks[key]);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleTask(key)}
                          className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-left text-xs leading-relaxed transition ${
                            done ? "glass-card-selected text-white" : "glass-card text-zinc-200"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c6f432]" />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                          )}
                          <span className={done ? "line-through opacity-80" : ""}>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })()
        )}
      </main>

      <CampusFooter />
    </div>
  );
}
