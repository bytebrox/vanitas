import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

const SITE = 'https://www.vanitas.fun';

const ogLocale: Record<string, string> = {
  en: 'en_US',
  de: 'de_DE',
  es: 'es_ES',
  pt: 'pt_BR',
  fr: 'fr_FR',
  it: 'it_IT',
  tr: 'tr_TR',
  id: 'id_ID',
  vi: 'vi_VN',
  th: 'th_TH',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
};

/** Build hreflang alternates for a path without locale prefix (e.g. `/sol`). */
export function localeAlternates(path: string) {
  const normalized = path === '/' ? '' : path;
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    const prefix =
      locale === routing.defaultLocale ? '' : `/${locale}`;
    languages[locale] = `${SITE}${prefix}${normalized || ''}` || SITE;
  }
  languages['x-default'] = `${SITE}${normalized || ''}` || SITE;
  return languages;
}

type MetaOpts = {
  locale: string;
  /** Key under `meta.*` e.g. `home`, `sol` */
  route: string;
  path: string;
  image?: string;
  keywords?: string[];
};

export async function buildPageMetadata({
  locale,
  route,
  path,
  image = '/og.jpg',
  keywords,
}: MetaOpts): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t(`${route}.title`);
  const description = t(`${route}.description`);
  const ogAlt = t.has(`${route}.ogAlt`) ? t(`${route}.ogAlt`) : title;
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const url = `${SITE}${prefix}${path === '/' ? '' : path}`;
  const languages = localeAlternates(path);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${title} | Vanitas`,
      description,
      url,
      siteName: 'Vanitas',
      type: 'website',
      locale: ogLocale[locale] ?? 'en_US',
      images: [
        {
          url: image.startsWith('http') ? image : `${SITE}${image}`,
          width: 1200,
          height: 630,
          alt: ogAlt,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Vanitas`,
      description,
      images: [image.startsWith('http') ? image : `${SITE}${image}`],
    },
    alternates: {
      canonical: url,
      languages,
    },
  };
}
