/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pharma: {
          50: "#eefaf6",
          100: "#d5f2e6",
          200: "#ade4cf",
          300: "#79ceb3",
          400: "#48b092",
          500: "#2f9478",
          600: "#227562",
          700: "#1e5e50",
          800: "#1c4b41",
          900: "#193f37",
        },
      },
    },
  },
  plugins: [],
}
