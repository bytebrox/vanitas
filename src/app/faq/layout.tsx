import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'FAQ for Vanitas across all nine forges: Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano, XRP — security, patterns, CREATE2, proof links, and CLI.',
  keywords: [
    'vanitas faq',
    'solana vanity faq',
    'evm create2 vanity',
    'bitcoin taproot vanity',
    'tron aptos sui ton cardano xrp',
    'client-side wallet security',
  ],
  openGraph: {
    title: 'FAQ | Vanitas',
    description:
      'Answers by topic — every chain, security, proof, CLI, and usage.',
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
      'Answers by topic — every chain, security, proof, CLI, and usage.',
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
