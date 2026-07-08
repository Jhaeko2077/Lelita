import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['selector', '.night'],
  // Gatea todas las variantes hover: tras @media (hover:hover) — el touch dispara hovers falsos al tocar
  future: { hoverOnlyWhenSupported: true },
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
        card: '0 20px 50px -24px rgba(142, 44, 72, 0.25)',
        polaroid: '0 14px 30px -12px rgba(51, 32, 46, 0.3)',
        'polaroid-lift': '0 22px 44px -14px rgba(51, 32, 46, 0.38)',
        glow: '0 0 36px rgba(217, 106, 133, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
