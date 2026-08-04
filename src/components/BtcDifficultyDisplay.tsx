'use client';

import { useMemo } from 'react';
import {
  estimateBtcDifficulty,
  formatBtcDifficulty,
  estimateBtcTime,
  normalizeBtcPrefix,
} from '@/lib/btc-validation';
import { combineOrDifficulty, normalizePatterns, type PatternTarget } from '@/lib/patterns';
import type { BtcMode } from '@/types/btc';

interface BtcDifficultyDisplayProps {
  prefix: string;
  suffix: string;
  patterns?: PatternTarget[];
  mode: BtcMode;
  caseSensitive: boolean;
  currentRate: number;
}

export function BtcDifficultyDisplay({
  prefix,
  suffix,
  patterns,
  mode,
  caseSensitive,
  currentRate,
}: BtcDifficultyDisplayProps) {
  const estimatedRate = useMemo(() => {
    if (currentRate > 0) return currentRate;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    return Math.max(1, cores - 1) * 2000;
  }, [currentRate]);

  const targets = useMemo(
    () => normalizePatterns(patterns?.length ? patterns : { prefix, suffix }),
    [patterns, prefix, suffix]
  );

  const difficulty = useMemo(
    () =>
      combineOrDifficulty(
        targets.map((p) => estimateBtcDifficulty(p.prefix, p.suffix, mode, caseSensitive))
      ),
    [targets, mode, caseSensitive]
  );
  const difficultyLabel = useMemo(() => formatBtcDifficulty(difficulty), [difficulty]);
  const timeEstimate = useMemo(
    () => estimateBtcTime(difficulty, estimatedRate),
    [difficulty, estimatedRate]
  );
  const displayPrefix = useMemo(
    () => (prefix ? normalizeBtcPrefix(prefix, mode) : ''),
    [prefix, mode]
  );
  const hasPattern = targets.some((p) => p.prefix.length > 0 || p.suffix.length > 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
      <div>
        <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Pattern</p>
        <p className="font-mono text-lg sm:text-xl tracking-wide break-all">
          <span className={displayPrefix ? 'text-accent' : 'text-ink/25'}>
            {displayPrefix || '····'}
          </span>
          <span className="text-ink/20 mx-1">…</span>
          <span className={suffix ? 'text-accent' : 'text-ink/25'}>{suffix || '····'}</span>
          {targets.length > 1 && (
            <span className="text-micro text-muted ml-2 normal-case tracking-normal">
              +{targets.length - 1}
            </span>
          )}
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
