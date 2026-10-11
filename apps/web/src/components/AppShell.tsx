import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", match: /^\/dashboard$/ },
  { to: "/practice", label: "Mashq", match: /^\/practice/ },
  { to: "/courses", label: "Kurslar", match: /^\/courses/ },
  { to: "/skills", label: "Mavzular", match: /^\/skills/ },
  { to: "/mock-exams", label: "Imtihonlar", match: /^\/mock-exams/ },
  { to: "/settings", label: "Hisob", match: /^\/settings$/ },
] as const;

export function AppShell({
  title,
  subtitle,
  backTo,
  backLabel = "Orqaga",
  maxWidth = "max-w-3xl",
  actions,
  children,
  showNav = true,
}: {
  title: string;
  subtitle?: ReactNode;
  backTo?: string;
  backLabel?: string;
  maxWidth?: string;
  actions?: ReactNode;
  children: ReactNode;
  showNav?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-card/70 backdrop-blur-sm">
        <div
          className={`mx-auto flex ${maxWidth} items-center justify-between gap-3 px-5 py-4`}
        >
          <div className="min-w-0 space-y-0.5">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            {subtitle ? (
              <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {actions}
            {backTo ? (
              <button
                onClick={() => navigate(backTo)}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {backLabel}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className={`mx-auto w-full ${maxWidth} flex-1 space-y-6 px-5 py-8`}>
        {children}
      </main>

      {showNav ? (
        <nav
          aria-label="Asosiy bo‘limlar"
          className="sticky bottom-0 z-10 border-t bg-card/80 backdrop-blur-sm"
        >
          <div
            className={`mx-auto flex ${maxWidth} items-stretch justify-between gap-1 overflow-x-auto px-2 py-1`}
          >
            {NAV_ITEMS.map((item) => {
              const active = item.match.test(location.pathname);
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => navigate(item.to)}
                  aria-current={active ? "page" : undefined}
                  className={`min-w-0 flex-1 rounded-lg px-1.5 py-2 text-center text-[11px] leading-tight sm:text-xs ${
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
