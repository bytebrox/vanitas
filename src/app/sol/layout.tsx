import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solana Vanity Address Generator',
  description:
    'Forge vanity Solana wallet and token mint addresses entirely in your browser. Open source, client-side, no keys leave this device.',
  keywords: [
    'solana',
    'vanity address',
    'wallet generator',
    'vanity mint',
    'pump.fun mint',
    'vanitas',
    'client-side crypto',
    'ed25519',
  ],
  openGraph: {
    title: 'Solana Vanity Address Generator | Vanitas',
    description:
      'Forge vanity Solana wallet and mint addresses client-side. No keys leave this device.',
    url: 'https://vanitas.fun/sol',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-wallet.webp',
        width: 1200,
        height: 630,
        alt: 'Vanitas — Solana vanity forge',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solana Vanity Address Generator | Vanitas',
    description:
      'Forge vanity Solana wallet and mint addresses client-side.',
    images: ['/og-wallet.webp'],
  },
  alternates: {
    canonical: 'https://vanitas.fun/sol',
  },
};

export default function SolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
