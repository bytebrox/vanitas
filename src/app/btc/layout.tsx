import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bitcoin Vanity Address Generator',
  description:
    'Forge vanity Bitcoin addresses entirely in your browser. Legacy (1…) and SegWit (bc1q…). Keys never leave this device.',
  keywords: [
    'bitcoin vanity address',
    'btc vanity generator',
    'bc1q vanity',
    'legacy bitcoin address',
    'vanitas bitcoin',
  ],
  openGraph: {
    title: 'Bitcoin Vanity Address Generator | Vanitas',
    description:
      'Forge vanity Bitcoin addresses client-side. Legacy and SegWit. No keys leave this device.',
    url: 'https://www.vanitas.fun/btc',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.vanitas.fun/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas Bitcoin vanity forge',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bitcoin Vanity Address Generator | Vanitas',
    description: 'Forge vanity Bitcoin addresses client-side. Legacy and SegWit.',
    images: ['https://www.vanitas.fun/og.jpg'],
  },
  alternates: {
    canonical: 'https://www.vanitas.fun/btc',
  },
};

export default function BtcLayout({ children }: { children: React.ReactNode }) {
  return children;
}
