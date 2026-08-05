'use client';

import { useTranslations } from 'next-intl';

/**
 * Page stepper for the board.
 *
 * Replaces an append-as-you-go button on purpose: a board that only ever grows
 * downwards gets unusable once there are a few hundred addresses on it, and
 * there is no way back to something you scrolled past.
 */
export function Pagination({
  page,
  pageCount,
  onPage,
  disabled = false,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  disabled?: boolean;
}) {
  const t = useTranslations('market.browse');

  if (pageCount <= 1) return null;

  const button =
    'text-micro uppercase tracking-[0.14em] px-3 py-2 border border-ink/20 text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:pointer-events-none';

  return (
    <nav className="flex items-center justify-between gap-4" aria-label={t('pagination')}>
      <button
        type="button"
        className={button}
        disabled={disabled || page <= 1}
        onClick={() => onPage(page - 1)}
      >
        {t('prev')}
      </button>

      <p className="text-micro uppercase tracking-[0.16em] text-muted">
        {t('pageOf', { page, pageCount })}
      </p>

      <button
        type="button"
        className={button}
        disabled={disabled || page >= pageCount}
        onClick={() => onPage(page + 1)}
      >
        {t('next')}
      </button>
    </nav>
  );
}
