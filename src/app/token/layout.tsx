import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Token Mint Generator',
  robots: { index: false, follow: true },
  alternates: {
    canonical: 'https://vanitas.fun/sol?mode=mint',
  },
};

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
