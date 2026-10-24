/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAF8F5',
          subtle: '#F3EFEA',
          muted: '#E8E2D9',
        },
        forest: {
          50: '#F0F6F3',
          100: '#DCECE3',
          200: '#BDDAC9',
          300: '#94C1A7',
          400: '#64A181',
          500: '#3F8362',
          600: '#2E694D',
          700: '#23533D',
          800: '#1B3F2F', // Primary brand forest green
          900: '#143024',
          950: '#0B1C14',
        },
        terracotta: {
          50: '#FFF5F0',
          100: '#FFE7DC',
          200: '#FFCEB9',
          300: '#FFAA8A',
          400: '#F87D52',
          500: '#E45725', // Subtle orange / warm accent
          600: '#C73F14',
          700: '#A42F0F',
          800: '#832711',
          900: '#6C2312',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
