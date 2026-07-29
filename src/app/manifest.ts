import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vanitas — Vanity Address Forge',
    short_name: 'Vanitas',
    description:
      'Generate vanity wallet and token addresses for nine chains. Everything runs in your browser — install it and forge with the network switched off.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#F5F0E8',
    theme_color: '#F5F0E8',
    categories: ['utilities', 'developer', 'finance'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      { name: 'Solana', url: '/sol' },
      { name: 'EVM', url: '/evm' },
      { name: 'Bitcoin', url: '/btc' },
    ],
  };
}
