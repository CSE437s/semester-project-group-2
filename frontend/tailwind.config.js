/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "eraser": "url('../public/eraser.svg')",
        "clear": "url('../public/clear.svg')"
      }
    },
  },
  plugins: [],
}