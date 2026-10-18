/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Pale-yellow tints for chip/icon backgrounds, neon yellow for
          // accent borders, and near-black for text/icons on top of them —
          // matches the neon-yellow/black-grid theme instead of the old blue.
          50: "#fdfde3",
          100: "#fbfbb8",
          200: "#f7f87a",
          300: "#eeff26",
          400: "#d4e600",
          500: "#b8cc00",
          600: "#0a0a0a",
          700: "#000000",
          800: "#000000",
          900: "#000000",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
