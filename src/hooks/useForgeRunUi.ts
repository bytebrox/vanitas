'use client';

import { useEffect, useRef } from 'react';
import type { GeneratorStatus } from '@/types';

const DEFAULT_TITLE = 'Vanitas';

/**
 * Tab title + optional desktop notification while forging.
 * Notification permission is requested lazily on first successful forge start.
 */
export function useForgeRunUi({
  status,
  brand = DEFAULT_TITLE,
  forgingLabel,
  foundLabel,
  notifyTitle,
  notifyBody,
}: {
  status: GeneratorStatus;
  brand?: string;
  forgingLabel: string;
  foundLabel: string;
  notifyTitle: string;
  notifyBody: string;
}) {
  const baseTitleRef = useRef<string | null>(null);
  const notifiedRef = useRef(false);
  const wasRunningRef = useRef(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (baseTitleRef.current === null) {
      baseTitleRef.current = document.title || brand;
    }
    const base = baseTitleRef.current;

    if (status === 'running') {
      document.title = `${forgingLabel} · ${brand}`;
      wasRunningRef.current = true;
      notifiedRef.current = false;
    } else if (status === 'found') {
      document.title = `${foundLabel} · ${brand}`;
    } else if (status === 'stopped') {
      document.title = base;
    } else {
      document.title = base;
    }

    return () => {
      if (baseTitleRef.current) document.title = baseTitleRef.current;
    };
  }, [status, brand, forgingLabel, foundLabel]);

  useEffect(() => {
    if (status !== 'found' || notifiedRef.current) return;
    if (!wasRunningRef.current) return;
    notifiedRef.current = true;

    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'denied') return;

    const show = () => {
      try {
        new Notification(notifyTitle, {
          body: notifyBody,
          silent: false,
        });
      } catch {
        /* ignore */
      }
    };

    if (Notification.permission === 'granted') {
      show();
    } else if (Notification.permission === 'default') {
      void Notification.requestPermission().then((p) => {
        if (p === 'granted') show();
      });
    }
  }, [status, notifyTitle, notifyBody]);
}

/** Call once when the user starts forging to warm notification permission. */
export function requestForgeNotifyPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'default') {
    void Notification.requestPermission();
  }
}
