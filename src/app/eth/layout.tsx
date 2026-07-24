import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ETH Vanity Address Generator',
  description:
    'Forge vanity Ethereum wallet and contract addresses entirely in your browser. Works on every EVM chain — Ethereum, Arbitrum, Robinhood Chain, Base, and more.',
  keywords: [
    'ethereum vanity address',
    'eth vanity wallet',
    'vanity contract address',
    'evm address generator',
    'robinhood chain',
    'arbitrum vanity',
    'create nonce 0',
    'vanitas eth',
  ],
  openGraph: {
    title: 'ETH Vanity Address Generator | Vanitas',
    description:
      'Forge vanity Ethereum wallet and contract addresses client-side. Same 0x key on every EVM chain.',
    url: 'https://vanitas.fun/eth',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-eth.webp',
        width: 1200,
        height: 630,
        alt: 'Vanitas — ETH vanity wallet & contract generator',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ETH Vanity Address Generator | Vanitas',
    description:
      'Forge vanity Ethereum wallet and contract addresses client-side. Same 0x key on every EVM chain.',
    images: ['/og-eth.webp'],
  },
  alternates: {
    canonical: 'https://vanitas.fun/eth',
  },
};

export default function EthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
