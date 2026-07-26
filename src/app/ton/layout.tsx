import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TON Vanity Address Generator',
  description:
    'Forge vanity TON Wallet v4R2 addresses (UQ… / EQ…) entirely in your browser. Keys never leave this device.',
  openGraph: {
    title: 'TON Vanity Address Generator | Vanitas',
    description: 'Forge vanity TON addresses client-side.',
    url: 'https://www.vanitas.fun/ton',
    siteName: 'Vanitas',
    type: 'website',
    images: [{ url: 'https://www.vanitas.fun/og.jpg', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://www.vanitas.fun/ton' },
};

export default function TonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
