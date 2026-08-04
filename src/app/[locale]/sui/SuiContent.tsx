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
  SuiPatternInput,
  SuiDifficultyDisplay,
  SuiResultDisplay,
  ForgePatternHints,
} from '@/components';
import { Header } from '@/components/Header';
import { useSuiGenerator } from '@/hooks/useSuiGenerator';
import { useSound } from '@/hooks/useSound';
import { useForgeRunUi, requestForgeNotifyPermission } from '@/hooks/useForgeRunUi';
import {
  validateSuiPrefix,
  validateSuiSuffix,
  estimateSuiDifficulty,
} from '@/lib/sui-validation';
import { saveRecentFind } from '@/lib/find-history';
import { hasBlockingLookalikeErrors } from '@/lib/lookalike';
import type { GeneratedSuiResult } from '@/types/sui';
import { RecentFinds } from '@/components/RecentFinds';
import { Link } from '@/i18n/navigation';

export function SuiContent() {
  const tCommon = useTranslations('common');
  const tSteps = useTranslations('forge.stepsCompact');
  const tLinks = useTranslations('forge.links');
  const tSide = useTranslations('forge.sideCaptions');

  const { state, start, stop, reset, updateConfig, maxThreads } = useSuiGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedSuiResult | null>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, threads } = config;

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
        chain: 'sui',
        address: result.address,
        pattern: result.matchedPattern,
      });
      setHistoryKey((k) => k + 1);
    }
    prevResultRef.current = result;
  }, [result, playSuccessSound]);

  useEffect(() => {
    const urlPrefix = searchParams.get('prefix');
    const urlSuffix = searchParams.get('suffix');
    if (urlPrefix) updateConfig({ prefix: urlPrefix.replace(/^0x/i, '').toLowerCase() });
    if (urlSuffix) updateConfig({ suffix: urlSuffix.replace(/^0x/i, '').toLowerCase() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateSuiDifficulty(prefix, suffix);
  const prefixValid = validateSuiPrefix(prefix).valid;
  const suffixValid = validateSuiSuffix(suffix).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const patternBlocked = hasBlockingLookalikeErrors('sui', prefix, suffix);
  const canStart = prefixValid && suffixValid && hasPattern && !patternBlocked;

  const handleContinueSearch = useCallback(() => {
    reset();
    requestForgeNotifyPermission();
    start(config);
  }, [reset, start, config]);

  const generateShareLink = useCallback(() => {
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    if (suffix) params.set('suffix', suffix);
    const shareUrl = `${window.location.origin}/sui?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {});
  }, [prefix, suffix]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="sui" imageSrc="/ascii/hero-sui-wide.webp" />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={tSide('sui')}>
          <FadeIn className="space-y-8 sm:space-y-12">
            {result ? (
              <>
                <SuiResultDisplay result={result} onReset={reset} onContinueSearch={handleContinueSearch} />
                <RecentFinds chain="sui" refreshKey={historyKey} />
              </>
            ) : (
              <>
                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{tSteps('pattern')}</p>
                  <SuiPatternInput
                    prefix={prefix}
                    suffix={suffix}
                    onPrefixChange={(value) => updateConfig({ prefix: value })}
                    onSuffixChange={(value) => updateConfig({ suffix: value })}
                    disabled={status === 'running'}
                    patterns={config.patterns}
                    onPatternsChange={(patterns) => updateConfig({ patterns, prefix: patterns[0]?.prefix ?? '', suffix: patterns[0]?.suffix ?? '' })}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('estimate')}</p>
                  <SuiDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    patterns={config.patterns}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <ForgePatternHints chain={"sui"} prefix={prefix} suffix={suffix} />

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

                <RecentFinds chain="sui" refreshKey={historyKey} />

                <p className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal">
                  Sui Ed25519 addresses (0x…64 hex). Address = blake2b(0x00 ‖ pubkey). Other forges:{' '}
                  <a href="/sol" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">
                    SOL
                  </a>
                  {' · '}
                  <a href="/evm" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">
                    EVM
                  </a>
                  {' · '}
                  <a href="/btc" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">
                    BTC
                  </a>
                  {' · '}
                  <a href="/tron" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">
                    TRON
                  </a>
                  {' · '}
                  <a href="/aptos" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">
                    APTOS
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
                      {copied ? tCommon('copied') : tLinks('sharePattern')}
                    </button>
                  )}
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
