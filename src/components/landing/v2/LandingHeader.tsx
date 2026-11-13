"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { loadSecureLocal } from "@/lib/security/client-storage";
import { BRAND } from "@/lib/site-config";

const LINKS = [
  { href: "#platforma", label: "Platforma" },
  { href: "#metod", label: "Metod" },
  { href: "#oyinlar", label: "O'yinlar" },
  { href: "#kafolat", label: "Kafolat" },
  { href: "#faq", label: "Savollar" },
];

export function LandingHeader() {
  const { data: session } = useSession();
  const [localName, setLocalName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const parsed = loadSecureLocal<{ name?: string }>("3talaba_user");
    if (parsed?.name) setLocalName(parsed.name);
  }, []);

  const isLoggedIn = Boolean(session?.user?.name ?? localName);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label={`${BRAND.fullName} bosh sahifa`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF4B3C] text-lg font-black text-white">
            3
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-slate-900">{BRAND.name}</span>
            <span className="block text-[10px] font-medium text-slate-500">SAT · IELTS · Matematika</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Asosiy">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Link href="/dashboard" className="rounded-xl bg-[#FF4B3C] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#e63e30]">
              Kabinetga o&apos;tish
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Kirish
              </Link>
              <Link href="/placement" className="rounded-xl bg-[#FF4B3C] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#e63e30]">
                Boshlash
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menyu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col py-2">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-semibold text-slate-700">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="grid grid-cols-2 gap-2">
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700">
              {isLoggedIn ? "Kabinet" : "Kirish"}
            </Link>
            <Link href="/placement" className="rounded-xl bg-[#FF4B3C] py-2.5 text-center text-sm font-bold text-white">
              Boshlash
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
