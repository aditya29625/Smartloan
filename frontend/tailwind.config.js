/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          blue:   'rgb(59, 130, 246)',
          indigo: 'rgb(99, 102, 241)',
          purple: 'rgb(168, 85, 247)',
          cyan:   'rgb(6, 182, 212)',
          pink:   'rgb(236, 72, 153)',
          emerald:'rgb(16, 185, 129)',
          amber:  'rgb(245, 158, 11)',
          rose:   'rgb(244, 63, 94)',
        },
        slate: {
          950: '#070913',
          900: '#0d1127',
          850: '#131836',
          800: '#1a2046',
          700: '#262f62',
        }
      },
      boxShadow: {
        'glow-blue':   '0 0 25px -5px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.5)',
        'glow-cyan':   '0 0 25px -5px rgba(6, 182, 212, 0.5)',
        'glow-emerald':'0 0 25px -5px rgba(16, 185, 129, 0.5)',
        'glow-card':   '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 15px 0 rgba(99, 102, 241, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-reverse': 'floatReverse 9s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-20px) rotate(3deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(20px) rotate(-3deg)' },
        },
      },
    },
  },
  plugins: [],
}
