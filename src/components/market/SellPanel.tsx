'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { marketApi } from '@/lib/market-api';
import { formatEth, netOfGas, parseEth } from '@/lib/market-format';
import type { ListingSummary } from '@/types/market';
import { useMarket } from './MarketProvider';

/**
 * Price a freshly ground address and put it on the board. The seller picks the
 * number and keeps it: the only deduction is the network fee for the transfer
 * that pays them out.
 */
export function SellPanel({
  listing,
  onPublished,
}: {
  listing: ListingSummary;
  onPublished: (listing: ListingSummary) => void;
}) {
  const t = useTranslations('market.sell');
  const { config, session, setPayoutAddress } = useMarket();

  const [price, setPrice] = useState(listing.priceWei ? formatEth(listing.priceWei) : '');
  const [payout, setPayout] = useState(session?.payoutAddress ?? session?.address ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceWei = useMemo(() => parseEth(price), [price]);
  const reserveWei = config?.payoutReserveWei ?? null;

  const priceError = (() => {
    if (!price.trim()) return null;
    if (priceWei === null) return t('errorPriceFormat');
    if (config && priceWei < BigInt(config.minPriceWei)) {
      return t('errorPriceMin', { min: formatEth(config.minPriceWei) });
    }
    if (config && priceWei > BigInt(config.maxPriceWei)) {
      return t('errorPriceMax', { max: formatEth(config.maxPriceWei) });
    }
    return null;
  })();

  const payoutValid = /^0x[0-9a-fA-F]{40}$/.test(payout.trim());
  const canPublish = priceWei !== null && !priceError && payoutValid && !busy;

  const publish = async () => {
    if (priceWei === null) return;
    setBusy(true);
    setError(null);
    try {
      const normalized = payout.trim().toLowerCase();
      if (normalized !== session?.payoutAddress) await setPayoutAddress(normalized);
      onPublished(
        await marketApi.updateListing(listing.id, {
          priceWei: priceWei.toString(),
          status: 'active',
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'publish_failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 border-y border-ink/15 py-6">
      <div>
        <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1">{t('addressLabel')}</p>
        <p className="font-mono text-sm sm:text-base text-ink break-all">{listing.address}</p>
        <p className="text-micro text-muted mt-2 leading-relaxed">{t('noKeyNote')}</p>
      </div>

      <label className="block">
        <span className="text-micro uppercase tracking-[0.16em] text-muted">{t('priceLabel')}</span>
        <div className="mt-2 flex items-baseline gap-2">
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            inputMode="decimal"
            spellCheck={false}
            placeholder="0.05"
            className="w-full border border-ink/20 bg-surface px-3 py-2.5 font-mono text-ink text-sm focus:outline-none focus:border-accent"
          />
          <span className="font-mono text-sm text-muted">
            {config?.chain.nativeCurrency.symbol ?? 'ETH'}
          </span>
        </div>
        {priceError && <p className="text-micro text-accent mt-1">{priceError}</p>}
      </label>

      {priceWei !== null && !priceError && (
        <div className="space-y-2">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-micro">
            <dt className="text-muted uppercase tracking-[0.14em]">{t('gasLabel')}</dt>
            <dd className="font-mono text-ink text-right">
              {reserveWei ? `−${formatEth(reserveWei, 9)}` : '—'}
            </dd>
            <dt className="text-muted uppercase tracking-[0.14em]">{t('netLabel')}</dt>
            <dd className="font-mono text-ink text-right">
              {formatEth(netOfGas(priceWei, reserveWei), 9)}
            </dd>
          </dl>
          <p className="text-micro text-muted leading-relaxed">{t('noCommission')}</p>
        </div>
      )}

      <label className="block">
        <span className="text-micro uppercase tracking-[0.16em] text-muted">{t('payoutLabel')}</span>
        <input
          value={payout}
          onChange={(event) => setPayout(event.target.value)}
          spellCheck={false}
          placeholder="0x…"
          className="mt-2 w-full border border-ink/20 bg-surface px-3 py-2.5 font-mono text-ink text-sm focus:outline-none focus:border-accent"
        />
        <span className="block text-micro text-muted mt-2">{t('payoutHint')}</span>
        {payout.trim() && !payoutValid && (
          <span className="block text-micro text-accent mt-1">{t('errorPayout')}</span>
        )}
      </label>

      {error && <p className="text-micro text-accent">{t('error', { code: error })}</p>}

      <button
        type="button"
        onClick={() => void publish()}
        disabled={!canPublish}
        className={`btn-primary w-full sm:w-auto sm:min-w-[12rem] ${canPublish ? '' : 'opacity-40 cursor-not-allowed'}`}
      >
        {busy ? t('publishing') : t('publish')}
      </button>
    </div>
  );
}
