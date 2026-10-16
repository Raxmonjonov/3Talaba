"use client";

import React from "react";
import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="glass-card w-full p-8">
        <span className="inline-block rounded-full bg-danger/15 px-3 py-1 text-xs font-bold text-danger">
          Tizim xatoligi
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-fg">
          Kutilmagan nosozlik yuz berdi
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          Xavotir olmang, o&apos;quv natijalaringiz xavfsiz saqlangan. Sahifani qayta
          yuklab ko&apos;ring.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="btn-neon px-5 py-2.5 text-sm font-bold"
          >
            Qayta urinish
          </button>
          <Link
            href="/"
            className="rounded-xl border border-border bg-elevated px-5 py-2.5 text-sm font-semibold text-fg"
          >
            Bosh sahifa
          </Link>
        </div>
      </div>
    </div>
  );
}
