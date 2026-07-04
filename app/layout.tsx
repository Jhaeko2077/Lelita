import type { Metadata } from 'next';
import { Fraunces, Figtree, Caveat } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' });
const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-hand' });

export const metadata: Metadata = {
  title: 'Jeicob & Lelita · Nuestro rincón',
  description: 'Un archivo de recuerdos, cartas y mensajes para dos.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${figtree.variable} ${caveat.variable}`}>{children}</body>
    </html>
  );
}
