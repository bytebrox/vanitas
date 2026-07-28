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
  CardanoPatternInput,
  CardanoDifficultyDisplay,
  CardanoResultDisplay,
  ForgePatternHints,
} from '@/components';
import { Header } from '@/components/Header';
import { useCardanoGenerator } from '@/hooks/useCardanoGenerator';
import { useSound } from '@/hooks/useSound';
import { useForgeRunUi, requestForgeNotifyPermission } from '@/hooks/useForgeRunUi';
import {
  validateCardanoPrefix,
  validateCardanoSuffix,
  estimateCardanoDifficulty,
  cardanoUserPrefix,
  stripCardanoHrp,
} from '@/lib/cardano-validation';
import { saveRecentFind } from '@/lib/find-history';
import { hasBlockingLookalikeErrors } from '@/lib/lookalike';
import type { GeneratedCardanoResult } from '@/types/cardano';
import { RecentFinds } from '@/components/RecentFinds';
import { Link } from '@/i18n/navigation';

export function CardanoContent() {
  const tCommon = useTranslations('common');
  const tSteps = useTranslations('forge.stepsCompact');
  const tLinks = useTranslations('forge.links');
  const tSide = useTranslations('forge.sideCaptions');

  const { state, start, stop, reset, updateConfig, maxThreads } = useCardanoGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedCardanoResult | null>(null);

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
        chain: 'cardano',
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
    if (urlPrefix) updateConfig({ prefix: cardanoUserPrefix(urlPrefix) });
    if (urlSuffix) updateConfig({ suffix: stripCardanoHrp(urlSuffix) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateCardanoDifficulty(prefix, suffix);
  const prefixValid = validateCardanoPrefix(prefix).valid;
  const suffixValid = validateCardanoSuffix(suffix).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const patternBlocked = hasBlockingLookalikeErrors('cardano', prefix, suffix);
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
    const shareUrl = `${window.location.origin}/cardano?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {});
  }, [prefix, suffix]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="cardano" />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={tSide('cardano')}>
          <FadeIn className="space-y-8 sm:space-y-12">
            {result ? (
              <>
                <CardanoResultDisplay result={result} onReset={reset} onContinueSearch={handleContinueSearch} />
                <RecentFinds chain="cardano" refreshKey={historyKey} />
              </>
            ) : (
              <>
                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{tSteps('pattern')}</p>
                  <CardanoPatternInput
                    prefix={prefix}
                    suffix={suffix}
                    onPrefixChange={(value) => updateConfig({ prefix: value })}
                    onSuffixChange={(value) => updateConfig({ suffix: value })}
                    disabled={status === 'running'}
                  />
                </div>

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('estimate')}</p>
                  <CardanoDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <ForgePatternHints chain={"cardano"} prefix={prefix} suffix={suffix} />

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

                <RecentFinds chain="cardano" refreshKey={historyKey} />

                <p className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal">
                  Cardano enterprise mainnet addresses (addr1…). Payment key only (CIP-19 type 6).
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
