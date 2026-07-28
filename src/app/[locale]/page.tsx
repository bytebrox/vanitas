import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { buildPageMetadata } from '@/lib/metadata';
import { softwareApplicationJsonLd } from '@/lib/json-ld';
import { JsonLd } from '@/components/JsonLd';
import { LandingContent } from './LandingContent';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Params = Promise<{ locale: string }>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    route: 'home',
    path: '/',
    image: '/og.jpg',
    keywords: [
      'solana',
      'ethereum',
      'bitcoin',
      'tron',
      'evm',
      'vanity address',
      'wallet generator',
      'vanitas',
    ],
  });
}

/**
 * Landing at /. Legacy wallet query params redirect to /sol.
 */
export default async function Home({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const prefix = first(sp.prefix);
  const suffix = first(sp.suffix);
  const mode = first(sp.mode);

  if (prefix || suffix || mode === 'wallet' || mode === 'mint') {
    const q = new URLSearchParams();
    if (prefix) q.set('prefix', prefix);
    if (suffix) q.set('suffix', suffix);
    q.set('mode', mode === 'mint' ? 'mint' : 'wallet');
    redirect({ href: `/sol?${q.toString()}`, locale });
  }

  return (
    <>
      <JsonLd data={softwareApplicationJsonLd(locale)} />
      <LandingContent />
    </>
  );
}
