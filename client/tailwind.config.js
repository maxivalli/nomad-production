/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'nomad-title': ['"Syncopate"', 'sans-serif'],
        'nomad-body': ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}