import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How it Works',
  description:
    'How Vanitas forges Solana vanity addresses: native Web Crypto Ed25519, multi-core workers, zero network during generation, and verifiable client-side security.',
  keywords: [
    'how vanity addresses work',
    'web crypto ed25519',
    'client-side key generation',
    'solana address generation',
    'vanitas architecture',
  ],
  openGraph: {
    title: 'How it Works | Vanitas',
    description:
      'Native browser cryptography at 100K+ keys/sec. Everything runs on your device.',
    url: 'https://vanitas.fun/how-it-works',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-how.webp',
        width: 1200,
        height: 630,
        alt: 'Vanitas — how vanity address generation works',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How it Works | Vanitas',
    description:
      'Native browser cryptography at 100K+ keys/sec. Everything runs on your device.',
    images: ['/og-how.webp'],
  },
  alternates: {
    canonical: 'https://vanitas.fun/how-it-works',
  },
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
