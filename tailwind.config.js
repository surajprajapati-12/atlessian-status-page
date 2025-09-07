export default {
  content: [
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        npm: {
          red: '#cb3837',
          black: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}