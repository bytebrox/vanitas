'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Footer,
  FadeIn,
  PageIntro,
  ContentWithSide,
  DocsToc,
  DocSection,
  MultiPatternField,
  mergePatternTargets,
} from '@/components';
import { LabRarityVisual } from '@/components/LabRarityVisual';
import {
  LAB_CHAINS,
  analyzeLabPattern,
  type LabChain,
  type LabAnalysis,
} from '@/lib/pattern-lab';
import type { PatternTarget } from '@/lib/patterns';
import { Link } from '@/i18n/navigation';

interface QueueItem {
  id: string;
  analysis: LabAnalysis;
}

const MODE_LABEL_KEY: Record<
  string,
  'wallet' | 'mint' | 'legacy' | 'segwit' | 'taproot' | 'create' | 'create2' | 'uq' | 'eq'
> = {
  wallet: 'wallet',
  mint: 'mint',
  legacy: 'legacy',
  segwit: 'segwit',
  taproot: 'taproot',
  contract: 'create',
  'create2-salt': 'create2',
  'create2-deployer': 'create2',
  'non-bounceable': 'uq',
  bounceable: 'eq',
};

function hexSanitize(v: string): string {
  return v.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '').slice(0, 8);
}

export default function LabPage() {
  const t = useTranslations('tools.lab');
  const tCommon = useTranslations('common');
  const tModes = useTranslations('forge.modes');
  const tEthMode = useTranslations('forge.eth.mode');
  const tNav = useTranslations('nav.chainItems');

  const toc = useMemo(
    () => [
      { id: 'composer', label: t('toc.composer'), n: '01' },
      { id: 'matrix', label: t('toc.matrix'), n: '02' },
      { id: 'queue', label: t('toc.queue'), n: '03' },
    ],
    [t]
  );

  const [chain, setChain] = useState<LabChain>('sol');
  const [prefix, setPrefix] = useState('Ace');
  const [suffix, setSuffix] = useState('');
  const [alternatives, setAlternatives] = useState<PatternTarget[]>([]);
  const [mode, setMode] = useState('wallet');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const patterns = useMemo(
    () => mergePatternTargets({ prefix, suffix }, alternatives),
    [prefix, suffix, alternatives]
  );

  const analysis = useMemo(
    () => analyzeLabPattern({ chain, prefix, suffix, patterns, mode, caseSensitive }),
    [chain, prefix, suffix, patterns, mode, caseSensitive]
  );

  const chainLabel = tNav(`${chain}.label`);

  const modeOptions = useMemo(() => {
    if (chain === 'btc') {
      return [
        { id: 'legacy', label: tModes('legacy') },
        { id: 'segwit', label: tModes('segwit') },
        { id: 'taproot', label: tModes('taproot') },
      ];
    }
    if (chain === 'ton') {
      return [
        { id: 'non-bounceable', label: tModes('uq') },
        { id: 'bounceable', label: tModes('eq') },
      ];
    }
    if (chain === 'sol') {
      return [
        { id: 'wallet', label: tModes('wallet') },
        { id: 'mint', label: tModes('mint') },
      ];
    }
    if (chain === 'evm') {
      return [
        { id: 'wallet', label: tModes('wallet') },
        { id: 'contract', label: tModes('create') },
        { id: 'create2-salt', label: tEthMode('c2Salt') },
        { id: 'create2-deployer', label: tEthMode('c2Key') },
      ];
    }
    if (chain === 'tron') {
      return [
        { id: 'wallet', label: tModes('wallet') },
        { id: 'contract', label: tModes('create') },
      ];
    }
    return [{ id: 'wallet', label: tModes('wallet') }];
  }, [chain, tModes, tEthMode]);

  const addToQueue = () => {
    if (!analysis.valid) return;
    setQueue((q) => [
      ...q,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, analysis: { ...analysis } },
    ]);
  };

  const exportQueue = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      tool: 'vanitas-pattern-lab',
      warning: t('exportWarning'),
      jobs: queue.map((j) => ({
        chain: j.analysis.chain,
        mode: j.analysis.mode,
        prefix: j.analysis.prefix,
        suffix: j.analysis.suffix,
        patterns: j.analysis.patterns,
        difficulty: j.analysis.difficulty,
        rarity: j.analysis.rarityLabel,
        forgeHref: j.analysis.forgeHref,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vanitas-lab-queue.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const alertLine = analysis.errors[0] || analysis.warnings[0];
  const show0x = chain === 'evm' || chain === 'aptos' || chain === 'sui';
  const sanitize =
    chain === 'evm' || chain === 'aptos' || chain === 'sui' ? hexSanitize : undefined;

  const patternLabel = (a: LabAnalysis) => {
    if (a.patterns.length <= 1) {
      return (
        <>
          <span className="text-accent">{a.prefix || ''}</span>
          <span className="text-ink/25">…</span>
          <span className="text-accent">{a.suffix || ''}</span>
        </>
      );
    }
    return (
      <span className="text-accent">
        {a.patterns
          .map((p) => `${p.prefix || '…'}${p.suffix ? `…${p.suffix}` : ''}`)
          .join(' ∨ ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-lab-wide.webp"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-figure.webp" caption={t('caption')}>
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection id="composer" n={t('composerN')} title={t('sectionPattern')}>
                <div className="flex flex-wrap gap-2 mb-4">
                  {LAB_CHAINS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setChain(c.id);
                        setMode(
                          c.id === 'btc' ? 'segwit' : c.id === 'ton' ? 'non-bounceable' : 'wallet'
                        );
                        setAlternatives([]);
                      }}
                      className={`text-micro uppercase tracking-[0.14em] px-2.5 py-1.5 border transition-colors ${
                        chain === c.id
                          ? 'border-ink text-ink bg-ink/[0.04]'
                          : 'border-ink/15 text-muted hover:text-ink hover:border-ink/35'
                      }`}
                    >
                      {tNav(`${c.id}.label`)}
                    </button>
                  ))}
                </div>

                {modeOptions.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {modeOptions.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMode(m.id);
                        }}
                        className={`text-micro uppercase tracking-[0.14em] px-2.5 py-1.5 border transition-colors ${
                          mode === m.id
                            ? 'border-accent text-ink'
                            : 'border-ink/15 text-muted hover:text-ink'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-3">
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {tCommon('prefix')}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      {show0x && (
                        <span className="font-mono text-sm text-ink/35 select-none">0x</span>
                      )}
                      <input
                        className="input flex-1"
                        value={prefix}
                        onChange={(e) => {
                          setPrefix(sanitize ? sanitize(e.target.value) : e.target.value);
                        }}
                        placeholder={t('prefixPh')}
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {tCommon('suffix')}
                    </span>
                    <input
                      className="input mt-1"
                      value={suffix}
                      onChange={(e) => {
                        setSuffix(sanitize ? sanitize(e.target.value) : e.target.value);
                      }}
                      placeholder={t('suffixPh')}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </label>
                </div>

                <div className="mb-4">
                  <MultiPatternField
                    alternatives={alternatives}
                    onChange={setAlternatives}
                    show0x={show0x}
                    sanitize={sanitize}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
                  <span className="text-micro uppercase tracking-[0.14em] text-muted font-mono">
                    {analysis.alphabet} · {analysis.alphabetSize}
                  </span>
                  {(chain === 'sol' || chain === 'btc' || chain === 'tron' || chain === 'xrp') && (
                    <label className="inline-flex items-center gap-2 text-micro uppercase tracking-[0.14em] text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={caseSensitive}
                        onChange={(e) => {
                          setCaseSensitive(e.target.checked);
                        }}
                      />
                      {tCommon('caseSensitive')}
                    </label>
                  )}
                </div>

                {alertLine && (
                  <p
                    className={`text-sm mb-4 ${
                      analysis.errors[0] ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {alertLine}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <button
                    type="button"
                    disabled={!analysis.valid}
                    onClick={addToQueue}
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent disabled:opacity-40 disabled:border-ink/20"
                  >
                    {t('addQueue')}
                  </button>
                  <Link
                    href={analysis.forgeHref}
                    className={`pb-0.5 border-b ${
                      analysis.valid
                        ? 'text-muted border-transparent hover:text-ink hover:border-ink'
                        : 'pointer-events-none opacity-40 border-transparent'
                    }`}
                  >
                    {t('openForge', { chain: chainLabel })}
                  </Link>
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="matrix" n={t('matrixN')} title={t('sectionRarity')}>
                <LabRarityVisual analysis={analysis} />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="queue" n={t('queueN')} title={t('sectionBatch')}>
                {queue.length === 0 ? (
                  <div className="border-y border-ink/15 py-10 text-center">
                    <p className="font-display text-xl text-ink/30 normal-case mb-2">
                      {t('queueEmpty')}
                    </p>
                    <p className="text-sm text-muted">{t('queueEmptyHint')}</p>
                  </div>
                ) : (
                  <div className="border-y border-ink/15 divide-y divide-ink/10">
                    {queue.map((item, idx) => {
                      const filled = Math.round(
                        Math.min(
                          1,
                          Math.max(0, Math.log10(Math.max(1, item.analysis.difficulty)) / 15)
                        ) * 8
                      );
                      const itemMode = item.analysis.mode;
                      const modeKey = itemMode ? MODE_LABEL_KEY[itemMode] : undefined;
                      const modeLabel = modeKey ? tModes(modeKey) : itemMode ?? '';
                      return (
                        <div
                          key={item.id}
                          className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">
                              {String(idx + 1).padStart(2, '0')} · {item.analysis.label} ·{' '}
                              {modeLabel}
                            </p>
                            <p className="font-display text-xl text-ink normal-case tracking-[0.02em]">
                              {patternLabel(item.analysis)}
                            </p>
                            <div className="mt-2 flex items-end gap-0.5 h-4" aria-hidden>
                              {Array.from({ length: 8 }, (_, i) => (
                                <span
                                  key={i}
                                  className={`w-2 ${
                                    i < filled ? 'bg-accent h-full' : 'bg-ink/10 h-2 self-end'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-micro uppercase tracking-[0.14em] shrink-0">
                            <Link href={item.analysis.forgeHref} className="text-ink hover:text-accent">
                              {t('forge')}
                            </Link>
                            <button
                              type="button"
                              className="text-muted hover:text-ink"
                              onClick={() => {
                                setQueue((q) => q.filter((x) => x.id !== item.id));
                              }}
                            >
                              {t('remove')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {queue.length > 0 && (
                  <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6 text-micro uppercase tracking-[0.16em]">
                    <button
                      type="button"
                      onClick={exportQueue}
                      className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                    >
                      {t('exportJson')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQueue([]);
                      }}
                      className="text-muted hover:text-ink"
                    >
                      {t('clear')}
                    </button>
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
