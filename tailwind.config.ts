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
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: {
          DEFAULT: "var(--canvas)",
          foreground: "var(--canvas-foreground)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          foreground: "var(--surface-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          text: "var(--sidebar-text)",
          muted: "var(--sidebar-muted)",
          hover: "var(--sidebar-hover)",
          border: "var(--sidebar-border)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        accent: {
          dashboard: "var(--accent-dashboard)",
          evidence: "var(--accent-evidence)",
          custody: "var(--accent-custody)",
          integrity: "var(--accent-integrity)",
          reports: "var(--accent-reports)",
          audit: "var(--accent-audit)",
          admin: "var(--accent-admin)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          foreground: "var(--brand-foreground)",
          soft: "var(--brand-soft)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        "card-hover":
          "0 2px 4px rgba(16, 24, 40, 0.06), 0 8px 20px -6px rgba(16, 24, 40, 0.12)",
        elevated:
          "0 4px 8px rgba(16, 24, 40, 0.06), 0 16px 32px -12px rgba(16, 24, 40, 0.18)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.6)",
        brand: "0 8px 28px -10px rgba(11, 92, 46, 0.45)",
        "glow-brand": "0 8px 28px -10px rgba(11, 92, 46, 0.45)",
        "glow-integrity": "0 8px 28px -10px rgba(209, 52, 56, 0.4)",
        "glow-custody": "0 8px 28px -10px rgba(196, 138, 0, 0.4)",
      },
      fontSize: {
        "stat-numeral": [
          "36px",
          { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
      },
      fontFamily: {
        sans: [
          "var(--font-plex-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-syne)",
          "var(--font-plex-sans)",
          "ui-sans-serif",
          "sans-serif",
        ],
        mono: [
          "var(--font-plex-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
