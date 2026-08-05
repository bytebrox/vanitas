'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  EthDifficultyDisplay,
  EthPatternInput,
  GeneratorControls,
  StatsDisplay,
} from '@/components';
import { MarketGate } from '@/components/market/MarketGate';
import { MarketShell } from '@/components/market/MarketShell';
import { MarketTrustNotice } from '@/components/market/MarketTrustNotice';
import { SellPanel } from '@/components/market/SellPanel';
import { useMarketForge } from '@/hooks/useMarketForge';
import { estimateEthDifficulty } from '@/lib/eth-validation';
import { combineOrDifficulty, hasAnyPattern, normalizePatterns } from '@/lib/patterns';
import type { PatternTarget } from '@/lib/patterns';
import type { ListingSummary } from '@/types/market';

export function MarketForgeContent() {
  const t = useTranslations('market.forge');
  const {
    state,
    listing,
    error,
    preparing,
    submitting,
    start,
    stop,
    reset,
    submit,
    updateConfig,
    maxThreads,
  } = useMarketForge();

  const { status, config, stats, result } = state;
  const [patterns, setPatterns] = useState<PatternTarget[]>([]);
  const [published, setPublished] = useState<ListingSummary | null>(null);

  const targets = useMemo(
    () => normalizePatterns({ prefix: config.prefix, suffix: config.suffix, patterns }),
    [config.prefix, config.suffix, patterns]
  );

  const expectedDifficulty = useMemo(
    () =>
      targets.length > 0
        ? combineOrDifficulty(targets.map((target) => estimateEthDifficulty(target.prefix, target.suffix)))
        : estimateEthDifficulty(config.prefix, config.suffix),
    [targets, config.prefix, config.suffix]
  );

  const canStart = hasAnyPattern({ prefix: config.prefix, suffix: config.suffix, patterns });

  // The client half is only useful together with the server half, so there is
  // no reason to keep it in the tab any longer than the round trip needs.
  useEffect(() => {
    if (status === 'found' && result && !listing && !submitting) {
      void submit(Number.isFinite(expectedDifficulty) ? Math.log2(expectedDifficulty) : undefined);
    }
  }, [status, result, listing, submitting, submit, expectedDifficulty]);

  const handleStart = useCallback(() => {
    setPublished(null);
    void start(targets);
  }, [start, targets]);

  const handleReset = useCallback(() => {
    setPublished(null);
    reset();
  }, [reset]);

  return (
    <MarketShell active="forge" title={t('title')} description={t('description')}>
      <div className="space-y-10">
        <MarketTrustNotice />

        <MarketGate>
          {published ? (
            <div className="space-y-6 border-y border-ink/15 py-6">
              <p className="text-micro uppercase tracking-[0.18em] text-ink">{t('listedTitle')}</p>
              <p className="font-mono text-sm sm:text-base text-ink break-all">
                {published.address}
              </p>
              <p className="text-sm text-muted leading-relaxed">{t('listedBody')}</p>
              <button type="button" onClick={handleReset} className="btn-primary sm:min-w-[12rem]">
                {t('forgeAnother')}
              </button>
            </div>
          ) : listing ? (
            <SellPanel listing={listing} onPublished={setPublished} />
          ) : (
            <div className="space-y-10">
              <div>
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">
                  {t('stepPattern')}
                </p>
                <EthPatternInput
                  prefix={config.prefix}
                  suffix={config.suffix}
                  patterns={patterns}
                  disabled={status === 'running' || preparing}
                  onPrefixChange={(value) => updateConfig({ prefix: value })}
                  onSuffixChange={(value) => updateConfig({ suffix: value })}
                  onPatternsChange={setPatterns}
                />
              </div>

              <EthDifficultyDisplay
                prefix={config.prefix}
                suffix={config.suffix}
                patterns={patterns}
                currentRate={stats.attemptsPerSecond}
              />

              <div>
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">
                  {t('stepForge')}
                </p>
                <GeneratorControls
                  status={status}
                  threads={config.threads}
                  maxThreads={maxThreads}
                  onStart={handleStart}
                  onStop={stop}
                  onThreadsChange={(threads) => updateConfig({ threads })}
                  disabled={!canStart || preparing}
                />
                {!canStart && <p className="text-micro text-muted mt-3">{t('needPattern')}</p>}
                {preparing && <p className="text-micro text-muted mt-3">{t('opening')}</p>}
                {submitting && <p className="text-micro text-muted mt-3">{t('claiming')}</p>}
                {error && <p className="text-micro text-accent mt-3">{t('error', { code: error })}</p>}
              </div>

              <div>
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{t('stepLive')}</p>
                <StatsDisplay
                  stats={stats}
                  status={status}
                  expectedDifficulty={expectedDifficulty}
                />
              </div>

              <p className="text-micro text-muted leading-relaxed">{t('footnote')}</p>
            </div>
          )}
        </MarketGate>
      </div>
    </MarketShell>
  );
}
