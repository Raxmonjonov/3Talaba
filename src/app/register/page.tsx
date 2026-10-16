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
} from "lucide-react";
import { UZBEK_REGIONS, GRADE_OPTIONS } from "@/lib/validations/auth";
import { useUIPreferences } from "@/components/providers/AppProviders";

export default function RegisterPage() {
  const router = useRouter();
  const { reduceMotion } = useUIPreferences();
  const cardRef = useRef<HTMLDivElement | null>(null);

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
      translateY: [24, 0],
      duration: 680,
      ease: "outExpo",
    });
  }, [reduceMotion]);

  const triggerShake = () => {
    if (reduceMotion || !cardRef.current) return;
    animate(cardRef.current, {
      translateX: [-8, 8, -6, 6, -3, 3, 0],
      duration: 420,
      ease: "outSine",
    });
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
          name,
          gender,
          age: Number(age),
          grade,
          region,
          email,
          phone,
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
          `Tabriklaymiz, ${gender === "FEMALE" ? "Malikam" : "Shag'zodam"}! Sinfxonaga kirilmoqda...`,
      );

      // Avtomatik tizimga kirish
      const signInResult = await signIn("credentials", {
        redirect: false,
        identifier: email,
        password,
      });

      if (signInResult?.error) {
        router.push("/login");
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setErrorMsg("Tarmoq xatoligi. Qayta urinib ko'ring.");
      setLoading(false);
      triggerShake();
    }
  };

  return (
    <div className="classroom-grid-bg relative flex min-h-[calc(100vh-70px)] items-center justify-center px-4 py-10 sm:px-6">
      <div
        ref={cardRef}
        className={`glass-card w-full max-w-2xl p-6 sm:p-9 ${
          successMsg ? "border-neon shadow-neon" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3 py-1 text-xs font-bold text-neon">
              <Sparkles className="h-3.5 w-3.5" />
              <span>1-QADAM: SHAXSIY PROFIL YARATISH</span>
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
              3Talab sinfxonasiga xush kelibsiz!
            </h1>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">
              Ma&apos;lumotlaringiz AI murabbiy sizga munosib murojaat qilishi va 12 oylik
              xaritangizni tuzishi uchun xizmat qiladi.
            </p>
          </div>
          <div className="rounded-xl border border-gold/40 bg-gold-soft px-3.5 py-2 text-center">
            <span className="block font-mono text-sm font-extrabold text-gold">+50 XP</span>
            <span className="text-[10px] font-medium text-fg-muted">Boshlang&apos;ich bonus</span>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2.5 rounded-xl border border-danger/50 bg-danger/10 p-3.5 text-xs font-semibold text-danger sm:text-sm"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2.5 rounded-xl border border-neon bg-neon-soft p-3.5 text-xs font-semibold text-neon sm:text-sm"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Jins tanlovi ("Malikam" / "Shag'zodam") */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-fg-muted">
              AI Murabbiy sizga qanday murojaat qilsin? (Jinsingiz)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("FEMALE")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-bold transition-all ${
                  gender === "FEMALE"
                    ? "border-gold bg-gold-soft text-gold shadow-gold"
                    : "border-border bg-elevated/60 text-fg-muted hover:text-fg"
                }`}
              >
                <span>👑 Qiz bola («Malikam»)</span>
              </button>
              <button
                type="button"
                onClick={() => setGender("MALE")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-bold transition-all ${
                  gender === "MALE"
                    ? "border-neon bg-neon-soft text-neon shadow-neon"
                    : "border-border bg-elevated/60 text-fg-muted hover:text-fg"
                }`}
              >
                <span>🛡️ O&apos;g&apos;il bola («Shag&apos;zodam»)</span>
              </button>
            </div>
          </div>

          {/* Ism va Yosh */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="reg-name"
                className="mb-1.5 block text-xs font-semibold text-fg-muted"
              >
                Ism va familiyangiz
              </label>
              <div className="relative">
                <UserPlus className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-fg-muted" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder={gender === "FEMALE" ? "Madina Karimova" : "Sardor Alimov"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-fg focus:border-neon focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-age"
                className="mb-1.5 block text-xs font-semibold text-fg-muted"
              >
                Yoshingiz
              </label>
              <input
                id="reg-age"
                type="number"
                min={10}
                max={40}
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 font-mono text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          {/* Sinf va Viloyat */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-grade"
                className="mb-1.5 block text-xs font-semibold text-fg-muted"
              >
                Sinf / Bosqichingiz
              </label>
              <div className="relative">
                <GraduationCap className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-fg-muted" />
                <select
                  id="reg-grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-fg focus:border-neon focus:outline-none"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-region"
                className="mb-1.5 block text-xs font-semibold text-fg-muted"
              >
                Viloyat / Hududingiz
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-fg-muted" />
                <select
                  id="reg-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-fg focus:border-neon focus:outline-none"
                >
                  {UZBEK_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Email va Telefon */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-email"
                className="mb-1.5 block text-xs font-semibold text-fg-muted"
              >
                Email manzilingiz
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-fg-muted" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="oquvchi@3talab.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-fg focus:border-neon focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="mb-1.5 block text-xs font-semibold text-fg-muted"
              >
                Telefon raqam (ixtiyoriy)
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-fg-muted" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-fg focus:border-neon focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Parol */}
          <div>
            <label
              htmlFor="reg-password"
              className="mb-1.5 block text-xs font-semibold text-fg-muted"
            >
              Maxfiy parol (kamida 6 ta belgi)
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-fg-muted" />
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          {/* Yuborish tugmasi */}
          <button
            type="submit"
            disabled={loading}
            className="btn-neon flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold disabled:opacity-60"
          >
            <span>
              {loading
                ? "Ro'yxatdan o'tkazilmoqda..."
                : `Ro'yxatdan o'tish va Boshlash (${gender === "FEMALE" ? "Malikam" : "Shag'zodam"})`}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Google OAuth va Kirish havolasi */}
        <div className="mt-6 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-elevated/70 py-2.5 text-xs font-semibold text-fg transition-colors hover:border-neon/40"
          >
            <span>🌐 Google hisobi orqali tezkor davom etish</span>
          </button>

          <p className="mt-4 text-center text-xs text-fg-muted">
            Allaqachon hisobingiz bormi?{" "}
            <Link href="/login" className="font-bold text-neon hover:underline">
              Sinfxonaga kirish →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
