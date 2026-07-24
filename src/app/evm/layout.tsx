import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EVM Vanity Address Generator',
  description:
    'Forge vanity 0x wallet and contract addresses entirely in your browser. Same key on every EVM chain — Ethereum, BNB Smart Chain, Base, Arbitrum, Optimism, and more.',
  keywords: [
    'evm vanity address',
    'ethereum vanity address',
    'bnb vanity wallet',
    'base vanity address',
    'arbitrum vanity',
    'vanity contract address',
    'evm address generator',
    'create nonce 0',
    'vanitas evm',
  ],
  openGraph: {
    title: 'EVM Vanity Address Generator | Vanitas',
    description:
      'Forge vanity 0x wallet and contract addresses client-side. Same key on Ethereum, BNB, Base, Arbitrum, and every EVM chain.',
    url: 'https://www.vanitas.fun/evm',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-eth.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas — EVM vanity wallet & contract generator',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EVM Vanity Address Generator | Vanitas',
    description:
      'Forge vanity 0x wallet and contract addresses client-side. Same key on every EVM chain.',
    images: ['/og-eth.jpg'],
  },
  alternates: {
    canonical: 'https://www.vanitas.fun/evm',
  },
};

export default function EvmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
