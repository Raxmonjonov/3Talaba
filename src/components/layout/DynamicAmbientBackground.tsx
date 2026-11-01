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
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-all duration-1000"
    >
      {isAuthenticated ? (
        /* O'quvchi ro'yxatdan o'tgandan keyingi JONLI NURLI TALABA AURA FON */
        <>
          {/* Yuqori chap: Zangori Zumrad Nur */}
          <div className="absolute -top-32 -left-32 h-[750px] w-[750px] rounded-full bg-emerald-500/35 blur-[140px] animate-pulse" />

          {/* Yuqori o'ng: Moviy Okean Nur */}
          <div className="absolute top-10 -right-40 h-[700px] w-[700px] rounded-full bg-sky-500/30 blur-[150px]" />

          {/* Markaziy: Qirollik Binafsha / Indigo Yorug'lik */}
          <div className="absolute top-1/2 left-1/4 h-[650px] w-[650px] -translate-y-1/2 rounded-full bg-indigo-500/25 blur-[160px]" />

          {/* Pastki o'ng: Zafar Oltin Nur */}
          <div className="absolute -bottom-40 right-10 h-[650px] w-[650px] rounded-full bg-amber-500/28 blur-[150px]" />

          {/* Pastki chap: Jonli Yashil Aura */}
          <div className="absolute -bottom-32 -left-20 h-[600px] w-[600px] rounded-full bg-teal-400/25 blur-[140px]" />

          {/* Nozik shisha to'r panjarasi */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-70" />
        </>
      ) : (
        /* Mehmon (kirilmagan) holatidagi chuqur sokin oqshom fon */
        <>
          <div className="absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full bg-emerald-500/25 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-teal-500/20 blur-[150px]" />
          <div className="absolute -bottom-40 right-1/4 h-[550px] w-[550px] rounded-full bg-indigo-500/18 blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
        </>
      )}
    </div>
  );
}
