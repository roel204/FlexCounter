/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'lg': '854px', // Custom large breakpoint (default is 1024px/64rem)
      },
    },
  },
  plugins: [],
}

