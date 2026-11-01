"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";

export function DynamicAmbientBackground() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isAuthenticated) {
        document.body.classList.add("student-authenticated-campus");
        document.body.classList.remove("guest-campus");
      } else {
        document.body.classList.add("guest-campus");
        document.body.classList.remove("student-authenticated-campus");
      }
    }
  }, [isAuthenticated]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-all duration-700"
    >
      {isAuthenticated ? (
        /* O'quvchi tizimga kirganidan keyingi maxsus Jonli Shaxsiy Sinfxona Foni */
        <>
          {/* Yuqori chegara yorug'lik nuri (Luminous Top Horizon) */}
          <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 shadow-[0_0_20px_rgba(16,185,129,0.85)] z-50 pointer-events-none" />

          {/* Yuqori markaziy zumrad nur */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-emerald-500/35 blur-[150px] animate-pulse" />

          {/* O'ng yuqori feruza nur */}
          <div className="absolute top-12 -right-36 h-[650px] w-[650px] rounded-full bg-sky-500/30 blur-[150px]" />

          {/* Markaziy indigo-binafsha chuqurlik */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/28 blur-[160px]" />

          {/* Pastki o'ng oltin nur */}
          <div className="absolute -bottom-36 right-10 h-[650px] w-[650px] rounded-full bg-amber-500/30 blur-[150px]" />

          {/* Shisha mikrotuzilma panjarasi */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.07)_1px,transparent_1px)] bg-[size:32px_32px] opacity-80" />
        </>
      ) : (
        /* Mehmon (tizimga kirmagan) holatidagi chuqur sokin oqshom shisha foni */
        <>
          <div className="absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full bg-emerald-500/22 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-teal-500/18 blur-[150px]" />
          <div className="absolute -bottom-40 right-1/4 h-[550px] w-[550px] rounded-full bg-indigo-500/15 blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
        </>
      )}
    </div>
  );
}
