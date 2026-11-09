"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, CheckCircle2, Sigma, Sparkles, Volume2, Pause } from "lucide-react";
import { BRAND, TARGETS } from "@/lib/site-config";
import { HeroPrimaryCta } from "./HeroPrimaryCta";
import { jarvisVoice } from "@/lib/voice/jarvis-speech";

const HERO_STATS = [
  { value: TARGETS.satShort, label: `SAT (${TARGETS.satMath})`, color: "text-emerald-400" },
  { value: TARGETS.ieltsShort, label: "IELTS Academic", color: "text-amber-300" },
  { value: "12 Oy", label: "Tizimli Reja", color: "text-teal-300" },
  { value: "24/7 AI", label: `${BRAND.aiName} Murabbiy`, color: "text-emerald-400" },
] as const;

export function HeroSection() {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const voiceExplanationText =
    "Kvadrat tenglamani Viyet teoremasi orqali tezkor yechamiz. Ildizlar yig'indisi 6 ga, ko'paytmasi 8 ga teng. Demak, javob: 2 va 4.";

  useEffect(() => {
    return jarvisVoice.subscribe((s) => {
      if (s.currentText === voiceExplanationText) {
        setIsPlayingVoice(s.isSpeaking && !s.isPaused);
      } else if (!s.isSpeaking) {
        setIsPlayingVoice(false);
      }
    });
  }, [voiceExplanationText]);

  const handleToggleVoice = () => {
    if (isPlayingVoice) {
      jarvisVoice.stop();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      jarvisVoice.speak(voiceExplanationText, () => {
        setIsPlayingVoice(false);
      });
    }
  };

  return (
    <section className="grid items-center gap-8 lg:grid-cols-12" aria-labelledby="hero-title">
      {/* Chap qism: Sarlavha, Maqsad va Harakat tugmalari */}
      <div className="space-y-6 lg:col-span-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-extrabold text-emerald-300">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span>XALQARO TA&apos;LIM PLATFORMASI • 12 OYLIK TIZIM</span>
        </div>

        <h1
          id="hero-title"
          className="text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Top Universitetlar Sari{" "}
          <span className="bg-gradient-to-r from-[#c6f432] via-[#dcfa72] to-[#ffffff] bg-clip-text text-transparent">
            Tizimli Tayyorgarlik
          </span>
        </h1>

        <p className="max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Digital {TARGETS.sat}, {TARGETS.ielts} va chuqur Matematikani bosqichma-bosqich,{" "}
          {BRAND.aiName} murabbiyi bilan birga o&apos;rganing. {BRAND.fullName} — tushuntirishlar
          100% o&apos;zbek tilida.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <HeroPrimaryCta />

          <Link
            href="/math"
            className="glass-card inline-flex items-center gap-2 px-6 py-4 text-base font-bold text-white transition-colors hover:text-emerald-300"
          >
            <Sigma className="h-5 w-5 text-emerald-400" />
            <span>Algebra &amp; Geometriya</span>
          </Link>
        </div>

        {/* Afzalliklar qatori */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="glass-pill rounded-xl p-3 text-center">
              <span className={`block font-mono text-lg font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-[11px] font-semibold text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* O'ng qism: Jonli Interaktiv Darslik Vitrinasi */}
      <div className="lg:col-span-5">
        <div className="glass-card relative overflow-hidden p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-emerald-400">NAMUNA INTERAKTIV DARSLIK</span>
            </div>
            <span className="glass-pill rounded-full px-3 py-0.5 font-mono text-xs font-bold text-amber-300">
              SAT {TARGETS.satMath}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mavzu: Kvadrat Tenglamalar va Viyet
              </span>
              <h2 className="mt-1 text-xl font-black text-white">x² - 6x + 8 = 0 ning ildizlarini toping</h2>
            </div>

            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-mono text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>1. Ko&apos;paytuvchilar: (x - 2)(x - 4) = 0</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>2. Ildizlar: x₁ = 2, x₂ = 4</span>
              </div>
            </div>

            {/* Talaba AI ovozli tushuntirish paneli */}
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">{BRAND.aiName} Ovozli Tushuntirish</span>
                    <span className="block text-[11px] text-slate-300">
                      {isPlayingVoice ? "Ovoz yangramoqda..." : "Nutq bilan tinglash"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                    isPlayingVoice
                      ? "border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-neon"
                      : "border-white/15 bg-white/5 text-slate-300 hover:border-emerald-400/50 hover:text-white"
                  }`}
                >
                  {isPlayingVoice ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>To&apos;xtatish</span>
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="h-2.5 w-0.5 bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-3.5 w-0.5 bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-0.5 bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Tinglash</span>
                    </>
                  )}
                </button>
              </div>

              {isPlayingVoice && (
                <p className="text-xs text-emerald-200/90 font-mono italic pt-1 border-t border-emerald-400/20">
                  &ldquo;{voiceExplanationText}&rdquo;
                </p>
              )}
            </div>

            <Link
              href="/math"
              className="btn-neon flex w-full items-center justify-center gap-2 py-3 text-center text-sm font-bold"
            >
              <span>Barcha 15 ta Matematika Modullarini Ochish</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
