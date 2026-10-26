"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  Monitor,
  Apple,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface OSDownload {
  id: "windows" | "mac" | "linux";
  name: string;
  badge: string;
  fileName: string;
  fileExt: string;
  fileSize: string;
  downloadUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  requirements: string;
  instructions: string[];
}

const OS_DOWNLOADS: OSDownload[] = [
  {
    id: "windows",
    name: "Windows (10 / 11)",
    badge: "Tavsiya etiladi (.exe)",
    fileName: "3Talab-Setup.exe",
    fileExt: ".exe",
    fileSize: "Nativ .exe (Yengil & Tezkor)",
    downloadUrl: "/downloads/3Talab-Setup.exe",
    icon: Monitor,
    color: "neon",
    requirements: "Windows 10 / 11 (64-bit), 4GB RAM",
    instructions: [
      "1. «3Talab-Setup.exe» faylini yuklab oling.",
      "2. Faylni oching va «O'rnatish» (Install) tugmasini bosing.",
      "3. SmartScreen ogohlantirishi chiqsa, «Batafsil» -> «Baribir ishga tushirish»ni bosing.",
      "4. Dastur ishga tushgach, o'z hisobingizga kiring.",
    ],
  },
  {
    id: "mac",
    name: "macOS (Apple Silicon & Intel)",
    badge: "Universal (.dmg)",
    fileName: "3Talab-mac.zip",
    fileExt: ".zip / .command",
    fileSize: "15 KB",
    downloadUrl: "/downloads/3Talab-mac.zip",
    icon: Apple,
    color: "gold",
    requirements: "macOS 12.0 Monterey yoki undan yangi, M1/M2/M3 yoki Intel",
    instructions: [
      "1. «3Talab.dmg» faylini yuklab oling va oching.",
      "2. 3Talab belgisini Applications (Dasturlar) jildiga sudrab tashlang.",
      "3. Dasturni birinchi marta ochganda «Open» (Ochish) tugmasini bosing.",
      "4. Offline va Online darslardan foydalaning.",
    ],
  },
  {
    id: "linux",
    name: "Kali Linux / Ubuntu / Debian",
    badge: "Linux (.AppImage & .deb)",
    fileName: "3Talab.AppImage",
    fileExt: ".AppImage",
    fileSize: "Skript (.AppImage)",
    downloadUrl: "/downloads/3Talab.AppImage",
    icon: Terminal,
    color: "neon",
    requirements: "Kali Linux 2022+, Ubuntu 20.04+, Debian 11+ (x86_64)",
    instructions: [
      "1. «3Talab.AppImage» yoki «3talab.deb» paketini yuklab oling.",
      "2. Terminalda ruxsat bering: chmod +x 3Talab.AppImage",
      "3. Ishga tushirish: ./3Talab.AppImage",
      "4. Yoki .deb uchun: sudo dpkg -i 3talab.deb",
    ],
  },
];

export default function DownloadPage() {
  const [selectedOS, setSelectedOS] = useState<"windows" | "mac" | "linux">("windows");
  const activeOS = OS_DOWNLOADS.find((os) => os.id === selectedOS)!;

  return (
    <div className="classroom-grid-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Sarlavha */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon-soft px-3.5 py-1 text-xs font-bold text-neon">
            <Download className="h-3.5 w-3.5" />
            <span>DESKTOP ILOVALARNI YUKLAB OLISH</span>
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-fg sm:text-4xl">
            3Talab platformasini kompyuteringizga o&apos;rnating
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-fg-muted sm:text-base leading-relaxed">
            Windows (.exe), macOS (.dmg) hamda Kali Linux (.AppImage/.deb) tizimlariga to&apos;liq moslashtirilgan.
            Darslar, testlar va AI murabbiydan maksimal tezlikda foydalaning.
          </p>
        </div>

        {/* 3 ta tizim tanlov kartalari */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {OS_DOWNLOADS.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedOS === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedOS(item.id)}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all ${
                  isSelected
                    ? "border-neon bg-neon-soft/30 shadow-neon scale-[1.02]"
                    : "border-border bg-surface hover:border-fg-muted"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                        isSelected
                          ? "border-neon bg-neon text-canvas"
                          : "border-border bg-elevated text-fg"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-elevated px-2.5 py-0.5 font-mono text-[11px] font-bold text-fg-muted">
                      {item.fileExt}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-fg">{item.name}</h3>
                  <p className="mt-1 text-xs text-fg-muted">{item.badge}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="font-mono text-fg-muted">{item.fileSize}</span>
                  <span
                    className={`font-semibold ${
                      isSelected ? "text-neon" : "text-fg-muted"
                    }`}
                  >
                    {isSelected ? "Tanlangan ✓" : "Tanlash →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tanlangan OS yuklab olish asosiy paneli */}
        <div className="mt-8 glass-card p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-neon-soft px-2.5 py-0.5 font-mono text-xs font-bold text-neon">
                  VERSIYA 1.2.0 • 2026
                </span>
                <span className="text-xs text-fg-muted flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-neon" />
                  Xavfsiz va tekshirilgan
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-extrabold text-fg sm:text-3xl">
                {activeOS.name} uchun {activeOS.fileName}
              </h2>
              <p className="mt-1 text-xs text-fg-muted sm:text-sm">
                Talablar: {activeOS.requirements}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={activeOS.downloadUrl}
                download={activeOS.fileName}
                className="btn-neon inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold shadow-neon"
              >
                <Download className="h-4 w-4" />
                <span>Hoziroq Yuklab Olish ({activeOS.fileSize})</span>
              </a>

              {activeOS.id === "linux" && (
                <a
                  href="/downloads/3talab.deb"
                  download="3talab.deb"
                  className="rounded-xl border border-border bg-surface px-4 py-3 text-xs font-semibold text-fg hover:border-neon text-center"
                >
                  .deb paket (Kali/Debian)
                </a>
              )}
            </div>
          </div>

          {/* O'rnatish qo'llanmasi */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-fg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neon" />
              <span>O&apos;rnatish va ishga tushirish yo&apos;riqnomasi:</span>
            </h3>

            <div className="mt-3 space-y-2">
              {activeOS.instructions.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/80 bg-canvas/60 px-4 py-3 text-xs text-fg sm:text-sm font-mono flex items-center justify-between"
                >
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Afzalliklar */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3 border-t border-border pt-6 text-xs text-fg-muted">
            <div className="flex items-start gap-2.5">
              <Cpu className="h-4 w-4 text-neon shrink-0 mt-0.5" />
              <div>
                <strong className="block text-fg font-semibold">Tezkor Native Ishlash</strong>
                Kompyuter resurslaridan to&apos;liq unumli foydalanadi, brauzerdan 2 barobar tezroq yuklanadi.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <HardDrive className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <div>
                <strong className="block text-fg font-semibold">Offline Nazariya va Misollar</strong>
                Internet uzilib qolgan paytda ham dars nazariyasi va testlarni yechish imkoniyati.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Layers className="h-4 w-4 text-neon shrink-0 mt-0.5" />
              <div>
                <strong className="block text-fg font-semibold">Avtomatik Sinxronizatsiya</strong>
                To&apos;plagan XP va progresslaringiz veb-sayt va dastur o&apos;rtasida darhol yangilanadi.
              </div>
            </div>
          </div>
        </div>

        {/* Orqaga qaytish */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-muted hover:text-neon transition-colors"
          >
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
