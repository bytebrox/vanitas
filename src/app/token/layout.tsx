import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Token Mint Generator',
  description:
    'Forge vanity Solana mint addresses for pump.fun, Raydium, Meteora, and other launchpads. 100% client-side — paste the private key into your custom-mint field.',
  keywords: [
    'solana token mint',
    'vanity mint address',
    'custom token address',
    'pump.fun mint',
    'raydium',
    'meteora',
    'token launcher',
    'vanitas mint',
  ],
  openGraph: {
    title: 'Token Mint Generator | Vanitas',
    description:
      'Forge vanity Solana mint addresses for any launchpad. Client-side only.',
    url: 'https://vanitas.fun/token',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-mint.webp',
        width: 1200,
        height: 630,
        alt: 'Vanitas — Solana vanity token mint generator',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Token Mint Generator | Vanitas',
    description:
      'Forge vanity Solana mint addresses for any launchpad. Client-side only.',
    images: ['/og-mint.webp'],
  },
  alternates: {
    canonical: 'https://vanitas.fun/token',
  },
};

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
