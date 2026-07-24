import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F5F0E8',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vanitas.fun'),
  title: {
    default: 'Vanitas | Solana, EVM, Bitcoin & Tron Vanity Forge',
    template: '%s | Vanitas',
  },
  description:
    'Client-side vanity address forge for Solana, EVM, Bitcoin, and Tron. Wallets, mints, and contracts — keys never leave this browser.',
  keywords: [
    'solana',
    'ethereum',
    'bitcoin',
    'tron',
    'evm',
    'vanity address',
    'wallet generator',
    'vanitas',
    'client-side crypto',
    'ed25519',
    'evm vanity',
  ],
  authors: [{ name: 'Bytebrox', url: 'https://www.vanitas.fun' }],
  creator: 'Bytebrox',
  publisher: 'Vanitas',
  applicationName: 'Vanitas',
  category: 'technology',
  openGraph: {
    title: 'Vanitas | Solana, EVM, Bitcoin & Tron Vanity Forge',
    description:
      'Forge vanity addresses for Solana, EVM, Bitcoin, and Tron entirely in your browser. No keys leave this device.',
    url: 'https://www.vanitas.fun',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.vanitas.fun/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas multi-chain vanity forge',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vanitas | Solana, EVM, Bitcoin & Tron Vanity Forge',
    description:
      'Forge vanity addresses for Solana, EVM, Bitcoin, and Tron entirely in your browser.',
    images: ['https://www.vanitas.fun/og.jpg'],
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
    canonical: 'https://www.vanitas.fun',
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
