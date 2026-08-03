/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B3A5F',
          50: '#EBF0F5',
          100: '#DCE9F5',
          200: '#B9D3EB',
          300: '#6A9AC5',
          400: '#3D6F9F',
          500: '#1B3A5F',
          600: '#162F4D',
          700: '#11243B',
          800: '#0C1929',
          900: '#070E17',
        },
        accent: {
          DEFAULT: '#DCE9F5',
          light: '#EBF0F5',
        },
        status: {
          draft: '#F59E0B',
          complete: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Sarabun', 'Noto Sans Thai', 'sans-serif'],
      },
      fontSize: {
        'input': '16px',
        'label': '14px',
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
