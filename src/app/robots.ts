import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'Twitterbot', allow: '/' },
      { userAgent: 'facebookexternalhit', allow: '/' },
    ],
    sitemap: 'https://www.vanitas.fun/sitemap.xml',
    host: 'https://www.vanitas.fun',
  };
}
