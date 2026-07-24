import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security',
  description:
    'How Vanitas keeps keys safe: 100% client-side generation, no storage, CSP lockdown, open source, and live verifiable audits.',
  keywords: [
    'vanitas security',
    'client-side key generation',
    'private key safety',
    'web crypto csprng',
    'content security policy',
    'solana vanity security',
  ],
  openGraph: {
    title: 'Security | Vanitas',
    description:
      'Your keys never leave this browser. Architecture, storage, crypto, and how to verify it.',
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
      'Your keys never leave this browser. Open source and verifiable.',
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
