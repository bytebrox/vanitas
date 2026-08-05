'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { BuyPanel } from '@/components/market/BuyPanel';
import { MarketShell } from '@/components/market/MarketShell';
import { MarketTrustNotice } from '@/components/market/MarketTrustNotice';
import { CopyButton } from '@/components/market/CopyButton';
import { marketApi } from '@/lib/market-api';
import { shortAddress } from '@/lib/market-format';
import type { ListingSummary } from '@/types/market';

export function MarketListingContent() {
  const t = useTranslations('market.detail');
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const [listing, setListing] = useState<ListingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const found = await marketApi.listing(id);
        if (!cancelled) setListing(found);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'load_failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <MarketShell active="browse" title={t('title')}>
      {loading ? (
        <p className="text-micro uppercase tracking-[0.16em] text-muted py-8">{t('loading')}</p>
      ) : error || !listing ? (
        <p className="text-sm text-accent py-8">{t('notFound')}</p>
      ) : (
        <div className="space-y-8">
          <div className="border-y border-ink/15 py-6 space-y-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">{t('addressLabel')}</p>
            <p className="font-mono text-base sm:text-lg text-ink break-all">{listing.address}</p>
            <CopyButton value={listing.address} />

            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 pt-3 text-micro">
              <dt className="uppercase tracking-[0.14em] text-muted">{t('patternLabel')}</dt>
              <dd className="font-mono text-ink">{listing.matchedPattern || '—'}</dd>

              {listing.difficultyBits !== null && (
                <>
                  <dt className="uppercase tracking-[0.14em] text-muted">{t('difficultyLabel')}</dt>
                  <dd className="font-mono text-ink">
                    {t('difficultyValue', { bits: listing.difficultyBits.toFixed(1) })}
                  </dd>
                </>
              )}

              <dt className="uppercase tracking-[0.14em] text-muted">{t('sellerLabel')}</dt>
              <dd className="font-mono text-ink">
                {listing.origin === 'platform'
                  ? t('sellerPlatform')
                  : shortAddress(listing.sellerAddress)}
              </dd>
            </dl>
          </div>

          <BuyPanel listing={listing} />

          <MarketTrustNotice />
        </div>
      )}
    </MarketShell>
  );
}
