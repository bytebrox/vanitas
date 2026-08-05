'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { marketApi } from '@/lib/market-api';
import { formatEth, parseEth } from '@/lib/market-format';
import type { ListingSummary } from '@/types/market';

/** One row of the seller's own inventory, with inline pricing and withdrawal. */
export function MyListingRow({
  listing,
  onChange,
}: {
  listing: ListingSummary;
  onChange: (listing: ListingSummary) => void;
}) {
  const t = useTranslations('market.mine');
  const [price, setPrice] = useState(listing.priceWei ? formatEth(listing.priceWei) : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = listing.status === 'reserved' || listing.status === 'sold';
  const priceWei = parseEth(price);

  const apply = async (patch: { priceWei?: string; status?: string }) => {
    setBusy(true);
    setError(null);
    try {
      onChange(await marketApi.updateListing(listing.id, patch));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'update_failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-b border-ink/15 py-4 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Link
          href={`/market/${listing.id}`}
          className="font-mono text-sm text-ink break-all hover:text-accent"
        >
          {listing.address}
        </Link>
        <span className="text-micro uppercase tracking-[0.14em] text-muted">
          {t(`status.${listing.status}`)}
        </span>
      </div>

      {locked ? (
        <p className="text-micro text-muted">{t('lockedNote')}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputMode="decimal"
            spellCheck={false}
            placeholder="0.05"
            disabled={busy}
            className="w-32 border border-ink/20 bg-surface px-2.5 py-1.5 font-mono text-ink text-sm focus:outline-none focus:border-accent"
          />
          <span className="font-mono text-micro text-muted">ETH</span>

          <button
            type="button"
            disabled={busy || priceWei === null}
            onClick={() => void apply({ priceWei: priceWei!.toString() })}
            className="text-micro uppercase tracking-[0.14em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent disabled:opacity-40"
          >
            {t('savePrice')}
          </button>

          {listing.status === 'active' ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void apply({ status: 'withdrawn' })}
              className="text-micro uppercase tracking-[0.14em] text-muted hover:text-accent disabled:opacity-40"
            >
              {t('withdraw')}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy || priceWei === null}
              onClick={() => void apply({ priceWei: priceWei!.toString(), status: 'active' })}
              className="text-micro uppercase tracking-[0.14em] text-muted hover:text-accent disabled:opacity-40"
            >
              {t('publish')}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-micro text-accent">{t('error', { code: error })}</p>}
    </div>
  );
}
