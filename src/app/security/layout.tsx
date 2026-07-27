import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security',
  description:
    'Vanitas trust model: client-side key generation, threat model, crypto per chain, worker integrity hashes, CSP headers, browser risks, and how to verify everything yourself.',
  keywords: [
    'vanitas security',
    'client-side key generation',
    'private key safety',
    'web crypto csprng',
    'worker hash integrity',
    'content security policy',
    'vanity address threat model',
  ],
  openGraph: {
    title: 'Security | Vanitas',
    description:
      'Architecture, threats, crypto, headers, and verification — keys stay in your browser.',
    url: 'https://www.vanitas.fun/security',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-security.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas security — keys stay in your browser',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Security | Vanitas',
    description:
      'Architecture, threats, crypto, headers, and verification — keys stay in your browser.',
    images: ['/og-security.jpg'],
  },
  alternates: {
    canonical: 'https://www.vanitas.fun/security',
  },
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
