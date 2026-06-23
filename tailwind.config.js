/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#FDF8F0',
          100: '#F9EDD8',
          200: '#F2D9A8',
          300: '#E8C170',
          400: '#D4A84B',
          500: '#B8975A',
          600: '#9A7A3F',
          700: '#7A5E2E',
          800: '#5C4420',
          900: '#3D2D13',
        },
        dark: {
          50:  '#F5F5F4',
          100: '#E8E7E5',
          200: '#D1CFCC',
          300: '#A8A5A0',
          400: '#6E6B65',
          500: '#4A4745',
          600: '#343230',
          700: '#2A2826',
          800: '#1C1C1A',
          900: '#111110',
        },
        cream: {
          50:  '#FAFAF8',
          100: '#F5F3EF',
          200: '#EDE9E2',
          300: '#E0DAD0',
          400: '#CFC8BB',
          500: '#B8B0A0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px 0 rgba(0,0,0,0.05)',
        'modal': '0 20px 60px 0 rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(184,151,90,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(184,151,90,0)' },
        },
      },
    },
  },
  plugins: [],
}
