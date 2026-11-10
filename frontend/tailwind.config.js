/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3faf5",
          100: "#e2f5e8",
          200: "#bfe8cd",
          300: "#7dcea0",
          400: "#3cb371",
          500: "#2a9a4e",
          600: "#145c34",
          700: "#0f4d2b",
          800: "#0c3b21",
          900: "#082616",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
