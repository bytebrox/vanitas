import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F5F0E8',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vanitas.fun'),
  title: {
    default: 'Vanitas | Solana & Ethereum Vanity Address Forge',
    template: '%s | Vanitas',
  },
  description:
    'Client-side vanity address forge for Solana and Ethereum. Wallets, mints, and contracts — keys never leave this browser.',
  keywords: [
    'solana',
    'ethereum',
    'vanity address',
    'wallet generator',
    'vanitas',
    'client-side crypto',
    'ed25519',
    'evm vanity',
  ],
  authors: [{ name: 'Bytebrox', url: 'https://vanitas.fun' }],
  creator: 'Bytebrox',
  publisher: 'Vanitas',
  applicationName: 'Vanitas',
  category: 'technology',
  openGraph: {
    title: 'Vanitas | Solana & Ethereum Vanity Address Forge',
    description:
      'Forge vanity addresses for Solana and Ethereum entirely in your browser. No keys leave this device.',
    url: 'https://vanitas.fun',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-home.webp',
        width: 1200,
        height: 630,
        alt: 'Vanitas — Solana & Ethereum vanity forge',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vanitas | Solana & Ethereum Vanity Address Forge',
    description:
      'Forge vanity addresses for Solana and Ethereum entirely in your browser.',
    images: ['/og-home.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://vanitas.fun',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
