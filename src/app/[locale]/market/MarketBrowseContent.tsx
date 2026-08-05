'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ListingGrid } from '@/components/market/ListingGrid';
import { MarketShell } from '@/components/market/MarketShell';
import { MarketTrustNotice } from '@/components/market/MarketTrustNotice';
import { Pagination } from '@/components/market/Pagination';
import type { RarestRank } from '@/components/market/ListingCard';
import { marketApi } from '@/lib/market-api';
import type { ListingSummary } from '@/types/market';

const SORTS = ['newest', 'cheapest', 'dearest', 'rarest'] as const;
const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_RAREST = new Map<string, RarestRank>();

export function MarketBrowseContent() {
  const t = useTranslations('market.browse');

  const [sort, setSort] = useState<(typeof SORTS)[number]>('newest');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<ListingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [rarestRanks, setRarestRanks] = useState(EMPTY_RAREST);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  // Typing should not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // The top three rarest are board-wide, not page-local, so they stay marked
  // under every sort and search that happens to include them.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const rarest = await marketApi.listings({
          sort: 'rarest',
          status: 'active',
          limit: 3,
        });
        if (cancelled) return;
        const ranks = new Map<string, RarestRank>();
        rarest.items.forEach((listing, index) => {
          if (index < 3) ranks.set(listing.id, (index + 1) as RarestRank);
        });
        setRarestRanks(ranks);
      } catch {
        if (!cancelled) setRarestRanks(EMPTY_RAREST);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [total]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const result = await marketApi.listings({
          sort,
          status: 'active',
          q: query || undefined,
          offset: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'load_failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sort, query, page]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goToPage = (next: number) => {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <MarketShell active="browse" title={t('title')} description={t('description')} wide>
      <div ref={topRef} className="space-y-6 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <div className="relative flex-1 min-w-[16rem] max-w-md">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchLabel')}
              spellCheck={false}
              className="w-full border border-ink/20 bg-surface pl-9 pr-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink/30 placeholder:font-sans focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-micro uppercase tracking-[0.18em] text-muted">
              {t('sortLabel')}
            </span>
            {SORTS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSort(option);
                  setPage(1);
                }}
                className={`text-micro uppercase tracking-[0.14em] pb-0.5 transition-colors ${
                  option === sort
                    ? 'text-ink border-b border-ink'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {t(`sort.${option}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink/15 pb-3">
          <p className="text-micro uppercase tracking-[0.16em] text-muted">
            {loading ? t('counting') : total === 1 ? t('countOne') : t('count', { total })}
          </p>
          {query && !loading && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-micro uppercase tracking-[0.14em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
            >
              {t('clearSearch')}
            </button>
          )}
        </div>

        {error && <p className="text-micro text-accent">{t('error', { code: error })}</p>}

        <ListingGrid
          items={items}
          loading={loading}
          emptyLabel={query ? t('emptySearch', { query }) : t('empty')}
          rarestRanks={rarestRanks}
        />

        <Pagination page={page} pageCount={pageCount} onPage={goToPage} disabled={loading} />

        <div className="pt-6 border-t border-ink/15 grid gap-8 lg:grid-cols-[1fr_1.4fr] items-start">
          <p className="text-sm text-muted leading-relaxed">
            {t('sellHint')}{' '}
            <Link
              href="/market/forge"
              className="text-ink border-b border-ink hover:text-accent hover:border-accent"
            >
              {t('sellLink')}
            </Link>
          </p>
          <MarketTrustNotice />
        </div>
      </div>
    </MarketShell>
  );
}
