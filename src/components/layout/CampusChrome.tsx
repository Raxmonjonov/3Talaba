"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookmarkCheck,
  LogOut,
  Mail,
  Maximize2,
  Menu,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";

export function DynamicAmbientBackground({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-all duration-700"
    >
      {isAuthenticated ? (
        <>
          <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-[2px] bg-gradient-to-r from-[#c6f432] via-[#ffffff] to-[#c6f432] shadow-[0_0_20px_rgba(198,244,50,0.75)]" />
          <div className="absolute -top-36 left-1/2 h-[620px] w-[860px] -translate-x-1/2 rounded-full bg-[#c6f432]/12 blur-[150px]" />
          <div className="absolute -right-40 top-1/4 h-[560px] w-[560px] rounded-full bg-white/[0.04] blur-[150px]" />
          <div className="absolute -bottom-40 left-12 h-[540px] w-[540px] rounded-full bg-[#c6f432]/[0.08] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,244,50,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-70" />
        </>
      ) : (
        <>
          <div className="absolute -left-40 -top-44 h-[620px] w-[620px] rounded-full bg-[#c6f432]/[0.11] blur-[150px]" />
          <div className="absolute -right-44 top-1/3 h-[560px] w-[560px] rounded-full bg-white/[0.04] blur-[150px]" />
          <div className="absolute -bottom-44 right-1/4 h-[520px] w-[520px] rounded-full bg-[#c6f432]/[0.07] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:40px_40px] opacity-55" />
        </>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/dars", label: "AI Dars (Fullscreen)", neon: true },
  { href: "/#tekshirgich", label: "Top 300 Talablar" },
  { href: "/#dasturlar", label: "Kurslar" },
  { href: "/#pricing", label: "Tariflar" },
  { href: "/#faq", label: "FAQ" },
];

export function CampusNavbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0c]/80 shadow-lg backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Flux Signature Obsidian-Lime Brand Mark */}
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#c6f432]/55 bg-[#0b0b0c] shadow-[0_0_24px_rgba(198,244,50,0.3)] transition-transform duration-200 group-hover:scale-105 sm:h-11 sm:w-11">
            <span className="font-mono text-2xl font-black text-[#c6f432] drop-shadow-[0_2px_10px_rgba(198,244,50,0.45)]">
              F
            </span>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c6f432] text-[10px] font-black text-[#0b0b0c] ring-2 ring-[#0b0b0c]">
              ✦
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Fl<span className="text-[#c6f432]">ux</span>
            </span>
            <span className="hidden rounded-md border border-[#c6f432]/35 bg-[#c6f432]/12 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#c6f432] sm:inline-block">
              CAMPUS AI
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-1.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "rounded-xl border border-[#c6f432]/45 bg-[#c6f432]/15 px-3 py-1.5 text-xs font-bold text-[#c6f432] xl:text-sm"
                    : item.neon
                      ? "rounded-xl px-3 py-1.5 text-xs font-bold text-[#c6f432] transition hover:bg-white/5 hover:text-white xl:text-sm"
                      : "rounded-xl px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/5 hover:text-[#c6f432] xl:text-sm"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-2.5 sm:flex">
          {user ? (
            <>
              <Link
                href="/kabinet"
                className="glass-pill inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white"
              >
                <BookmarkCheck className="h-3.5 w-3.5 text-[#c6f432]" />
                <span>Mening rejam</span>
              </Link>
              <Link
                href="/dars"
                className="btn-neon inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Dars bo&apos;limi ({user.name.split(" ")[0]})</span>
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                aria-label="Chiqish"
                className="glass-pill flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="glass-pill rounded-xl px-4 py-2 text-xs font-bold text-white xl:text-sm"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="btn-neon rounded-xl px-4 py-2 text-xs font-extrabold xl:text-sm"
              >
                Bepul Boshlash
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menyu"
          className="glass-pill flex h-10 w-10 items-center justify-center rounded-xl text-white lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0b0b0c]/95 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-white hover:bg-white/5 hover:text-[#c6f432]"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              {user ? (
                <>
                  <Link
                    href="/kabinet"
                    onClick={() => setMobileOpen(false)}
                    className="glass-pill rounded-xl px-4 py-2.5 text-center text-sm font-bold text-white"
                  >
                    Mening rejam ({user.name.split(" ")[0]})
                  </Link>
                  <Link
                    href="/dars"
                    onClick={() => setMobileOpen(false)}
                    className="btn-neon rounded-xl px-4 py-2.5 text-center text-sm font-extrabold"
                  >
                    AI Dars bo&apos;limiga o&apos;tish
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="glass-pill rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-zinc-300"
                  >
                    Chiqish
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="glass-pill rounded-xl px-4 py-2.5 text-center text-sm font-bold text-white"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-neon rounded-xl px-4 py-2.5 text-center text-sm font-extrabold"
                  >
                    Ro&apos;yxatdan o&apos;tish
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

export function CampusFooter() {
  return (
    <footer className="relative z-10 mt-16 border-t border-white/10 bg-[#0b0b0c]/85 backdrop-blur-2xl">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c6f432]/45 bg-[#c6f432]/15 font-mono text-xl font-black text-[#c6f432]">
                F✦
              </div>
              <span className="text-xl font-black text-white">
                Fl<span className="text-[#c6f432]">ux</span> CAMPUS
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-zinc-400">
              Tizimli 7 qadamli qabul metodologiyasi: SAT 1500+, IELTS 7.5+ va Fullscreen jonli
              ovozli AI ustoz yordamida dunyoning Top 300 universitetiga grant asosida kirish
              platformasi.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-zinc-300">
              <span className="glass-pill rounded-lg px-2.5 py-1">MIT &amp; Harvard</span>
              <span className="glass-pill rounded-lg px-2.5 py-1">Oxford &amp; Cambridge</span>
              <span className="glass-pill rounded-lg px-2.5 py-1">KAIST &amp; Yonsei</span>
              <span className="glass-pill rounded-lg px-2.5 py-1">TUM &amp; ETH Zurich</span>
            </div>
          </div>

          {/* Dasturlar */}
          <nav aria-label="Akademik dasturlar">
            <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#c6f432]">
              Akademik Yo&apos;nalishlar
            </h4>
            <ul className="space-y-2 text-xs font-medium text-zinc-300">
              <li>
                <Link href="/dars" className="transition hover:text-[#c6f432]">
                  Top 300 Qabul Metodologiyasi
                </Link>
              </li>
              <li>
                <Link href="/#dasturlar" className="transition hover:text-[#c6f432]">
                  SAT Math 800 &amp; R&amp;W
                </Link>
              </li>
              <li>
                <Link href="/#dasturlar" className="transition hover:text-[#c6f432]">
                  IELTS Academic 7.5+
                </Link>
              </li>
              <li>
                <Link href="/#dasturlar" className="transition hover:text-[#c6f432]">
                  100% Grant Strategiyasi
                </Link>
              </li>
            </ul>
          </nav>

          {/* AI Vositalar */}
          <nav aria-label="AI asboblar">
            <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-white">
              Flux AI Tizimi
            </h4>
            <ul className="space-y-2 text-xs font-medium text-zinc-300">
              <li>
                <Link href="/dars" className="transition hover:text-[#c6f432]">
                  Fullscreen Matnsiz AI Dars
                </Link>
              </li>
              <li>
                <Link href="/#tekshirgich" className="transition hover:text-[#c6f432]">
                  300 Universitet Ball Tekshirgichi
                </Link>
              </li>
              <li>
                <Link href="/kabinet" className="transition hover:text-[#c6f432]">
                  Shaxsiy 7 Qadamli Reja
                </Link>
              </li>
            </ul>
          </nav>

          {/* Aloqa */}
          <div>
            <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#c6f432]">
              Aloqa
            </h4>
            <div className="space-y-2">
              <a
                href="https://t.me/flux_campus"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-pill flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs"
              >
                <Send className="h-4 w-4 text-[#c6f432]" />
                <div>
                  <span className="block text-[10px] text-zinc-400">Telegram kanal</span>
                  <span className="font-bold text-white">@flux_campus</span>
                </div>
              </a>
              <a
                href="https://t.me/flux_support_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-pill flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs"
              >
                <MessageCircle className="h-4 w-4 text-[#c6f432]" />
                <div>
                  <span className="block text-[10px] text-zinc-400">Yordam bot</span>
                  <span className="font-bold text-white">@flux_support_bot</span>
                </div>
              </a>
              <a
                href="mailto:support@flux.uz"
                className="glass-pill flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs"
              >
                <Mail className="h-4 w-4 text-[#c6f432]" />
                <div>
                  <span className="block text-[10px] text-zinc-400">Email</span>
                  <span className="font-bold text-white">support@flux.uz</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} Flux Campus. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            <span>Bluetooth &amp; Dinamik Ovozli AI</span>
            <span aria-hidden="true">•</span>
            <span>100% Tabiiy O&apos;zbek Tilida</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
