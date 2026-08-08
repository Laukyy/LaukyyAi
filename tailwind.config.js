/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lauky: {
          bg: "#0f0f10",
          panel: "#17171a",
          bubble: "#1f2023",
          accent: "#f97316",
          accent2: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
