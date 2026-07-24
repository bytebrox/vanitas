'use client';

import type { BtcMode } from '@/types/btc';

interface BtcModeToggleProps {
  mode: BtcMode;
  onChange: (mode: BtcMode) => void;
  disabled?: boolean;
}

const MODES: { id: BtcMode; label: string; blurb: string }[] = [
  { id: 'legacy', label: 'Legacy', blurb: 'Classic 1… P2PKH (Base58).' },
  { id: 'segwit', label: 'SegWit', blurb: 'Native bc1q… P2WPKH (Bech32).' },
  { id: 'taproot', label: 'Taproot', blurb: 'Native bc1p… P2TR (Bech32m).' },
];

export function BtcModeToggle({ mode, onChange, disabled = false }: BtcModeToggleProps) {
  const current = MODES.find((m) => m.id === mode) || MODES[0];

  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">Address type</p>
        <p className="text-micro text-muted normal-case tracking-normal">{current.blurb}</p>
      </div>

      <div
        className={`grid grid-cols-3 gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {MODES.map((m) => (
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
