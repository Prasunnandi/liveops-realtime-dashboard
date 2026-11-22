/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        live: {
          50: '#ecfdf5',
          900: '#064e3b',
          950: '#022c22',
        }
      }
    },
  },
  plugins: [],
}