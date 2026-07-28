'use client';

/**
 * EVM forge — wallet + contract on one page (slider toggle)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  GeneratorControls,
  StatsDisplay,
  Footer,
  FadeIn,
  ContentWithSide,
  EthModeToggle,
  EthPatternInput,
  EthDifficultyDisplay,
  EthResultDisplay,
  ForgePatternHints,
} from '@/components';
import { EvmHeader } from './EvmHeader';
import { useEthGenerator } from '@/hooks/useEthGenerator';
import { useSound } from '@/hooks/useSound';
import { useForgeRunUi, requestForgeNotifyPermission } from '@/hooks/useForgeRunUi';
import { validateEthPrefix, validateEthSuffix, estimateEthDifficulty } from '@/lib/eth-validation';
import { hasBlockingLookalikeErrors } from '@/lib/lookalike';
import type { EthMode, GeneratedEthResult } from '@/types/eth';
import { Link } from '@/i18n/navigation';
import { RichParagraph } from '@/lib/rich-text';

export function EvmContent() {
  const tCommon = useTranslations('common');
  const tSteps = useTranslations('forge.steps');
  const tLinks = useTranslations('forge.links');
  const tSide = useTranslations('forge.sideCaptions');
  const tEth = useTranslations('forge.eth');

  const { state, start, stop, reset, updateConfig, maxThreads } = useEthGenerator();
  const { soundEnabled, toggleSound, playSuccessSound } = useSound();
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const prevResultRef = useRef<GeneratedEthResult | null>(null);

  const { status, config, stats, result } = state;
  const { prefix, suffix, threads, mode, create2Salt, create2InitCodeHash, create2DeployerKey } =
    config;

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
    const urlHash = searchParams.get('initCodeHash');
    const urlSalt = searchParams.get('salt');
    const patch: Parameters<typeof updateConfig>[0] = {};
    if (urlPrefix) patch.prefix = urlPrefix.replace(/^0x/i, '');
    if (urlSuffix) patch.suffix = urlSuffix.replace(/^0x/i, '');
    if (
      urlMode === 'wallet' ||
      urlMode === 'contract' ||
      urlMode === 'create2-salt' ||
      urlMode === 'create2-deployer'
    ) {
      patch.mode = urlMode;
    }
    if (urlHash) patch.create2InitCodeHash = urlHash.replace(/^0x/i, '').toLowerCase();
    if (urlSalt) patch.create2Salt = urlSalt.replace(/^0x/i, '').toLowerCase();
    if (Object.keys(patch).length) updateConfig(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const expectedDifficulty = estimateEthDifficulty(prefix, suffix);

  const isHex32 = (v?: string) => /^[0-9a-fA-F]{64}$/.test((v || '').replace(/^0x/i, ''));

  const generateShareLink = useCallback(() => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (prefix) params.set('prefix', prefix);
    if (suffix) params.set('suffix', suffix);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/evm?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    }).catch(() => {});
  }, [mode, prefix, suffix]);

  const prefixValid = validateEthPrefix(prefix).valid;
  const suffixValid = validateEthSuffix(suffix).valid;
  const hasPattern = prefix.length > 0 || suffix.length > 0;
  const create2Ok =
    mode === 'wallet' || mode === 'contract'
      ? true
      : mode === 'create2-salt'
        ? isHex32(create2InitCodeHash) && isHex32(create2DeployerKey)
        : isHex32(create2InitCodeHash) && isHex32(create2Salt);
  const patternBlocked = hasBlockingLookalikeErrors('evm', prefix, suffix);
  const canStart = prefixValid && suffixValid && hasPattern && create2Ok && !patternBlocked;

  const handleStart = useCallback(() => {
    if (!canStart) return;
    requestForgeNotifyPermission();
    start(config);
  }, [canStart, config, start]);

  const handleModeChange = useCallback(
    (next: EthMode) => {
      if (next === mode) return;
      if (status === 'running') stop();
      updateConfig({ mode: next });
    },
    [mode, status, stop, updateConfig]
  );

  const handleForgeAnother = useCallback(() => {
    reset();
  }, [reset]);

  const handleContinueSearch = useCallback(() => {
    reset();
    requestForgeNotifyPermission();
    start(config);
  }, [reset, start, config]);

  return (
    <div className="min-h-screen flex flex-col">
      <EvmHeader />

      <main id="forge" className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16 scroll-mt-24">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={tSide('evm')}>
          <FadeIn className="space-y-8 sm:space-y-12">
            <div>
              <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{tSteps('mode')}</p>
              <EthModeToggle
                mode={mode}
                onChange={handleModeChange}
                disabled={status === 'running'}
              />
            </div>

            {result ? (
              <EthResultDisplay
                result={result}
                onReset={handleForgeAnother}
                onContinueSearch={handleContinueSearch}
              />
            ) : (
              <>
                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{tSteps('pattern')}</p>
                  <EthPatternInput
                    prefix={prefix}
                    suffix={suffix}
                    onPrefixChange={(value) => updateConfig({ prefix: value })}
                    onSuffixChange={(value) => updateConfig({ suffix: value })}
                    disabled={status === 'running'}
                  />
                </div>

                {(mode === 'create2-salt' || mode === 'create2-deployer') && (
                  <div className="border-y border-ink/15 divide-y divide-ink/15">
                    <p className="text-micro uppercase tracking-[0.2em] text-muted py-4">
                      {tEth('create2Params')}
                    </p>
                    <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 items-start">
                      <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-2">
                        {tEth('initHash')}
                      </span>
                      <input
                        type="text"
                        value={create2InitCodeHash || ''}
                        onChange={(e) => {
                          updateConfig({
                            create2InitCodeHash: e.target.value.replace(/^0x/i, '').toLowerCase(),
                          });
                        }}
                        placeholder={tEth('initHashPh')}
                        spellCheck={false}
                        disabled={status === 'running'}
                        className="w-full bg-transparent border-0 border-b border-ink/25 font-mono text-sm py-2 focus:outline-none focus:border-accent"
                      />
                    </label>
                    {mode === 'create2-deployer' && (
                      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 items-start">
                        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-2">
                          {tEth('salt')}
                        </span>
                        <input
                          type="text"
                          value={create2Salt || ''}
                          onChange={(e) => {
                            updateConfig({
                              create2Salt: e.target.value.replace(/^0x/i, '').toLowerCase(),
                            });
                          }}
                          placeholder={tEth('saltPh')}
                          spellCheck={false}
                          disabled={status === 'running'}
                          className="w-full bg-transparent border-0 border-b border-ink/25 font-mono text-sm py-2 focus:outline-none focus:border-accent"
                        />
                      </label>
                    )}
                    {mode === 'create2-salt' && (
                      <label className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-6 py-4 items-start">
                        <span className="text-micro uppercase tracking-[0.18em] text-muted sm:pt-2">
                          {tEth('deployerKey')}
                        </span>
                        <input
                          type="text"
                          value={create2DeployerKey || ''}
                          onChange={(e) => {
                            updateConfig({
                              create2DeployerKey: e.target.value.replace(/^0x/i, '').toLowerCase(),
                            });
                          }}
                          placeholder={tEth('deployerKeyPh')}
                          spellCheck={false}
                          disabled={status === 'running'}
                          className="w-full bg-transparent border-0 border-b border-ink/25 font-mono text-sm py-2 focus:outline-none focus:border-accent"
                        />
                      </label>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{tSteps('estimate')}</p>
                  <EthDifficultyDisplay
                    prefix={prefix}
                    suffix={suffix}
                    currentRate={stats.attemptsPerSecond}
                  />
                </div>

                <ForgePatternHints chain="evm" prefix={prefix} suffix={suffix} />

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

                <RichParagraph
                  text={tEth('footnote')}
                  className="text-micro text-muted leading-relaxed max-w-xl normal-case tracking-normal"
                  linkClassName="underline underline-offset-2 decoration-ink/30 hover:decoration-ink"
                />

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
