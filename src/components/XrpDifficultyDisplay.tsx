'use client';

import { useMemo } from 'react';
import {
  estimateXrpDifficulty,
  formatXrpDifficulty,
  estimateXrpTime,
  xrpPrefixBody,
} from '@/lib/xrp-validation';

interface Props {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  currentRate: number;
}

export function XrpDifficultyDisplay({
  prefix,
  suffix,
  caseSensitive,
  currentRate,
}: Props) {
  const estimatedRate = useMemo(() => {
    if (currentRate > 0) return currentRate;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    return Math.max(1, cores - 1) * 8000;
  }, [currentRate]);

  const difficulty = useMemo(
    () => estimateXrpDifficulty(prefix, suffix, caseSensitive),
    [prefix, suffix, caseSensitive]
  );
  const difficultyLabel = useMemo(() => formatXrpDifficulty(difficulty), [difficulty]);
  const timeEstimate = useMemo(
    () => estimateXrpTime(difficulty, estimatedRate),
    [difficulty, estimatedRate]
  );
  const body = xrpPrefixBody(prefix);
  const hasPattern = body.length > 0 || suffix.length > 0;
  const totalChars = body.length + suffix.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Pattern</p>
          <p className="font-mono text-lg sm:text-xl tracking-wide break-all">
            <span className="text-ink/35">r</span>
            <span className={body ? 'text-accent' : 'text-ink/25'}>{body || '····'}</span>
            <span className="text-ink/20 mx-1">…</span>
            <span className={suffix ? 'text-accent' : 'text-ink/25'}>{suffix || '····'}</span>
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
          {totalChars} characters can take a long time (
          {caseSensitive ? '58' : '~33'} possibilities each).
        </p>
      )}
    </div>
  );
}
