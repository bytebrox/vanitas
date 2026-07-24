import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aptos Vanity Address Generator',
  description:
    'Forge vanity Aptos addresses entirely in your browser. Ed25519 · sha3_256 auth keys. Keys never leave this device.',
  keywords: [
    'aptos vanity address',
    'apt vanity generator',
    'petra vanity',
    'vanitas aptos',
  ],
  openGraph: {
    title: 'Aptos Vanity Address Generator | Vanitas',
    description: 'Forge vanity Aptos addresses client-side. No keys leave this device.',
    url: 'https://www.vanitas.fun/aptos',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.vanitas.fun/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas Aptos vanity forge',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aptos Vanity Address Generator | Vanitas',
    description: 'Forge vanity Aptos addresses client-side.',
    images: ['https://www.vanitas.fun/og.jpg'],
  },
  alternates: {
    canonical: 'https://www.vanitas.fun/aptos',
  },
};

export default function AptosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
