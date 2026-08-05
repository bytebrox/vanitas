'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { OrderView } from '@/types/market';
import { KeyReveal } from './KeyReveal';

/**
 * One past purchase.
 *
 * The key is not fetched until the row is expanded, so opening the account
 * page does not put private keys on screen for every address ever bought.
 */
export function MyPurchaseRow({ order }: { order: OrderView }) {
  const t = useTranslations('market.purchases');
  const [open, setOpen] = useState(false);

  const deliverable = order.status === 'paid' || order.status === 'released';

  return (
    <div className="border-b border-ink/15 py-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="font-mono text-sm text-ink break-all">{order.address}</p>
        <div className="flex items-center gap-4">
          <span className="text-micro uppercase tracking-[0.14em] text-muted">
            {t(`status.${order.status}`)}
          </span>
          {deliverable && (
            <button
              type="button"
              onClick={() => {
                setOpen((v) => !v);
              }}
              aria-expanded={open}
              className="text-micro uppercase tracking-[0.14em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
            >
              {open ? t('hide') : t('show')}
            </button>
          )}
        </div>
      </div>

      {open && <KeyReveal orderId={order.id} />}
    </div>
  );
}
