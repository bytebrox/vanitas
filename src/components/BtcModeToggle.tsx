'use client';

import type { BtcMode } from '@/types/btc';

interface BtcModeToggleProps {
  mode: BtcMode;
  onChange: (mode: BtcMode) => void;
  disabled?: boolean;
}

export function BtcModeToggle({ mode, onChange, disabled = false }: BtcModeToggleProps) {
  const isSegwit = mode === 'segwit';

  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">Address type</p>
        <p className="text-micro text-muted normal-case tracking-normal">
          {isSegwit ? 'Native SegWit (bc1q…)' : 'Legacy P2PKH (1…)'}
        </p>
      </div>

      <div
        className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5 ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => { onChange('legacy'); }}
          className={`text-left text-micro uppercase tracking-[0.16em] transition-colors ${
            !isSegwit ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
          aria-pressed={!isSegwit}
        >
          Legacy
        </button>

        <label className="relative block w-28 sm:w-36 h-7 cursor-pointer select-none">
          <span className="sr-only">Toggle legacy or segwit</span>
          <input
            type="range"
            min={0}
            max={1}
            step={1}
            value={isSegwit ? 1 : 0}
            disabled={disabled}
            onChange={(e) => {
              onChange(Number(e.target.value) === 1 ? 'segwit' : 'legacy');
            }}
            className="eth-mode-slider absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-valuetext={isSegwit ? 'SegWit' : 'Legacy'}
          />
          <span className="absolute inset-0 border border-ink/30 bg-transparent" aria-hidden />
          <span
            className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-ink transition-[left] duration-200 ease-out ${
              isSegwit ? 'left-[calc(50%+1px)]' : 'left-0.5'
            }`}
            aria-hidden
          />
        </label>

        <button
          type="button"
          onClick={() => { onChange('segwit'); }}
          className={`text-right text-micro uppercase tracking-[0.16em] transition-colors ${
            isSegwit ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
          aria-pressed={isSegwit}
        >
          SegWit
        </button>
      </div>

      <p className="mt-4 text-micro text-muted leading-relaxed normal-case tracking-normal max-w-xl">
        {isSegwit
          ? 'Forges a bc1q… P2WPKH address (Bech32, lowercase). Best for modern wallets.'
          : 'Forges a classic 1… P2PKH address (Base58). Classic vanity style.'}
      </p>
    </div>
  );
}
