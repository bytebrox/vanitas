import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Account and per-listing order pages are session bound: crawling them
        // only ever yields a sign-in prompt.
        disallow: ['/api/', '/market/me'],
      },
      { userAgent: 'Twitterbot', allow: '/' },
      { userAgent: 'facebookexternalhit', allow: '/' },
    ],
    sitemap: 'https://www.vanitas.fun/sitemap.xml',
    host: 'https://www.vanitas.fun',
  };
}
