"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

/**
 * Hero asosiy harakat tugmasi.
 * Mehmon o'quvchini to'g'ridan-to'g'ri bepul Adaptiv Diagnostika Testiga (/placement) yo'naltiradi.
 */
export function HeroPrimaryCta() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <Link
        href="/roadmap"
        className="btn-neon inline-flex items-center gap-2.5 px-7 py-4 text-base font-bold shadow-xl"
      >
        <Compass className="h-5 w-5" />
        <span>Shaxsiy Xaritangizni Ochish</span>
        <ArrowRight className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link
      href="/placement"
      className="btn-neon inline-flex items-center gap-2.5 px-8 py-4 text-base font-bold shadow-xl"
    >
      <Sparkles className="h-5 w-5" />
      <span>Hoziroq Boshlash (Diagnostika)</span>
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}
