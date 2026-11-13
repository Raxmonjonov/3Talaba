"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Pause, Star, Volume2 } from "lucide-react";
import { jarvisVoice } from "@/lib/voice/jarvis-speech";

const VOICE_TEXT =
  "Kvadrat tenglamani Viyet teoremasi orqali tezkor yechamiz. Ildizlar yig'indisi 6 ga, ko'paytmasi 8 ga teng. Demak, javob: 2 va 4.";

export function LandingHero() {
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");

  useEffect(() => {
    return jarvisVoice.subscribe((s) => {
      if (s.currentText !== VOICE_TEXT) {
        if (!s.isSpeaking) setStatus("idle");
        return;
      }
      setStatus(s.isSpeaking ? "playing" : s.isPaused ? "loading" : "idle");
    });
  }, []);

  const toggleVoice = () => {
    if (status !== "idle") {
      jarvisVoice.stop();
      setStatus("idle");
      return;
    }
    setStatus("loading");
    jarvisVoice.speak(VOICE_TEXT, () => setStatus("idle"));
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,75,60,0.10),transparent)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FF4B3C]/20 bg-[#FF4B3C]/5 px-3 py-1 text-xs font-bold text-[#FF4B3C]">
            <span className="rounded-full bg-[#FF4B3C] px-1.5 py-0.5 text-[10px] text-white">1500+</span>
            SAT · IELTS 7.5+ · Matematika
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Kerakli ballni <span className="text-[#FF4B3C]">birinchi urinishda</span> oling
          </h1>

          <p className="mt-5 max-w-xl text-lg text-slate-600">
            O&apos;zbek tilida AI ustoz bilan tayyorgarlik — 8 ta vosita bitta platformada.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/placement"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FF4B3C] px-6 py-4 text-base font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,75,60,0.7)] transition hover:bg-[#e63e30]"
            >
              Tayyorgarlikni boshlash <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#platforma"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-6 py-4 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Platformani ko&apos;rish
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
            <span className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </span>
            Bepul diagnostika · Karta talab qilinmaydi
          </div>
        </div>

        {/* AI ustoz ovozli demo */}
        <div className="relative">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SAT Math · Algebra</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">Jonli dars</span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900">x² − 6x + 8 = 0</h2>
            <p className="text-sm text-slate-500">Ildizlarni toping</p>

            <ol className="mt-5 space-y-2 font-mono text-sm">
              <li className="rounded-xl bg-slate-50 px-4 py-3 text-slate-700">1. Viyet: x₁ + x₂ = 6, x₁ · x₂ = 8</li>
              <li className="rounded-xl bg-[#FF4B3C]/5 px-4 py-3 font-bold text-[#FF4B3C]">2. Javob: x₁ = 2, x₂ = 4</li>
            </ol>

            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
              <button
                type="button"
                onClick={toggleVoice}
                aria-label={status === "idle" ? "AI ustozni tinglash" : "To'xtatish"}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF4B3C] text-white transition hover:scale-105"
              >
                {status === "loading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : status === "playing" ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">AI ustoz tushuntiradi</p>
                <p className="text-xs text-slate-500">
                  {status === "loading"
                    ? "Ovoz tayyorlanmoqda..."
                    : status === "playing"
                      ? "Tinglayapsiz — tabiiy o'zbekcha ovoz"
                      : "Bosing va o'zbekcha tushuntirishni tinglang"}
                </p>
              </div>
              <div className="flex h-8 items-end gap-[3px]" aria-hidden>
                {[10, 22, 14, 28, 18, 24, 12].map((h, i) => (
                  <span
                    key={i}
                    className={`w-[3px] rounded-full bg-[#FF4B3C] ${status === "playing" ? "animate-pulse" : "opacity-30"}`}
                    style={{ height: h, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
