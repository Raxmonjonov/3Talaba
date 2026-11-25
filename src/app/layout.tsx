import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Flux — Top 300 Universitetlar Sari Jonli AI Metodologiya",
    template: "%s | Flux",
  },
  description:
    "SAT 1500+, IELTS 7.5+ va Top 300 xalqaro universitetlarga kirish uchun ovozli AI ustoz va shaxsiy yo'l xaritasi — 100% tabiiy o'zbek tilida.",
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
    >
      <body className="relative min-h-screen max-w-[100vw] overflow-x-hidden bg-[#0b0b0c] font-sans text-white antialiased selection:bg-[#c6f432] selection:text-[#0b0b0c]">
        {children}
      </body>
    </html>
  );
}
