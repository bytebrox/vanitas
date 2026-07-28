'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar, Footer, FadeIn } from '@/components';
import {
  parseProofSearchParams,
  verifyProofMatch,
  type ProofChain,
} from '@/lib/proof-of-find';
import { formatDuration, formatNumber } from '@/lib/format';
import { Link } from '@/i18n/navigation';
import { RichParagraph } from '@/lib/rich-text';

const FORGE_CHAINS: ProofChain[] = [
  'sol',
  'evm',
  'btc',
  'tron',
  'aptos',
  'sui',
  'ton',
  'cardano',
  'xrp',
];

const FORGE_HREF: Record<ProofChain, '/sol' | '/evm' | '/btc' | '/tron' | '/aptos' | '/sui' | '/ton' | '/cardano' | '/xrp'> = {
  sol: '/sol',
  evm: '/evm',
  btc: '/btc',
  tron: '/tron',
  aptos: '/aptos',
  sui: '/sui',
  ton: '/ton',
  cardano: '/cardano',
  xrp: '/xrp',
};

function ProofInner() {
  const sp = useSearchParams();
  const t = useTranslations('tools.proof');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav.chainItems');

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
            <p className="text-micro uppercase tracking-[0.2em] text-accent mb-2">{t('eyebrow')}</p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink normal-case tracking-[0.02em] mb-3">
              {t('title')}
            </h1>
            <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
              {t('intro')}
            </p>
          </header>

          {!payload && (
            <section className="space-y-4 text-sm text-muted leading-relaxed">
              <RichParagraph text={t('emptyIntro')} className="text-sm text-muted leading-relaxed" />
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-micro uppercase tracking-[0.16em]">
                {FORGE_CHAINS.map((k) => (
                  <Link key={k} href={FORGE_HREF[k]} className="text-ink hover:text-accent">
                    {tNav(`${k}.label`)}
                  </Link>
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
                  {verification.ok ? tCommon('verified') : tCommon('mismatch')}
                </p>
                <p className="text-ink normal-case tracking-normal">{verification.reason}</p>
              </section>

              <section className="border-y border-ink/15 divide-y divide-ink/15">
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">
                    {tCommon('chain')}
                  </p>
                  <p className="font-display text-xl text-ink normal-case">
                    {tNav(`${payload.chain}.label`) || payload.chain}
                    {payload.mode ? (
                      <span className="text-sm text-muted font-sans ml-2 uppercase tracking-[0.12em]">
                        {payload.mode}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">{t('address')}</p>
                  <p className="font-mono text-base break-all text-ink">{payload.address}</p>
                </div>
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">{t('pattern')}</p>
                  <p className="font-mono text-base text-ink">
                    <span className="text-accent">{payload.prefix || '·'}</span>
                    <span className="text-ink/30 mx-1">…</span>
                    <span className="text-accent">{payload.suffix || '·'}</span>
                  </p>
                </div>
                {(payload.attempts != null || payload.duration != null) && (
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">
                      {tCommon('stats')}
                    </p>
                    <p className="font-mono text-sm text-muted">
                      {payload.attempts != null
                        ? `${formatNumber(payload.attempts)} ${tCommon('attempts')}`
                        : ''}
                      {payload.attempts != null && payload.duration != null ? ' · ' : ''}
                      {payload.duration != null ? formatDuration(payload.duration) : ''}
                    </p>
                    <p className="text-micro text-muted mt-2 normal-case tracking-normal">
                      {tCommon('statsDisclaimer')}
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
                  {copied ? tCommon('copied') : tCommon('copyProofLink')}
                </button>
                <Link href={FORGE_HREF[payload.chain]} className="text-muted hover:text-ink">
                  {tCommon('openForge')}
                </Link>
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
