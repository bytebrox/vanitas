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
  AptosPatternInput,
  AptosDifficultyDisplay,
  AptosResultDisplay,
  ForgePatternHints,
} from '@/components';
import { Header } from '@/components/Header';
import { useAptosGenerator } from '@/hooks/useAptosGenerator';
import { useSound } from '@/hooks/useSound';
import { useForgeRunUi, requestForgeNotifyPermission } from '@/hooks/useForgeRunUi';
import {
  validateAptosPrefix,
  validateAptosSuffix,
  estimateAptosDifficulty,
} from '@/lib/aptos-validation';
import { saveRecentFind } from '@/lib/find-history';
import { hasAnyPattern, patternsFromSearchParams, writePatternsToSearchParams } from '@/lib/patterns';
import { hasBlockingLookalikeErrors } from '@/lib/lookalike';
import type { GeneratedAptosResult } from '@/types/aptos';
import { RecentFinds } from '@/components/RecentFinds';
import { Link } from '@/i18n/navigation';

export function AptosContent() {
  const tCommon = useTranslations('common');
  const tSteps = useTranslations('forge.stepsCompact');
  const tLinks = useTranslations('forge.links');
  const tSide = useTranslations('forge.sideCaptions');

  const { state, start, stop, reset, updateConfig, maxThreads } = useAptosGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedAptosResult | null>(null);

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
        chain: 'aptos',
        address: result.address,
        pattern: result.matchedPattern,
      });
      setHistoryKey((k) => k + 1);
    }
    prevResultRef.current = result;
  }, [result, playSuccessSound]);

  useEffect(() => {
    const urlPatterns = patternsFromSearchParams(searchParams).map((p) => ({
      prefix: p.prefix.replace(/^0x/i, '').toLowerCase(),
      suffix: p.suffix.replace(/^0x/i, '').toLowerCase(),
    }));
    if (urlPatterns.length) {
      updateConfig({
        patterns: urlPatterns,
        prefix: urlPatterns[0].prefix,
        suffix: urlPatterns[0].suffix,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateAptosDifficulty(prefix, suffix);
  const prefixValid = validateAptosPrefix(prefix).valid;
  const suffixValid = validateAptosSuffix(suffix).valid;
  const hasPattern = hasAnyPattern(config);
  const patternBlocked = hasBlockingLookalikeErrors('aptos', prefix, suffix);
  const canStart = prefixValid && suffixValid && hasPattern && !patternBlocked;

  const handleContinueSearch = useCallback(() => {
    reset();
    requestForgeNotifyPermission();
    start(config);
  }, [reset, start, config]);

  const generateShareLink = useCallback(() => {
    const params = new URLSearchParams();
    writePatternsToSearchParams(params, config);
    const shareUrl = `${window.location.origin}/aptos?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {});
  }, [config]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="aptos" imageSrc="/ascii/hero-aptos-wide.webp" />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={tSide('aptos')}>
          <FadeIn className="space-y-8 sm:space-y-12">
            {result ? (
              <>
                <AptosResultDisplay result={result} onReset={reset} onContinueSearch={handleContinueSearch} />
                <RecentFinds chain="aptos" refreshKey={historyKey} />
              </>
            ) : (
              <>
                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{tSteps('pattern')}</p>
                  <AptosPatternInput
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
                  <AptosDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    patterns={config.patterns}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <ForgePatternHints chain={"aptos"} prefix={prefix} suffix={suffix} />

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

                <RecentFinds chain="aptos" refreshKey={historyKey} />

                <p className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal">
                  Aptos Ed25519 addresses (0x…64 hex). Auth key = sha3_256(pubkey ‖ 0x00). Other
                  forges:{' '}
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
                  <a href="/sui" className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink">
                    SUI
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
