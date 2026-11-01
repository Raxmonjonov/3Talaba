"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { animate } from "animejs";
import {
  Sparkles,
  UserPlus,
  Mail,
  Phone,
  Lock,
  MapPin,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Calendar,
} from "lucide-react";
import { UZBEK_REGIONS, GRADE_OPTIONS } from "@/lib/validations/auth";
import { useUIPreferences } from "@/components/providers/AppProviders";

export default function RegisterPage() {
  const router = useRouter();
  const { reduceMotion } = useUIPreferences();
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Bosqich holati (1-qadam / 2-qadam)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form maydonlari
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"FEMALE" | "MALE">("MALE");
  const [age, setAge] = useState("16");
  const [grade, setGrade] = useState<string>(GRADE_OPTIONS[3]);
  const [region, setRegion] = useState<string>(UZBEK_REGIONS[0]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (reduceMotion || !cardRef.current) return;
    animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 550,
      ease: "outExpo",
    });
  }, [reduceMotion, currentStep]);

  const triggerShake = () => {
    if (reduceMotion || !cardRef.current) return;
    animate(cardRef.current, {
      translateX: [-8, 8, -6, 6, -3, 3, 0],
      duration: 420,
      ease: "outSine",
    });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Iltimos, ismingizni to'liq kiriting (kamida 2 ta harf)");
      triggerShake();
      return;
    }

    const ageNum = Number(age);
    if (!ageNum || ageNum < 10 || ageNum > 35) {
      setErrorMsg("Yoshingizni to'g'ri ko'rsating (10 dan 35 gacha)");
      triggerShake();
      return;
    }

    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          gender,
          age: Number(age),
          grade,
          region,
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setErrorMsg(data.error ?? "Ro'yxatdan o'tishda xatolik yuz berdi");
        setLoading(false);
        triggerShake();
        return;
      }

      setSuccessMsg(
        data.message ??
          `Tabriklaymiz, ${name || "Aziz o'quvchi"}! Shaxsiy sinfxonangiz ochilmoqda...`,
      );

      // Avtomatik tizimga kirish
      const signInResult = await signIn("credentials", {
        redirect: false,
        identifier: email,
        password,
      });

      if (signInResult?.ok) {
        setTimeout(() => {
          router.push("/onboarding");
        }, 800);
      } else {
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      }
    } catch {
      setErrorMsg("Internet bilan bog'lanishda xatolik. Qaytadan urinib ko'ring.");
      setLoading(false);
      triggerShake();
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 sm:px-6">
      <div
        ref={cardRef}
        className={`glass-card w-full max-w-xl p-7 sm:p-10 ${
          successMsg ? "border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)]" : ""
        }`}
      >
        {/* Yuqori bosqich va sarlavha */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>RO&apos;YXATDAN O&apos;TISH</span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-400">
              Bosqich: {currentStep} / 2
            </span>
          </div>

          {/* Bosqich progress chizig'i */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-500 ease-out"
              style={{ width: currentStep === 1 ? "50%" : "100%" }}
            />
          </div>

          <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            {currentStep === 1
              ? "1-Qadam: Shaxsiy Tanishuv"
              : "2-Qadam: Sinf va Kirish Hisobi"}
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {currentStep === 1
              ? "JARVIS murabbiy sizga mos ohangda murojaat qilishi uchun ma'lumotlarni kiriting."
              : "Platformaga xavfsiz kirish va 12 oylik darslaringizni saqlash uchun hisob oching."}
          </p>
        </div>

        {/* Xatolik xabari */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs font-semibold text-red-300 sm:text-sm"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Muvaffaqiyat xabari */}
        {successMsg && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2.5 rounded-xl border border-emerald-400/50 bg-emerald-500/15 p-3.5 text-xs font-semibold text-emerald-300 sm:text-sm"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1-QADAM: Shaxsiy tanishuv */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep} className="mt-6 space-y-6">
            {/* Jins tanlovi */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Murojaat ohangi (Jins)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender("MALE")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all ${
                    gender === "MALE"
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">👨</span>
                  <span>O&apos;g&apos;il bola</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("FEMALE")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all ${
                    gender === "FEMALE"
                      ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">👩</span>
                  <span>Qiz bola</span>
                </button>
              </div>
            </div>

            {/* Ism */}
            <div>
              <label
                htmlFor="reg-name"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Ismingiz
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Sardor yoki Madina"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>

            {/* Yosh */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="reg-age"
                  className="text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Yoshingiz
                </label>
                <span className="font-mono text-sm font-extrabold text-emerald-400">
                  {age} yosh
                </span>
              </div>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-age"
                  type="number"
                  min={10}
                  max={35}
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-neon w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-xl mt-4"
            >
              <span>Keyingi qadam (Sinf va Hisob)</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        )}

        {/* 2-QADAM: Sinf, Hudud, Aloqa va Parol */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Sinf va Hudud (2 ustun) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reg-grade"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Sinf / Bosqich
                </label>
                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    id="reg-grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-white/15 bg-slate-900/90 py-3 pl-10 pr-4 text-xs font-semibold text-white focus:border-emerald-400 focus:outline-none"
                  >
                    {GRADE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-region"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Viloyat / Hudud
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    id="reg-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-white/15 bg-slate-900/90 py-3 pl-10 pr-4 text-xs font-semibold text-white focus:border-emerald-400 focus:outline-none"
                  >
                    {UZBEK_REGIONS.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label
                htmlFor="reg-phone"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Telefon raqamingiz
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="reg-email"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="talaba@namuna.uz"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Parol */}
            <div>
              <label
                htmlFor="reg-pass"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Parol (kamida 8 ta belgi)
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-pass"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Harakat tugmalari */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Orqaga</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-neon flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold shadow-xl disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                <span>{loading ? "Hisob ochilmoqda..." : "Ro'yxatdan o'tish"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Kirish havolasi */}
        <div className="mt-6 border-t border-white/10 pt-5 text-center">
          <p className="text-xs text-slate-400">
            Allaqachon hisobingiz bormi?{" "}
            <Link
              href="/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Tizimga kirish →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
