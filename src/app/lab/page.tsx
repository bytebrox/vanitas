'use client';

import { useMemo, useState } from 'react';
import {
  Footer,
  FadeIn,
  PageIntro,
  ContentWithSide,
  DocsToc,
  DocSection,
} from '@/components';
import { LabRarityVisual } from '@/components/LabRarityVisual';
import {
  LAB_CHAINS,
  analyzeLabPattern,
  type LabChain,
  type LabAnalysis,
} from '@/lib/pattern-lab';

const toc = [
  { id: 'composer', label: 'Composer', n: '01' },
  { id: 'matrix', label: 'Matrix', n: '02' },
  { id: 'queue', label: 'Queue', n: '03' },
];

interface QueueItem {
  id: string;
  analysis: LabAnalysis;
}

export default function LabPage() {
  const [chain, setChain] = useState<LabChain>('sol');
  const [prefix, setPrefix] = useState('Ace');
  const [suffix, setSuffix] = useState('');
  const [mode, setMode] = useState('wallet');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const analysis = useMemo(
    () => analyzeLabPattern({ chain, prefix, suffix, mode, caseSensitive }),
    [chain, prefix, suffix, mode, caseSensitive]
  );

  const chainMeta = LAB_CHAINS.find((c) => c.id === chain)!;

  const modeOptions = useMemo(() => {
    if (chain === 'btc') {
      return [
        { id: 'legacy', label: 'Legacy' },
        { id: 'segwit', label: 'SegWit' },
        { id: 'taproot', label: 'Taproot' },
      ];
    }
    if (chain === 'ton') {
      return [
        { id: 'non-bounceable', label: 'UQ' },
        { id: 'bounceable', label: 'EQ' },
      ];
    }
    if (chain === 'sol') {
      return [
        { id: 'wallet', label: 'Wallet' },
        { id: 'mint', label: 'Mint' },
      ];
    }
    if (chain === 'evm' || chain === 'tron') {
      return [
        { id: 'wallet', label: 'Wallet' },
        { id: 'contract', label: 'CREATE' },
      ];
    }
    return [{ id: 'wallet', label: 'Wallet' }];
  }, [chain]);

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
      warning: 'Patterns only — no private keys.',
      jobs: queue.map((j) => ({
        chain: j.analysis.chain,
        mode: j.analysis.mode,
        prefix: j.analysis.prefix,
        suffix: j.analysis.suffix,
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

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-how-wide.webp"
        eyebrow="Tools"
        title="Pattern lab"
        description="See how rare a pattern is before you mine — then queue jobs and open the forge."
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-figure.webp" caption="Fig. — Lab">
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection id="composer" n="01 — Composer" title="Pattern">
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
                      }}
                      className={`text-micro uppercase tracking-[0.14em] px-2.5 py-1.5 border transition-colors ${
                        chain === c.id
                          ? 'border-ink text-ink bg-ink/[0.04]'
                          : 'border-ink/15 text-muted hover:text-ink hover:border-ink/35'
                      }`}
                    >
                      {c.label}
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
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">Prefix</span>
                    <input
                      className="input mt-1"
                      value={prefix}
                      onChange={(e) => {
                        setPrefix(e.target.value);
                      }}
                      placeholder="Ace"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </label>
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">Suffix</span>
                    <input
                      className="input mt-1"
                      value={suffix}
                      onChange={(e) => {
                        setSuffix(e.target.value);
                      }}
                      placeholder="optional"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </label>
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
                      Case sensitive
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
                    Add to queue
                  </button>
                  <a
                    href={analysis.forgeHref}
                    className={`pb-0.5 border-b ${
                      analysis.valid
                        ? 'text-muted border-transparent hover:text-ink hover:border-ink'
                        : 'pointer-events-none opacity-40 border-transparent'
                    }`}
                  >
                    Open {chainMeta.label} forge →
                  </a>
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="matrix" n="02 — Matrix" title="Rarity">
                <LabRarityVisual analysis={analysis} />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="queue" n="03 — Queue" title="Batch">
                {queue.length === 0 ? (
                  <div className="border-y border-ink/15 py-10 text-center">
                    <p className="font-display text-xl text-ink/30 normal-case mb-2">Empty</p>
                    <p className="text-sm text-muted">Add a pattern above to compare jobs.</p>
                  </div>
                ) : (
                  <div className="border-y border-ink/15 divide-y divide-ink/10">
                    {queue.map((item, idx) => {
                      const filled = Math.round(
                        Math.min(1, Math.max(0, Math.log10(Math.max(1, item.analysis.difficulty)) / 15)) *
                          8
                      );
                      return (
                        <div
                          key={item.id}
                          className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">
                              {String(idx + 1).padStart(2, '0')} · {item.analysis.label}
                            </p>
                            <p className="font-display text-xl text-ink normal-case tracking-tight">
                              <span className="text-accent">{item.analysis.prefix || ''}</span>
                              <span className="text-ink/25">…</span>
                              <span className="text-accent">{item.analysis.suffix || ''}</span>
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
                            <a href={item.analysis.forgeHref} className="text-ink hover:text-accent">
                              Forge
                            </a>
                            <button
                              type="button"
                              className="text-muted hover:text-ink"
                              onClick={() => {
                                setQueue((q) => q.filter((x) => x.id !== item.id));
                              }}
                            >
                              Remove
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
                      Export JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQueue([]);
                      }}
                      className="text-muted hover:text-ink"
                    >
                      Clear
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
