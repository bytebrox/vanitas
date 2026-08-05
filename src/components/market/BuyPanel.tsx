'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { marketApi } from '@/lib/market-api';
import { formatEth } from '@/lib/market-format';
import type { ListingSummary, OrderView } from '@/types/market';
import { KeyReveal } from './KeyReveal';
import { MarketGate } from './MarketGate';
import { PaymentWatcher } from './PaymentWatcher';
import { useMarket } from './MarketProvider';

/** Drives a purchase from "buy" through payment to key handover. */
export function BuyPanel({ listing }: { listing: ListingSummary }) {
  const t = useTranslations('market.buy');
  const { config } = useMarket();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startOrder = async () => {
    setBusy(true);
    setError(null);
    try {
      setOrder(await marketApi.createOrder(listing.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'order_failed');
    } finally {
      setBusy(false);
    }
  };

  if (listing.isOwn) {
    return <p className="text-sm text-muted border-y border-ink/15 py-6">{t('ownListing')}</p>;
  }

  if (listing.status === 'sold' && !order) {
    return <p className="text-sm text-muted border-y border-ink/15 py-6">{t('alreadySold')}</p>;
  }

  if (listing.status === 'reserved' && !order) {
    return <p className="text-sm text-muted border-y border-ink/15 py-6">{t('reserved')}</p>;
  }

  return (
    <MarketGate requireChain={false}>
      {order ? (
        <div className="space-y-6">
          <PaymentWatcher order={order} onUpdate={setOrder} />
          {(order.status === 'paid' || order.status === 'released') && (
            <KeyReveal orderId={order.id} />
          )}
          {order.status === 'expired' && (
            <p className="text-sm text-accent border-y border-ink/15 py-6">{t('orderExpired')}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4 border-y border-ink/15 py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="text-micro uppercase tracking-[0.18em] text-muted">{t('priceLabel')}</span>
            <span className="font-mono text-xl text-ink">
              {listing.priceWei ? formatEth(listing.priceWei) : '—'}{' '}
              {config?.chain.nativeCurrency.symbol ?? 'ETH'}
            </span>
          </div>

          <p className="text-sm text-muted leading-relaxed">{t('body')}</p>

          <button
            type="button"
            onClick={() => void startOrder()}
            disabled={busy || !listing.priceWei}
            className="btn-primary w-full sm:w-auto sm:min-w-[12rem] disabled:opacity-40"
          >
            {busy ? t('opening') : t('buy')}
          </button>

          {error && <p className="text-micro text-accent">{t('error', { code: error })}</p>}
        </div>
      )}
    </MarketGate>
  );
}
