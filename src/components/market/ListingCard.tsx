'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatEth, shortAddress } from '@/lib/market-format';
import type { ListingSummary } from '@/types/market';

/** Split an address so the matched prefix and suffix can be emphasised. */
function splitByPattern(address: string, matched: string) {
  const [rawPrefix = '', rawSuffix = ''] = matched.split('...');
  const body = address.slice(2);
  const prefix = body.slice(0, rawPrefix.length);
  const suffix = rawSuffix ? body.slice(body.length - rawSuffix.length) : '';
  const middle = body.slice(prefix.length, body.length - suffix.length);
  return { prefix, middle, suffix };
}

/**
 * One address on the board.
 *
 * The matched characters are what someone is actually shopping for, so they
 * carry the accent and a larger size while the rest of the address recedes.
 * Price sits on its own baseline underneath, because comparing prices down a
 * column is the second thing anyone does here.
 */
export function ListingCard({ listing }: { listing: ListingSummary }) {
  const t = useTranslations('market.card');
  const { prefix, middle, suffix } = splitByPattern(listing.address, listing.matchedPattern);

  return (
    <Link
      href={`/market/${listing.id}`}
      className="group flex flex-col justify-between gap-4 border border-ink/15 bg-surface px-4 py-4 transition-colors hover:border-accent focus-visible:border-accent"
    >
      <div>
        <p className="font-mono text-[0.82rem] leading-relaxed break-all">
          <span className="text-ink/30">0x</span>
          <span className="text-accent font-semibold text-[0.95rem]">{prefix}</span>
          <span className="text-ink/40">{middle}</span>
          <span className="text-accent font-semibold text-[0.95rem]">{suffix}</span>
        </p>

        {listing.difficultyBits !== null && (
          <p className="mt-2 text-micro uppercase tracking-[0.14em] text-muted">
            {t('difficulty', { bits: listing.difficultyBits.toFixed(1) })}
          </p>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-ink/10 pt-3">
        <div className="min-w-0">
          <p className="font-mono text-lg text-ink leading-none group-hover:text-accent transition-colors">
            {listing.priceWei ? formatEth(listing.priceWei) : '—'}
            {listing.priceWei && <span className="text-sm text-muted"> ETH</span>}
          </p>
          <p className="mt-1.5 text-micro uppercase tracking-[0.14em] text-muted truncate">
            {listing.origin === 'platform' ? t('originPlatform') : t('originUser')}
            <span className="font-mono normal-case tracking-normal text-ink/40">
              {' '}
              {shortAddress(listing.sellerAddress)}
            </span>
          </p>
        </div>

        {listing.status !== 'active' ? (
          <span className="shrink-0 text-micro uppercase tracking-[0.14em] text-accent">
            {t(listing.status)}
          </span>
        ) : (
          <span
            className="shrink-0 text-ink/25 group-hover:text-accent transition-colors"
            aria-hidden
          >
            →
          </span>
        )}
      </div>
    </Link>
  );
}
