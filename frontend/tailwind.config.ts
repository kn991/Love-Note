import type { Config } from "tailwindcss";

/**
 * Tokens mirror DESIGN_RULES.md exactly.
 * Components must use these tokens — never raw hex, never blue/purple.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#FFF8F5", deep: "#FFF0EA" },
        card: "#FFFDFB",
        pink: { soft: "#FFD6E0" },
        blush: "#FFB6C7",
        strawberry: { DEFAULT: "#FF7A9A", deep: "#F2557A" },
        cherry: { DEFAULT: "#7A2233", soft: "#9C4A5A", faint: "#A35E6C" },
        lavender: { DEFAULT: "#D9C7FF", deep: "#B79CF0" },
        mint: "#C7F0DE",
        butter: "#FFE9B8",
        border: { DEFAULT: "#FFE0E7", strong: "#FFB6C7" },
        danger: { DEFAULT: "#E0566B", soft: "#FFE3E8" },
        success: "#3FA77E",
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "40px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 2px 8px rgba(255,122,154,0.12)",
        md: "0 8px 24px rgba(255,122,154,0.16)",
        lg: "0 16px 40px rgba(255,122,154,0.20)",
        press: "inset 0 2px 6px rgba(242,85,122,0.25)",
        glow: "0 0 0 4px rgba(255,182,199,0.45)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "cursive"],
      },
      fontSize: {
        display: ["2.25rem", { lineHeight: "1.15", fontWeight: "700" }],
        tiny: ["0.75rem", { lineHeight: "1.4", fontWeight: "600" }],
      },
      maxWidth: {
        step: "420px",
        prose: "38ch",
      },
      backgroundImage: {
        "grad-petal":
          "linear-gradient(135deg,#FFE9EF 0%,#FFD6E0 50%,#FFE6D9 100%)",
        "grad-button": "linear-gradient(180deg,#FF8FAA 0%,#FF7A9A 100%)",
        "grad-card-glow":
          "radial-gradient(120% 120% at 50% 0%,#FFFDFB 0%,#FFF5F0 100%)",
      },
      keyframes: {
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-5px)" },
          "40%": { transform: "translateX(5px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
        "spin-heart": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.12)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(var(--tilt,0deg))" },
          "50%": { transform: "rotate(calc(var(--tilt,0deg) + 6deg))" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        "spin-heart": "spin-heart 1.1s ease-in-out infinite",
        wiggle: "wiggle 0.6s ease-in-out",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
