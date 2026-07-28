'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { BtcMode } from '@/types/btc';

interface BtcModeToggleProps {
  mode: BtcMode;
  onChange: (mode: BtcMode) => void;
  disabled?: boolean;
}

const MODE_IDS: BtcMode[] = ['legacy', 'segwit', 'taproot'];

export function BtcModeToggle({ mode, onChange, disabled = false }: BtcModeToggleProps) {
  const tModes = useTranslations('forge.modes');
  const tBtc = useTranslations('forge.btc.mode');

  const modes = useMemo(
    () =>
      MODE_IDS.map((id) => ({
        id,
        label:
          id === 'legacy'
            ? tModes('legacy')
            : id === 'segwit'
              ? tModes('segwit')
              : tModes('taproot'),
        blurb:
          id === 'legacy'
            ? tBtc('legacyBlurb')
            : id === 'segwit'
              ? tBtc('segwitBlurb')
              : tBtc('taprootBlurb'),
      })),
    [tModes, tBtc]
  );

  const current = modes.find((m) => m.id === mode) || modes[0];

  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">{tBtc('addressType')}</p>
        <p className="text-micro text-muted normal-case tracking-normal">{current.blurb}</p>
      </div>

      <div
        className={`grid grid-cols-3 gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => { onChange(m.id); }}
            aria-pressed={mode === m.id}
            className={`text-micro uppercase tracking-[0.14em] py-3 border transition-colors ${
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
