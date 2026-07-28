import { setRequestLocale } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/metadata';

type Params = Promise<{ locale: string }>;

const ROUTE = 'faq' as const;
const PATH = '/faq';
const IMAGE = '/og.jpg';

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, route: ROUTE, path: PATH, image: IMAGE });
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
