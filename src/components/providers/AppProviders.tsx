"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

type ThemeMode = "dark" | "light";

interface UIPreferencesContextValue {
  theme: ThemeMode;
  reduceMotion: boolean;
  toggleTheme: () => void;
  toggleReduceMotion: () => void;
  setTheme: (theme: ThemeMode) => void;
  setReduceMotion: (reduce: boolean) => void;
}

const UIPreferencesContext = createContext<UIPreferencesContextValue>({
  theme: "dark",
  reduceMotion: false,
  toggleTheme: () => {},
  toggleReduceMotion: () => {},
  setTheme: () => {},
  setReduceMotion: () => {},
});

export function useUIPreferences() {
  return useContext(UIPreferencesContext);
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("3talab_theme") as ThemeMode | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
    }

    const savedMotion = localStorage.getItem("3talab_reduce_motion");
    if (savedMotion !== null) {
      setReduceMotionState(savedMotion === "true");
    } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduceMotionState(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("3talab_theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
    localStorage.setItem("3talab_reduce_motion", String(reduceMotion));
  }, [reduceMotion]);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
    fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  };

  const setReduceMotion = (next: boolean) => {
    setReduceMotionState(next);
    fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reduceMotion: next }),
    }).catch(() => {});
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleReduceMotion = () => setReduceMotion(!reduceMotion);

  return (
    <SessionProvider>
      <UIPreferencesContext.Provider
        value={{
          theme,
          reduceMotion,
          toggleTheme,
          toggleReduceMotion,
          setTheme,
          setReduceMotion,
        }}
      >
        {children}
      </UIPreferencesContext.Provider>
    </SessionProvider>
  );
}
