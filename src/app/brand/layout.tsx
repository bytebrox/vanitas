import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand',
  description:
    'Embed Vanitas proof cards on launchpads and docs, plus wordmark, colors, and copy for the Brand kit. No private keys.',
  openGraph: {
    title: 'Brand | Vanitas',
    description: 'Embeddable proof widget and light branding kit.',
    url: 'https://www.vanitas.fun/brand',
  },
  alternates: { canonical: 'https://www.vanitas.fun/brand' },
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
