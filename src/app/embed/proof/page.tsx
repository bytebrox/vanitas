'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  parseProofSearchParams,
  verifyProofMatch,
  type ProofChain,
} from '@/lib/proof-of-find';

const CHAIN_LABEL: Record<ProofChain, string> = {
  sol: 'Solana',
  evm: 'EVM',
  btc: 'Bitcoin',
  tron: 'Tron',
  aptos: 'Aptos',
  sui: 'Sui',
  ton: 'TON',
  cardano: 'Cardano',
  xrp: 'XRP',
};

function EmbedInner() {
  const sp = useSearchParams();
  const payload = useMemo(() => parseProofSearchParams(sp), [sp]);
  const verification = useMemo(() => {
    if (!payload) return null;
    return verifyProofMatch(payload);
  }, [payload]);

  const theme = sp.get('theme') === 'ink' ? 'ink' : 'paper';
  const compact = sp.get('compact') === '1';

  const shell =
    theme === 'ink'
      ? 'bg-ink text-paper'
      : 'bg-paper text-ink';
  const muted = theme === 'ink' ? 'text-paper/55' : 'text-muted';
  const accent = theme === 'ink' ? 'text-paper' : 'text-accent';
  const border = theme === 'ink' ? 'border-paper/20' : 'border-ink/15';

  if (!payload || !verification) {
    return (
      <div className={`min-h-full ${shell} px-4 py-5 font-sans`}>
        <p className={`text-micro uppercase tracking-[0.18em] ${muted}`}>Vanitas proof</p>
        <p className="mt-2 text-sm opacity-80">Missing proof parameters.</p>
      </div>
    );
  }

  const fullProof = `/proof?${sp.toString().replace(/&?theme=[^&]*/g, '').replace(/&?compact=[^&]*/g, '').replace(/^&/, '')}`;

  return (
    <div className={`min-h-full ${shell} px-4 py-4 font-sans ${compact ? 'text-sm' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className={`text-micro uppercase tracking-[0.18em] ${accent}`}>Vanitas</p>
          <p className={`text-micro uppercase tracking-[0.14em] ${muted} mt-1`}>
            {CHAIN_LABEL[payload.chain] || payload.chain}
            {payload.mode ? ` · ${payload.mode}` : ''}
          </p>
        </div>
        <p
          className={`text-micro uppercase tracking-[0.14em] shrink-0 ${
            verification.ok ? accent : muted
          }`}
        >
          {verification.ok ? 'Verified' : 'Mismatch'}
        </p>
      </div>

      <p className={`font-mono break-all ${compact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
        {payload.address}
      </p>
      <p className={`font-mono mt-2 ${muted} ${compact ? 'text-xs' : 'text-sm'}`}>
        <span className={accent}>{payload.prefix || '·'}</span>
        <span className="opacity-40 mx-1">…</span>
        <span className={accent}>{payload.suffix || '·'}</span>
      </p>

      {!compact && (
        <p className={`mt-3 text-xs leading-relaxed ${muted}`}>{verification.reason}</p>
      )}

      <div className={`mt-4 pt-3 border-t ${border} flex items-center justify-between gap-3`}>
        <a
          href={fullProof}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-micro uppercase tracking-[0.14em] ${accent} hover:opacity-80`}
        >
          Open proof
        </a>
        <a
          href="https://vanitas.fun"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-micro uppercase tracking-[0.14em] ${muted} hover:opacity-80`}
        >
          vanitas.fun
        </a>
      </div>
    </div>
  );
}

export default function EmbedProofPage() {
  return (
    <Suspense fallback={<div className="min-h-full bg-paper" />}>
      <EmbedInner />
    </Suspense>
  );
}
