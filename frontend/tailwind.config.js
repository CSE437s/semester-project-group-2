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
        "resize": "url('../public/resize.svg')",
        "settings": "url('../public/settings.svg')"
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      animation: {
        'spin-short': 'spin 1s linear 0.2',
        'spin-back': "spinback 1s linear 0.2"
      },
      "keyframes": {
        "spinback": {
          "0%": { transform: "rotate(0deg)"},
          "100%": { transform: "rotate(360deg)"}
        }
      }
    },
  },
  plugins: [],
}