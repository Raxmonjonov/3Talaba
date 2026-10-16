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
      <body className="min-h-screen bg-canvas font-sans text-fg antialiased">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
