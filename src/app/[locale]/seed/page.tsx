'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import {
  Footer,
  FadeIn,
  PageIntro,
  ContentWithSide,
  DocSection,
  DocsToc,
  GeneratorControls,
  StatsDisplay,
  MultiPatternField,
  mergePatternTargets,
  patternAlternatives,
} from '@/components';
import { RichParagraph } from '@/lib/rich-text';
import { useSeedGenerator } from '@/hooks/useSeedGenerator';
import { isValidMnemonic } from '@/lib/seed-generator';
import {
  INDEX_MARKER,
  SEED_PATH_STYLES,
  renderPath,
  pathStyleById,
} from '@/workers/seed-derivation';
import { tryChecksumAddress } from '@/lib/eip55';

export default function SeedPage() {
  const t = useTranslations('tools.seed');
  const tCommon = useTranslations('common');

  const { state, start, stop, reset, updateConfig, maxThreads } = useSeedGenerator();
  const { status, config, stats, result, error } = state;

  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const toc = useMemo(
    () => [
      { id: 'mnemonic', label: t('toc.mnemonic'), n: '01' },
      { id: 'pattern', label: t('toc.pattern'), n: '02' },
      { id: 'run', label: t('toc.run'), n: '03' },
    ],
    [t]
  );

  const style = pathStyleById(config.styleId) ?? SEED_PATH_STYLES[0];
  const mnemonicWords = config.mnemonic.trim() ? config.mnemonic.trim().split(/\s+/) : [];
  const mnemonicValid = mnemonicWords.length > 0 && isValidMnemonic(config.mnemonic);
  const hasPattern =
    config.prefix.length > 0 ||
    config.suffix.length > 0 ||
    (config.patterns?.some((p) => p.prefix || p.suffix) ?? false);
  const canStart = mnemonicValid && hasPattern && status !== 'running';

  const copy = useCallback((value: string, id: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(id);
        setTimeout(() => { setCopied(null); }, 2000);
      })
      .catch(() => {});
  }, []);

  const newMnemonic = useCallback(
    (strength: 128 | 256) => {
      reset();
      setRevealed(true);
      updateConfig({ mnemonic: generateMnemonic(wordlist, strength) });
    },
    [reset, updateConfig]
  );

  const alphabetHint =
    style.chain === 'evm' ? t('alphabetEvm') : t('alphabetSol');

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-create2-wide.webp"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-temple.webp" caption={t('caption')}>
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection
                id="mnemonic"
                n={t('sectionMnemonicN')}
                title={t('sectionMnemonicTitle')}
                glyph="key"
              >
                <RichParagraph text={t('mnemonicIntro')} className="text-sm" />

                <div className="flex flex-wrap gap-x-6 gap-y-3 text-micro uppercase tracking-[0.14em]">
                  <button
                    type="button"
                    onClick={() => { newMnemonic(128); }}
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    {t('generate12')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { newMnemonic(256); }}
                    className="text-muted hover:text-ink"
                  >
                    {t('generate24')}
                  </button>
                </div>

                <label className="block">
                  <span className="text-micro uppercase tracking-[0.16em] text-muted">
                    {t('mnemonicLabel')}
                  </span>
                  <textarea
                    value={config.mnemonic}
                    onChange={(e) => { updateConfig({ mnemonic: e.target.value }); }}
                    onFocus={() => { setRevealed(true); }}
                    rows={3}
                    spellCheck={false}
                    autoComplete="off"
                    disabled={status === 'running'}
                    className={`mt-2 w-full border border-ink/20 bg-surface px-3 py-3 font-mono text-ink text-sm leading-relaxed focus:outline-none focus:border-accent disabled:opacity-60 ${
                      revealed ? '' : 'blur-sm'
                    }`}
                    placeholder={t('mnemonicPh')}
                  />
                </label>

                {mnemonicWords.length > 0 && (
                  <p className={`text-sm ${mnemonicValid ? 'text-muted' : 'text-accent'}`}>
                    {mnemonicValid
                      ? t('mnemonicValid', { words: mnemonicWords.length })
                      : t('mnemonicInvalid')}
                  </p>
                )}

                <label className="block">
                  <span className="text-micro uppercase tracking-[0.16em] text-muted">
                    {t('passphraseLabel')}
                  </span>
                  <input
                    value={config.passphrase}
                    onChange={(e) => { updateConfig({ passphrase: e.target.value }); }}
                    spellCheck={false}
                    autoComplete="off"
                    disabled={status === 'running'}
                    className="mt-2 w-full border border-ink/20 bg-surface px-3 py-2.5 font-mono text-ink text-sm focus:outline-none focus:border-accent disabled:opacity-60"
                    placeholder={t('passphrasePh')}
                  />
                </label>

                <p className="text-micro text-muted leading-relaxed">{t('mnemonicWarning')}</p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="pattern"
                n={t('sectionPatternN')}
                title={t('sectionPatternTitle')}
                glyph="modes"
              >
                {/* The marker is the literal {i} shown in the path templates below. */}
                <RichParagraph text={t('pathIntro', { i: INDEX_MARKER })} className="text-sm" />

                <div className="grid sm:grid-cols-2 gap-2">
                  {SEED_PATH_STYLES.map((option) => {
                    const active = option.id === config.styleId;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => { updateConfig({ styleId: option.id }); }}
                        disabled={status === 'running'}
                        aria-pressed={active}
                        className={`border px-3.5 py-3 text-left transition-colors disabled:opacity-50 ${
                          active
                            ? 'border-ink bg-ink/[0.04]'
                            : 'border-ink/20 hover:border-ink/40'
                        }`}
                      >
                        <span className="block font-mono text-sm text-ink">{option.template}</span>
                        <span className="block text-micro text-muted mt-1">
                          {option.wallets.join(' · ')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {tCommon('prefix')}
                    </span>
                    <input
                      value={config.prefix}
                      onChange={(e) => {
                        const nextPrefix = e.target.value;
                        updateConfig({
                          prefix: nextPrefix,
                          patterns: mergePatternTargets(
                            { prefix: nextPrefix, suffix: config.suffix },
                            patternAlternatives(config.patterns)
                          ),
                        });
                      }}
                      spellCheck={false}
                      disabled={status === 'running'}
                      className="mt-2 w-full border border-ink/20 bg-surface px-3 py-2.5 font-mono text-ink text-sm focus:outline-none focus:border-accent disabled:opacity-60"
                      placeholder={style.chain === 'evm' ? 'dead' : 'Ace'}
                    />
                  </label>
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {tCommon('suffix')}
                    </span>
                    <input
                      value={config.suffix}
                      onChange={(e) => {
                        const nextSuffix = e.target.value;
                        updateConfig({
                          suffix: nextSuffix,
                          patterns: mergePatternTargets(
                            { prefix: config.prefix, suffix: nextSuffix },
                            patternAlternatives(config.patterns)
                          ),
                        });
                      }}
                      spellCheck={false}
                      disabled={status === 'running'}
                      className="mt-2 w-full border border-ink/20 bg-surface px-3 py-2.5 font-mono text-ink text-sm focus:outline-none focus:border-accent disabled:opacity-60"
                      placeholder={style.chain === 'evm' ? 'beef' : 'sol'}
                    />
                  </label>
                </div>

                <MultiPatternField
                  alternatives={patternAlternatives(config.patterns)}
                  disabled={status === 'running'}
                  show0x={style.chain === 'evm'}
                  sanitize={
                    style.chain === 'evm'
                      ? (v) => v.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '').slice(0, 8)
                      : undefined
                  }
                  onChange={(alts) => {
                    updateConfig({
                      patterns: mergePatternTargets(
                        { prefix: config.prefix, suffix: config.suffix },
                        alts
                      ),
                    });
                  }}
                />

                <p className="text-micro text-muted">{alphabetHint}</p>

                <label className="block">
                  <span className="text-micro uppercase tracking-[0.16em] text-muted">
                    {t('startIndexLabel')}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={config.startIndex}
                    onChange={(e) => {
                      updateConfig({ startIndex: Math.max(0, Number(e.target.value) || 0) });
                    }}
                    disabled={status === 'running'}
                    className="mt-2 w-full sm:w-48 border border-ink/20 bg-surface px-3 py-2.5 font-mono text-ink text-sm focus:outline-none focus:border-accent disabled:opacity-60"
                  />
                </label>
                <p className="text-micro text-muted">
                  {t('startIndexHint', { path: renderPath(style, config.startIndex) })}
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="run" n={t('sectionRunN')} title={t('sectionRunTitle')} glyph="forge">
                {result ? (
                  <div className="space-y-6">
                    <div className="border-y border-ink/15 py-5 space-y-4">
                      <div>
                        <p className="text-micro uppercase tracking-[0.16em] text-muted mb-1">
                          {tCommon('publicAddress')}
                        </p>
                        <p className="font-mono text-sm sm:text-base text-ink break-all">
                          {style.chain === 'evm'
                            ? tryChecksumAddress(result.address) || result.address
                            : result.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-micro uppercase tracking-[0.16em] text-muted mb-1">
                          {t('derivationPath')}
                        </p>
                        <p className="font-mono text-sm text-ink">{result.path}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-micro uppercase tracking-[0.14em]">
                        <button
                          type="button"
                          onClick={() => { copy(result.path, 'path'); }}
                          className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                        >
                          {copied === 'path' ? tCommon('copied') : t('copyPath')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const addr =
                              style.chain === 'evm'
                                ? tryChecksumAddress(result.address) || result.address
                                : result.address;
                            copy(addr, 'address');
                          }}
                          className="text-muted hover:text-ink"
                        >
                          {copied === 'address' ? tCommon('copied') : t('copyAddress')}
                        </button>
                        <button
                          type="button"
                          onClick={() => { reset(); }}
                          className="text-muted hover:text-ink"
                        >
                          {tCommon('forgeAnother')}
                        </button>
                      </div>
                    </div>

                    <div className="border border-ink/20 p-4 space-y-2">
                      <p className="text-micro uppercase tracking-[0.18em] text-ink">
                        {t('recoveryTitle')}
                      </p>
                      <RichParagraph
                        text={t('recoveryBody', { path: result.path })}
                        className="text-sm text-muted leading-relaxed"
                      />
                    </div>

                    <details className="border-t border-ink/15 pt-4">
                      <summary className="cursor-pointer text-micro uppercase tracking-[0.16em] text-muted hover:text-ink">
                        {t('showPrivateKey')}
                      </summary>
                      <p className="mt-3 font-mono text-xs text-ink break-all select-all">
                        {result.privateKey}
                      </p>
                      <p className="mt-2 text-micro text-muted">{t('privateKeyNote')}</p>
                    </details>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <StatsDisplay stats={stats} status={status === 'running' ? 'running' : 'idle'} />

                    <GeneratorControls
                      status={status === 'running' ? 'running' : 'idle'}
                      threads={config.threads}
                      maxThreads={maxThreads}
                      onStart={() => { start(config); }}
                      onStop={stop}
                      onThreadsChange={(threads) => { updateConfig({ threads }); }}
                      disabled={!canStart}
                    />

                    {status === 'exhausted' && (
                      <p className="text-sm text-accent">{t('exhausted')}</p>
                    )}
                    {error && <p className="text-sm text-accent">{error}</p>}
                    {!mnemonicValid && (
                      <p className="text-sm text-muted">{t('needMnemonic')}</p>
                    )}
                  </div>
                )}
              </DocSection>
            </FadeIn>
          </div>
        </ContentWithSide>
      </main>

      <Footer />
    </div>
  );
}
