'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  GeneratorControls,
  StatsDisplay,
  Footer,
  FadeIn,
  ContentWithSide,
  BtcModeToggle,
  BtcPatternInput,
  BtcDifficultyDisplay,
  BtcResultDisplay,
} from '@/components';
import { Header } from '@/components/Header';
import { useBtcGenerator } from '@/hooks/useBtcGenerator';
import { useSound } from '@/hooks/useSound';
import { validateBtcPrefix, validateBtcSuffix, estimateBtcDifficulty } from '@/lib/btc-validation';
import type { BtcMode, GeneratedBtcResult } from '@/types/btc';

export function BtcContent() {
  const { state, start, stop, reset, updateConfig, maxThreads } = useBtcGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedBtcResult | null>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, threads, mode, caseSensitive } = config;

  useEffect(() => {
    if (result && result !== prevResultRef.current) playSuccessSound();
    prevResultRef.current = result;
  }, [result, playSuccessSound]);

  useEffect(() => {
    const urlPrefix = searchParams.get('prefix');
    const urlSuffix = searchParams.get('suffix');
    const urlMode = searchParams.get('mode');
    if (urlPrefix) updateConfig({ prefix: urlPrefix });
    if (urlSuffix) updateConfig({ suffix: urlSuffix });
    if (urlMode === 'legacy' || urlMode === 'segwit') updateConfig({ mode: urlMode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateBtcDifficulty(prefix, suffix, mode, caseSensitive);
  const prefixValid = validateBtcPrefix(prefix, mode).valid;
  const suffixValid = validateBtcSuffix(suffix, mode).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const canStart = prefixValid && suffixValid && hasPattern;

  const generateShareLink = useCallback(() => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (prefix) params.set('prefix', prefix);
    if (suffix) params.set('suffix', suffix);
    const shareUrl = `${window.location.origin}/btc?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    }).catch(() => {});
  }, [mode, prefix, suffix]);

  const handleModeChange = useCallback(
    (next: BtcMode) => {
      if (next === mode) return;
      if (status === 'running') stop();
      updateConfig({ mode: next });
    },
    [mode, status, stop, updateConfig]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="btc" />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption="Fig. VIII — Coin">
          <FadeIn className="space-y-8 sm:space-y-12">
            <div>
              <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">01 — Type</p>
              <BtcModeToggle mode={mode} onChange={handleModeChange} disabled={status === 'running'} />
            </div>

            {result ? (
              <BtcResultDisplay result={result} onReset={reset} />
            ) : (
              <>
                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">02 — Pattern</p>
                  <BtcPatternInput
                    prefix={prefix}
                    suffix={suffix}
                    mode={mode}
                    caseSensitive={caseSensitive}
                    onPrefixChange={(value) => updateConfig({ prefix: value })}
                    onSuffixChange={(value) => updateConfig({ suffix: value })}
                    onCaseSensitiveChange={(value) => updateConfig({ caseSensitive: value })}
                    disabled={status === 'running'}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">03 — Estimate</p>
                  <BtcDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    mode={mode}
                    caseSensitive={caseSensitive}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">04 — Forge</p>
                  <GeneratorControls
                    status={status}
                    threads={threads}
                    maxThreads={maxThreads}
                    onStart={() => { if (canStart) start(config); }}
                    onStop={stop}
                    onThreadsChange={(value) => updateConfig({ threads: value })}
                    disabled={!canStart}
                    soundEnabled={soundEnabled}
                    onSoundToggle={toggleSound}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">05 — Live</p>
                  <StatsDisplay
                    stats={stats}
                    status={status}
                    expectedDifficulty={expectedDifficulty}
                  />
                </div>

                <p className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal">
                  Bitcoin mainnet only. Keys stay in this browser. Solana and EVM forges live on{' '}
                  <a href="/sol" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">SOL</a>
                  {' · '}
                  <a href="/evm" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">EVM</a>
                  .
                </p>

                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em] text-muted">
                  {hasPattern && (
                    <button
                      type="button"
                      onClick={generateShareLink}
                      disabled={status === 'running'}
                      className="hover:text-ink disabled:opacity-40"
                    >
                      {copied ? 'Copied' : 'Share pattern'}
                    </button>
                  )}
                  <a href="/how-it-works" className="hover:text-ink">How it works</a>
                  <a href="/audit" className="hover:text-ink">Live audit</a>
                </div>
              </>
            )}
          </FadeIn>
        </ContentWithSide>
      </main>

      <Footer />
    </div>
  );
}
