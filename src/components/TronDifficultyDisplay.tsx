'use client';

import { useMemo } from 'react';
import {
  estimateTronDifficulty,
  formatTronDifficulty,
  estimateTronTime,
} from '@/lib/tron-validation';

interface TronDifficultyDisplayProps {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  currentRate: number;
}

export function TronDifficultyDisplay({
  prefix,
  suffix,
  caseSensitive,
  currentRate,
}: TronDifficultyDisplayProps) {
  const estimatedRate = useMemo(() => {
    if (currentRate > 0) return currentRate;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    return Math.max(1, cores - 1) * 2200;
  }, [currentRate]);

  const difficulty = useMemo(
    () => estimateTronDifficulty(prefix, suffix, caseSensitive),
    [prefix, suffix, caseSensitive]
  );
  const difficultyLabel = useMemo(() => formatTronDifficulty(difficulty), [difficulty]);
  const timeEstimate = useMemo(
    () => estimateTronTime(difficulty, estimatedRate),
    [difficulty, estimatedRate]
  );
  const hasPattern = prefix.length > 0 || suffix.length > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
      <div>
        <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Pattern</p>
        <p className="font-mono text-lg sm:text-xl tracking-wide break-all">
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
  );
}
