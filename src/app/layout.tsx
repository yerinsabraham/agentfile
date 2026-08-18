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
      <body>{children}</body>
    </html>
  );
}
