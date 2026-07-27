import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pattern Lab',
  description:
    'Plan vanity address patterns across Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano, and XRP — difficulty, rarity, alphabet warnings, and a batch queue.',
  openGraph: {
    title: 'Pattern Lab | Vanitas',
    description: 'Difficulty matrix, rarity estimates, and batch pattern queue — before you mine.',
    url: 'https://www.vanitas.fun/lab',
  },
  alternates: { canonical: 'https://www.vanitas.fun/lab' },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
