'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar, Footer, FadeIn } from '@/components';
import {
  parseProofSearchParams,
  verifyProofMatch,
  type ProofChain,
} from '@/lib/proof-of-find';
import { formatDuration, formatNumber } from '@/lib/format';

const CHAIN_LABEL: Record<ProofChain, string> = {
  sol: 'Solana',
  evm: 'EVM',
  btc: 'Bitcoin',
  tron: 'Tron',
  aptos: 'Aptos',
  sui: 'Sui',
  ton: 'TON',
  cardano: 'Cardano',
};

const FORGE_HREF: Record<ProofChain, string> = {
  sol: '/sol',
  evm: '/evm',
  btc: '/btc',
  tron: '/tron',
  aptos: '/aptos',
  sui: '/sui',
  ton: '/ton',
  cardano: '/cardano',
};

function ProofInner() {
  const sp = useSearchParams();
  const payload = useMemo(() => parseProofSearchParams(sp), [sp]);
  const [copied, setCopied] = useState(false);

  const verification = useMemo(() => {
    if (!payload) return null;
    return verifyProofMatch(payload);
  }, [payload]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 lg:px-12 pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))] pb-16">
        <FadeIn className="max-w-2xl mx-auto space-y-10">
          <header className="border-b border-ink/15 pb-6">
            <p className="text-micro uppercase tracking-[0.2em] text-accent mb-2">Proof of find</p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink normal-case tracking-tight mb-3">
              Public match check
            </h1>
            <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
              This page verifies that an address matches a claimed pattern. It never contains private
              keys. Anyone can open the link and re-check client-side.
            </p>
          </header>

          {!payload && (
            <section className="space-y-4 text-sm text-muted leading-relaxed">
              <p>
                No proof data in the URL. After you forge an address, use <strong className="text-ink">Share proof</strong>{' '}
                on the result screen. Or forge first:
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-micro uppercase tracking-[0.16em]">
                {Object.entries(FORGE_HREF).map(([k, href]) => (
                  <a key={k} href={href} className="text-ink hover:text-accent">
                    {CHAIN_LABEL[k as ProofChain]}
                  </a>
                ))}
              </div>
            </section>
          )}

          {payload && verification && (
            <>
              <section
                className={`border px-5 py-4 ${
                  verification.ok ? 'border-ink/25 bg-ink/[0.03]' : 'border-accent/40 bg-accent/5'
                }`}
              >
                <p className="text-micro uppercase tracking-[0.18em] mb-2">
                  {verification.ok ? 'Verified' : 'Mismatch'}
                </p>
                <p className="text-ink normal-case tracking-normal">{verification.reason}</p>
              </section>

              <section className="border-y border-ink/15 divide-y divide-ink/15">
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Chain</p>
                  <p className="font-display text-xl text-ink normal-case">
                    {CHAIN_LABEL[payload.chain] || payload.chain}
                    {payload.mode ? (
                      <span className="text-sm text-muted font-sans ml-2 uppercase tracking-[0.12em]">
                        {payload.mode}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Address</p>
                  <p className="font-mono text-base break-all text-ink">{payload.address}</p>
                </div>
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Pattern</p>
                  <p className="font-mono text-base text-ink">
                    <span className="text-accent">{payload.prefix || '·'}</span>
                    <span className="text-ink/30 mx-1">…</span>
                    <span className="text-accent">{payload.suffix || '·'}</span>
                  </p>
                </div>
                {(payload.attempts != null || payload.duration != null) && (
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Stats</p>
                    <p className="font-mono text-sm text-muted">
                      {payload.attempts != null ? `${formatNumber(payload.attempts)} attempts` : ''}
                      {payload.attempts != null && payload.duration != null ? ' · ' : ''}
                      {payload.duration != null ? formatDuration(payload.duration) : ''}
                    </p>
                    <p className="text-micro text-muted mt-2 normal-case tracking-normal">
                      Attempt counts are self-reported by the forger and not cryptographically proven.
                    </p>
                  </div>
                )}
              </section>

              <div className="flex flex-wrap gap-x-8 gap-y-3 text-micro uppercase tracking-[0.16em]">
                <button
                  type="button"
                  onClick={copyLink}
                  className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                >
                  {copied ? 'Copied' : 'Copy proof link'}
                </button>
                <a
                  href={FORGE_HREF[payload.chain]}
                  className="text-muted hover:text-ink"
                >
                  Open forge
                </a>
              </div>
            </>
          )}
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}

export default function ProofPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <ProofInner />
    </Suspense>
  );
}
