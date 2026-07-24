'use client';

import type { EthMode } from '@/types/eth';

interface EthModeToggleProps {
  mode: EthMode;
  onChange: (mode: EthMode) => void;
  disabled?: boolean;
}

const MODES: { id: EthMode; label: string; blurb: string }[] = [
  { id: 'wallet', label: 'Wallet', blurb: 'EOA 0x address on every EVM chain.' },
  { id: 'contract', label: 'CREATE', blurb: 'First deploy (nonce 0) contract address.' },
  { id: 'create2-salt', label: 'C2 Salt', blurb: 'Fixed deployer + initCodeHash; grind salt.' },
  {
    id: 'create2-deployer',
    label: 'C2 Key',
    blurb: 'Fixed salt + initCodeHash; grind deployer key.',
  },
];

export function EthModeToggle({ mode, onChange, disabled = false }: EthModeToggleProps) {
  const current = MODES.find((m) => m.id === mode) || MODES[0];

  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">Target</p>
        <p className="text-micro text-muted normal-case tracking-normal">{current.blurb}</p>
      </div>

      <div
        className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => { onChange(m.id); }}
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
