/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: "#4ADE80",
        slate: "#1E293B",
      },
      // Tambahkan ini
      maxWidth: {
        '8xl': '100rem', // Ini setara dengan 1600px
      }
    },
  },
  plugins: [],
}