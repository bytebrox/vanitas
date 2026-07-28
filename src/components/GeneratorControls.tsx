'use client';

/**
 * Controls as a single action strip — no panel chrome
 */

import { useTranslations } from 'next-intl';
import { GeneratorStatus } from '@/types';

interface GeneratorControlsProps {
  status: GeneratorStatus;
  threads: number;
  maxThreads: number;
  onStart: () => void;
  onStop: () => void;
  onThreadsChange: (threads: number) => void;
  disabled?: boolean;
  soundEnabled?: boolean;
  onSoundToggle?: () => void;
}

export function GeneratorControls({
  status,
  threads,
  maxThreads,
  onStart,
  onStop,
  onThreadsChange,
  disabled = false,
  soundEnabled = true,
  onSoundToggle,
}: GeneratorControlsProps) {
  const t = useTranslations('common');
  const isRunning = status === 'running';
  const canStart = !disabled && (status === 'idle' || status === 'stopped' || status === 'found');
  const startLabel = status === 'stopped' ? t('resume') : t('forge');

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
        <div className="flex items-center gap-4">
          <span className="text-micro uppercase tracking-[0.18em] text-muted w-16 shrink-0">
            {t('cores')}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onThreadsChange(Math.max(1, threads - 1));
              }}
              disabled={isRunning || threads <= 1}
              className="min-h-11 min-w-11 text-lg text-ink disabled:opacity-30 hover:text-accent"
              aria-label={t('fewerCores')}
            >
              −
            </button>
            <span className="font-mono text-2xl tabular-nums w-8 text-center">{threads}</span>
            <button
              type="button"
              onClick={() => {
                onThreadsChange(Math.min(maxThreads, threads + 1));
              }}
              disabled={isRunning || threads >= maxThreads}
              className="min-h-11 min-w-11 text-lg text-ink disabled:opacity-30 hover:text-accent"
              aria-label={t('moreCores')}
            >
              +
            </button>
          </div>
          <span className="text-micro text-muted">{t('of', { max: maxThreads })}</span>
        </div>

        {onSoundToggle && (
          <button
            type="button"
            onClick={onSoundToggle}
            className="text-micro uppercase tracking-[0.18em] text-muted hover:text-ink text-left min-h-11"
          >
            {soundEnabled ? t('soundOn') : t('soundOff')}
          </button>
        )}
      </div>

      <div className="w-full sm:w-auto">
        {isRunning ? (
          <button type="button" onClick={onStop} className="btn-danger w-full sm:w-auto sm:min-w-[12rem]">
            {t('pause')}
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className={`btn-primary w-full sm:w-auto sm:min-w-[12rem] ${!canStart ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {startLabel}
          </button>
        )}
      </div>
    </div>
  );
}
