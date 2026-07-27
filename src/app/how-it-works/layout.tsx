import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How it Works',
  description:
    'How Vanitas forges vanity addresses across Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano, and XRP: workers, modes (mint, CREATE, CREATE2), proof of find, CLI, and how to verify client-side security.',
  keywords: [
    'how vanity addresses work',
    'web crypto ed25519',
    'secp256k1 vanity',
    'create2 vanity address',
    'client-side key generation',
    'vanitas architecture',
  ],
  openGraph: {
    title: 'How it Works | Vanitas',
    description:
      'Full tour of every forge, worker architecture, deploy modes, and verification.',
    url: 'https://www.vanitas.fun/how-it-works',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-how.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas — how vanity address generation works',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How it Works | Vanitas',
    description:
      'Full tour of every forge, worker architecture, deploy modes, and verification.',
    images: ['/og-how.jpg'],
  },
  alternates: {
    canonical: 'https://www.vanitas.fun/how-it-works',
  },
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
