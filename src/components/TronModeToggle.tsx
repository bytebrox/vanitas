'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { TronMode } from '@/types/tron';

interface TronModeToggleProps {
  mode: TronMode;
  onChange: (mode: TronMode) => void;
  disabled?: boolean;
}

const MODE_IDS: TronMode[] = ['wallet', 'contract'];

export function TronModeToggle({ mode, onChange, disabled = false }: TronModeToggleProps) {
  const tModes = useTranslations('forge.modes');
  const tTron = useTranslations('forge.tron.mode');
  const tTarget = useTranslations('forge.eth.mode');

  const modes = useMemo(
    () =>
      MODE_IDS.map((id) => ({
        id,
        label: id === 'wallet' ? tModes('wallet') : tModes('create'),
        blurb: id === 'wallet' ? tTron('walletBlurb') : tTron('createBlurb'),
      })),
    [tModes, tTron]
  );

  const current = modes.find((m) => m.id === mode) || modes[0];

  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">{tTarget('target')}</p>
        <p className="text-micro text-muted normal-case tracking-normal">{current.blurb}</p>
      </div>

      <div
        className={`grid grid-cols-2 gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              onChange(m.id);
            }}
            aria-pressed={mode === m.id}
            className={`text-micro uppercase tracking-[0.12em] py-3 border transition-colors ${
              mode === m.id
                ? 'border-ink bg-ink text-paper'
                : 'border-ink/25 text-muted hover:border-ink hover:text-ink'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
