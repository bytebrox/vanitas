'use client';

/**
 * Controls as a single action strip — no panel chrome
 */

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
  const isRunning = status === 'running';
  const canStart = !disabled && (status === 'idle' || status === 'stopped' || status === 'found');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
        <div className="flex items-center gap-4">
          <span className="text-micro uppercase tracking-[0.18em] text-muted w-16">Cores</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { onThreadsChange(Math.max(1, threads - 1)); }}
              disabled={isRunning || threads <= 1}
              className="text-lg text-ink disabled:opacity-30 hover:text-accent"
              aria-label="Fewer cores"
            >
              −
            </button>
            <span className="font-mono text-2xl tabular-nums w-8 text-center">{threads}</span>
            <button
              type="button"
              onClick={() => { onThreadsChange(Math.min(maxThreads, threads + 1)); }}
              disabled={isRunning || threads >= maxThreads}
              className="text-lg text-ink disabled:opacity-30 hover:text-accent"
              aria-label="More cores"
            >
              +
            </button>
          </div>
          <span className="text-micro text-muted">of {maxThreads}</span>
        </div>

        {onSoundToggle && (
          <button
            type="button"
            onClick={onSoundToggle}
            className="text-micro uppercase tracking-[0.18em] text-muted hover:text-ink text-left"
          >
            Sound {soundEnabled ? 'on' : 'off'}
          </button>
        )}
      </div>

      <div>
        {isRunning ? (
          <button type="button" onClick={onStop} className="btn-danger min-w-[12rem]">
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className={`btn-primary min-w-[12rem] ${!canStart ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Forge
          </button>
        )}
      </div>
    </div>
  );
}
