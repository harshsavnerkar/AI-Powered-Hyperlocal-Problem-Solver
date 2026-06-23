/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables class-based dark mode
  theme: {
    extend: {
      colors: {
        citizen: {
          light: '#e6f4ea',
          DEFAULT: '#10b981', // green
          dark: '#065f46',
        },
        volunteer: {
          light: '#eff6ff',
          DEFAULT: '#2563eb', // blue
          dark: '#1e3a8a',
        },
        admin: {
          light: '#f5f3ff',
          DEFAULT: '#7c3aed', // purple
          dark: '#4c1d95',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
