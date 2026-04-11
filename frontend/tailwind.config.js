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
          DEFAULT: '#7000ff',
          light: '#8f33ff',
          dark: '#5a00cc',
        },
        secondary: {
          DEFAULT: '#ff4d4f',
          light: '#ff7875',
          dark: '#d9363e',
        },
        surface: {
          DEFAULT: '#f6f6f6',
          light: '#ffffff',
          dark: '#e8e8e8',
        },
        text: {
          primary: '#1a1a1a',
          secondary: '#595959',
          muted: '#8c8c8c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
