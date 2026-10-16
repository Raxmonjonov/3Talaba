import type { Config } from "tailwindcss";

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
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        border: "var(--border-subtle)",
        neon: {
          DEFAULT: "var(--accent-neon)",
          soft: "var(--accent-neon-soft)",
          glow: "var(--accent-neon-glow)",
        },
        gold: {
          DEFAULT: "var(--accent-gold)",
          soft: "var(--accent-gold-soft)",
        },
        fg: {
          DEFAULT: "var(--text-primary)",
          muted: "var(--text-muted)",
        },
        danger: "var(--danger)",
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
