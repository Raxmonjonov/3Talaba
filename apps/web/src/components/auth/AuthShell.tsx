import { lazy, Suspense, type ReactNode } from "react";
import { LOCALES } from "@/i18n/config";
import { useAuthLocale } from "@/i18n/useAuthLocale";
import { GlobeIcon } from "@/components/landing/Icons";

// The scene is decoration: it is pulled in after first paint so the form is
// never waiting on it.
const HeroScene = lazy(() => import("@/components/landing/HeroScene"));

type AuthShellProps = {
  tagline: string;
  children: ReactNode;
  footnote: ReactNode;
};

function AuthLanguageSwitcher() {
  const { locale, setLocale, t } = useAuthLocale();

  return (
    <div className="flex items-center gap-1 rounded-full border bg-surface p-1 text-sm">
      <GlobeIcon className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      {LOCALES.map((option) => {
        const isActive = option.code === locale;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLocale(option.code)}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`}
          >
            <span className="sr-only">{option.label}</span>
            <span aria-hidden="true">{option.code.toUpperCase()}</span>
          </button>
        );
      })}
      <span className="sr-only">{t.auth.language}</span>
    </div>
  );
}

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

      <div className="absolute right-5 top-5 z-20">
        <AuthLanguageSwitcher />
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
