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
  TronPatternInput,
  TronDifficultyDisplay,
  TronResultDisplay,
  TronModeToggle,
  ForgePatternHints,
} from '@/components';
import { Header } from '@/components/Header';
import { useTronGenerator } from '@/hooks/useTronGenerator';
import { useSound } from '@/hooks/useSound';
import { useForgeRunUi, requestForgeNotifyPermission } from '@/hooks/useForgeRunUi';
import {
  validateTronPrefix,
  validateTronSuffix,
  estimateTronDifficulty,
} from '@/lib/tron-validation';
import { saveRecentFind } from '@/lib/find-history';
import type { GeneratedTronResult, TronMode } from '@/types/tron';
import { RecentFinds } from '@/components/RecentFinds';
import { Link } from '@/i18n/navigation';

export function TronContent() {
  const tCommon = useTranslations('common');
  const tSteps = useTranslations('forge.stepsCompact');
  const tLinks = useTranslations('forge.links');
  const tSide = useTranslations('forge.sideCaptions');

  const { state, start, stop, reset, updateConfig, maxThreads } = useTronGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedTronResult | null>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, threads, caseSensitive, mode } = config;

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
        chain: 'tron',
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
    const urlMode = searchParams.get('mode');
    if (urlPrefix) updateConfig({ prefix: urlPrefix });
    if (urlSuffix) updateConfig({ suffix: urlSuffix });
    if (urlMode === 'wallet' || urlMode === 'contract') {
      updateConfig({ mode: urlMode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateTronDifficulty(prefix, suffix, caseSensitive);
  const prefixValid = validateTronPrefix(prefix, caseSensitive).valid;
  const suffixValid = validateTronSuffix(suffix).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const canStart = prefixValid && suffixValid && hasPattern;

  const onModeChange = useCallback(
    (next: TronMode) => {
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
    const shareUrl = `${window.location.origin}/tron?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {});
  }, [mode, prefix, suffix]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="tron" />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={tSide('tron')}>
          <FadeIn className="space-y-8 sm:space-y-12">
            {result ? (
              <>
                <TronResultDisplay result={result} onReset={reset} />
                <RecentFinds chain="tron" refreshKey={historyKey} />
              </>
            ) : (
              <>
                <TronModeToggle
                  mode={mode}
                  onChange={onModeChange}
                  disabled={status === 'running'}
                />

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{tSteps('pattern')}</p>
                  <TronPatternInput
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
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('estimate')}</p>
                  <TronDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    caseSensitive={caseSensitive}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <ForgePatternHints chain={"tron"} prefix={prefix} suffix={suffix} />

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

                <RecentFinds chain="tron" refreshKey={historyKey} />

                <p className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal">
                  {mode === 'contract'
                    ? 'Contract mode grinds a deployer key whose first CREATE (nonce 0) yields a vanity T… address — same RLP math as EVM, then Tron Base58Check.'
                    : 'Tron mainnet Base58 addresses (T…). Same secp256k1 curve family as EVM, different encoding.'}{' '}
                  Other forges:{' '}
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
