import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ArbWatch - Cross-Venue Arbitrage Monitor',
  description: 'Real-time monitoring of cryptocurrency arbitrage opportunities across exchanges',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
