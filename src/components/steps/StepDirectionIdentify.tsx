"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Atom,
  BookOpen,
  Briefcase,
  Check,
  Cog,
  Compass,
  Cpu,
  HeartPulse,
  Maximize2,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  APTITUDE_QUESTIONS,
  DIRECTION_TRACKS,
  rankDirectionsByAnswers,
  type DirectionIconKey,
  type DirectionTrack,
  type GradeOption,
} from "@/lib/data/methodology";
import type { UniversityItem } from "@/lib/data/universities";

interface StepDirectionIdentifyProps {
  university: UniversityItem;
  grade: GradeOption;
  selectedDirection: DirectionTrack | null;
  onSelectDirection: (direction: DirectionTrack) => void;
  onBack: () => void;
  onStartFullscreenLesson: () => void;
}

const DIRECTION_ICONS: Record<DirectionIconKey, typeof Cpu> = {
  cpu: Cpu,
  cog: Cog,
  briefcase: Briefcase,
  heartPulse: HeartPulse,
  scale: Scale,
  atom: Atom,
  compass: Compass,
  bookOpen: BookOpen,
};

export function StepDirectionIdentify({
  university,
  grade,
  selectedDirection,
  onSelectDirection,
  onBack,
  onStartFullscreenLesson,
}: StepDirectionIdentifyProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answeredCount = Object.keys(answers).length;
  const ranked = useMemo(() => rankDirectionsByAnswers(answers), [answers]);

  const handleAnswer = (questionId: string, optionId: string) => {
    const updated = { ...answers, [questionId]: optionId };
    setAnswers(updated);
    const nextRanked = rankDirectionsByAnswers(updated);
    if (nextRanked[0]) {
      onSelectDirection(nextRanked[0].track);
    }
  };

  return (
    <section className="glass-panel relative mx-auto w-full max-w-5xl rounded-[1.75rem] p-5 sm:p-8">
      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c6f432]/35 bg-[#c6f432]/12 px-3.5 py-1 font-mono text-xs font-bold text-[#c6f432]">
            <Sparkles className="h-3.5 w-3.5" />
            3-BOSQICH · YO&apos;NALISHNI ANIQLASH
          </span>
          <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-white">
            #{university.rank} {university.name}
          </span>
          <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-[#c6f432]">
            {grade.label}
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Qobiliyatingizga eng mos yo&apos;nalishni aniqlang
        </h1>
        <p className="max-w-3xl text-sm text-zinc-400">
          3 ta qisqa savolga javob bering — tizim sizga eng mos yo&apos;nalishni aniqlab beradi
          (yoki pastdan o&apos;zingiz xohlagan sohani bevosita belgilang).
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {APTITUDE_QUESTIONS.map((q, idx) => (
          <div key={q.id} className="glass-card flex flex-col rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#c6f432]/50 bg-[#c6f432]/15 font-mono text-xs font-bold text-[#c6f432]">
                {idx + 1}
              </span>
              <h2 className="text-xs font-bold leading-snug text-white sm:text-sm">{q.question}</h2>
            </div>

            <div className="space-y-1.5">
              {q.options.map((opt) => {
                const chosen = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAnswer(q.id, opt.id)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs leading-snug transition ${
                      chosen
                        ? "border border-[#c6f432]/70 bg-[#c6f432]/20 font-bold text-white shadow-[0_0_16px_rgba(198,244,50,0.2)]"
                        : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-200">
          {answeredCount > 0
            ? "Aniqlangan mos yo'nalishlar (istalganini tasdiqlang):"
            : "Yoki yo'nalishni to'g'ridan-to'g'ri tanlang:"}
        </h3>
        {answeredCount > 0 && (
          <span className="font-mono text-xs font-bold text-[#c6f432]">
            Diagnostika: {answeredCount} / {APTITUDE_QUESTIONS.length}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(answeredCount > 0
          ? ranked
          : DIRECTION_TRACKS.map((track) => ({ track, score: 0, matchPercent: 0 }))
        ).map(({ track, matchPercent }, idx) => {
          const Icon = DIRECTION_ICONS[track.iconKey];
          const isSelected = selectedDirection?.id === track.id;
          const isTopRecommendation = answeredCount > 0 && idx === 0;

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelectDirection(track)}
              className={`group flex flex-col justify-between gap-3 rounded-2xl p-4 text-left ${
                isSelected ? "glass-card-selected" : "glass-card"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c6f432]/35 bg-[#c6f432]/12 text-[#c6f432]">
                    <Icon className="h-4 w-4" />
                  </span>

                  <div className="flex items-center gap-1.5">
                    {answeredCount > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${
                          isTopRecommendation
                            ? "bg-[#c6f432] text-[#0b0b0c]"
                            : "border border-white/15 bg-white/10 text-zinc-200"
                        }`}
                      >
                        {matchPercent}% mos
                      </span>
                    )}
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-[#c6f432] bg-[#c6f432] text-[#0b0b0c]"
                          : "border-white/15 bg-white/5 text-transparent"
                      }`}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold leading-snug text-white">{track.title}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">{track.careerOutcomes}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {track.coreSubjects.map((subj) => (
                  <span
                    key={subj}
                    className="rounded-md border border-white/12 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-200"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-white/12 pt-5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onBack}
          className="glass-pill inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Orqaga</span>
        </button>

        <button
          type="button"
          disabled={!selectedDirection}
          onClick={onStartFullscreenLesson}
          className="btn-neon inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-extrabold"
        >
          <Maximize2 className="h-4 w-4" />
          <span>Fullscreen AI Darsni Boshlash</span>
        </button>
      </div>
    </section>
  );
}
