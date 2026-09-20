import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArbWatch - Cross-Venue Price Monitor',
  description: 'Fee-aware cross-venue price discrepancy monitor for crypto spot (educational)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
