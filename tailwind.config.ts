import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['selector', '.night'],
  theme: {
    extend: {
      colors: {
        paper: '#FBF6EF',
        ink: '#33202E',
        wine: '#8E2C48',
        rose: { ...colors.rose, DEFAULT: '#D96A85' },
        blush: '#F6E3E6',
        gold: '#C9A253',
        plum: '#170F28'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        hand: ['var(--font-hand)', 'cursive']
      },
      boxShadow: {
        card: '0 18px 44px -18px rgba(142, 44, 72, 0.22)',
        polaroid: '0 12px 28px -10px rgba(51, 32, 46, 0.28)',
        glow: '0 0 32px rgba(217, 106, 133, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
