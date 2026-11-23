"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { loadSecureLocal, removeSecureLocal } from "@/lib/security/client-storage";
import {
  Menu,
  X,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { BRAND, GUEST_NAV_LINKS, STUDENT_NAV_LINKS, type NavLinkItem } from "@/lib/site-config";

const SETTINGS_RELATED_PREFIXES = [
  "/settings",
  "/profile",
  "/progress",
  "/dashboard",
  "/roadmap",
  "/history",
  "/examiner",
  "/placement",
  "/onboarding",
  "/guardian",
  "/admin",
  "/terms",
  "/privacy",
];

function getDesktopLinkClasses(tone: NavLinkItem["tone"] = "default", active: boolean): string {
  if (active) {
    return "whitespace-nowrap rounded-xl border border-[#c6f432]/40 bg-[#c6f432]/15 px-3 py-1.5 text-xs xl:text-sm font-bold text-[#c6f432] transition-colors";
  }
  switch (tone) {
    case "neon":
      return "whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-bold text-[#c6f432] transition-colors hover:bg-white/5 hover:text-white";
    case "gold":
      return "whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-bold text-amber-300 transition-colors hover:bg-white/5 hover:text-[#c6f432]";
    default:
      return "whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-[#c6f432]";
  }
}

function getMobileLinkClasses(tone: NavLinkItem["tone"] = "default", active: boolean): string {
  if (active) {
    return "rounded-xl border border-[#c6f432]/40 bg-[#c6f432]/15 px-3 py-2.5 text-sm font-bold text-[#c6f432]";
  }
  if (tone === "neon") {
    return "rounded-xl px-3 py-2.5 text-sm font-bold text-[#c6f432] hover:bg-white/5";
  }
  if (tone === "gold") {
    return "rounded-xl px-3 py-2.5 text-sm font-bold text-amber-300 hover:bg-white/5";
  }
  return "rounded-xl px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/5";
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localUserName, setLocalUserName] = useState<string | null>(null);

  useEffect(() => {
    const parsed = loadSecureLocal<{ name?: string }>("3talaba_user");
    if (parsed?.name) setLocalUserName(parsed.name);
  }, []);

  // CD-IELTS Inspera simulyatori to'liq ekranli rasmiy imtihon muhiti bo'lgani uchun
  // platforma umumiy navbari simulyator ustida ikkinchi navbar bo'lib turmasligi kerak.
  if (pathname === "/simulator" || pathname?.startsWith("/simulator/")) {
    return null;
  }

  const activeUserName = session?.user?.name ?? localUserName;
  const navLinks = activeUserName ? STUDENT_NAV_LINKS : GUEST_NAV_LINKS;
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isSettingsActive = SETTINGS_RELATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`)
  );

  const handleSignOut = () => {
    removeSecureLocal("3talaba_user");
    removeSecureLocal("3talaba_plan");
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
        {/* Brend Logotipi */}
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

        {/* Asosiy 5 ta o'quv bo'limi (Desktop) */}
        <nav className="hidden items-center gap-2 xl:gap-3 lg:flex shrink-0" aria-label="Asosiy navigatsiya">
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={getDesktopLinkClasses(link.tone, active)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* O'ng taraf: Settings (barcha qo'shimcha bo'limlar) va Auth */}
        <div className="hidden items-center gap-2 md:flex shrink-0">
          <Link
            href="/settings"
            className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl border px-3.5 py-2 text-xs xl:text-sm font-bold transition-all ${
              isSettingsActive
                ? "border-[#c6f432]/60 bg-[#c6f432]/15 text-[#c6f432] shadow-[0_0_20px_rgba(198,244,50,0.2)]"
                : "border-white/15 bg-white/5 text-white/90 hover:border-[#c6f432]/50 hover:text-[#c6f432]"
            }`}
            title="Sozlamalar va barcha qo'shimcha bo'limlar (Profil, Xarita, Tarix, AI Examiner, Mavzu, Eslatmalar)"
            aria-label="Sozlamalar"
          >
            {activeUserName && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            )}
            <Settings className="h-4 w-4" />
            <span>Sozlamalar</span>
          </Link>

          {activeUserName ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-red-400/40 hover:text-red-400"
              title="Hisobdan chiqish"
              aria-label="Hisobdan chiqish"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="shrink-0 whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs xl:text-sm font-semibold text-white transition-colors hover:border-emerald-400/40 hover:text-emerald-400"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="btn-neon inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 px-3.5 py-2 text-xs xl:text-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Boshlash</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobil: Sozlamalar + Menyu tugmasi */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/settings"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors md:hidden ${
              isSettingsActive
                ? "border-[#c6f432]/60 bg-[#c6f432]/15 text-[#c6f432]"
                : "border-white/10 bg-white/5 text-slate-200 hover:border-[#c6f432]/50 hover:text-[#c6f432]"
            }`}
            aria-label="Sozlamalar"
            title="Sozlamalar"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
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
          <nav className="flex flex-col gap-2" aria-label="Mobil navigatsiya">
            {navLinks.map((link) => {
              const active =
                pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={getMobileLinkClasses(link.tone, active)}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/settings"
              onClick={closeMobileMenu}
              className={`mt-1 flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-bold ${
                isSettingsActive
                  ? "border-[#c6f432]/50 bg-[#c6f432]/15 text-[#c6f432]"
                  : "border-white/10 bg-white/5 text-white"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#c6f432]" />
                <span>Sozlamalar</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Barcha bo&apos;limlar
              </span>
            </Link>

            <div className="mt-2 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-3">
              {activeUserName ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleSignOut();
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Hisobdan chiqish</span>
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="btn-neon py-2.5 text-center text-sm"
                  >
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
