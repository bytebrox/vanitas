'use client';

/**
 * Live stats as a running line — not a dark dashboard box
 */

import { useTranslations } from 'next-intl';
import { GeneratorStats, GeneratorStatus } from '@/types';
import { formatNumber, formatRate, formatDuration } from '@/lib/format';

interface StatsDisplayProps {
  stats: GeneratorStats;
  status: GeneratorStatus;
  expectedDifficulty?: number;
}

export function StatsDisplay({ stats, status, expectedDifficulty = 1 }: StatsDisplayProps) {
  const t = useTranslations('common');
  const { totalAttempts, attemptsPerSecond, elapsedTime, activeWorkers } = stats;
  const isActive = status !== 'idle';
  const progressRaw = expectedDifficulty > 1 ? (totalAttempts / expectedDifficulty) * 100 : 0;
  const progressDisplay = Math.min(progressRaw, 100);

  if (!isActive) {
    return (
      <p className="text-micro uppercase tracking-[0.18em] text-ink/30">
        {t('waiting')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-mono">
        <span>
          <span className="text-muted mr-2 text-micro uppercase tracking-[0.14em]">{t('keys')}</span>
          {formatNumber(totalAttempts)}
        </span>
        <span>
          <span className="text-muted mr-2 text-micro uppercase tracking-[0.14em]">{t('rate')}</span>
          {formatRate(attemptsPerSecond)}
        </span>
        <span>
          <span className="text-muted mr-2 text-micro uppercase tracking-[0.14em]">{t('time')}</span>
          {formatDuration(elapsedTime)}
        </span>
        <span>
          <span className="text-muted mr-2 text-micro uppercase tracking-[0.14em]">{t('workers')}</span>
          {activeWorkers}
        </span>
        <span className="text-accent uppercase tracking-[0.14em] text-micro">
          {status === 'running' ? t('running') : status}
        </span>
      </div>

      {status === 'running' && expectedDifficulty > 1 && (
        <div>
          <div className="h-px bg-ink/15 overflow-hidden">
            <div
              className="h-px bg-accent transition-all duration-300"
              style={{ width: `${progressDisplay}%` }}
            />
          </div>
          <p className="text-micro text-muted mt-2">
            {t('progressExpected', { pct: progressRaw.toFixed(1) })}
          </p>
        </div>
      )}
    </div>
  );
}
