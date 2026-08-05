'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImportGuide } from '@/components';
import { marketApi } from '@/lib/market-api';
import type { OrderKeyResponse } from '@/types/market';
import { CopyButton } from './CopyButton';

/**
 * Offer the key as a file without ever putting it on a server.
 *
 * The blob is built in the page and revoked straight after the click, so the
 * download never travels anywhere and leaves no URL behind.
 */
function downloadKey(key: OrderKeyResponse): void {
  const contents = [
    'Vanitas marketplace purchase',
    '',
    `Address:     ${key.address}`,
    `Private key: ${key.privateKey}`,
    '',
    `Retrieved:   ${new Date().toISOString()}`,
    '',
    'Anyone holding this key controls the address. Store it offline.',
    '',
  ].join('\n');

  const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `vanitas-${key.address.slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Final step of a purchase. The key is fetched on an explicit click rather
 * than on page load, so it does not end up in a screenshot or a shoulder
 * surf just because someone revisited the order.
 */
export function KeyReveal({ orderId }: { orderId: string }) {
  const t = useTranslations('market.key');
  const [key, setKey] = useState<OrderKeyResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reveal = async () => {
    setBusy(true);
    setError(null);
    try {
      setKey(await marketApi.orderKey(orderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'reveal_failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 border-y border-ink/15 py-6">
      <p className="text-micro uppercase tracking-[0.18em] text-ink">{t('title')}</p>

      {!key ? (
        <>
          <p className="text-sm text-muted leading-relaxed">{t('body')}</p>
          <button
            type="button"
            onClick={() => void reveal()}
            disabled={busy}
            className="btn-primary sm:min-w-[12rem] disabled:opacity-40"
          >
            {busy ? t('revealing') : t('reveal')}
          </button>
        </>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-micro uppercase tracking-[0.16em] text-muted">{t('addressLabel')}</p>
            <p className="font-mono text-sm text-ink break-all">{key.address}</p>
          </div>

          <div>
            <p className="text-micro uppercase tracking-[0.16em] text-muted">{t('keyLabel')}</p>
            <p className="font-mono text-sm text-ink break-all select-all">{key.privateKey}</p>
            <div className="flex flex-wrap items-center gap-4">
              <CopyButton value={key.privateKey} />
              <button
                type="button"
                onClick={() => {
                  downloadKey(key);
                }}
                className="text-micro uppercase tracking-[0.14em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
              >
                {t('download')}
              </button>
            </div>
          </div>

          <p className="text-micro text-accent leading-relaxed">{t('warning')}</p>
          <p className="text-micro text-muted leading-relaxed">{t('retention')}</p>

          <ImportGuide chain="evm" mode="wallet" />
        </div>
      )}

      {error && <p className="text-micro text-accent">{t('error', { code: error })}</p>}
    </div>
  );
}
