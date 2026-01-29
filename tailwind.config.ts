import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dream: {
          50: "#f8f7ff",
          100: "#f0ecff",
          200: "#e1d9ff",
          300: "#d2c6ff",
          400: "#c3b3ff",
          500: "#b4a0ff",
          600: "#a58dff",
          700: "#9680ff",
          800: "#8773ff",
          900: "#7860ff",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
