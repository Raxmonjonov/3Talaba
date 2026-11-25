"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail, Sparkles, User } from "lucide-react";
import { CampusFooter, CampusNavbar, DynamicAmbientBackground } from "@/components/layout/CampusChrome";

interface AuthFormCardProps {
  mode: "login" | "register";
}

export function AuthFormCard({ mode }: AuthFormCardProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isRegister = mode === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? "Xatolik yuz berdi, qaytadan urinib ko'ring.");
        setLoading(false);
        return;
      }

      router.push("/dars");
      router.refresh();
    } catch {
      setErrorMsg("Internet aloqasini tekshirib qaytadan urinib ko'ring.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden">
      <DynamicAmbientBackground isAuthenticated={false} />
      <CampusNavbar user={null} />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <section className="glass-panel w-full max-w-md rounded-[1.75rem] p-6 sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/12 bg-white/[0.03] p-1">
            <Link
              href="/login"
              className={`rounded-xl py-2.5 text-center text-xs font-extrabold transition sm:text-sm ${
                !isRegister
                  ? "border border-[#c6f432]/65 bg-[#c6f432]/20 text-[#c6f432] shadow-[0_0_20px_rgba(198,244,50,0.22)]"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              Kirish
            </Link>
            <Link
              href="/register"
              className={`rounded-xl py-2.5 text-center text-xs font-extrabold transition sm:text-sm ${
                isRegister
                  ? "border border-[#c6f432]/65 bg-[#c6f432]/20 text-[#c6f432] shadow-[0_0_20px_rgba(198,244,50,0.22)]"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </div>

          <div className="mb-6 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#c6f432]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>FLUX CAMPUS · AI DARS</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {isRegister ? "Yangi hisob ochish" : "Hisobingizga kiring"}
            </h1>
            <p className="text-sm text-zinc-400">
              {isRegister
                ? "Ro'yxatdan o'tishingiz bilan shaxsiy AI dars bo'limi ochiladi."
                : "Dars bo'limiga o'tish va AI ustoz bilan davom etish uchun kiring."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="auth-name" className="mb-1.5 block text-xs font-bold text-zinc-200">
                  Ismingiz
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Jasurbek"
                    className="glass-input w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="mb-1.5 block text-xs font-bold text-zinc-200">
                Email manzilingiz
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="misol@gmail.com"
                  className="glass-input w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="mb-1.5 block text-xs font-bold text-zinc-200"
              >
                Parol
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={isRegister ? 6 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "Kamida 6 ta belgi" : "Parolingizni kiriting"}
                  className="glass-input w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-xs font-medium text-red-200">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Ochilmoqda...</span>
                </>
              ) : (
                <>
                  <span>
                    {isRegister ? "Ro'yxatdan o'tish va Darsga kirish" : "Dars bo'limiga kirish"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </section>
      </main>

      <CampusFooter />
    </div>
  );
}
