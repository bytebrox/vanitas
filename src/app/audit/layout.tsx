import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Audit',
  description:
    'Run eight local checks on Vanitas: Web Crypto, RNG quality, zero network during generation, CSP, worker isolation, and build integrity.',
  keywords: [
    'vanitas audit',
    'live security audit',
    'client-side verification',
    'web crypto audit',
    'worker integrity',
    'solana vanity audit',
  ],
  openGraph: {
    title: 'Live Audit | Vanitas',
    description:
      'Eight automated checks in your browser. Nothing is faked, nothing is sent.',
    url: 'https://vanitas.fun/audit',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-audit.webp',
        width: 1200,
        height: 630,
        alt: 'Vanitas live security audit',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Audit | Vanitas',
    description:
      'Eight automated checks in your browser. Nothing is faked, nothing is sent.',
    images: ['/og-audit.webp'],
  },
  alternates: {
    canonical: 'https://vanitas.fun/audit',
  },
};

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
