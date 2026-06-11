/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0d2b6e',
        accent: '#3b82f6',
        'blue-light': '#93c5fd',
        'blue-mid': '#3b82f6',
        'blue-deep': '#1d4ed8',
        surface: '#eef3fb',
        border: 'rgba(59, 130, 246, 0.35)',
        success: '#1A7340',
        warning: '#B45309',
        error: '#B91C1C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        btn: '12px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(30, 100, 220, 0.12)',
        'glass-hover': '0 20px 60px rgba(37, 99, 235, 0.25)',
      },
    },
  },
  plugins: [],
};
