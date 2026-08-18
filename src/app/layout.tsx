import type { Metadata } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';

import './globals.css';

/**
 * PROJECT.md §3 [r5].
 *
 * next/font/google is built into Next, so §1's dependency rule is untouched:
 * package.json still lists three dependencies. It downloads the font files
 * during the build and emits them into the static output, so the browser
 * fetches them from this site rather than from Google. No third-party request
 * at runtime, and no lint rule to suppress.
 */
const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Agentfile',
  description:
    'Write the context file an AI coding agent reads before it touches your code.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
