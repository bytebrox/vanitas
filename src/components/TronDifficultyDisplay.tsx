'use client';

import { useMemo } from 'react';
import {
  estimateTronDifficulty,
  formatTronDifficulty,
  estimateTronTime,
  normalizeTronPrefix,
} from '@/lib/tron-validation';
import { combineOrDifficulty, normalizePatterns, type PatternTarget } from '@/lib/patterns';

interface TronDifficultyDisplayProps {
  prefix: string;
  suffix: string;
  patterns?: PatternTarget[];
  caseSensitive: boolean;
  currentRate: number;
}

export function TronDifficultyDisplay({
  prefix,
  suffix,
  patterns,
  caseSensitive,
  currentRate,
}: TronDifficultyDisplayProps) {
  const estimatedRate = useMemo(() => {
    if (currentRate > 0) return currentRate;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    return Math.max(1, cores - 1) * 2200;
  }, [currentRate]);

  const targets = useMemo(
    () => normalizePatterns(patterns?.length ? patterns : { prefix, suffix }),
    [patterns, prefix, suffix]
  );

  const difficulty = useMemo(
    () =>
      combineOrDifficulty(
        targets.map((p) => estimateTronDifficulty(p.prefix, p.suffix, caseSensitive))
      ),
    [targets, caseSensitive]
  );
  const difficultyLabel = useMemo(() => formatTronDifficulty(difficulty), [difficulty]);
  const timeEstimate = useMemo(
    () => estimateTronTime(difficulty, estimatedRate),
    [difficulty, estimatedRate]
  );
  const displayPrefix = useMemo(
    () => (prefix ? normalizeTronPrefix(prefix) : ''),
    [prefix]
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
