/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "sans-serif"],
      },
    },
  },
  plugins: [],
};
