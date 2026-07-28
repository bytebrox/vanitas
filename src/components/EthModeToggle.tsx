'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { EthMode } from '@/types/eth';

interface EthModeToggleProps {
  mode: EthMode;
  onChange: (mode: EthMode) => void;
  disabled?: boolean;
}

const MODE_IDS: EthMode[] = ['wallet', 'contract', 'create2-salt', 'create2-deployer'];

export function EthModeToggle({ mode, onChange, disabled = false }: EthModeToggleProps) {
  const tModes = useTranslations('forge.modes');
  const tEth = useTranslations('forge.eth.mode');

  const modes = useMemo(
    () =>
      MODE_IDS.map((id) => ({
        id,
        label:
          id === 'wallet'
            ? tModes('wallet')
            : id === 'contract'
              ? tModes('create')
              : id === 'create2-salt'
                ? tEth('c2Salt')
                : tEth('c2Key'),
        blurb:
          id === 'wallet'
            ? tEth('walletBlurb')
            : id === 'contract'
              ? tEth('createBlurb')
              : id === 'create2-salt'
                ? tEth('c2SaltBlurb')
                : tEth('c2KeyBlurb'),
      })),
    [tModes, tEth]
  );

  const current = modes.find((m) => m.id === mode) || modes[0];

  return (
    <div className="border-y border-ink/15 py-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-micro uppercase tracking-[0.18em] text-muted">{tEth('target')}</p>
        <p className="text-micro text-muted normal-case tracking-normal">{current.blurb}</p>
      </div>

      <div
        className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {modes.map((m) => (
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
