import type { Config } from "tailwindcss";

/**
 * 3Talaba Campus — Uch Rangli Yagona Brend Palitrasi:
 * 1. Qora (Obsidian Black): #0b0b0c (RGB: 11 11 12)
 * 2. Oq (Pure White):       #ffffff (RGB: 255 255 255)
 * 3. Lime Green:            #c6f432 (RGB: 198 244 50)
 */
const limeScale = {
  50: "#f9fee8",
  100: "#f1fccb",
  200: "#e4f99b",
  300: "#d6f766",
  400: "#c6f432",
  500: "#c6f432",
  600: "#a5d11b",
  700: "#7ea113",
  800: "#5d7712",
  900: "#36460b",
  950: "#0b0b0c",
};

const carbonScale = {
  50: "#ffffff",
  100: "#f4f4f5",
  200: "#e4e4e7",
  300: "#d4d4d8",
  400: "#a1a1aa",
  500: "#71717a",
  600: "#52525b",
  700: "#27272a",
  800: "#1a1a1d",
  900: "#121214",
  950: "#0b0b0c",
};

const whiteLimeAccentScale = {
  50: "#ffffff",
  100: "#ffffff",
  200: "#f3fdd8",
  300: "#ffffff",
  400: "#e2fa82",
  500: "#c6f432",
  600: "#a5d11b",
  700: "#7ea113",
  800: "#36460b",
  900: "#1a1a1d",
  950: "#0b0b0c",
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--bg-canvas-rgb) / <alpha-value>)",
        surface: "rgb(var(--bg-surface-rgb) / <alpha-value>)",
        elevated: "rgb(var(--bg-elevated-rgb) / <alpha-value>)",
        border: "var(--border-subtle)",
        neon: {
          DEFAULT: "rgb(var(--accent-neon-rgb) / <alpha-value>)",
          soft: "var(--accent-neon-soft)",
          glow: "var(--accent-neon-glow)",
        },
        gold: {
          DEFAULT: "rgb(var(--accent-gold-rgb) / <alpha-value>)",
          soft: "var(--accent-gold-soft)",
        },
        fg: {
          DEFAULT: "rgb(var(--text-primary-rgb) / <alpha-value>)",
          muted: "rgb(var(--text-muted-rgb) / <alpha-value>)",
        },
        danger: "var(--danger)",
        // Mavjud utility klasslar ham yagona #0b0b0c / #ffffff / #c6f432 tizimida ishlashi uchun:
        lime: limeScale,
        emerald: limeScale,
        teal: limeScale,
        cyan: whiteLimeAccentScale,
        sky: whiteLimeAccentScale,
        indigo: whiteLimeAccentScale,
        violet: whiteLimeAccentScale,
        amber: whiteLimeAccentScale,
        slate: carbonScale,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        neon: "var(--shadow-neon)",
        gold: "var(--shadow-gold)",
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};

export default config;
