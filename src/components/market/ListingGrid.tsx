'use client';

import { useTranslations } from 'next-intl';
import { ListingCard, type RarestRank } from './ListingCard';
import type { ListingSummary } from '@/types/market';

/** Keeps the grid from collapsing to nothing while a page is being fetched. */
function Skeleton() {
  return (
    <div className="border border-ink/10 bg-surface px-4 py-4 animate-pulse">
      <div className="h-3 bg-ink/10 w-full" />
      <div className="mt-2 h-3 bg-ink/10 w-2/3" />
      <div className="mt-6 h-5 bg-ink/10 w-1/3" />
      <div className="mt-2 h-3 bg-ink/10 w-1/2" />
    </div>
  );
}

export function ListingGrid({
  items,
  loading,
  emptyLabel,
  rarestRanks,
  skeletonCount = 8,
}: {
  items: ListingSummary[];
  loading: boolean;
  emptyLabel: string;
  /** Global top-three rarest listing ids → rank. */
  rarestRanks?: ReadonlyMap<string, RarestRank>;
  skeletonCount?: number;
}) {
  const t = useTranslations('market.card');
  const grid = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-2';

  if (loading) {
    return (
      <div className={grid} aria-busy="true" aria-label={t('loading')}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-ink/20 px-6 py-16 text-center">
        <p className="text-sm text-muted">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className={grid}>
      {items.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          rarestRank={rarestRanks?.get(listing.id)}
        />
      ))}
    </div>
  );
}
