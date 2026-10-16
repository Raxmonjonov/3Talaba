"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Sparkles,
  Sun,
  Moon,
  EyeOff,
  Eye,
  Menu,
  X,
  Compass,
  LogOut,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { useUIPreferences } from "@/components/providers/AppProviders";

export function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme, reduceMotion, toggleReduceMotion } = useUIPreferences();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brend logotipi */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus:outline-none"
          aria-label="3Talab Bosh sahifa"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neon/40 bg-neon-soft shadow-neon transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-neon" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-slate-950">
              3
            </span>
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-fg">
              3<span className="text-neon">Talab</span>
            </span>
            <span className="block text-[11px] font-medium text-fg-muted">
              12 oyda top universitet sari
            </span>
          </div>
        </Link>

        {/* Desktop navigatsiya */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Asosiy navigatsiya">
          {session?.user ? (
            <>
              <Link
                href="/roadmap"
                className="text-sm font-medium text-fg-muted transition-colors hover:text-neon"
              >
                12 Oylik Xarita
              </Link>
              <Link
                href="/learn"
                className="text-sm font-medium text-fg-muted transition-colors hover:text-neon"
              >
                Darslar
              </Link>
              <Link
                href="/practice"
                className="text-sm font-medium text-fg-muted transition-colors hover:text-neon"
              >
                Savollar Banki
              </Link>
              <Link
                href="/coach"
                className="text-sm font-semibold text-gold transition-colors hover:text-neon"
              >
                AI Murabbiy
              </Link>
              <Link
                href="/progress"
                className="text-sm font-semibold text-neon transition-colors hover:text-gold"
              >
                Progress & XP
              </Link>
            </>
          ) : (
            <>
              <a
                href="#tizim"
                className="text-sm font-medium text-fg-muted transition-colors hover:text-neon"
              >
                12 Oylik Tizim
              </a>
              <a
                href="#fanlar"
                className="text-sm font-medium text-fg-muted transition-colors hover:text-neon"
              >
                Fanlar (SAT & IELTS)
              </a>
              <a
                href="#ai-murabbiy"
                className="text-sm font-medium text-fg-muted transition-colors hover:text-neon"
              >
                AI Murabbiy
              </a>
              <a
                href="#vaqt-kalkulyator"
                className="text-sm font-medium text-fg-muted transition-colors hover:text-neon"
              >
                Kunlik Vaqt Rejasi
              </a>
            </>
          )}
        </nav>

        {/* Sozlamalar (Animatsiyani kamaytirish + Rejim) va Kirish/Boshlash */}
        <div className="hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            onClick={toggleReduceMotion}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              reduceMotion
                ? "border-gold/50 bg-gold-soft text-gold"
                : "border-border bg-surface text-fg-muted hover:text-fg"
            }`}
            title="Animatsiyalarni kamaytirish (Sozlama)"
            aria-pressed={reduceMotion}
          >
            {reduceMotion ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{reduceMotion ? "Tinch rejim yoqilgan" : "Animatsiyalarni kamaytirish"}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-fg-muted transition-colors hover:border-neon/40 hover:text-neon"
            aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish"}
            title={theme === "dark" ? "Yorug' rejim" : "Qorong'u rejim"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4" />}
          </button>

          {session?.user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl border border-neon/40 bg-neon-soft px-3.5 py-2 text-xs font-semibold text-neon transition-all hover:bg-neon hover:text-white"
              >
                <UserCheck className="h-4 w-4" />
                <span>
                  {session.user.honorific}: {session.user.name}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-fg-muted transition-colors hover:border-danger/40 hover:text-danger"
                title="Hisobdan chiqish"
                aria-label="Hisobdan chiqish"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-fg transition-colors hover:border-neon/40 hover:text-neon"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="btn-neon inline-flex items-center gap-1.5 px-4 py-2 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Boshlash</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobil menyu tugmasi */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-fg-muted"
            aria-label="Mavzuni almashtirish"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-fg"
            aria-label="Menyuni ochish"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil ochiluvchi menyu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a
              href="#tizim"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-fg"
            >
              12 Oylik Tizim
            </a>
            <a
              href="#fanlar"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-fg"
            >
              Fanlar (SAT & IELTS)
            </a>
            <a
              href="#ai-murabbiy"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-fg"
            >
              AI Murabbiy
            </a>
            <button
              type="button"
              onClick={toggleReduceMotion}
              className="flex items-center justify-between rounded-lg border border-border bg-elevated px-3 py-2 text-xs font-medium text-fg"
            >
              <span>Animatsiyalarni kamaytirish</span>
              <span className={reduceMotion ? "text-gold font-bold" : "text-fg-muted"}>
                {reduceMotion ? "Yoqilgan" : "O'chiq"}
              </span>
            </button>
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {session?.user ? (
                <>
                  <Link
                    href="/onboarding"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-neon flex items-center justify-center gap-1.5 py-2.5 text-center text-sm"
                  >
                    <Compass className="h-4 w-4" />
                    <span>Kabinet ({session.user.honorific})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-xl border border-border bg-elevated py-2.5 text-sm font-medium text-fg"
                  >
                    Chiqish
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-border bg-elevated py-2.5 text-center text-sm font-semibold text-fg"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-neon py-2.5 text-center text-sm"
                  >
                    Boshlash
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
