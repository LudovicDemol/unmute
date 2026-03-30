/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
      },
      colors: {
        accent: {
          stable: '#10B981', // emerald-500
          action: '#3B82F6', // blue-500
          critical: '#EF4444', // red-500
          alert: '#F59E42', // amber-500
        },
      },
      boxShadow: {
        'blue-glow': '0 0 40px 0 rgba(59,130,246,0.1)',
      },
      borderRadius: {
        '3xl': '2rem',
      },
    },
  },
  plugins: [require('tw-animate-css')],
};
