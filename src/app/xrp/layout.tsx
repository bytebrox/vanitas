import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'XRP Vanity Address Generator',
  description:
    'Forge vanity XRP Ledger classic addresses entirely in your browser. Base58 r… addresses. Keys never leave this device.',
  keywords: [
    'xrp vanity address',
    'xrpl vanity generator',
    'ripple vanity',
    'vanitas xrp',
  ],
  openGraph: {
    title: 'XRP Vanity Address Generator | Vanitas',
    description: 'Forge vanity XRP classic addresses client-side. No keys leave this device.',
    url: 'https://www.vanitas.fun/xrp',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.vanitas.fun/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas XRP vanity forge',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XRP Vanity Address Generator | Vanitas',
    description: 'Forge vanity XRP classic addresses client-side.',
    images: ['https://www.vanitas.fun/og.jpg'],
  },
  alternates: {
    canonical: 'https://www.vanitas.fun/xrp',
  },
};

export default function XrpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
