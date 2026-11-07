"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  Eye,
  Headphones,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  STUDENT_PERSONA_TRACKS,
  useLearningAdaptation,
} from "@/lib/learning/easy-adaptation";

const FOUR_EASY_METHODS = [
  {
    num: "01",
    icon: Headphones,
    title: "1. Ko'rish va Ovozli Tinglash",
    desc: "Uzun va zerikarli kitob matnlari yo'q. Har bir qoida qisqa kartochkaga ajratilgan va bir tugma bilan o'zbek tilida ovozli tushuntiriladi.",
  },
  {
    num: "02",
    icon: Eye,
    title: "2. Jonli Grafikda His Qilish",
    desc: "Formulani quruq yodlamaysiz — slayderni surganingizda chiziq, parabola va uchburchak ko'z oldingizda o'zgarib, sababini ko'rsatadi.",
  },
  {
    num: "03",
    icon: Lightbulb,
    title: "3. Sokratik Ishora va 50/50 Yordam",
    desc: "Misolga tiqilib qolsangiz, tizim darhol tayyor javobni bermaydi — 50/50 va yo'naltiruvchi ishora bilan o'zingiz topishingizga o'rgatadi.",
  },
  {
    num: "04",
    icon: Brain,
    title: "4. Darajangizga Mos Talaba AI",
    desc: "«0 dan sodda tilda» rejimini yoqsangiz — hayotiy misol bilan, «Imtihon siri» rejimida esa 10 soniyalik SAT/IELTS usuli bilan o'rgatadi.",
  },
];

export function EasyOnboardingGuideSection() {
  const { pace, setPace, options } = useLearningAdaptation();
  const [activePersonaId, setActivePersonaId] = useState<string>(
    STUDENT_PERSONA_TRACKS[0]!.id,
  );

  const activeTrack =
    STUDENT_PERSONA_TRACKS.find((t) => t.id === activePersonaId) ??
    STUDENT_PERSONA_TRACKS[0]!;

  return (
    <section
      id="easy-guide"
      className="space-y-8"
      aria-labelledby="easy-guide-heading"
    >
      <div className="glass-card p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Sarlavha + Tushuntirish Rejimi */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c6f432]/40 bg-[#c6f432]/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#c6f432]">
              <Compass className="h-3.5 w-3.5" />
              Barcha O&apos;quvchilar Uchun Tez Moslashuv Tizimi
            </span>
            <h2
              id="easy-guide-heading"
              className="text-2xl sm:text-4xl font-black tracking-tight text-white"
            >
              Qanday darajada bo&apos;lsangiz ham —{" "}
              <span className="text-[#c6f432]">aniq yo&apos;l-yo&apos;riq</span> tayyor
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Platformaga birinchi marta kirgan o&apos;quvchi ham adashib qolmasligi uchun barcha metodlar{" "}
              <strong className="text-white">3 xil tushuntirish darajasiga</strong> va{" "}
              <strong className="text-white">4 qadamli aniq yo&apos;riqnomaga</strong> moslashtirilgan.
            </p>
          </div>

          {/* 3 Rejim Switcher */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Darslarni tushuntirish uslubi:
            </span>
            <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-[#0b0b0c] p-1.5">
              {options.map((opt) => {
                const isSelected = pace === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPace(opt.id)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${
                      isSelected
                        ? "bg-[#c6f432] text-[#0b0b0c] shadow-sm"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {opt.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Holat tanlash: 4 xil o'quvchi turi */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#c6f432]">
            <Sparkles className="h-4 w-4" />
            <span>O&apos;zingizga eng yaqin holatni bosing — tizim sizga shaxsiy boshlash yo&apos;lini ko&apos;rsatadi:</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STUDENT_PERSONA_TRACKS.map((track) => {
              const selected = track.id === activeTrack.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => {
                    setActivePersonaId(track.id);
                    setPace(track.recommendedPace);
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? "border-[#c6f432] bg-[#c6f432]/15 shadow-[0_0_25px_rgba(198,244,50,0.2)]"
                      : "border-white/10 bg-[#0b0b0c]/80 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#c6f432]">
                      Kuniga ~{track.dailyMinutes} daq
                    </span>
                    {selected && <CheckCircle2 className="h-4 w-4 text-[#c6f432]" />}
                  </div>
                  <h3 className="mt-2 text-sm font-black text-white leading-snug">
                    {track.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {track.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Tanlangan o'quvchi uchun 1 -> 2 -> 3 -> 4 qadamlar */}
          <div className="rounded-2xl border border-[#c6f432]/30 bg-[#0b0b0c] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c6f432]">
                  Siz uchun tavsiya etilgan yo&apos;l-yo&apos;riq:
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  {activeTrack.title} — 4 ta ketma-ket qadam
                </h3>
              </div>

              <Link
                href={activeTrack.firstHref}
                className="btn-neon inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold"
              >
                <Zap className="h-4 w-4" />
                <span>{activeTrack.firstButtonLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {activeTrack.steps.map((stepItem) => (
                <div
                  key={stepItem.step}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-3"
                >
                  <div className="space-y-2">
                    <span className="inline-flex items-center rounded-lg bg-[#c6f432] px-2.5 py-0.5 font-mono text-xs font-black text-[#0b0b0c]">
                      QADAM {stepItem.step}
                    </span>
                    <h4 className="text-sm font-extrabold text-white leading-snug">
                      {stepItem.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {stepItem.detail}
                    </p>
                  </div>

                  <Link
                    href={stepItem.href}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#c6f432] hover:text-white transition-colors"
                  >
                    <span>{stepItem.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 ta Oson O'rganish Metodi */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          {FOUR_EASY_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.num}
                className="rounded-2xl border border-white/10 bg-[#121214]/90 p-5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c6f432]/40 bg-[#c6f432]/15 text-[#c6f432]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs font-black text-white/40">
                    METOD {method.num}
                  </span>
                </div>
                <h3 className="text-sm font-black text-white">{method.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{method.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
