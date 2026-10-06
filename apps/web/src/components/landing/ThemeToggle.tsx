import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/lib/useTheme";
import { MoonIcon, SunIcon } from "./Icons";

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface text-foreground transition-colors hover:bg-secondary"
      aria-label={`${t.nav.toggleTheme}: ${isDark ? t.nav.themeLight : t.nav.themeDark}`}
      title={isDark ? t.nav.themeLight : t.nav.themeDark}
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
