/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [],
};
