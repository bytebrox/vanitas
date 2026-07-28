/** JSON-LD helpers for SEO */

const SITE = 'https://www.vanitas.fun';

export function softwareApplicationJsonLd(locale: string) {
  const path = locale === 'en' ? '' : `/${locale}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Vanitas',
    url: `${SITE}${path}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Client-side multi-chain vanity address forge. Keys never leave your browser.',
    license: 'https://opensource.org/licenses/MIT',
    author: {
      '@type': 'Person',
      name: 'Bytebrox',
      url: 'https://x.com/bytebrox',
    },
  };
}

export function faqPageJsonLd(
  items: { question: string; answer: string }[],
  locale: string
) {
  const path = locale === 'en' ? '/faq' : `/${locale}/faq`;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: `${SITE}${path}`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.replace(/\*\*|`/g, ''),
      },
    })),
  };
}
