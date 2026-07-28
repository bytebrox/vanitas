/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

const cspHeader = {
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
  ].join('; '),
};

const pageHeaders = [...securityHeaders, cspHeader];

/** Embeddable proof widget — allow framing; omit X-Frame-Options DENY */
const embedHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors *",
    ].join('; '),
  },
];

const localeOpt = ':locale(en|de|es|pt|fr|it|tr|id|vi|th|zh|ja|ko)?';

const nextConfig = {
  async headers() {
    return [
      {
        source: '/og.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/og-:slug.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      // Embed (with optional locale prefix)
      { source: '/embed', headers: embedHeaders },
      { source: '/embed/:path*', headers: embedHeaders },
      { source: `/${localeOpt}/embed`, headers: embedHeaders },
      { source: `/${localeOpt}/embed/:path*`, headers: embedHeaders },
      // HTML pages
      { source: '/', headers: pageHeaders },
      { source: `/${localeOpt}`, headers: pageHeaders },
      {
        source: `/${localeOpt}/:page((?!embed$)[\\w-]+)`,
        headers: pageHeaders,
      },
      {
        source: `/${localeOpt}/:page((?!embed$)[\\w-]+)/:rest*`,
        headers: pageHeaders,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
