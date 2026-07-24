import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sui Vanity Address Generator',
  description:
    'Forge vanity Sui addresses entirely in your browser. Ed25519 · blake2b addresses. Keys never leave this device.',
  keywords: [
    'sui vanity address',
    'sui vanity generator',
    'suiet vanity',
    'vanitas sui',
  ],
  openGraph: {
    title: 'Sui Vanity Address Generator | Vanitas',
    description: 'Forge vanity Sui addresses client-side. No keys leave this device.',
    url: 'https://www.vanitas.fun/sui',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.vanitas.fun/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas Sui vanity forge',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sui Vanity Address Generator | Vanitas',
    description: 'Forge vanity Sui addresses client-side.',
    images: ['https://www.vanitas.fun/og.jpg'],
  },
  alternates: {
    canonical: 'https://www.vanitas.fun/sui',
  },
};

export default function SuiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
