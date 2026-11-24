import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "3Talab — Yangi avlod ta'lim platformasi",
  description:
    "Next.js App Router, TypeScript, Tailwind CSS va Prisma/PostgreSQL asosida noldan qurilgan toza arxitektura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={inter.variable}>
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-amber-400/30 selection:text-amber-100">
        {children}
      </body>
    </html>
  );
}
