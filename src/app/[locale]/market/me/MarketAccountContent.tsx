'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { MarketGate } from '@/components/market/MarketGate';
import { MarketShell } from '@/components/market/MarketShell';
import { MyListingRow } from '@/components/market/MyListingRow';
import { MyPurchaseRow } from '@/components/market/MyPurchaseRow';
import { MarketTrustNotice } from '@/components/market/MarketTrustNotice';
import { useMarket } from '@/components/market/MarketProvider';
import { marketApi } from '@/lib/market-api';
import type { ListingSummary, OrderView } from '@/types/market';

function PayoutField() {
  const t = useTranslations('market.mine');
  const { session, setPayoutAddress } = useMarket();
  const [value, setValue] = useState(session?.payoutAddress ?? '');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^0x[0-9a-fA-F]{40}$/.test(value.trim());

  const save = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await setPayoutAddress(value.trim().toLowerCase());
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-y border-ink/15 py-5 space-y-3">
      <p className="text-micro uppercase tracking-[0.18em] text-muted">{t('payoutTitle')}</p>
      <p className="text-micro text-muted leading-relaxed">{t('payoutHint')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setSaved(false);
          }}
          spellCheck={false}
          placeholder="0x…"
          className="flex-1 min-w-[18rem] border border-ink/20 bg-surface px-3 py-2 font-mono text-ink text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          disabled={!valid || busy}
          onClick={() => void save()}
          className="text-micro uppercase tracking-[0.14em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent disabled:opacity-40"
        >
          {t('savePayout')}
        </button>
      </div>
      {saved && <p className="text-micro text-muted">{t('payoutSaved')}</p>}
      {error && <p className="text-micro text-accent">{t('error', { code: error })}</p>}
    </div>
  );
}

function MyListings() {
  const t = useTranslations('market.mine');
  const [items, setItems] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await marketApi.listings({ mine: true, limit: 60 });
      setItems(page.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = (updated: ListingSummary) =>
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));

  if (loading) {
    return <p className="text-micro uppercase tracking-[0.16em] text-muted py-8">{t('loading')}</p>;
  }

  if (error) return <p className="text-micro text-accent py-8">{t('error', { code: error })}</p>;

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted py-8">
        {t('empty')}{' '}
        <Link
          href="/market/forge"
          className="text-ink border-b border-ink hover:text-accent hover:border-accent"
        >
          {t('emptyLink')}
        </Link>
      </p>
    );
  }

  return (
    <div className="border-t border-ink/15">
      {items.map((listing) => (
        <MyListingRow key={listing.id} listing={listing} onChange={replace} />
      ))}
    </div>
  );
}

function MyPurchases() {
  const t = useTranslations('market.purchases');
  const [items, setItems] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const orders = await marketApi.myOrders();
        if (!cancelled) setItems(orders);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'load_failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-micro uppercase tracking-[0.16em] text-muted py-8">{t('loading')}</p>;
  }

  if (error) return <p className="text-micro text-accent py-8">{t('error', { code: error })}</p>;

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted py-8">
        {t('empty')}{' '}
        <Link
          href="/market"
          className="text-ink border-b border-ink hover:text-accent hover:border-accent"
        >
          {t('emptyLink')}
        </Link>
      </p>
    );
  }

  return (
    <div className="border-t border-ink/15">
      {items.map((order) => (
        <MyPurchaseRow key={order.id} order={order} />
      ))}
      <p className="text-micro text-muted leading-relaxed pt-4">{t('retention')}</p>
    </div>
  );
}

export function MarketAccountContent() {
  const t = useTranslations('market.mine');
  const tp = useTranslations('market.purchases');

  return (
    <MarketShell active="mine" title={t('title')} description={t('description')} wide>
      <MarketGate requireChain={false}>
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] items-start">
          <div className="space-y-8 lg:sticky lg:top-24">
            <PayoutField />
            <MarketTrustNotice />
          </div>

          <div className="space-y-10 min-w-0">
            <section>
              <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tp('title')}</p>
              <MyPurchases />
            </section>
            <section>
              <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">
                {t('listingsTitle')}
              </p>
              <MyListings />
            </section>
          </div>
        </div>
      </MarketGate>
    </MarketShell>
  );
}
