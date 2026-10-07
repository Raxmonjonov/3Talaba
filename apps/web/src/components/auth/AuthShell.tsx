import { lazy, Suspense, type ReactNode } from "react";

// The scene is decoration: it is pulled in after first paint so the form is
// never waiting on it.
const HeroScene = lazy(() => import("@/components/landing/HeroScene"));

type AuthShellProps = {
  tagline: string;
  children: ReactNode;
  footnote: ReactNode;
};

export function AuthShell({ tagline, children, footnote }: AuthShellProps) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-motif" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 glow-violet" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            3Talab
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground sm:text-base lg:mx-0">
            {tagline}
          </p>

          <div className="auth-stack mt-10 hidden lg:block" aria-hidden="true">
            <span className="auth-chip auth-chip-back" />
            <span className="auth-chip auth-chip-mid" />
            <span className="auth-chip auth-chip-front" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-lg lg:max-w-none">
          <div className="auth-card rounded-2xl border bg-card p-6 shadow-sm sm:p-7">
            {children}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footnote}
          </p>
        </div>
      </div>
    </div>
  );
}
