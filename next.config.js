/** @type {import('next').NextConfig} */
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

const nextConfig = {
  async headers() {
    return [
      // Share images: crawlable, no CSP (X ignores / fails cards when CSP is on the asset)
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
      // HTML pages only (no dots in segment → skips /og.jpg, /favicon.png, …)
      { source: '/', headers: pageHeaders },
      { source: '/:page([\\w-]+)', headers: pageHeaders },
      { source: '/:page([\\w-]+)/:rest*', headers: pageHeaders },
    ];
  },
};

module.exports = nextConfig;
