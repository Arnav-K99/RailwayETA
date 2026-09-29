/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          navy: '#0b192c',
          dark: '#1e3e62',
          accent: '#000000',
          red: '#dc2626',
          amber: '#f59e0b',
          emerald: '#10b981',
          blue: '#2563eb',
          slate: '#0f172a',
          card: '#1e293b',
          surface: '#334155'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
