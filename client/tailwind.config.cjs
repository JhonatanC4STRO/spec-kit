/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0a0a0a",
          card: "#111111",
          alt: "#1a1a1a",
        },
        primary: "#00ff87",
        edge: "#2a2a2a",
        text: {
          secondary: "#999999",
        },
      },
      fontFamily: {
        sans: ["Rajdhani", "Barlow Condensed", "sans-serif"],
        landing: ["Inter", "system-ui", "sans-serif"],
      },
      screens: {
        wide: "1200px",
      },
    },
  },
  plugins: [],
};
