import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const SITE = 'https://www.vanitas.fun';

/** Paths without locale prefix (default locale = no prefix). */
const PATHS = [
  '/',
  '/sol',
  '/evm',
  '/btc',
  '/tron',
  '/aptos',
  '/sui',
  '/ton',
  '/cardano',
  '/xrp',
  '/lab',
  '/seed',
  '/lookalike',
  '/create2',
  '/proof',
  '/brand',
  '/audit',
  '/faq',
  '/how-it-works',
  '/security',
  '/terms',
  '/privacy',
] as const;

function urlFor(locale: string, path: string): string {
  const normalized = path === '/' ? '' : path;
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${SITE}${prefix}${normalized}` || SITE;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: urlFor(locale, path),
        lastModified,
        changeFrequency: path === '/' ? 'weekly' : 'monthly',
        priority: path === '/' ? 1 : path.startsWith('/sol') || path === '/evm' ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
