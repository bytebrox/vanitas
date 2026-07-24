'use client';

/**
 * Token mint — same open ledger structure as wallet
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  PatternInput,
  DifficultyDisplay,
  StatsDisplay,
  GeneratorControls,
  Footer,
  FadeIn,
  ContentWithSide,
} from '@/components';
import { TokenHeader } from './TokenHeader';
import { TokenResultDisplay } from './TokenResultDisplay';
import { useGenerator } from '@/hooks/useGenerator';
import { useSound } from '@/hooks/useSound';
import { validatePrefix, validateSuffix, estimateDifficulty } from '@/lib/validation';

export function TokenContent() {
  const { state, start, stop, reset, updateConfig, maxThreads } = useGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<typeof result>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, caseSensitive, threads } = config;

  useEffect(() => {
    if (result && result !== prevResultRef.current) {
      playSuccessSound();
    }
    prevResultRef.current = result;
  }, [result, playSuccessSound]);

  useEffect(() => {
    const urlPrefix = searchParams.get('prefix');
    const urlSuffix = searchParams.get('suffix');
    if (urlPrefix || urlSuffix) {
      if (urlPrefix) updateConfig({ prefix: urlPrefix });
      if (urlSuffix) updateConfig({ suffix: urlSuffix });
    }
  }, [searchParams, updateConfig]);

  const expectedDifficulty = estimateDifficulty(prefix, suffix, caseSensitive);

  const generateShareLink = useCallback(() => {
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    if (suffix) params.set('suffix', suffix);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = params.toString()
      ? `${baseUrl}/token?${params.toString()}`
      : `${baseUrl}/token`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    }).catch(() => {});
  }, [prefix, suffix]);

  const prefixValid = validatePrefix(prefix, caseSensitive).valid;
  const suffixValid = validateSuffix(suffix, caseSensitive).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const canStart = prefixValid && suffixValid && hasPattern;

  const handleStart = useCallback(() => {
    if (canStart) start(config);
  }, [canStart, config, start]);

  return (
    <div className="min-h-screen flex flex-col">
      <TokenHeader />

      <main id="forge" className="flex-1 px-5 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-temple.webp" caption="Fig. II — Temple">
          {result ? (
            <FadeIn>
              <TokenResultDisplay result={result} onReset={reset} />
            </FadeIn>
          ) : (
            <FadeIn className="space-y-12">
              <div>
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">01 — Mint pattern</p>
                <PatternInput
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
                <DifficultyDisplay
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
                  onStart={handleStart}
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
                After forging: copy the private key into your launchpad&apos;s custom mint field
                (pump.fun, Raydium, Meteora, …).
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
            </FadeIn>
          )}
        </ContentWithSide>
      </main>

      <Footer />
    </div>
  );
}
