'use client';

import { useEffect, useState } from 'react';

export interface OfflineStatus {
  /** Browser reports no connection. */
  offline: boolean;
  /** A service worker is controlling this page, so cached assets are served. */
  cached: boolean;
}

/**
 * Both halves matter: offline alone is a broken page, offline *and* controlled
 * by the service worker is the air-gapped state the forge is built for.
 */
export function useOfflineStatus(): OfflineStatus {
  const [offline, setOffline] = useState(false);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    const sync = () => { setOffline(!navigator.onLine); };
    sync();

    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);

    if ('serviceWorker' in navigator) {
      setCached(Boolean(navigator.serviceWorker.controller));
      const onControllerChange = () => {
        setCached(Boolean(navigator.serviceWorker.controller));
      };
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
      return () => {
        window.removeEventListener('online', sync);
        window.removeEventListener('offline', sync);
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      };
    }

    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  return { offline, cached };
}
