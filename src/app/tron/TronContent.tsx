'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  GeneratorControls,
  StatsDisplay,
  Footer,
  FadeIn,
  ContentWithSide,
  TronPatternInput,
  TronDifficultyDisplay,
  TronResultDisplay,
} from '@/components';
import { Header } from '@/components/Header';
import { useTronGenerator } from '@/hooks/useTronGenerator';
import { useSound } from '@/hooks/useSound';
import {
  validateTronPrefix,
  validateTronSuffix,
  estimateTronDifficulty,
} from '@/lib/tron-validation';
import type { GeneratedTronResult } from '@/types/tron';

export function TronContent() {
  const { state, start, stop, reset, updateConfig, maxThreads } = useTronGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedTronResult | null>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, threads, caseSensitive } = config;

  useEffect(() => {
    if (result && result !== prevResultRef.current) playSuccessSound();
    prevResultRef.current = result;
  }, [result, playSuccessSound]);

  useEffect(() => {
    const urlPrefix = searchParams.get('prefix');
    const urlSuffix = searchParams.get('suffix');
    if (urlPrefix) updateConfig({ prefix: urlPrefix });
    if (urlSuffix) updateConfig({ suffix: urlSuffix });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateTronDifficulty(prefix, suffix, caseSensitive);
  const prefixValid = validateTronPrefix(prefix).valid;
  const suffixValid = validateTronSuffix(suffix).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const canStart = prefixValid && suffixValid && hasPattern;

  const generateShareLink = useCallback(() => {
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    if (suffix) params.set('suffix', suffix);
    const shareUrl = `${window.location.origin}/tron?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    }).catch(() => {});
  }, [prefix, suffix]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="tron" />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption="Fig. IX — Circuit">
          <FadeIn className="space-y-8 sm:space-y-12">
            {result ? (
              <TronResultDisplay result={result} onReset={reset} />
            ) : (
              <>
                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">01 — Pattern</p>
                  <TronPatternInput
                    prefix={prefix}
                    suffix={suffix}
                    caseSensitive={caseSensitive}
                    onPrefixChange={(value) => updateConfig({ prefix: value })}
                    onSuffixChange={(value) => updateConfig({ suffix: value })}
                    onCaseSensitiveChange={(value) => updateConfig({ caseSensitive: value })}
                    disabled={status === 'running'}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">02 — Estimate</p>
                  <TronDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    caseSensitive={caseSensitive}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">03 — Forge</p>
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
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">04 — Live</p>
                  <StatsDisplay
                    stats={stats}
                    status={status}
                    expectedDifficulty={expectedDifficulty}
                  />
                </div>

                <p className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal">
                  Tron mainnet Base58 addresses (T…). Same secp256k1 curve family as EVM, different encoding.
                  Other forges:{' '}
                  <a href="/sol" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">SOL</a>
                  {' · '}
                  <a href="/evm" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">EVM</a>
                  {' · '}
                  <a href="/btc" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">BTC</a>
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
