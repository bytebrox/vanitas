'use client';

import type { TronMode } from '@/types/tron';

interface TronModeToggleProps {
  mode: TronMode;
  onChange: (mode: TronMode) => void;
  disabled?: boolean;
}

const MODES: { id: TronMode; label: string; blurb: string }[] = [
  { id: 'wallet', label: 'Wallet', blurb: 'Account Base58 address (T…).' },
  {
    id: 'contract',
    label: 'CREATE',
    blurb: 'First-deploy contract address (CREATE nonce 0).',
  },
];

export function TronModeToggle({ mode, onChange, disabled = false }: TronModeToggleProps) {
  const current = MODES.find((m) => m.id === mode) || MODES[0];

  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">Target</p>
        <p className="text-micro text-muted normal-case tracking-normal">{current.blurb}</p>
      </div>

      <div
        className={`grid grid-cols-2 gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {MODES.map((m) => (
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
