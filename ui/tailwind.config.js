/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'greenhouse-green': '#10b981',
        'warning-orange': '#f59e0b',
        'danger-red': '#ef4444',
      }
    },
  },
  plugins: [],
}
