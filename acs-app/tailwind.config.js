/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0f1a',
        surface: '#101825',
        card: '#151f2e',
        border: '#1e2d42',
        accent: '#f06623',
        'accent-hover': '#d4551a',
        'text-primary': '#e8edf4',
        'text-secondary': '#8fa3bc',
        'text-muted': '#4a6080',
        'status-red': '#ef4444',
        'status-amber': '#f59e0b',
        'status-green': '#22c55e',
        'status-blue': '#3b82f6',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
