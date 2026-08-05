import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/metadata';
import { faqPageJsonLd } from '@/lib/json-ld';
import { JsonLd } from '@/components/JsonLd';
import { MARKET_ENABLED } from '@/lib/market-flag';

type Params = Promise<{ locale: string }>;

const ROUTE = 'faq' as const;
const PATH = '/faq';
const IMAGE = '/og.jpg';

const FAQ_CATEGORY_IDS = [
  'general',
  'solana',
  'evm',
  'bitcoin',
  'tron',
  'aptos-sui',
  'ton-cardano-xrp',
  'security',
  'proof-cli',
  'usage',
  ...(MARKET_ENABLED ? (['market'] as const) : []),
];

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

  const t = await getTranslations({ locale, namespace: 'faq' });
  const items: { question: string; answer: string }[] = [];
  for (const cat of FAQ_CATEGORY_IDS) {
    const raw = t.raw(`categories.${cat}.items`) as Record<string, { q: string; a: string }>;
    for (const item of Object.values(raw || {})) {
      if (item?.q && item?.a) items.push({ question: item.q, answer: item.a });
    }
  }

  return (
    <>
      <JsonLd data={faqPageJsonLd(items.slice(0, 24), locale)} />
      {children}
    </>
  );
}
