/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        dark: {
          50:  '#f8fafc',
          800: '#0f1629',
          850: '#0c1220',
          900: '#080e1a',
          950: '#050a12',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'slide-in':  'slideIn 0.35s ease forwards',
        'glow':      'glow 3s ease-in-out infinite',
        'shimmer':   'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:  { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        glow:     { '0%,100%': { opacity: 0.4 }, '50%': { opacity: 0.8 } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'glow-brand':  '0 0 30px rgba(16,185,129,0.2)',
        'glow-accent': '0 0 30px rgba(139,92,246,0.2)',
        'card':        '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.4)',
      }
    }
  },
  plugins: []
}
