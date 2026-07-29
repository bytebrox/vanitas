'use client';

import { useTranslations } from 'next-intl';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

/**
 * Surfaces the air-gapped state. Going offline is not an error here — it is
 * the strongest proof the forge makes no network calls, so the badge reads as
 * a seal rather than a warning.
 */
export function OfflineBadge() {
  const t = useTranslations('offline');
  const { offline, cached } = useOfflineStatus();

  if (!offline) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 max-w-[16rem] border border-ink/20 bg-paper/95 backdrop-blur-sm px-3.5 py-2.5 shadow-sm pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <p className="text-micro uppercase tracking-[0.18em] text-ink mb-0.5">
        {cached ? t('airGapped') : t('offline')}
      </p>
      <p className="text-[0.7rem] leading-snug text-muted normal-case tracking-normal">
        {cached ? t('airGappedDetail') : t('offlineDetail')}
      </p>
    </div>
  );
}
