/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme
        dark: {
          'bg-primary': '#0d1117',
          'bg-secondary': '#161b22',
          'bg-tertiary': '#21262d',
          'border': '#30363d',
          'text-primary': '#e6edf3',
          'text-secondary': '#8b949e',
          'text-muted': '#484f58',
        },
        // Light theme
        light: {
          'bg-primary': '#ffffff',
          'bg-secondary': '#f6f8fa',
          'bg-tertiary': '#eaeef2',
          'border': '#d0d7de',
          'text-primary': '#1f2328',
          'text-secondary': '#656d76',
          'text-muted': '#9198a1',
        },
        // Status colors
        green: {
          available: '#3fb950',
          'available-text': '#2ea043',
        },
        orange: {
          cooldown: '#d29922',
          'cooldown-text': '#bb8009',
        },
        red: {
          error: '#f85149',
        },
        blue: {
          accent: '#388bfd',
        },
        purple: {
          accent: '#bc8cff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in-right': 'slideInRight 0.2s ease-out',
        'slide-in-up': 'slideInUp 0.2s ease-out',
        'flash-green': 'flashGreen 2s ease-out',
        'flash-yellow': 'flashYellow 2s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
        'toast-in': 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'toast-out': 'toastOut 0.2s ease-in forwards',
        'skeleton': 'skeleton 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        flashGreen: {
          '0%': { boxShadow: '0 0 0 0 rgba(63,185,80,0.6)' },
          '50%': { boxShadow: '0 0 0 4px rgba(63,185,80,0.3)' },
          '100%': { boxShadow: '0 0 0 0 rgba(63,185,80,0)' },
        },
        flashYellow: {
          '0%': { backgroundColor: 'rgba(210,153,34,0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        toastIn: {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        toastOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(120%)', opacity: '0' },
        },
        skeleton: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'modal': '0 25px 50px -12px rgba(0,0,0,0.5)',
        'card': '0 1px 3px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.4)',
        'toast': '0 8px 24px rgba(0,0,0,0.4)',
        'settings': '-8px 0 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
