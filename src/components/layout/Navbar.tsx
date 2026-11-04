"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Sun,
  Moon,
  EyeOff,
  Eye,
  Menu,
  X,
  Compass,
  LogOut,
  UserCheck,
  User,
  Sparkles,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";
import { BRAND, GUEST_NAV_LINKS, STUDENT_NAV_LINKS, type NavLinkItem } from "@/lib/site-config";

const DESKTOP_TONE_CLASSES: Record<NonNullable<NavLinkItem["tone"]>, string> = {
  default: "text-sm font-semibold text-slate-300 transition-colors hover:text-emerald-400",
  gold: "text-sm font-bold text-amber-300 transition-colors hover:text-emerald-400",
  neon: "text-sm font-bold text-emerald-400 transition-colors hover:text-amber-300",
};

const MOBILE_TONE_CLASSES: Record<NonNullable<NavLinkItem["tone"]>, string> = {
  default: "rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/5",
  gold: "rounded-xl px-3 py-2 text-sm font-semibold text-amber-300 hover:bg-white/5",
  neon: "rounded-xl px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-white/5",
};

export function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme, reduceMotion, toggleReduceMotion } = useUIPreferences();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localUserName, setLocalUserName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("3talaba_user");
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string };
        if (parsed?.name) setLocalUserName(parsed.name);
      }
    } catch {}
  }, []);

  const activeUserName = session?.user?.name ?? localUserName;
  const navLinks = activeUserName ? STUDENT_NAV_LINKS : GUEST_NAV_LINKS;
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("3talaba_user");
    } catch {}
    setLocalUserName(null);
    if (session?.user) {
      signOut({ callbackUrl: "/" });
    } else {
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-canvas/75 shadow-lg backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        {/* Katta, Aniq va Yorqin Brend Logotipi */}
        <Link
          href="/"
          className="group flex items-center gap-3.5 focus:outline-none"
          aria-label={`${BRAND.fullName} Bosh sahifa`}
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/25 via-slate-900/90 to-amber-500/25 shadow-[0_0_24px_rgba(16,185,129,0.35)] backdrop-blur-xl transition-transform duration-200 group-hover:scale-105">
            <span className="font-mono text-2xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]">
              3
            </span>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 ring-2 ring-slate-950">
              ✦
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
                3<span className="text-emerald-400">Talaba</span>
              </span>
              <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                Campus
              </span>
            </div>
            <span className="block text-xs font-semibold text-slate-300">{BRAND.tagline}</span>
          </div>
        </Link>

        {/* Desktop navigatsiya */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Asosiy navigatsiya">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={DESKTOP_TONE_CLASSES[link.tone ?? "default"]}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Sozlamalar va Profil */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleReduceMotion}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              reduceMotion
                ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:text-white"
            }`}
            title={reduceMotion ? "Animatsiyalar o'chiq" : "Animatsiyalarni kamaytirish"}
            aria-label="Animatsiyalarni kamaytirish"
          >
            {reduceMotion ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-400"
            aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
            title={theme === "dark" ? "Yorug' rejim" : "Qorong'u rejim"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {activeUserName ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500 hover:text-slate-950"
                title="Mening Profilim (12 Oylik Xarita, Dars Tarixi, Savollar Banki)"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <UserCheck className="h-4 w-4" />
                <span>{activeUserName.split(" ")[0]} (Profil)</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-red-400/40 hover:text-red-400"
                title="Hisobdan chiqish"
                aria-label="Hisobdan chiqish"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                title="Profil: 12 Oylik Xarita, Dars Tarixi, Savollar Banki"
              >
                <User className="h-4 w-4" />
                <span>Profil</span>
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-emerald-400/40 hover:text-emerald-400"
              >
                Kirish
              </Link>
              <Link href="/register" className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Boshlash</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobil menyu tugmasi */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300"
            aria-label="Mavzuni almashtirish"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white"
            aria-label={mobileMenuOpen ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil ochiluvchi menyu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="border-t border-white/10 bg-canvas/95 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <nav className="flex flex-col gap-2.5" aria-label="Mobil navigatsiya">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={MOBILE_TONE_CLASSES[link.tone ?? "default"]}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-2">
              {activeUserName ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="btn-neon flex items-center justify-center gap-1.5 py-2.5 text-center text-sm"
                  >
                    <Compass className="h-4 w-4" />
                    <span>Mening Profilim</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white"
                  >
                    Chiqish
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="col-span-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 py-2.5 text-center text-sm font-bold text-emerald-300"
                  >
                    Profil (Xarita • Tarix • Savollar Banki)
                  </Link>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Kirish
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu} className="btn-neon py-2.5 text-center text-sm">
                    Boshlash
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
