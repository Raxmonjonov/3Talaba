"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { animate } from "animejs";
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";

export default function LoginPage() {
  const router = useRouter();
  const { reduceMotion } = useUIPreferences();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (reduceMotion || !cardRef.current) return;
    animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 650,
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
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
      triggerShake();
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  return (
    <div className="classroom-grid-bg relative flex min-h-[calc(100vh-70px)] items-center justify-center px-4 py-12">
      <div ref={cardRef} className="glass-card w-full max-w-md p-6 sm:p-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-soft px-3 py-1 text-xs font-bold text-neon">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SINFXONAGA QAYTISH</span>
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-fg sm:text-3xl">
            Xush kelibsiz!
          </h1>
          <p className="mt-1 text-xs text-fg-muted sm:text-sm">
            Shaxsiy 12 oylik yo&apos;l xaritangizni davom ettirish uchun kiring.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2 rounded-xl border border-danger/50 bg-danger/10 p-3 text-xs font-semibold text-danger"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="login-id"
              className="mb-1.5 block text-xs font-semibold text-fg-muted"
            >
              Email yoki Telefon raqamingiz
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-fg-muted" />
              <input
                id="login-id"
                type="text"
                required
                placeholder="oquvchi@3talab.uz"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-xs font-semibold text-fg-muted"
            >
              Parol
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-fg-muted" />
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-fg focus:border-neon focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-neon flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold disabled:opacity-60"
          >
            <span>{loading ? "Kirilmoqda..." : "Sinfxonaga kirish"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-elevated/70 py-2.5 text-xs font-semibold text-fg hover:border-neon/40"
          >
            <span>🌐 Google orqali kirish</span>
          </button>

          <p className="mt-4 text-center text-xs text-fg-muted">
            Hali ro&apos;yxatdan o&apos;tmaganmisiz?{" "}
            <Link href="/register" className="font-bold text-neon hover:underline">
              Yangi profil ochish →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
