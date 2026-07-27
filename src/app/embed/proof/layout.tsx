import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proof embed',
  robots: { index: false, follow: false },
};

export default function EmbedProofLayout({ children }: { children: React.ReactNode }) {
  return children;
}
