/**
 * Vanitas service worker.
 *
 * The point is not speed, it is being able to pull the plug: the nine worker
 * bundles are precached at install, so once the app is installed you can go
 * offline — or into airplane mode — and still forge a key. Nothing here ever
 * sends anything anywhere; the worker only reads from the cache and the
 * network.
 */

const VERSION = 'v1.11.0';
const SHELL_CACHE = `vanitas-shell-${VERSION}`;
const ASSET_CACHE = `vanitas-assets-${VERSION}`;
const FONT_CACHE = `vanitas-fonts-${VERSION}`;

/** The crypto core — without these, offline forging is impossible. */
const PRECACHE = [
  '/vanity-worker.js',
  '/eth-worker.js',
  '/btc-worker.js',
  '/tron-worker.js',
  '/aptos-worker.js',
  '/sui-worker.js',
  '/ton-worker.js',
  '/cardano-worker.js',
  '/xrp-worker.js',
  '/seed-worker.js',
  '/worker-hash.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.png',
];

const IMMUTABLE = /^\/_next\/static\//;
const STATIC_ASSET = /^\/(ascii|flags|chains|icons)\/|\.(webp|avif|png|jpg|svg|ico|json|js|css)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // A single missing entry must not abort the whole install.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, ASSET_CACHE, FONT_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return hit || (await network) || Response.error();
}

async function navigate(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    const root = await cache.match('/');
    if (root) return root;
    throw new Error('offline and no cached page');
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
      event.respondWith(cacheFirst(request, FONT_CACHE));
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(navigate(request));
    return;
  }

  // Content-hashed by the bundler — safe to serve from cache forever.
  if (IMMUTABLE.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (STATIC_ASSET.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
  }
});
