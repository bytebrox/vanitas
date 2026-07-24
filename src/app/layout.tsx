import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://vanitas.fun'),
  title: {
    default: 'Vanitas | Solana Vanity Address Generator',
    template: '%s | Vanitas',
  },
  description:
    'Forge custom Solana wallet addresses entirely in your browser. Open source, client-side, no keys leave this device.',
  keywords: [
    'solana',
    'vanity address',
    'wallet generator',
    'vanitas',
    'client-side crypto',
    'ed25519',
    'custom solana address',
  ],
  authors: [{ name: 'Bytebrox', url: 'https://vanitas.fun' }],
  creator: 'Bytebrox',
  publisher: 'Vanitas',
  applicationName: 'Vanitas',
  category: 'technology',
  openGraph: {
    title: 'Vanitas | Solana Vanity Address Generator',
    description:
      'Forge custom Solana wallet addresses entirely in your browser. No keys leave this device.',
    url: 'https://vanitas.fun',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-wallet.webp',
        width: 1200,
        height: 630,
        alt: 'Vanitas — Solana vanity wallet generator',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vanitas | Solana Vanity Address Generator',
    description:
      'Forge custom Solana wallet addresses entirely in your browser.',
    images: ['/og-wallet.webp'],
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
        <meta name="theme-color" content="#F5F0E8" />
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
