import { setRequestLocale } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/metadata';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, route: 'seed', path: '/seed', image: '/og.jpg' });
}

export default async function Layout({
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
