import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
    default: "3Talaba Campus — SAT 1500+ (Math 800) va IELTS 7.5+ ga tizimli tayyorgarlik",
    template: "%s | 3Talaba Campus",
  },
  description:
    "O'zbek tilidagi adaptiv SAT, IELTS, Matematika va Akademik yozuv platformasi. Tizimli 12 oylik shaxsiy yo'l xaritasi va Talaba AI murabbiy bilan o'rganing.",
  keywords: [
    "3Talaba",
    "3Talaba Campus",
    "SAT tayyorgarlik o'zbek tilida",
    "IELTS o'zbek tilida",
    "xorijiy universitetlar",
    "shaxsiy yo'l xaritasi",
    "Talaba AI",
    "AI murabbiy",
  ],
  applicationName: "3Talaba Campus",
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: "3Talaba Campus",
    title: "3Talaba Campus — SAT 1500+ (Math 800) va IELTS 7.5+ ga tizimli tayyorgarlik",
    description:
      "Tizimli 12 oylik tayyorgarlik, Talaba AI murabbiy va tushuntirishlar 100% o'zbek tilida.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${jakarta.variable} ${jetbrainsMono.variable} dark overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="relative min-h-screen max-w-[100vw] overflow-x-hidden bg-canvas font-sans text-fg antialiased selection:bg-[#c6f432] selection:text-[#0b0b0c]">
        <AppProviders>
          {/* O'quvchi tizimga kirganda yoki ro'yxatdan o'tganda avtomatik ravishda nurli sinfxona tusiga kiruvchi fon */}
          <DynamicAmbientBackground />

          <div className="relative z-10 flex min-h-screen w-full max-w-[100vw] flex-col justify-between overflow-x-hidden">
            <Navbar />
            <main className="flex-1 min-h-0 overflow-x-hidden">{children}</main>

            {/* Xalqaro O'quv Kampusi Footer */}
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
