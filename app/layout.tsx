import type { Metadata, Viewport } from 'next';
import { Fraunces, Figtree, Caveat } from 'next/font/google';
import './globals.css';

// Fraunces con sus ejes ópticos: SOFT/WONK le dan el carácter cálido del display
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', axes: ['SOFT', 'WONK', 'opsz'] });
const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-hand' });

export const metadata: Metadata = {
  title: 'Jeicob & Lelita · El archivo de nuestra historia',
  description: 'Un archivo de recuerdos, cartas y mensajes para dos.'
};

export const viewport: Viewport = {
  themeColor: '#FBF6EF'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${figtree.variable} ${caveat.variable}`}>{children}</body>
    </html>
  );
}
