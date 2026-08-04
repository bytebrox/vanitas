'use client';

/**
 * Solana forge — wallet + mint on one page (slider toggle)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Header,
  PatternInput,
  DifficultyDisplay,
  StatsDisplay,
  ResultDisplay,
  GeneratorControls,
  Footer,
  FadeIn,
  ContentWithSide,
  SolModeToggle,
  TokenResultDisplay,
  ForgePatternHints,
} from '@/components';
import { useGenerator } from '@/hooks/useGenerator';
import { useSound } from '@/hooks/useSound';
import { useForgeRunUi, requestForgeNotifyPermission } from '@/hooks/useForgeRunUi';
import { validatePrefix, validateSuffix, estimateDifficulty } from '@/lib/validation';
import { hasBlockingLookalikeErrors } from '@/lib/lookalike';
import type { SolMode } from '@/types/sol';
import type { GeneratedKeypair } from '@/types';
import { Link } from '@/i18n/navigation';

export function SolContent() {
  const tCommon = useTranslations('common');
  const tSteps = useTranslations('forge.steps');
  const tLinks = useTranslations('forge.links');
  const tSide = useTranslations('forge.sideCaptions');
  const tSol = useTranslations('forge.sol');

  const { state, start, stop, reset, updateConfig, maxThreads } = useGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<SolMode>('wallet');
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedKeypair | null>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, caseSensitive, threads } = config;

  useForgeRunUi({
    status,
    forgingLabel: tCommon('tabForging'),
    foundLabel: tCommon('tabFound'),
    notifyTitle: tCommon('notifyTitle'),
    notifyBody: tCommon('notifyBody'),
  });

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
    if (urlPrefix) updateConfig({ prefix: urlPrefix });
    if (urlSuffix) updateConfig({ suffix: urlSuffix });
    if (urlMode === 'wallet' || urlMode === 'mint') {
      setMode(urlMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL params on search change only
  }, [searchParams]);

  const expectedDifficulty = estimateDifficulty(prefix, suffix, caseSensitive);

  const generateShareLink = useCallback(() => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (prefix) params.set('prefix', prefix);
    if (suffix) params.set('suffix', suffix);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/sol?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    }).catch(() => {});
  }, [mode, prefix, suffix]);

  const prefixValid = validatePrefix(prefix, caseSensitive).valid;
  const suffixValid = validateSuffix(suffix, caseSensitive).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const patternBlocked = hasBlockingLookalikeErrors('sol', prefix, suffix);
  const canStart = prefixValid && suffixValid && hasPattern && !patternBlocked;

  const handleStart = useCallback(() => {
    if (!canStart) return;
    requestForgeNotifyPermission();
    start(config);
  }, [canStart, config, start]);

  const handleContinueSearch = useCallback(() => {
    reset();
    requestForgeNotifyPermission();
    start(config);
  }, [reset, start, config]);

  const handleModeChange = useCallback(
    (next: SolMode) => {
      if (next === mode) return;
      if (status === 'running') stop();
      if (result) reset();
      setMode(next);
    },
    [mode, status, result, stop, reset]
  );

  const sideArt =
    mode === 'mint'
      ? { src: '/ascii/side-temple.webp', caption: tSide('solMint') }
      : { src: '/ascii/side-colosseum.webp', caption: tSide('solWallet') };

  const heroSrc =
    mode === 'mint' ? '/ascii/hero-mint-wide.webp' : '/ascii/hero-wallet-wide.webp';

  return (
    <div className="min-h-screen flex flex-col">
      <Header imageSrc={heroSrc} mode={mode} />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 sm:pb-16 scroll-mt-24">
        <ContentWithSide imageSrc={sideArt.src} caption={sideArt.caption}>
          <FadeIn className="space-y-8 sm:space-y-12">
            <div>
              <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{tSteps('mode')}</p>
              <SolModeToggle
                mode={mode}
                onChange={handleModeChange}
                disabled={status === 'running'}
              />
            </div>

            {result ? (
              mode === 'mint' ? (
                <TokenResultDisplay
                  result={result}
                  onReset={reset}
                  onContinueSearch={handleContinueSearch}
                />
              ) : (
                <ResultDisplay
                  result={result}
                  onReset={reset}
                  onContinueSearch={handleContinueSearch}
                />
              )
            ) : (
              <>
                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">
                    {mode === 'mint' ? tCommon('stepMintPattern') : tSteps('pattern')}
                  </p>
                  <PatternInput
                    prefix={prefix}
                    suffix={suffix}
                    caseSensitive={caseSensitive}
                    onPrefixChange={(value) => updateConfig({ prefix: value })}
                    onSuffixChange={(value) => updateConfig({ suffix: value })}
                    onCaseSensitiveChange={(value) => updateConfig({ caseSensitive: value })}
                    disabled={status === 'running'}
                    patterns={config.patterns}
                    onPatternsChange={(patterns) => updateConfig({ patterns, prefix: patterns[0]?.prefix ?? '', suffix: patterns[0]?.suffix ?? '' })}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('estimate')}</p>
                  <DifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    caseSensitive={caseSensitive}
                    patterns={config.patterns}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <ForgePatternHints chain="sol" prefix={prefix} suffix={suffix} />

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('forge')}</p>
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
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('live')}</p>
                  <StatsDisplay
                    stats={stats}
                    status={status}
                    expectedDifficulty={expectedDifficulty}
                  />
                </div>

                {mode === 'mint' && (
                  <p className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal">
                    {tSol('mintAfterForge')}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em] text-muted">
                  {hasPattern && (
                    <button
                      type="button"
                      onClick={generateShareLink}
                      disabled={status === 'running'}
                      className="hover:text-ink disabled:opacity-40"
                    >
                      {copied ? tCommon('copied') : tLinks('sharePattern')}
                    </button>
                  )}
                  <Link href="/evm" className="hover:text-ink">
                    {tLinks('evmForge')}
                  </Link>
                  <Link href="/how-it-works" className="hover:text-ink">
                    {tLinks('howItWorks')}
                  </Link>
                  <Link href="/audit" className="hover:text-ink">
                    {tLinks('liveAudit')}
                  </Link>
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
