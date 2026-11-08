"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { loadSecureLocal, removeSecureLocal } from "@/lib/security/client-storage";
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
import { QuickGuideButton } from "@/components/learning/QuickGuideModal";

const DESKTOP_TONE_CLASSES: Record<NonNullable<NavLinkItem["tone"]>, string> = {
  default: "whitespace-nowrap text-xs xl:text-sm font-semibold text-white/80 transition-colors hover:text-[#c6f432]",
  gold: "whitespace-nowrap text-xs xl:text-sm font-bold text-white transition-colors hover:text-[#c6f432]",
  neon: "whitespace-nowrap text-xs xl:text-sm font-bold text-[#c6f432] transition-colors hover:text-white",
};

const MOBILE_TONE_CLASSES: Record<NonNullable<NavLinkItem["tone"]>, string> = {
  default: "rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/5",
  gold: "rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/5",
  neon: "rounded-xl px-3 py-2 text-sm font-semibold text-[#c6f432] hover:bg-white/5",
};

export function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme, reduceMotion, toggleReduceMotion } = useUIPreferences();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localUserName, setLocalUserName] = useState<string | null>(null);

  useEffect(() => {
    const parsed = loadSecureLocal<{ name?: string }>("3talaba_user");
    if (parsed?.name) setLocalUserName(parsed.name);
  }, []);

  const activeUserName = session?.user?.name ?? localUserName;
  const navLinks = activeUserName ? STUDENT_NAV_LINKS : GUEST_NAV_LINKS;
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSignOut = () => {
    removeSecureLocal("3talaba_user");
    setLocalUserName(null);
    if (session?.user) {
      signOut({ callbackUrl: "/" });
    } else {
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-canvas/75 shadow-lg backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Katta, Aniq va Yorqin Brend Logotipi */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 focus:outline-none"
          aria-label={`${BRAND.fullName} Bosh sahifa`}
        >
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl border border-[#c6f432]/50 bg-[#0b0b0c] shadow-[0_0_24px_rgba(198,244,50,0.3)] backdrop-blur-xl transition-transform duration-200 group-hover:scale-105">
            <span className="font-mono text-2xl font-black text-[#c6f432] drop-shadow-[0_2px_10px_rgba(198,244,50,0.45)]">
              3
            </span>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c6f432] text-[10px] font-black text-[#0b0b0c] ring-2 ring-[#0b0b0c]">
              ✦
            </span>
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm whitespace-nowrap">
                3<span className="text-emerald-400">Talaba</span>
              </span>
              <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 whitespace-nowrap">
                Campus
              </span>
            </div>
            <span className="hidden 2xl:block text-xs font-semibold text-slate-300 whitespace-nowrap">
              {BRAND.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop navigatsiya */}
        <nav className="hidden items-center gap-3.5 xl:gap-5 lg:flex shrink-0" aria-label="Asosiy navigatsiya">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={DESKTOP_TONE_CLASSES[link.tone ?? "default"]}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Sozlamalar va Profil */}
        <div className="hidden items-center gap-2 xl:gap-2.5 md:flex shrink-0">
          <QuickGuideButton />

          <button
            type="button"
            onClick={toggleReduceMotion}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              reduceMotion
                ? "border-[#c6f432]/60 bg-[#c6f432]/15 text-[#c6f432]"
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
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-[#c6f432]/50 hover:text-[#c6f432]"
            aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
            title={theme === "dark" ? "Yorug' rejim" : "Qorong'u rejim"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-[#c6f432]" /> : <Moon className="h-4 w-4 text-[#0b0b0c]" />}
          </button>

          {activeUserName ? (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/profile"
                className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500 hover:text-slate-950"
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
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-red-400/40 hover:text-red-400"
                title="Hisobdan chiqish"
                aria-label="Hisobdan chiqish"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/profile"
                className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                title="Profil: 12 Oylik Xarita, Dars Tarixi, Savollar Banki"
              >
                <User className="h-4 w-4" />
                <span>Profil</span>
              </Link>
              <Link
                href="/login"
                className="shrink-0 whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs xl:text-sm font-semibold text-white transition-colors hover:border-emerald-400/40 hover:text-emerald-400"
              >
                Kirish
              </Link>
              <Link href="/register" className="btn-neon inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 px-3.5 py-2 text-xs xl:text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Boshlash</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobil menyu tugmasi */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center gap-2 md:hidden">
            <QuickGuideButton />
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300"
              aria-label="Mavzuni almashtirish"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
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
