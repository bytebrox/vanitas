import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about Vanitas vanity addresses across Solana, EVM, Bitcoin, and Tron: security, speed, formats, and offline use.',
  keywords: [
    'vanitas faq',
    'solana vanity faq',
    'evm bitcoin tron vanity',
    'vanity address help',
    'token mint questions',
    'client-side wallet security',
  ],
  openGraph: {
    title: 'FAQ | Vanitas',
    description:
      'Security, performance, wallets, mints — common questions about Vanitas.',
    url: 'https://www.vanitas.fun/faq',
    siteName: 'Vanitas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-faq.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanitas FAQ',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Vanitas',
    description:
      'Security, performance, wallets, mints — common questions about Vanitas.',
    images: ['/og-faq.jpg'],
  },
  alternates: {
    canonical: 'https://www.vanitas.fun/faq',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
