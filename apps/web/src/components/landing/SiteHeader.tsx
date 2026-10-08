import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/useTranslation";
import { authPath } from "@/i18n/config";
import type { User } from "@/lib/types";
import { CloseIcon, MenuIcon } from "./Icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

type SiteHeaderProps = {
  user: User | null;
  onLogout: () => void;
};

export function SiteHeader({ user, onLogout }: SiteHeaderProps) {
  const { locale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#preview", label: t.nav.preview },
    { href: "#dialogue", label: t.nav.dialogue },
    { href: "#plans", label: t.nav.weekly },
    { href: "#subjects", label: t.nav.subjects },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-background/85 backdrop-blur transition-shadow ${
        scrolled ? "border-border shadow-sm" : "border-transparent"
      }`}
    >
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-foreground"
          onClick={() => setOpen(false)}
        >
          {t.nav.brand}
        </Link>

        <nav aria-label={t.nav.brand} className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher compact />
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard" className="btn-secondary text-sm">
                {t.nav.dashboard}
              </Link>
              <button type="button" onClick={onLogout} className="btn-primary text-sm">
                {t.nav.login}
              </button>
            </>
          ) : (
            <>
              <Link to={authPath("login", locale)} className="btn-secondary text-sm">
                {t.nav.login}
              </Link>
              <Link to={authPath("register", locale)} className="btn-primary text-sm">
                {t.nav.register}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-background lg:hidden">
          <nav aria-label={t.nav.brand} className="page-shell flex flex-col gap-1 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <LanguageSwitcher />
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-secondary w-full" onClick={() => setOpen(false)}>
                    {t.nav.dashboard}
                  </Link>
                  <button
                    type="button"
                    className="btn-primary w-full"
                    onClick={() => {
                      onLogout();
                      setOpen(false);
                    }}
                  >
                    {t.nav.login}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={authPath("login", locale)}
                    className="btn-secondary w-full"
                    onClick={() => setOpen(false)}
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    to={authPath("register", locale)}
                    className="btn-primary w-full"
                    onClick={() => setOpen(false)}
                  >
                    {t.nav.register}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
