import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface LegalSection {
  heading: string;
  body: string;
}

export function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
}: {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Bosh sahifa</span>
      </Link>

      <article className="glass-card mt-6 space-y-6 p-6 sm:p-10">
        <header className="space-y-2 border-b border-white/10 pb-6">
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="font-mono text-xs text-slate-400">Oxirgi yangilanish: {updatedAt}</p>
          <p className="text-sm leading-relaxed text-slate-300">{intro}</p>
        </header>

        {sections.map((section, idx) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-base font-bold text-white">
              {idx + 1}. {section.heading}
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">{section.body}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
