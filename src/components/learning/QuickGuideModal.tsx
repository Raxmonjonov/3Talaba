"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  HelpCircle,
  Layers,
  Lightbulb,
  Sparkles,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import {
  STUDENT_PERSONA_TRACKS,
  useLearningAdaptation,
  type LearningPaceMode,
} from "@/lib/learning/easy-adaptation";

export function QuickGuideButton() {
  const [open, setOpen] = useState(false);
  const { pace, setPace, options } = useLearningAdaptation();
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    STUDENT_PERSONA_TRACKS[0]!.id,
  );

  const currentTrack =
    STUDENT_PERSONA_TRACKS.find((t) => t.id === selectedTrackId) ??
    STUDENT_PERSONA_TRACKS[0]!;

  const handleSelectPersona = (trackId: string, recommendedPace: LearningPaceMode) => {
    setSelectedTrackId(trackId);
    setPace(recommendedPace);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#c6f432]/50 bg-[#c6f432]/15 px-3 py-2 text-xs font-extrabold text-[#c6f432] transition-all hover:bg-[#c6f432] hover:text-[#0b0b0c]"
        title="Platformadan foydalanish va oson o'rganish yo'l-yo'rig'i"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Yo&apos;l-yo&apos;riq</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-guide-title"
        >
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/15 bg-[#0b0b0c] p-5 sm:p-8 shadow-2xl space-y-6">
            {/* Yuqori qism */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c6f432]/40 bg-[#c6f432]/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#c6f432]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Barcha O&apos;quvchilar Uchun Oson Qo&apos;llanma
                </span>
                <h2 id="quick-guide-title" className="text-xl sm:text-2xl font-black text-white">
                  Saytga 2 Daqiqada Moslashish va To&apos;g&apos;ri O&apos;rganish Yo&apos;l-Yo&apos;rig&apos;i
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Darajangiz qanday bo&apos;lishidan qat&apos;i nazar, o&apos;zingizga mos rejimni tanlang — barcha dars va metodlar sizga moslashadi.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:border-[#c6f432] hover:text-white"
                aria-label="Yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 1. Tushuntirish Usulini Tanlash (Global Moslashuv) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#c6f432]">
                  1-Qadam: Sizga qanday tushuntirish usuli qulay? (Sayt bo&apos;ylab saqlanadi)
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {options.map((opt) => {
                  const active = pace === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPace(opt.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-[#c6f432] bg-[#c6f432]/15 shadow-[0_0_24px_rgba(198,244,50,0.2)]"
                          : "border-white/10 bg-[#121214] hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-[#c6f432]/20 px-2 py-0.5 font-mono text-[10px] font-black text-[#c6f432]">
                          {opt.badge}
                        </span>
                        {active && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#c6f432] px-2 py-0.5 text-[10px] font-black text-[#0b0b0c]">
                            <CheckCircle2 className="h-3 w-3" />
                            Faol
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-black text-white">{opt.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">{opt.summary}</p>
                      <p className="mt-2 border-t border-white/10 pt-2 font-mono text-[11px] text-[#c6f432]">
                        ⏱ {opt.dailyPlan}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Holatingizga Mos Aniq 4 Qadamli Yo'l */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                2-Qadam: Hozirgi holatingizni tanlang — aniq harakatlar ketma-ketligi chiqadi:
              </span>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {STUDENT_PERSONA_TRACKS.map((track) => {
                  const isSelected = track.id === currentTrack.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => handleSelectPersona(track.id, track.recommendedPace)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-[#c6f432] bg-[#c6f432] text-[#0b0b0c] font-black"
                          : "border-white/10 bg-[#121214] text-white hover:border-[#c6f432]/50"
                      }`}
                    >
                      <span className="block text-xs font-extrabold leading-snug">{track.title}</span>
                      <span
                        className={`mt-1 block text-[11px] leading-snug ${
                          isSelected ? "text-[#0b0b0c]/80 font-semibold" : "text-slate-400"
                        }`}
                      >
                        {track.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-1">
                {currentTrack.steps.map((s) => (
                  <div
                    key={s.step}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-[#c6f432] px-2 py-0.5 font-mono text-xs font-black text-[#0b0b0c]">
                          {s.step}-QADAM
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{s.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{s.detail}</p>
                    </div>

                    <Link
                      href={s.href}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#c6f432] hover:underline"
                    >
                      <span>{s.actionText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Oltin Qoidalar */}
            <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-white/10 bg-[#121214] p-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Volume2 className="h-4 w-4 shrink-0 text-[#c6f432] mt-0.5" />
                <div>
                  <strong className="text-white block">O&apos;qishga erinsangiz — tinglang:</strong>
                  <span className="text-slate-300">Har bir dars va misol ustida «Tinglash» ovozli tugmasi bor.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Lightbulb className="h-4 w-4 shrink-0 text-[#c6f432] mt-0.5" />
                <div>
                  <strong className="text-white block">Qiynalsangiz — «Maslahat» bosing:</strong>
                  <span className="text-slate-300">Mashqlarda «50/50» va «💡 Maslahat» javobni aytmay yo&apos;l ko&apos;rsatadi.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Compass className="h-4 w-4 shrink-0 text-[#c6f432] mt-0.5" />
                <div>
                  <strong className="text-white block">Kunlik rejangiz — Profilda:</strong>
                  <span className="text-slate-300">«Profil» tugmasi ichida 12 Oylik Xarita, Dars Tarixi va Savollar Banki turadi.</span>
                </div>
              </div>
            </div>

            {/* Pastki harakat qatori */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Zap className="h-4 w-4 text-[#c6f432]" />
                <span>
                  Tanlangan rejim: <strong className="text-white">{options.find((o) => o.id === pace)?.title}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10"
                >
                  Tushunarli, yopish
                </button>
                <Link
                  href={currentTrack.firstHref}
                  onClick={() => setOpen(false)}
                  className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{currentTrack.firstButtonLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
