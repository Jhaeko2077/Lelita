import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#fffdf8',
        ink: '#21304b',
        primary: '#4d6d95',
        beige: '#e8dcc8'
      },
      boxShadow: {
        card: '0 10px 30px rgba(31, 52, 83, 0.16)'
      }
    }
  },
  plugins: []
};

export default config;
