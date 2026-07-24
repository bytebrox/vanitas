'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  clearRecentFinds,
  findsForChain,
  type FindChain,
  type RecentFind,
} from '@/lib/find-history';

interface RecentFindsProps {
  chain: FindChain;
  /** Bump when a new find is saved so the list refreshes */
  refreshKey?: number;
}

export function RecentFinds({ chain, refreshKey = 0 }: RecentFindsProps) {
  const [items, setItems] = useState<RecentFind[]>([]);

  const reload = useCallback(() => {
    setItems(findsForChain(chain));
  }, [chain]);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  if (items.length === 0) return null;

  return (
    <div className="border-t border-ink/15 pt-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-micro uppercase tracking-[0.2em] text-muted">Recent finds</p>
        <button
          type="button"
          onClick={() => {
            clearRecentFinds();
            setItems([]);
          }}
          className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
        >
          Clear
        </button>
      </div>
      <p className="text-micro text-muted mb-3 normal-case tracking-normal">
        Stored only in this browser tab session — addresses only, never private keys.
      </p>
      <ul className="space-y-2 border-y border-ink/15 divide-y divide-ink/10">
        {items.map((item) => (
          <li key={`${item.address}-${item.at}`} className="py-3">
            <p className="font-mono text-sm break-all text-ink">{item.address}</p>
            <p className="text-micro text-muted mt-1 font-mono">
              {item.pattern || '—'}
              {item.mode ? ` · ${item.mode}` : ''}
              {' · '}
              {new Date(item.at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
