import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, Globe2, Layers, Sigma } from "lucide-react";
import { SECTION_IDS, TARGETS } from "@/lib/site-config";

interface ProgramCard {
  href: string;
  title: string;
  badge: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  accent: "emerald" | "amber";
}

const PROGRAMS: ProgramCard[] = [
  {
    href: "/math",
    title: "Algebra & Geometriya",
    badge: "15 ta Modul",
    description: "6 bosqichli chuqur metod, formulalar isboti va vizual SVG modellar.",
    cta: "Kursga kirish",
    icon: Sigma,
    accent: "emerald",
  },
  {
    href: "/practice?subject=sat-math",
    title: "SAT Matematika",
    badge: TARGETS.satMath,
    description: "Tenglamalar, funksiyalar va raqamli SAT imtihoni savollar banki.",
    cta: "Savollar bankiga o'tish",
    icon: Layers,
    accent: "amber",
  },
  {
    href: "/practice?subject=sat-rw",
    title: "SAT Reading & Writing",
    badge: "R&W Moduli",
    description: "Akademik matnlar tahlili, mantiqiy xulosalar va grammatik qoliplar.",
    cta: "Mashqlarni boshlash",
    icon: BookOpen,
    accent: "emerald",
  },
  {
    href: "/practice?subject=ielts",
    title: "IELTS Academic",
    badge: TARGETS.ielts,
    description: "Listening, Reading, Academic Writing Task 1/2 va Speaking ko'nikmalari.",
    cta: "IELTS darslariga o'tish",
    icon: Globe2,
    accent: "amber",
  },
];

const ACCENT_STYLES = {
  emerald: {
    iconBox: "border-emerald-400/40 bg-emerald-500/20 text-emerald-400",
    badge: "text-emerald-300",
    titleHover: "group-hover:text-emerald-400",
    footer: "text-emerald-400",
  },
  amber: {
    iconBox: "border-amber-400/40 bg-amber-400/20 text-amber-300",
    badge: "text-amber-300",
    titleHover: "group-hover:text-amber-300",
    footer: "text-amber-300",
  },
} as const;

export function ProgramsSection() {
  return (
    <section
      id={SECTION_IDS.programs}
      className="scroll-mt-28 space-y-6"
      aria-labelledby="programs-title"
    >
      <h2 id="programs-title" className="text-2xl font-black tracking-tight text-white sm:text-3xl">
        Kurslar
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PROGRAMS.map((program) => {
          const styles = ACCENT_STYLES[program.accent];
          const Icon = program.icon;
          return (
            <Link
              key={program.href}
              href={program.href}
              className="glass-card glass-card-interactive group flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105 ${styles.iconBox}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`glass-pill rounded-full px-3 py-1 font-mono text-xs font-bold ${styles.badge}`}>
                    {program.badge}
                  </span>
                </div>
                <h3 className={`mt-4 text-xl font-bold text-white transition-colors ${styles.titleHover}`}>
                  {program.title}
                </h3>
              </div>
              <div
                className={`mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold ${styles.footer}`}
              >
                <span>{program.cta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
