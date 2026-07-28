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
} from '@/components';
import { Header } from '@/components/Header';
import { useTonGenerator } from '@/hooks/useTonGenerator';
import { useSound } from '@/hooks/useSound';
import {
  validateTonPrefix,
  validateTonSuffix,
  estimateTonDifficulty,
} from '@/lib/ton-validation';
import { saveRecentFind } from '@/lib/find-history';
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
    const urlPrefix = searchParams.get('prefix');
    const urlSuffix = searchParams.get('suffix');
    const urlMode = searchParams.get('mode');
    if (urlPrefix) updateConfig({ prefix: urlPrefix });
    if (urlSuffix) updateConfig({ suffix: urlSuffix });
    if (urlMode === 'bounceable' || urlMode === 'non-bounceable') {
      updateConfig({ mode: urlMode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateTonDifficulty(prefix, suffix, mode);
  const prefixValid = validateTonPrefix(prefix).valid;
  const suffixValid = validateTonSuffix(suffix).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const canStart = prefixValid && suffixValid && hasPattern;

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
    if (prefix) params.set('prefix', prefix);
    if (suffix) params.set('suffix', suffix);
    const shareUrl = `${window.location.origin}/ton?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {});
  }, [mode, prefix, suffix]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="ton" />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={tSide('ton')}>
          <FadeIn className="space-y-8 sm:space-y-12">
            {result ? (
              <>
                <TonResultDisplay result={result} onReset={reset} />
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
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('estimate')}</p>
                  <TonDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    mode={mode}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('forge')}</p>
                  <GeneratorControls
                    status={status}
                    threads={threads}
                    maxThreads={maxThreads}
                    onStart={() => {
                      if (canStart) start(config);
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
