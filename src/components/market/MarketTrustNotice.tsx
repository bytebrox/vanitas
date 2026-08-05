'use client';

import { useTranslations } from 'next-intl';
import { useMarket } from './MarketProvider';

/**
 * The marketplace runs on a different trust model than the free forges, and
 * saying so plainly is part of the product rather than fine print. Custody is
 * split during grinding but the platform does hold the finished key, and a
 * buyer has to take that on trust.
 */
/**
 * Slim strip for the top of a page. A testnet deployment is the one thing
 * someone must not miss before wiring money, so it is not left to the notice
 * further down the page.
 */
export function TestnetBanner() {
  const t = useTranslations('market.trust');
  const { config } = useMarket();

  if (!config?.chain.testnet) return null;

  return (
    <p className="border border-accent/40 bg-accent/[0.06] px-4 py-2.5 text-micro uppercase tracking-[0.16em] text-accent">
      {t('testnet', { chain: config.chain.chainName })}
    </p>
  );
}

export function MarketTrustNotice({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const t = useTranslations('market.trust');

  if (variant === 'compact') {
    return (
      <p className="text-micro text-muted leading-relaxed border-l-2 border-accent/40 pl-3">
        {t('compact')}
      </p>
    );
  }

  return (
    <aside className="border border-ink/20 bg-surface px-4 py-4 space-y-3">
      <p className="text-micro uppercase tracking-[0.18em] text-ink">{t('title')}</p>
      <ul className="space-y-2 text-micro text-muted leading-relaxed list-none">
        <li>{t('split')}</li>
        <li>{t('custody')}</li>
        <li>{t('freeForges')}</li>
      </ul>
    </aside>
  );
}
