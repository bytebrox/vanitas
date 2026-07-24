'use client';

/**
 * Aptos difficulty readout — hex alphabet (16)
 */

import { useMemo } from 'react';
import {
  estimateAptosDifficulty,
  formatAptosDifficulty,
  estimateAptosTime,
} from '@/lib/aptos-validation';

interface AptosDifficultyDisplayProps {
  prefix: string;
  suffix: string;
  currentRate: number;
}

export function AptosDifficultyDisplay({
  prefix,
  suffix,
  currentRate,
}: AptosDifficultyDisplayProps) {
  const estimatedRate = useMemo(() => {
    if (currentRate > 0) return currentRate;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const workers = Math.max(1, cores - 1);
    // Ed25519 + sha3 is typically faster than secp256k1
    return workers * 8000;
  }, [currentRate]);

  const difficulty = useMemo(
    () => estimateAptosDifficulty(prefix, suffix),
    [prefix, suffix]
  );

  const difficultyLabel = useMemo(() => formatAptosDifficulty(difficulty), [difficulty]);
  const timeEstimate = useMemo(
    () => estimateAptosTime(difficulty, estimatedRate),
    [difficulty, estimatedRate]
  );

  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const totalChars = prefix.length + suffix.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Pattern</p>
          <p className="font-mono text-lg sm:text-xl tracking-wide">
            <span className="text-ink/35">0x</span>
            <span className={prefix ? 'text-accent' : 'text-ink/25'}>{prefix || '····'}</span>
            <span className="text-ink/20 mx-1">…</span>
            <span className={suffix ? 'text-accent' : 'text-ink/25'}>{suffix || '····'}</span>
          </p>
        </div>
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Attempts</p>
          <p className="font-mono text-lg sm:text-xl">{hasPattern ? difficultyLabel : '—'}</p>
        </div>
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Est. time</p>
          <p className="font-mono text-lg sm:text-xl">
            {hasPattern ? timeEstimate : '—'}
            <span className="text-micro text-muted ml-2 normal-case tracking-normal block sm:inline mt-1 sm:mt-0">
              @ ~{Math.floor(estimatedRate / 1000)}k/s
            </span>
          </p>
        </div>
      </div>

      {!hasPattern && (
        <p className="text-micro text-muted">
          Guide: 3 hex &lt;1s · 4 hex ~seconds · 5 hex ~minutes · 6+ can take hours
        </p>
      )}

      {totalChars >= 6 && (
        <p className="text-micro text-accent leading-relaxed">
          {totalChars >= 7
            ? `${totalChars} hex characters can take days.`
            : `${totalChars} hex characters may take hours.`}
        </p>
      )}
    </div>
  );
}
