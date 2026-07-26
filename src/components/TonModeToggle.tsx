'use client';

import type { TonMode } from '@/types/ton';

interface Props {
  mode: TonMode;
  onChange: (mode: TonMode) => void;
  disabled?: boolean;
}

const MODES: { id: TonMode; label: string; blurb: string }[] = [
  {
    id: 'non-bounceable',
    label: 'UQ Wallet',
    blurb: 'Non-bounceable wallet address (recommended).',
  },
  {
    id: 'bounceable',
    label: 'EQ',
    blurb: 'Bounceable form of the same Wallet v4R2 account.',
  },
];

export function TonModeToggle({ mode, onChange, disabled = false }: Props) {
  const current = MODES.find((m) => m.id === mode) || MODES[0];
  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">Address form</p>
        <p className="text-micro text-muted normal-case tracking-normal">{current.blurb}</p>
      </div>
      <div className={`grid grid-cols-2 gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
