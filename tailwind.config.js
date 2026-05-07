/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        handwriting: ['Pacifico', 'cursive'],
      },
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1e40af',
          accent: '#38bdf8',
          muted: '#93c5fd',
        },
        gold: {
          50:  '#fdf9ec',
          100: '#faf0cb',
          200: '#f5de8f',
          300: '#efc854',
          400: '#e8b428',
          500: '#C8952A',
          600: '#a97520',
          700: '#87581a',
          800: '#6f451b',
          900: '#5e3a1a',
          950: '#361f09',
        },
      },
    },
  },
  plugins: [],
}