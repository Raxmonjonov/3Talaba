"use client";

import { ArrowLeft, ArrowRight, CalendarClock, Check, GraduationCap } from "lucide-react";
import { GRADE_OPTIONS, type GradeOption } from "@/lib/data/methodology";
import type { UniversityItem } from "@/lib/data/universities";

interface StepGradeSelectProps {
  university: UniversityItem;
  selectedGrade: GradeOption | null;
  onSelect: (grade: GradeOption) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepGradeSelect({
  university,
  selectedGrade,
  onSelect,
  onBack,
  onNext,
}: StepGradeSelectProps) {
  return (
    <section className="glass-panel relative mx-auto w-full max-w-4xl rounded-[1.75rem] p-5 sm:p-8">
      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c6f432]/35 bg-[#c6f432]/12 px-3.5 py-1 font-mono text-xs font-bold text-[#c6f432]">
            <GraduationCap className="h-3.5 w-3.5" />
            2-BOSQICH · SINF TANLASH
          </span>
          <span className="glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold text-white">
            #{university.rank} {university.name}
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Hozir nechanchi sinfda o&apos;qiysiz?
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Qabulgacha qolgan vaqtingizga qarab AI ustoz til sertifikati, imtihonlar va amaliy loyiha
          rejasini aniq taqsimlab beradi.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {GRADE_OPTIONS.map((grade) => {
          const isSelected = selectedGrade?.id === grade.id;
          return (
            <button
              key={grade.id}
              type="button"
              onClick={() => onSelect(grade)}
              className={`group flex flex-col justify-between gap-3 rounded-2xl p-4 text-left ${
                isSelected ? "glass-card-selected" : "glass-card"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">{grade.label}</span>
                    <span className="rounded-full border border-[#c6f432]/35 bg-[#c6f432]/12 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#c6f432]">
                      {grade.stageBadge}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">{grade.shortDesc}</p>
                </div>

                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                    isSelected
                      ? "border-[#c6f432] bg-[#c6f432] text-[#0b0b0c]"
                      : "border-white/15 bg-white/5 text-transparent group-hover:border-white/30"
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#c6f432]">
                <CalendarClock className="h-3.5 w-3.5" />
                <span>{grade.yearsUntilApply}</span>
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
          disabled={!selectedGrade}
          onClick={onNext}
          className="btn-neon inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold"
        >
          <span>Yo&apos;nalishni aniqlashga o&apos;tish</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
