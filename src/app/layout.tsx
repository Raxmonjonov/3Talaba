import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";

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
        {/* Glassmorphic Ambient Luminous Backdrop (Haqiqiy shisha nurli fon) */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          {/* Zumrad neon nur (Emerald Glow) */}
          <div className="absolute -left-[10%] -top-[10%] h-[750px] w-[750px] rounded-full bg-emerald-500/20 blur-[130px] md:h-[950px] md:w-[950px] md:bg-emerald-500/25" />
          {/* Moviy feruza nur (Cyan Glow) */}
          <div className="absolute -right-[10%] top-[12%] h-[650px] w-[650px] rounded-full bg-cyan-500/18 blur-[120px] md:h-[850px] md:w-[850px] md:bg-cyan-500/22" />
          {/* Indigo binafsha nur (Indigo Glow) */}
          <div className="absolute -bottom-[20%] left-[5%] h-[700px] w-[700px] rounded-full bg-indigo-600/18 blur-[150px] md:h-[900px] md:w-[900px]" />
          {/* Oltin iliq nur (Gold Accent Glow) */}
          <div className="absolute -bottom-[10%] right-[10%] h-[600px] w-[600px] rounded-full bg-amber-500/18 blur-[130px] md:h-[750px] md:w-[750px]" />
          {/* Shisha to'r akslantiruvchi yengil naqsh */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px] opacity-80" />
        </div>

        <AppProviders>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
