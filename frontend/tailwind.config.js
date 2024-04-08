/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "eraser": "url('../public/eraser.svg')",
        "clear": "url('../public/clear.svg')",
        "resize": "url('../public/resize.svg')"
      },
      borderWidth: {
        '0.5': '0.5px',
      }
    },
  },
  plugins: [],
}