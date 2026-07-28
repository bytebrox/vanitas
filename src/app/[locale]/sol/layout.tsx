import { setRequestLocale } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/metadata';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    route: 'sol',
    path: '/sol',
    image: '/og-wallet.jpg',
    keywords: [
      'solana',
      'vanity address',
      'wallet generator',
      'vanity mint',
      'vanitas',
    ],
  });
}

export default async function SolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
