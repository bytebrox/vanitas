'use client';

import { useTranslations } from 'next-intl';
import { useMarket } from './MarketProvider';
import { WalletConnectButton } from './WalletConnectButton';

/**
 * Guards the parts of the marketplace that need an account: forging, selling
 * and buying. Browsing stays open to everyone.
 */
export function MarketGate({
  children,
  requireChain = true,
}: {
  children: React.ReactNode;
  requireChain?: boolean;
}) {
  const t = useTranslations('market.gate');
  const { session, ready, onCorrectChain, config, switchNetwork } = useMarket();

  if (!ready) {
    return <p className="text-micro uppercase tracking-[0.16em] text-muted py-8">{t('loading')}</p>;
  }

  if (!session) {
    return (
      <div className="border border-ink/20 bg-surface px-4 py-6 space-y-4">
        <p className="text-micro uppercase tracking-[0.18em] text-ink">{t('connectTitle')}</p>
        <p className="text-sm text-muted leading-relaxed">{t('connectBody')}</p>
        <WalletConnectButton />
      </div>
    );
  }

  if (requireChain && !onCorrectChain) {
    return (
      <div className="border border-ink/20 bg-surface px-4 py-6 space-y-4">
        <p className="text-micro uppercase tracking-[0.18em] text-ink">{t('wrongChainTitle')}</p>
        <p className="text-sm text-muted leading-relaxed">
          {t('wrongChainBody', { chain: config?.chain.chainName ?? '' })}
        </p>
        <button
          type="button"
          onClick={() => void switchNetwork().catch(() => undefined)}
          className="btn-primary sm:min-w-[12rem]"
        >
          {t('switchNetwork')}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
