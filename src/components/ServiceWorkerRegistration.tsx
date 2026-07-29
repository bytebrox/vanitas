'use client';

import { useEffect } from 'react';

/**
 * Registers the offline worker. Dev builds are skipped so the service worker
 * never serves a stale chunk over the hot-reload output — and any leftover
 * registration from a previous production visit is torn down.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch(() => {
          /* offline support is optional — never surface this */
        });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
      return () => { window.removeEventListener('load', register); };
    }
  }, []);

  return null;
}
