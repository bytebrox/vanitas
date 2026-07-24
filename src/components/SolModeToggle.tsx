'use client';

/**
 * Ledger-style slider: Wallet ↔ Mint
 */

import type { SolMode } from '@/types/sol';

interface SolModeToggleProps {
  mode: SolMode;
  onChange: (mode: SolMode) => void;
  disabled?: boolean;
}

export function SolModeToggle({ mode, onChange, disabled = false }: SolModeToggleProps) {
  const isMint = mode === 'mint';

  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">Target</p>
        <p className="text-micro text-muted normal-case tracking-normal">
          {isMint ? 'Token mint address' : 'Wallet address'}
        </p>
      </div>

      <div
        className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5 ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => { onChange('wallet'); }}
          className={`text-left text-micro uppercase tracking-[0.16em] transition-colors ${
            !isMint ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
          aria-pressed={!isMint}
        >
          Wallet
        </button>

        <label className="relative block w-28 sm:w-36 h-7 cursor-pointer select-none">
          <span className="sr-only">Toggle wallet or mint address</span>
          <input
            type="range"
            min={0}
            max={1}
            step={1}
            value={isMint ? 1 : 0}
            disabled={disabled}
            onChange={(e) => {
              onChange(Number(e.target.value) === 1 ? 'mint' : 'wallet');
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-valuetext={isMint ? 'Mint' : 'Wallet'}
          />
          <span
            className="absolute inset-0 border border-ink/30 bg-transparent"
            aria-hidden
          />
          <span
            className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-ink transition-[left] duration-200 ease-out ${
              isMint ? 'left-[calc(50%+1px)]' : 'left-0.5'
            }`}
            aria-hidden
          />
        </label>

        <button
          type="button"
          onClick={() => { onChange('mint'); }}
          className={`text-right text-micro uppercase tracking-[0.16em] transition-colors ${
            isMint ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
          aria-pressed={isMint}
        >
          Mint
        </button>
      </div>

      <p className="mt-4 text-micro text-muted leading-relaxed normal-case tracking-normal max-w-xl">
        {isMint
          ? 'Forges a vanity Solana mint keypair for launchpads (pump.fun, Raydium, Meteora, …). Paste the private key into the custom-mint field.'
          : 'Forges a vanity Solana wallet keypair — Base58 address, entirely in this browser.'}
      </p>
    </div>
  );
}
