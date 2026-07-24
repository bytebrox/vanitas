import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ETH Vanity Address Generator',
  description: 'Redirects to the EVM vanity forge.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: 'https://vanitas.fun/evm',
  },
};

export default function EthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
