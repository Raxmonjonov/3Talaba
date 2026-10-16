import React from "react";
import Link from "next/link";
import { BookOpen, Compass, Home, Sparkles } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center px-4 py-12">
      <div className="glass-card w-full p-8 text-center sm:p-10">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-1.5 font-mono text-xs font-extrabold text-gold">
          <Sparkles className="h-4 w-4" />
          <span>404 • SAHIFA TOPILMADI</span>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-fg sm:text-4xl">
          Yo&apos;ldan adashdingizmi? Bilim xaritasi shu yerda!
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          Siz izlagan manzil topilmadi yoki ko&apos;chirilgan bo&apos;lishi mumkin.
          Ammo top universitet sari 12 oylik sayohatingiz to&apos;xtamaydi!
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-neon inline-flex items-center gap-2 px-5 py-3 text-xs font-bold sm:text-sm"
          >
            <Home className="h-4 w-4" />
            <span>Bosh sahifaga qaytish</span>
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-xs font-bold text-fg hover:border-neon sm:text-sm"
          >
            <BookOpen className="h-4 w-4 text-neon" />
            <span>Darslar katalogi</span>
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-xs font-bold text-fg hover:border-gold sm:text-sm"
          >
            <Compass className="h-4 w-4 text-gold" />
            <span>12 Oylik Xarita</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
