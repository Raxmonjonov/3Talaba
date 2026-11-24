import { Database, Layers, ShieldCheck, Sparkles } from "lucide-react";

const stackItems = [
  {
    icon: Layers,
    title: "Next.js App Router",
    description: "Server Components, API Route Handlers va zamonaviy React 19 arxitekturasi.",
  },
  {
    icon: ShieldCheck,
    title: "Strict TypeScript + Zod",
    description: "Qat'iy tiplash va barcha kirish ma'lumotlari uchun sxema tekshiruvi.",
  },
  {
    icon: Database,
    title: "Prisma + PostgreSQL",
    description: "Migratsiyalar va kengaytirishga tayyor relyatsion ma'lumotlar bazasi qatlami.",
  },
  {
    icon: Sparkles,
    title: "Tailwind CSS v4",
    description: "Tezkor, yengil va izchil dizayn tizimi uchun toza CSS asos.",
  },
];

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_55%)]"
      />

      <div className="relative z-10 w-full max-w-4xl space-y-12">
        <header className="space-y-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-medium tracking-wide text-amber-300">
            3Talab v2 · Toza start
          </span>

          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Yangi arxitektura tayyor.
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Eski kodlar <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-200">archive/v1</code>{" "}
            branchida zaxiralandi. Endi barcha modullarni toza va tartibli ko&apos;rinishda boshidan
            quramiz.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {stackItems.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-colors hover:border-zinc-700"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-amber-400">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-medium text-white">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{description}</p>
            </div>
          ))}
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
          <span>
            Health endpoint:{" "}
            <a
              href="/api/health"
              className="text-zinc-300 underline decoration-zinc-700 underline-offset-4 hover:text-amber-300"
            >
              /api/health
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}
