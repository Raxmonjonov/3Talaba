import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { DynamicAmbientBackground } from "@/components/layout/DynamicAmbientBackground";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "3Talab — 1 Yilda Nufuzli Xorijiy Universitetlarga Tayyorgarlik",
    template: "%s | 3Talab",
  },
  description:
    "O'zbek tilidagi adaptiv SAT, IELTS, Matematika va Akademik yozuv platformasi. Noldan boshlab 12 oylik shaxsiy yo'l xaritasi va Socratic AI murabbiy bilan o'rganing.",
  keywords: [
    "3Talab",
    "SAT tayyorgarlik o'zbek tilida",
    "IELTS o'zbek tilida",
    "xorijiy universitetlar",
    "shaxsiy yo'l xaritasi",
    "AI murabbiy",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${jakarta.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="relative min-h-screen font-sans text-fg antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        <AppProviders>
          {/* O'quvchi tizimga kirganda yoki ro'yxatdan o'tganda avtomatik ravishda nurli sinfxona tusiga kiruvchi fon */}
          <DynamicAmbientBackground />

          <div className="relative z-10 flex min-h-screen flex-col justify-between">
            <Navbar />
            <main className="flex-1">{children}</main>

            {/* Xalqaro O'quv Kampusi Footer */}
            <footer className="mt-20 border-t border-white/10 bg-slate-950/70 backdrop-blur-2xl">
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Brand */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-400 font-black text-xl">
                        3✦
                      </div>
                      <span className="text-xl font-black text-white">
                        3<span className="text-emerald-400">Talab</span> CAMPUS
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      12 oyda xalqaro top universitetlarga grant asosida kirish uchun adaptiv ta&apos;lim platformasi.
                    </p>
                  </div>

                  {/* Dasturlar */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-3">
                      Akademik Dasturlar
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300 font-medium">
                      <li>
                        <Link href="/math" className="hover:text-emerald-400 transition-colors">
                          Algebra &amp; Geometriya (Chuqur)
                        </Link>
                      </li>
                      <li>
                        <Link href="/practice?subject=sat-math" className="hover:text-emerald-400 transition-colors">
                          Digital SAT Matematika (800)
                        </Link>
                      </li>
                      <li>
                        <Link href="/practice?subject=sat-rw" className="hover:text-emerald-400 transition-colors">
                          SAT Reading &amp; Writing
                        </Link>
                      </li>
                      <li>
                        <Link href="/practice?subject=ielts" className="hover:text-emerald-400 transition-colors">
                          IELTS Academic (Band 8.5)
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* O'quv Asboblari */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-3">
                      O&apos;quv Asboblari
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300 font-medium">
                      <li>
                        <Link href="/coach" className="hover:text-amber-300 transition-colors">
                          JARVIS AI Murabbiy
                        </Link>
                      </li>
                      <li>
                        <Link href="/history" className="hover:text-amber-300 transition-colors">
                          Dars Tarixi &amp; Matnlar
                        </Link>
                      </li>
                      <li>
                        <Link href="/roadmap" className="hover:text-amber-300 transition-colors">
                          12 Oylik Shaxsiy Xarita
                        </Link>
                      </li>
                      <li>
                        <Link href="/placement" className="hover:text-amber-300 transition-colors">
                          Adaptiv Bilim Testi
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Maqsadli Universitetlar */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-300 mb-3">
                      Top Universitetlar
                    </h4>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                      <span className="glass-pill rounded-lg px-2.5 py-1">MIT &amp; Harvard</span>
                      <span className="glass-pill rounded-lg px-2.5 py-1">Oxford &amp; Cambridge</span>
                      <span className="glass-pill rounded-lg px-2.5 py-1">KAIST &amp; Yonsei</span>
                      <span className="glass-pill rounded-lg px-2.5 py-1">Yangi O&apos;zbekiston &amp; WIUT</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                  <p>© 2026 3Talab Ta&apos;lim Platformasi. Barcha huquqlar himoyalangan.</p>
                  <div className="flex items-center gap-4">
                    <span>Xavfsiz va Sifatli Ta&apos;lim</span>
                    <span>•</span>
                    <span>100% O&apos;zbek Tilida</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
