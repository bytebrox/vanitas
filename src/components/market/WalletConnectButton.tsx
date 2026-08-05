'use client';

import { useTranslations } from 'next-intl';
import { useMarket } from './MarketProvider';
import { shortAddress } from '@/lib/market-format';

/**
 * Single control for the whole sign-in state machine: no wallet, wallet but no
 * session, wrong chain, or connected.
 */
export function WalletConnectButton() {
  const t = useTranslations('market.wallet');
  const {
    session,
    address,
    hasProvider,
    onCorrectChain,
    busy,
    error,
    ready,
    config,
    connect,
    disconnect,
    switchNetwork,
    clearError,
  } = useMarket();

  if (!ready) {
    return <span className="text-micro uppercase tracking-[0.16em] text-muted">{t('loading')}</span>;
  }

  if (!hasProvider) {
    return (
      <div className="text-right">
        <p className="text-micro uppercase tracking-[0.16em] text-muted">{t('noWallet')}</p>
        <p className="text-[0.7rem] text-muted normal-case tracking-normal mt-1">
          {t('noWalletHint')}
        </p>
      </div>
    );
  }

  const label = (() => {
    if (busy) return t('working');
    if (!session) return t('connect');
    if (!onCorrectChain) return t('switchTo', { chain: config?.chain.chainName ?? '' });
    return shortAddress(session.address);
  })();

  const onClick = () => {
    clearError();
    if (!session) return void connect();
    if (!onCorrectChain) return void switchNetwork().catch(() => undefined);
    return void disconnect();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="border border-ink/25 px-3.5 py-2 font-mono text-xs text-ink hover:border-accent hover:text-accent disabled:opacity-50 disabled:hover:border-ink/25 disabled:hover:text-ink"
      >
        {label}
      </button>
      {session && onCorrectChain && (
        <span className="text-micro uppercase tracking-[0.16em] text-muted">{t('disconnect')}</span>
      )}
      {error && error !== 'rejected' && (
        <span className="text-[0.7rem] text-accent normal-case tracking-normal">
          {t('error', { code: error })}
        </span>
      )}
      {address && !session && (
        <span className="text-[0.7rem] text-muted normal-case tracking-normal">
          {t('signPrompt')}
        </span>
      )}
    </div>
  );
}
