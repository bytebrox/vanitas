'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { isUserRejection, sendTransaction } from '@/lib/eip1193';
import { marketApi } from '@/lib/market-api';
import { formatCountdown, formatEth } from '@/lib/market-format';
import type { OrderView } from '@/types/market';
import { CopyButton } from './CopyButton';
import { PaymentQr } from './PaymentQr';
import { useMarket } from './MarketProvider';

const POLL_INTERVAL_MS = 12_000;

/**
 * Waits for the deposit address to be funded.
 *
 * Payment is matched on balance, not on a particular transaction, so the
 * buyer is free to pay from the connected wallet, from a different wallet, or
 * straight from an exchange withdrawal.
 */
export function PaymentWatcher({
  order,
  onUpdate,
}: {
  order: OrderView;
  onUpdate: (order: OrderView) => void;
}) {
  const t = useTranslations('market.pay');
  const { config, provider, address, onCorrectChain } = useMarket();

  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(() => Date.parse(order.expiresAt) - Date.now());

  const pending = order.status === 'pending';

  const check = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      onUpdate(await marketApi.checkOrder(order.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'check_failed');
    } finally {
      setChecking(false);
    }
  }, [order.id, onUpdate]);

  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => void check(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pending, check]);

  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => setRemaining(Date.parse(order.expiresAt) - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [pending, order.expiresAt]);

  const payUri = `ethereum:${order.depositAddress}@${config?.chain.chainId ?? ''}?value=${order.amountWei}`;

  const payWithWallet = async () => {
    if (!provider || !address) return;
    setSending(true);
    setError(null);
    try {
      await sendTransaction(provider, {
        from: address,
        to: order.depositAddress,
        value: `0x${BigInt(order.amountWei).toString(16)}`,
      });
      await check();
    } catch (err) {
      if (!isUserRejection(err)) {
        setError(err instanceof Error ? err.message : 'send_failed');
      }
    } finally {
      setSending(false);
    }
  };

  if (!pending) return null;

  const expired = remaining <= 0;

  return (
    <div className="space-y-5 border-y border-ink/15 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-micro uppercase tracking-[0.18em] text-ink">{t('title')}</p>
        <p className={`font-mono text-sm ${expired ? 'text-accent' : 'text-muted'}`}>
          {expired ? t('expired') : t('expiresIn', { time: formatCountdown(remaining) })}
        </p>
      </div>

      <p className="text-sm text-muted leading-relaxed">{t('instructions')}</p>

      <div className="flex flex-wrap gap-6 items-start">
        <PaymentQr value={payUri} />

        <dl className="flex-1 min-w-[16rem] space-y-3">
          <div>
            <dt className="text-micro uppercase tracking-[0.16em] text-muted">{t('amount')}</dt>
            <dd className="font-mono text-lg text-ink">
              {formatEth(order.amountWei)} {config?.chain.nativeCurrency.symbol ?? 'ETH'}
            </dd>
          </div>
          <div>
            <dt className="text-micro uppercase tracking-[0.16em] text-muted">{t('depositTo')}</dt>
            <dd className="font-mono text-sm text-ink break-all">{order.depositAddress}</dd>
            <CopyButton value={order.depositAddress} />
          </div>
          <div>
            <dt className="text-micro uppercase tracking-[0.16em] text-muted">{t('network')}</dt>
            <dd className="font-mono text-sm text-ink">{config?.chain.chainName ?? ''}</dd>
          </div>
        </dl>
      </div>

      <p className="text-micro text-accent leading-relaxed">{t('networkWarning')}</p>

      <div className="flex flex-wrap items-center gap-4">
        {provider && onCorrectChain && (
          <button
            type="button"
            onClick={() => void payWithWallet()}
            disabled={sending || expired}
            className="btn-primary sm:min-w-[12rem] disabled:opacity-40"
          >
            {sending ? t('sending') : t('payWithWallet')}
          </button>
        )}
        <button
          type="button"
          onClick={() => void check()}
          disabled={checking}
          className="text-micro uppercase tracking-[0.14em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent disabled:opacity-40"
        >
          {checking ? t('checking') : t('checkNow')}
        </button>
      </div>

      {error && <p className="text-micro text-accent">{t('error', { code: error })}</p>}
    </div>
  );
}
