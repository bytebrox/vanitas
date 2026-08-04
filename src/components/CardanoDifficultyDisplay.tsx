'use client';

import { useMemo } from 'react';
import {
  estimateCardanoDifficulty,
  formatCardanoDifficulty,
  estimateCardanoTime,
} from '@/lib/cardano-validation';
import { combineOrDifficulty, normalizePatterns, type PatternTarget } from '@/lib/patterns';

interface Props {
  prefix: string;
  suffix: string;
  patterns?: PatternTarget[];
  currentRate: number;
}

export function CardanoDifficultyDisplay({ prefix, suffix, patterns, currentRate }: Props) {
  const estimatedRate = useMemo(() => {
    if (currentRate > 0) return currentRate;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    return Math.max(1, cores - 1) * 5000;
  }, [currentRate]);

  const targets = useMemo(
    () => normalizePatterns(patterns?.length ? patterns : { prefix, suffix }),
    [patterns, prefix, suffix]
  );

  const difficulty = useMemo(
    () =>
      combineOrDifficulty(targets.map((p) => estimateCardanoDifficulty(p.prefix, p.suffix))),
    [targets]
  );
  const difficultyLabel = useMemo(() => formatCardanoDifficulty(difficulty), [difficulty]);
  const timeEstimate = useMemo(
    () => estimateCardanoTime(difficulty, estimatedRate),
    [difficulty, estimatedRate]
  );
  const hasPattern = targets.some((p) => p.prefix.length > 0 || p.suffix.length > 0);
  const totalChars = Math.max(
    0,
    ...targets.map((p) => p.prefix.length + p.suffix.length)
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Pattern</p>
          <p className="font-mono text-lg sm:text-xl tracking-wide">
            <span className="text-ink/35">addr1v</span>
            <span className={prefix ? 'text-accent' : 'text-ink/25'}>
              {prefix ? (prefix.startsWith('v') ? prefix.slice(1) : prefix) : '····'}
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
          <p className="font-mono text-lg sm:text-xl">{hasPattern ? difficultyLabel : '...'}</p>
        </div>
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Est. time</p>
          <p className="font-mono text-lg sm:text-xl">
            {hasPattern ? timeEstimate : '...'}
            <span className="text-micro text-muted ml-2 normal-case tracking-normal block sm:inline mt-1 sm:mt-0">
              @ ~{Math.floor(estimatedRate / 1000)}k/s
            </span>
          </p>
        </div>
      </div>
      {totalChars >= 5 && (
        <p className="text-micro text-accent leading-relaxed">
          {totalChars} Bech32 characters can take a long time (32 possibilities each).
        </p>
      )}
    </div>
  );
}
