'use client';

import { useMemo } from 'react';
import {
  estimateTonDifficulty,
  formatTonDifficulty,
  estimateTonTime,
  tonAddressTag,
  tonUserPrefix,
} from '@/lib/ton-validation';
import type { TonMode } from '@/types/ton';

interface Props {
  prefix: string;
  suffix: string;
  mode: TonMode;
  currentRate: number;
}

export function TonDifficultyDisplay({ prefix, suffix, mode, currentRate }: Props) {
  const estimatedRate = useMemo(() => {
    if (currentRate > 0) return currentRate;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    return Math.max(1, cores - 1) * 2000;
  }, [currentRate]);

  const difficulty = useMemo(
    () => estimateTonDifficulty(prefix, suffix, mode),
    [prefix, suffix, mode]
  );
  const difficultyLabel = useMemo(() => formatTonDifficulty(difficulty), [difficulty]);
  const timeEstimate = useMemo(
    () => estimateTonTime(difficulty, estimatedRate),
    [difficulty, estimatedRate]
  );
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const userPrefix = tonUserPrefix(prefix, mode);
  const totalChars = userPrefix.length + suffix.length;
  const tag = tonAddressTag(mode);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Pattern</p>
          <p className="font-mono text-lg sm:text-xl tracking-wide break-all">
            <span className="text-ink/35">{tag}</span>
            <span className={userPrefix ? 'text-accent' : 'text-ink/25'}>
              {userPrefix || '····'}
            </span>
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
      {totalChars >= 4 && (
        <p className="text-micro text-accent leading-relaxed">
          {totalChars} base64url characters can take a long time (64 possibilities each, case-sensitive).
        </p>
      )}
    </div>
  );
}
