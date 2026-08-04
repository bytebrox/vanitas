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
  XrpPatternInput,
  XrpDifficultyDisplay,
  XrpResultDisplay,
  ForgePatternHints,
} from '@/components';
import { Header } from '@/components/Header';
import { useXrpGenerator } from '@/hooks/useXrpGenerator';
import { useSound } from '@/hooks/useSound';
import { useForgeRunUi, requestForgeNotifyPermission } from '@/hooks/useForgeRunUi';
import {
  validateXrpPrefix,
  validateXrpSuffix,
  estimateXrpDifficulty,
  xrpPrefixBody,
} from '@/lib/xrp-validation';
import { saveRecentFind } from '@/lib/find-history';
import { hasBlockingLookalikeErrors } from '@/lib/lookalike';
import type { GeneratedXrpResult } from '@/types/xrp';
import { RecentFinds } from '@/components/RecentFinds';
import { Link } from '@/i18n/navigation';

export function XrpContent() {
  const tCommon = useTranslations('common');
  const tSteps = useTranslations('forge.stepsCompact');
  const tLinks = useTranslations('forge.links');
  const tSide = useTranslations('forge.sideCaptions');

  const { state, start, stop, reset, updateConfig, maxThreads } = useXrpGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedXrpResult | null>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, threads, caseSensitive } = config;

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
        chain: 'xrp',
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
    const urlCase = searchParams.get('case');
    if (urlPrefix) updateConfig({ prefix: xrpPrefixBody(urlPrefix) });
    if (urlSuffix) updateConfig({ suffix: urlSuffix.replace(/^r+/, '') });
    if (urlCase === '1' || urlCase === 'true') updateConfig({ caseSensitive: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateXrpDifficulty(prefix, suffix, caseSensitive);
  const prefixValid = validateXrpPrefix(prefix).valid;
  const suffixValid = validateXrpSuffix(suffix).valid;
  const hasPattern = xrpPrefixBody(prefix).length > 0 || suffix.length > 0;
  const patternBlocked = hasBlockingLookalikeErrors('xrp', prefix, suffix);
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
    if (caseSensitive) params.set('case', '1');
    const shareUrl = `${window.location.origin}/xrp?${params.toString()}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(() => {});
  }, [prefix, suffix, caseSensitive]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="xrp" imageSrc="/ascii/hero-xrp-wide.webp" />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={tSide('xrp')}>
          <FadeIn className="space-y-8 sm:space-y-12">
            {result ? (
              <>
                <XrpResultDisplay result={result} onReset={reset} onContinueSearch={handleContinueSearch} />
                <RecentFinds chain="xrp" refreshKey={historyKey} />
              </>
            ) : (
              <>
                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{tSteps('pattern')}</p>
                  <XrpPatternInput
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
                  <XrpDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    patterns={config.patterns}
                    caseSensitive={caseSensitive}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <ForgePatternHints chain={"xrp"} prefix={prefix} suffix={suffix} />

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

                <RecentFinds chain="xrp" refreshKey={historyKey} />

                <p className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal">
                  XRPL classic mainnet addresses (r…). secp256k1 compressed keys. X-addresses are not
                  generated here.
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
