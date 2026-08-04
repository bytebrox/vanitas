'use client';

/**
 * Difficulty as a quiet readout row — no boxed panel
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  estimateDifficulty,
  formatDifficulty,
  estimateTime,
  getFirstCharWarning,
  getFirstCharRarity,
} from '@/lib/validation';
import { combineOrDifficulty, normalizePatterns, type PatternTarget } from '@/lib/patterns';

interface DifficultyDisplayProps {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  patterns?: PatternTarget[];
  currentRate: number;
}

export function DifficultyDisplay({
  prefix,
  suffix,
  caseSensitive,
  patterns,
  currentRate,
}: DifficultyDisplayProps) {
  const t = useTranslations('common');

  const estimatedRate = useMemo(() => {
    if (currentRate > 0) return currentRate;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const workers = Math.max(1, cores - 1);
    return workers * 6000;
  }, [currentRate]);

  const targets = useMemo(
    () => normalizePatterns(patterns?.length ? patterns : { prefix, suffix }),
    [patterns, prefix, suffix]
  );

  const difficulty = useMemo(
    () =>
      combineOrDifficulty(
        targets.map((p) => estimateDifficulty(p.prefix, p.suffix, caseSensitive))
      ),
    [targets, caseSensitive]
  );

  const difficultyLabel = useMemo(() => formatDifficulty(difficulty), [difficulty]);
  const timeEstimate = useMemo(
    () => estimateTime(difficulty, estimatedRate),
    [difficulty, estimatedRate]
  );

  const hasPattern = targets.some((p) => p.prefix.length > 0 || p.suffix.length > 0);
  const totalChars = Math.max(
    0,
    ...targets.map((p) => p.prefix.length + p.suffix.length)
  );
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
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">{t('pattern')}</p>
          <p className="font-mono text-lg sm:text-xl tracking-wide">
            <span className={prefix ? 'text-accent' : 'text-ink/25'}>{prefix || '····'}</span>
            <span className="text-ink/20 mx-1">…</span>
            <span className={suffix ? 'text-accent' : 'text-ink/25'}>{suffix || '····'}</span>
          </p>
        </div>
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">
            {t.has('attemptsLabel') ? t('attemptsLabel') : t('attempts')}
          </p>
          <p className="font-mono text-lg sm:text-xl">{hasPattern ? difficultyLabel : '—'}</p>
        </div>
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">{t('estTime')}</p>
          <p className="font-mono text-lg sm:text-xl">
            {hasPattern ? timeEstimate : '—'}
            <span className="text-micro text-muted ml-2 normal-case tracking-normal block sm:inline mt-1 sm:mt-0">
              @ ~{Math.floor(estimatedRate / 1000)}k/s
            </span>
          </p>
        </div>
      </div>

      {!hasPattern && <p className="text-micro text-muted">{t('difficultyGuide')}</p>}

      {(totalChars >= 6 || firstCharWarning) && (
        <p className="text-micro text-accent leading-relaxed">
          {totalChars >= 7
            ? t.has('charsDays')
              ? t('charsDays', { n: totalChars })
              : `${totalChars} characters can take days or weeks.`
            : totalChars >= 6
              ? t.has('charsHours')
                ? t('charsHours', { n: totalChars })
                : `${totalChars} characters may take hours.`
              : firstCharWarning}
          {firstCharRarity.rarity === 'extreme' || firstCharRarity.rarity === 'very_rare'
            ? t.has('considerSuffix')
              ? ` ${t('considerSuffix')}`
              : ' Consider suffix-only or case-insensitive.'
            : ''}
        </p>
      )}
    </div>
  );
}
