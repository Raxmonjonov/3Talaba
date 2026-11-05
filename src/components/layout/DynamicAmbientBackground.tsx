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
        /* O'quvchi sinfxonasi: #0b0b0c Qora asosda #c6f432 Lime Green va #ffffff Oq mayin nurlar */
        <>
          <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c6f432] via-[#ffffff] to-[#c6f432] shadow-[0_0_20px_rgba(198,244,50,0.75)] z-50 pointer-events-none" />
          <div className="absolute -top-36 left-1/2 -translate-x-1/2 h-[620px] w-[860px] rounded-full bg-[#c6f432]/12 blur-[150px]" />
          <div className="absolute top-1/4 -right-40 h-[560px] w-[560px] rounded-full bg-white/[0.04] blur-[150px]" />
          <div className="absolute -bottom-40 left-12 h-[540px] w-[540px] rounded-full bg-[#c6f432]/[0.08] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,244,50,0.05)_1px,transparent_1px)] bg-[size:36px_36px] opacity-70" />
        </>
      ) : (
        /* Mehmon holati: chuqur #0b0b0c Qora + nozik #c6f432 Lime va #ffffff Oq shisha atmosferasi */
        <>
          <div className="absolute -top-44 -left-40 h-[620px] w-[620px] rounded-full bg-[#c6f432]/[0.11] blur-[150px]" />
          <div className="absolute top-1/3 -right-44 h-[560px] w-[560px] rounded-full bg-white/[0.04] blur-[150px]" />
          <div className="absolute -bottom-44 right-1/4 h-[520px] w-[520px] rounded-full bg-[#c6f432]/[0.07] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:40px_40px] opacity-55" />
        </>
      )}
    </div>
  );
}
