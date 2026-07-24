'use client';

/**
 * Difficulty as a quiet readout row — no boxed panel
 */

import { useMemo } from 'react';
import { estimateDifficulty, formatDifficulty, estimateTime, getFirstCharWarning, getFirstCharRarity } from '@/lib/validation';

interface DifficultyDisplayProps {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  currentRate: number;
}

export function DifficultyDisplay({
  prefix,
  suffix,
  caseSensitive,
  currentRate,
}: DifficultyDisplayProps) {
  const estimatedRate = useMemo(() => {
    if (currentRate > 0) return currentRate;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const workers = Math.max(1, cores - 1);
    return workers * 6000;
  }, [currentRate]);

  const difficulty = useMemo(
    () => estimateDifficulty(prefix, suffix, caseSensitive),
    [prefix, suffix, caseSensitive]
  );

  const difficultyLabel = useMemo(() => formatDifficulty(difficulty), [difficulty]);
  const timeEstimate = useMemo(
    () => estimateTime(difficulty, estimatedRate),
    [difficulty, estimatedRate]
  );

  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const totalChars = prefix.length + suffix.length;
  const firstCharWarning = useMemo(
    () => getFirstCharWarning(prefix, caseSensitive),
    [prefix, caseSensitive]
  );
  const firstCharRarity = useMemo(
    () => getFirstCharRarity(prefix, caseSensitive),
    [prefix, caseSensitive]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Pattern</p>
          <p className="font-mono text-xl tracking-wide">
            <span className={prefix ? 'text-accent' : 'text-ink/25'}>{prefix || '····'}</span>
            <span className="text-ink/20 mx-1">…</span>
            <span className={suffix ? 'text-accent' : 'text-ink/25'}>{suffix || '····'}</span>
          </p>
        </div>
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Attempts</p>
          <p className="font-mono text-xl">{hasPattern ? difficultyLabel : '—'}</p>
        </div>
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Est. time</p>
          <p className="font-mono text-xl">
            {hasPattern ? timeEstimate : '—'}
            <span className="text-micro text-muted ml-2 normal-case tracking-normal">
              @ ~{Math.floor(estimatedRate / 1000)}k/s
            </span>
          </p>
        </div>
      </div>

      {!hasPattern && (
        <p className="text-micro text-muted">
          Guide: 3 chars &lt;5s · 4 chars ~1m · 5 chars ~30m · 6+ hours
        </p>
      )}

      {(totalChars >= 6 || firstCharWarning) && (
        <p className="text-micro text-accent leading-relaxed">
          {totalChars >= 7
            ? `${totalChars} characters can take days or weeks.`
            : totalChars >= 6
              ? `${totalChars} characters may take hours.`
              : firstCharWarning}
          {firstCharRarity.rarity === 'extreme' || firstCharRarity.rarity === 'very_rare'
            ? ' Consider suffix-only or case-insensitive.'
            : ''}
        </p>
      )}
    </div>
  );
}
