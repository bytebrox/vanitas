'use client';

/**
 * ETH forge — wallet + contract on one page (slider toggle)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  GeneratorControls,
  StatsDisplay,
  Footer,
  FadeIn,
  ContentWithSide,
  EthModeToggle,
  EthPatternInput,
  EthDifficultyDisplay,
  EthResultDisplay,
} from '@/components';
import { EthHeader } from './EthHeader';
import { useEthGenerator } from '@/hooks/useEthGenerator';
import { useSound } from '@/hooks/useSound';
import { validateEthPrefix, validateEthSuffix, estimateEthDifficulty } from '@/lib/eth-validation';
import type { EthMode, GeneratedEthResult } from '@/types/eth';

export function EthContent() {
  const { state, start, stop, reset, updateConfig, maxThreads } = useEthGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedEthResult | null>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, threads, mode } = config;

  useEffect(() => {
    if (result && result !== prevResultRef.current) {
      playSuccessSound();
    }
    prevResultRef.current = result;
  }, [result, playSuccessSound]);

  useEffect(() => {
    const urlPrefix = searchParams.get('prefix');
    const urlSuffix = searchParams.get('suffix');
    const urlMode = searchParams.get('mode');
    if (urlPrefix) updateConfig({ prefix: urlPrefix.replace(/^0x/i, '') });
    if (urlSuffix) updateConfig({ suffix: urlSuffix.replace(/^0x/i, '') });
    if (urlMode === 'wallet' || urlMode === 'contract') {
      updateConfig({ mode: urlMode });
    }
    // Only apply URL params on mount / search change
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: read URL once per searchParams change
  }, [searchParams]);

  const expectedDifficulty = estimateEthDifficulty(prefix, suffix);

  const generateShareLink = useCallback(() => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (prefix) params.set('prefix', prefix);
    if (suffix) params.set('suffix', suffix);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/eth?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    }).catch(() => {});
  }, [mode, prefix, suffix]);

  const prefixValid = validateEthPrefix(prefix).valid;
  const suffixValid = validateEthSuffix(suffix).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const canStart = prefixValid && suffixValid && hasPattern;

  const handleStart = useCallback(() => {
    if (canStart) start(config);
  }, [canStart, config, start]);

  const handleModeChange = useCallback(
    (next: EthMode) => {
      if (next === mode) return;
      if (status === 'running') stop();
      updateConfig({ mode: next });
    },
    [mode, status, stop, updateConfig]
  );

  const handleForgeAnother = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="min-h-screen flex flex-col">
      <EthHeader />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption="Fig. VII — Forum">
          <FadeIn className="space-y-8 sm:space-y-12">
            <div>
              <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">01 — Mode</p>
              <EthModeToggle
                mode={mode}
                onChange={handleModeChange}
                disabled={status === 'running'}
              />
            </div>

            {result ? (
              <EthResultDisplay result={result} onReset={handleForgeAnother} />
            ) : (
              <>
                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">02 — Pattern</p>
                  <EthPatternInput
                    prefix={prefix}
                    suffix={suffix}
                    onPrefixChange={(value) => updateConfig({ prefix: value })}
                    onSuffixChange={(value) => updateConfig({ suffix: value })}
                    disabled={status === 'running'}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">03 — Estimate</p>
                  <EthDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">04 — Forge</p>
                  <GeneratorControls
                    status={status}
                    threads={threads}
                    maxThreads={maxThreads}
                    onStart={handleStart}
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
                EVM addresses are chain-agnostic: the same 0x key works on Ethereum mainnet,
                L2s, and Robinhood Chain. Solana forges live on{' '}
                <a href="/sol" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">
                  SOL
                </a>
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
