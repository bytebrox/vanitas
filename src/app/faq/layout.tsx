import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about Vanitas vanity addresses: security, speed, wallet vs mint, launchpads, private keys, and what happens offline.',
  keywords: [
    'vanitas faq',
    'solana vanity faq',
    'vanity address help',
    'token mint questions',
    'client-side wallet security',
  ],
  openGraph: {
    title: 'FAQ | Vanitas',
    description:
      'Security, performance, wallets, mints — common questions about Vanitas.',
    url: 'https://vanitas.fun/faq',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-faq.webp',
        width: 1200,
        height: 630,
        alt: 'Vanitas FAQ',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Vanitas',
    description:
      'Security, performance, wallets, mints — common questions about Vanitas.',
    images: ['/og-faq.webp'],
  },
  alternates: {
    canonical: 'https://vanitas.fun/faq',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
