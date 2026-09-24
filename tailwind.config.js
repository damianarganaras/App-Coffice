/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme (navy palette sampled from the reference mockup)
        navy: {
          bg: '#0b1120',
          surface: '#161f36',
          elevated: '#1f2b47',
          border: '#2a3757',
          text: '#e8edf7',
          muted: '#98a6c4',
        },
        // Light theme (warm tones derived from the #CEBC9B anchor)
        beige: {
          bg: '#f0e9db',
          surface: '#cebc9b',
          elevated: '#dccdb2',
          border: '#b8a37c',
          text: '#33291a',
          muted: '#574a31',
        },
        // Shared action accents (blue "Pedido", green "+ Producto", red destructive/badge)
        accent: {
          blue: '#2563eb',
          'blue-hover': '#1d4ed8',
          green: '#15803d',
          'green-hover': '#166534',
          red: '#dc2626',
          'red-hover': '#b91c1c',
        },
      },
    },
  },
  plugins: [],
}
