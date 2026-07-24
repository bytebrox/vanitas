import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tron Vanity Address Generator',
  description:
    'Forge vanity Tron addresses entirely in your browser. Base58 T… addresses. Keys never leave this device.',
  keywords: [
    'tron vanity address',
    'trx vanity generator',
    'tronlink vanity',
    'vanitas tron',
  ],
  openGraph: {
    title: 'Tron Vanity Address Generator | Vanitas',
    description: 'Forge vanity Tron addresses client-side. No keys leave this device.',
    url: 'https://www.vanitas.fun/tron',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.vanitas.fun/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas Tron vanity forge',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tron Vanity Address Generator | Vanitas',
    description: 'Forge vanity Tron addresses client-side.',
    images: ['https://www.vanitas.fun/og.jpg'],
  },
  alternates: {
    canonical: 'https://www.vanitas.fun/tron',
  },
};

export default function TronLayout({ children }: { children: React.ReactNode }) {
  return children;
}
