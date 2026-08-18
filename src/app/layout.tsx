import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Agentfile',
  description:
    'Write the context file an AI coding agent reads before it touches your code.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* PROJECT.md §3 [r5]. A stylesheet link rather than an npm package,
            so package.json stays at three dependencies. display=swap means a
            slow font falls back rather than blocking the page. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* The rule below is a Pages Router rule: it warns that a font added
            to one page loads only on that page. This is the App Router root
            layout, so it applies to every page, which is what the rule wants. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;450;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
