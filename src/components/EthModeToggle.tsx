'use client';

/**
 * Ledger-style slider: Wallet ↔ Contract
 */

import type { EthMode } from '@/types/eth';

interface EthModeToggleProps {
  mode: EthMode;
  onChange: (mode: EthMode) => void;
  disabled?: boolean;
}

export function EthModeToggle({ mode, onChange, disabled = false }: EthModeToggleProps) {
  const isContract = mode === 'contract';

  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">Target</p>
        <p className="text-micro text-muted normal-case tracking-normal">
          {isContract ? 'Contract (CREATE · nonce 0)' : 'Wallet (EOA)'}
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
            !isContract ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
          aria-pressed={!isContract}
        >
          Wallet
        </button>

        <label className="relative block w-28 sm:w-36 h-7 cursor-pointer select-none">
          <span className="sr-only">Toggle wallet or contract address</span>
          <input
            type="range"
            min={0}
            max={1}
            step={1}
            value={isContract ? 1 : 0}
            disabled={disabled}
            onChange={(e) => {
              onChange(Number(e.target.value) === 1 ? 'contract' : 'wallet');
            }}
            className="eth-mode-slider absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-valuetext={isContract ? 'Contract' : 'Wallet'}
          />
          <span
            className="absolute inset-0 border border-ink/30 bg-transparent"
            aria-hidden
          />
          <span
            className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-ink transition-[left] duration-200 ease-out ${
              isContract ? 'left-[calc(50%+1px)]' : 'left-0.5'
            }`}
            aria-hidden
          />
        </label>

        <button
          type="button"
          onClick={() => { onChange('contract'); }}
          className={`text-right text-micro uppercase tracking-[0.16em] transition-colors ${
            isContract ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
          aria-pressed={isContract}
        >
          Contract
        </button>
      </div>

      <p className="mt-4 text-micro text-muted leading-relaxed normal-case tracking-normal max-w-xl">
        {isContract
          ? 'Finds a deployer key whose first contract deploy (nonce 0) lands on your vanity address. Works on every EVM chain.'
          : 'Finds a private key whose 0x address matches your pattern. Same address on Ethereum, Arbitrum, Robinhood Chain, Base, and all EVM networks.'}
      </p>
    </div>
  );
}
