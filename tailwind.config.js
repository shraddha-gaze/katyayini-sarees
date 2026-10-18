/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#FBF1E6", light: "#FFF8EF", dark: "#F3E3CF" },
        sindoor: { DEFAULT: "#8B2A1F", dark: "#6E1F16", light: "#A8402F" },
        saffron: { DEFAULT: "#E07A1F", dark: "#C4630F", light: "#F29A45" },
        ink: { DEFAULT: "#3B1F14", soft: "#6B4A3A" },
        zari: { DEFAULT: "#C9A24A", light: "#E3C77E" },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Mukta"', "system-ui", "sans-serif"],
      },
      letterSpacing: { widest2: "0.3em" },
    },
  },
  plugins: [],
};
