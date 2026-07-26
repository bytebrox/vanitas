import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cardano Vanity Address Generator',
  description:
    'Forge vanity Cardano enterprise addresses (addr1…) entirely in your browser. Keys never leave this device.',
  openGraph: {
    title: 'Cardano Vanity Address Generator | Vanitas',
    description: 'Forge vanity Cardano addresses client-side.',
    url: 'https://www.vanitas.fun/cardano',
    siteName: 'Vanitas',
    type: 'website',
    images: [{ url: 'https://www.vanitas.fun/og.jpg', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://www.vanitas.fun/cardano' },
};

export default function CardanoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
