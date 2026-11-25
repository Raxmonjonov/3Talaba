"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Lock,
  Maximize2,
  Phone,
  Send,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import type { DirectionTrack, GradeOption } from "@/lib/data/methodology";
import type { UniversityItem } from "@/lib/data/universities";

export interface SubmittedApplicationInfo {
  id: string;
  fullName: string;
  phone: string;
  formattedNextWindow: string;
  createdAt: string;
}

interface StepSubmitApplicationProps {
  university: UniversityItem;
  grade: GradeOption;
  direction: DirectionTrack;
  defaultName?: string;
  userEmail: string;
  lessonStats: { completedModules: number; questionsAsked: number };
  submittedInfo: SubmittedApplicationInfo | null;
  onSubmitted: (info: SubmittedApplicationInfo) => void;
  onRewatchLesson?: () => void;
}

export function StepSubmitApplication({
  university,
  grade,
  direction,
  defaultName = "",
  userEmail,
  lessonStats,
  submittedInfo,
  onSubmitted,
  onRewatchLesson,
}: StepSubmitApplicationProps) {
  const [fullName, setFullName] = useState(submittedInfo?.fullName || defaultName);
  const [phone, setPhone] = useState(submittedInfo?.phone || "+998 ");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          universityRank: university.rank,
          gradeId: grade.id,
          directionId: direction.id,
          completedModules: lessonStats.completedModules,
          currentModuleIndex: 0,
          questionsAsked: lessonStats.questionsAsked,
          finishTodayLesson: true,
        }),
      });

      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        application?: { id: string; createdAt: string };
        status?: { formattedWindowLabel: string };
      };

      if (!res.ok || !json.ok || !json.application) {
        setErrorMsg(json.error ?? "So'rovni yuborishda xatolik yuz berdi.");
        setSubmitting(false);
        return;
      }

      onSubmitted({
        id: json.application.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        formattedNextWindow: json.status?.formattedWindowLabel ?? "Ertaga soat 18:00 – 20:00",
        createdAt: json.application.createdAt,
      });
    } catch {
      setErrorMsg("Tarmoq xatoligi yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedInfo) {
    return (
      <section className="glass-panel relative mx-auto w-full max-w-2xl rounded-[1.75rem] p-6 text-center sm:p-10">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#c6f432]/65 bg-[#c6f432]/20 text-[#c6f432] shadow-[0_0_40px_rgba(198,244,50,0.35)]">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c6f432]/40 bg-[#c6f432]/15 px-3.5 py-1 font-mono text-xs font-bold text-[#c6f432]">
          BUGUNGI DARS YAKUNLANDI
        </span>

        <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Keyingi darsga tayyorgarlik qiling
        </h1>

        <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-zinc-300">
          Sizning yagona maqsadingiz —{" "}
          <strong className="text-[#c6f432]">
            #{university.rank} {university.name}
          </strong>{" "}
          ({direction.shortTitle}, {grade.label}) qat&apos;iy biriktirildi. Darslar kuniga{" "}
          <strong className="text-white">1 marta, 2 soatdan</strong> o&apos;tiladi.
        </p>

        {/* Locked System Auto-Schedule Box */}
        <div className="glass-card mx-auto mt-6 max-w-lg space-y-2.5 rounded-2xl p-4 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[#c6f432]">
              <CalendarClock className="h-4 w-4" />
              AVTOMATIK BELGILANGAN VAQT
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
              <Lock className="h-3 w-3 text-[#c6f432]" />
              O&apos;zgartirib bo&apos;lmaydi
            </span>
          </div>
          <p className="font-mono text-base font-black text-white">
            {submittedInfo.formattedNextWindow} · 2 soat
          </p>
          <p className="text-xs text-zinc-400">
            Dars vaqti boshlanganda <strong className="text-white">{userEmail}</strong> pochtangizga{" "}
            <strong className="text-[#c6f432]">&ldquo;Dars boshlandi&rdquo;</strong> xati avtomatik
            yuboriladi.
          </p>
        </div>

        <div className="mt-7 flex justify-center">
          <Link
            href="/kabinet"
            className="btn-neon inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-extrabold"
          >
            <BookmarkCheck className="h-4 w-4" />
            <span>Shaxsiy kabinet va rejamga o&apos;tish</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel relative mx-auto w-full max-w-2xl rounded-[1.75rem] p-6 sm:p-9">
      <div className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#c6f432]/35 bg-[#c6f432]/12 px-3.5 py-1 font-mono text-xs font-bold text-[#c6f432]">
          <Send className="h-3.5 w-3.5" />
          YAKUNIY TASDIQLASH · YAGONA YO&apos;NALISH
        </span>

        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Ma&apos;lumotlaringizni tasdiqlang
        </h1>
        <p className="text-sm text-zinc-400">
          Tanlangan yagona universitet rejasi va kunlik 2 soatlik avtomatik dars jadvalini
          faollashtirish uchun ism va telefon raqamingizni tasdiqlang.
        </p>
      </div>

      <div className="glass-card mb-6 space-y-2.5 rounded-2xl p-4">
        <div className="flex items-center gap-2.5 text-sm text-white">
          <Trophy className="h-4 w-4 shrink-0 text-[#c6f432]" />
          <span className="font-bold">
            #{university.rank} {university.name} — {university.country}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-[#c6f432]" />
            {grade.label}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#c6f432]" />
            {direction.title}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="student-name" className="mb-1.5 block text-xs font-bold text-zinc-200">
            Ismingiz
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="student-name"
              type="text"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Azizbek Karimov"
              className="glass-input w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="student-phone" className="mb-1.5 block text-xs font-bold text-zinc-200">
            Telefon raqamingiz
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="student-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="glass-input w-full rounded-2xl py-3.5 pl-11 pr-4 font-mono text-sm text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-xs font-medium text-red-200">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-3 sm:flex-row sm:items-center">
          {onRewatchLesson ? (
            <button
              type="button"
              onClick={onRewatchLesson}
              className="glass-pill inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-200 sm:text-sm"
            >
              <Maximize2 className="h-4 w-4 text-[#c6f432]" />
              <span>AI Darsga qaytish</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-neon inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-extrabold"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>So&apos;rov yuborish va Jadvalni yoqish</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
