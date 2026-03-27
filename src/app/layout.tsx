import type { Metadata } from 'next';
import { Press_Start_2P, Inter } from 'next/font/google';
import './globals.css';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pokemon Battle — Unofficial Fan Simulator',
  description:
    'Unofficial fan-made Pokemon battle simulator for offline practice. 5v5 team battles with 2-player local mode and mirrored draw. Not affiliated with Nintendo, Creatures Inc., or GAME FREAK Inc.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${inter.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-[var(--font-body)]">
        {children}
        {/* Disclaimer footer — visible on every screen (UX-014) */}
        <footer
          className="mt-auto py-3 px-4 text-center text-[10px] leading-relaxed text-[var(--color-text-dim)] border-t border-[var(--color-border)]"
          role="contentinfo"
        >
          <p>
            This is an unofficial fan project. Not affiliated with Nintendo,
            Creatures Inc., or GAME FREAK Inc. Not for commercial use.
          </p>
          <p className="mt-1">
            Data provided by{' '}
            <a
              href="https://pokeapi.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--color-text-secondary)]"
            >
              PokeAPI
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
