'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  GeneratorControls,
  StatsDisplay,
  Footer,
  FadeIn,
  ContentWithSide,
  TonPatternInput,
  TonDifficultyDisplay,
  TonResultDisplay,
  TonModeToggle,
  ForgePatternHints,
} from '@/components';
import { Header } from '@/components/Header';
import { useTonGenerator } from '@/hooks/useTonGenerator';
import { useSound } from '@/hooks/useSound';
import { useForgeRunUi, requestForgeNotifyPermission } from '@/hooks/useForgeRunUi';
import {
  validateTonPrefix,
  validateTonSuffix,
  estimateTonDifficulty,
} from '@/lib/ton-validation';
import { saveRecentFind } from '@/lib/find-history';
import { hasAnyPattern, patternsFromSearchParams, writePatternsToSearchParams } from '@/lib/patterns';
import { hasBlockingLookalikeErrors } from '@/lib/lookalike';
import type { GeneratedTonResult, TonMode } from '@/types/ton';
import { RecentFinds } from '@/components/RecentFinds';
import { Link } from '@/i18n/navigation';

export function TonContent() {
  const tCommon = useTranslations('common');
  const tSteps = useTranslations('forge.stepsCompact');
  const tLinks = useTranslations('forge.links');

  const tSide = useTranslations('forge.sideCaptions');

  const { state, start, stop, reset, updateConfig, maxThreads } = useTonGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedTonResult | null>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, threads, mode } = config;

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
      saveRecentFind({
        chain: 'ton',
        address: result.address,
        pattern: result.matchedPattern,
        mode: result.mode,
      });
      setHistoryKey((k) => k + 1);
    }
    prevResultRef.current = result;
  }, [result, playSuccessSound]);

  useEffect(() => {
    const urlPatterns = patternsFromSearchParams(searchParams);
    const urlMode = searchParams.get('mode');
    const patch: Parameters<typeof updateConfig>[0] = {};
    if (urlPatterns.length) {
      patch.patterns = urlPatterns;
      patch.prefix = urlPatterns[0].prefix;
      patch.suffix = urlPatterns[0].suffix;
    }
    if (urlMode === 'bounceable' || urlMode === 'non-bounceable') {
      patch.mode = urlMode;
    }
    if (Object.keys(patch).length) updateConfig(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateTonDifficulty(prefix, suffix, mode);
  const prefixValid = validateTonPrefix(prefix).valid;
  const suffixValid = validateTonSuffix(suffix).valid;
  const hasPattern = hasAnyPattern(config);
  const patternBlocked = hasBlockingLookalikeErrors('ton', prefix, suffix);
  const canStart = prefixValid && suffixValid && hasPattern && !patternBlocked;

  const handleContinueSearch = useCallback(() => {
    reset();
    requestForgeNotifyPermission();
    start(config);
  }, [reset, start, config]);

  const onModeChange = useCallback(
    (next: TonMode) => {
      if (next === mode) return;
      if (status === 'running') stop();
      updateConfig({ mode: next });
    },
    [mode, status, stop, updateConfig]
  );

  const generateShareLink = useCallback(() => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    writePatternsToSearchParams(params, config);
    const shareUrl = `${window.location.origin}/ton?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {});
  }, [mode, config]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="ton" imageSrc="/ascii/hero-ton-wide.webp" />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={tSide('ton')}>
          <FadeIn className="space-y-8 sm:space-y-12">
            {result ? (
              <>
                <TonResultDisplay result={result} onReset={reset} onContinueSearch={handleContinueSearch} />
                <RecentFinds chain="ton" refreshKey={historyKey} />
              </>
            ) : (
              <>
                <TonModeToggle
                  mode={mode}
                  onChange={onModeChange}
                  disabled={status === 'running'}
                />

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{tSteps('pattern')}</p>
                  <TonPatternInput
                    prefix={prefix}
                    suffix={suffix}
                    mode={mode}
                    onPrefixChange={(value) => updateConfig({ prefix: value })}
                    onSuffixChange={(value) => updateConfig({ suffix: value })}
                    disabled={status === 'running'}
                    patterns={config.patterns}
                    onPatternsChange={(patterns) => updateConfig({ patterns, prefix: patterns[0]?.prefix ?? '', suffix: patterns[0]?.suffix ?? '' })}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('estimate')}</p>
                  <TonDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    patterns={config.patterns}
                    mode={mode}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <ForgePatternHints chain={"ton"} prefix={prefix} suffix={suffix} />

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('forge')}</p>
                  <GeneratorControls
                    status={status}
                    threads={threads}
                    maxThreads={maxThreads}
                    onStart={() => {
                      if (!canStart) return;
                      requestForgeNotifyPermission();
                      start(config);
                    }}
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

                <RecentFinds chain="ton" refreshKey={historyKey} />

                <p className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal">
                  TON Wallet v4R2. Non-bounceable UQ… is the usual wallet form; EQ… is the bounceable twin.
                </p>

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
                  <Link href="/proof" className="hover:text-ink">
                    {tLinks('proofOfFind')}
                  </Link>
                  <Link href="/how-it-works" className="hover:text-ink">
                    {tLinks('howItWorks')}
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
