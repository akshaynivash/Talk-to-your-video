/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        base: {
          950: "#0a0a0c",
          900: "#121214",
          800: "#1a1a1d",
          700: "#242427",
          600: "#2f2f33",
        },
        silver: {
          50: "#f5f5f6",
          100: "#e4e4e7",
          200: "#c9c9cf",
          300: "#a8a8b0",
          400: "#87878f",
          500: "#6b6b73",
          600: "#525259",
        },
        accent: {
          DEFAULT: "#60a5fa",
          bright: "#93c5fd",
          dim: "#3b82f6",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(96,165,250,0.4), 0 0 16px rgba(96,165,250,0.25)",
        "glow-lg": "0 0 0 1px rgba(96,165,250,0.3), 0 0 40px rgba(96,165,250,0.15)",
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(60% 50% at 50% 0%, rgba(96,165,250,0.12) 0%, rgba(96,165,250,0) 70%)",
        "grid-fade":
          "linear-gradient(to bottom, transparent, rgba(10,10,12,1)), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "100% 100%, 32px 32px, 32px 32px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
