/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        digipass: {
          navy: '#10162F',      // Primary Navy
          navyHover: '#182042', // Interactive Navy Hover
          cyan: '#00A9E8',      // Accent Cyan
          cyanLight: '#E6F6FC', // Subtle active card background
        },
      },
    },
  },
  plugins: [],
};