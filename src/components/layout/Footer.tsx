"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Mail, Send } from "lucide-react";
import { BRAND, CONTACTS, LEGAL_LINKS, SECTION_IDS, TARGETS } from "@/lib/site-config";

const PROGRAM_LINKS = [
  { href: "/math", label: "Algebra & Geometriya (Chuqur)" },
  { href: "/practice?subject=sat-math", label: `Digital ${TARGETS.sat}` },
  { href: "/practice?subject=sat-rw", label: "SAT Reading & Writing" },
  { href: "/practice?subject=ielts", label: `IELTS Academic (${TARGETS.ieltsShort})` },
];

const TOOL_LINKS = [
  { href: "/coach", label: `${BRAND.aiName} Murabbiy` },
  { href: `/#${SECTION_IDS.roadmap}`, label: "12 Oylik Tizim" },
  { href: "/placement", label: "Bepul Diagnostika Testi" },
  { href: "/history", label: "Dars Tarixi & Matnlar" },
  { href: `/#${SECTION_IDS.pricing}`, label: "Tariflar" },
  { href: `/#${SECTION_IDS.faq}`, label: "FAQ" },
];

const CONTACT_ITEMS = [
  { ...CONTACTS.telegramChannel, icon: Send, external: true },
  { ...CONTACTS.supportBot, icon: Bot, external: true },
  { ...CONTACTS.email, icon: Mail, external: false },
];

const WORKSPACE_PREFIXES = [
  "/math",
  "/learn",
  "/coach",
  "/dashboard",
  "/practice",
  "/mock",
  "/placement",
  "/roadmap",
  "/profile",
  "/history",
];

export function Footer() {
  const pathname = usePathname();
  const isWorkspaceRoute = WORKSPACE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`)
  );

  if (isWorkspaceRoute) {
    return null;
  }

  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brend */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-xl font-black text-emerald-400">
                3✦
              </div>
              <span className="text-xl font-black text-white">
                3<span className="text-emerald-400">Talaba</span> CAMPUS
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {TARGETS.program}: {TARGETS.sat} va {TARGETS.ielts} orqali xalqaro top universitetlarga grant
              asosida kirish uchun adaptiv ta&apos;lim platformasi.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-slate-300">
              <span className="glass-pill rounded-lg px-2.5 py-1">MIT &amp; Harvard</span>
              <span className="glass-pill rounded-lg px-2.5 py-1">Oxford &amp; Cambridge</span>
              <span className="glass-pill rounded-lg px-2.5 py-1">KAIST &amp; Yonsei</span>
              <span className="glass-pill rounded-lg px-2.5 py-1">Yangi O&apos;zbekiston &amp; WIUT</span>
            </div>
          </div>

          {/* Akademik dasturlar */}
          <nav aria-label="Akademik dasturlar">
            <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              Akademik Dasturlar
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              {PROGRAM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-emerald-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* O'quv asboblari */}
          <nav aria-label="O'quv asboblari">
            <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-white">
              O&apos;quv Asboblari
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              {TOOL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-[#c6f432]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Aloqa va ijtimoiy tarmoqlar */}
          <div className="lg:col-span-2">
            <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-teal-300">
              Aloqa &amp; Ijtimoiy Tarmoqlar
            </h4>
            <ul className="grid gap-2.5 sm:grid-cols-1 xl:grid-cols-2">
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="glass-pill group flex items-center gap-3 rounded-xl px-3 py-2.5"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300 transition-colors group-hover:bg-emerald-500/25 group-hover:text-emerald-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          {item.label}
                        </span>
                        <span className="block truncate text-xs font-bold text-white">{item.handle}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {BRAND.fullName}. Barcha huquqlar himoyalangan.</p>
          <nav aria-label="Huquqiy hujjatlar" className="flex flex-wrap items-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-emerald-400">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span>Xavfsiz va Sifatli Ta&apos;lim</span>
            <span aria-hidden="true">•</span>
            <span>Tushuntirishlar 100% O&apos;zbek Tilida</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
