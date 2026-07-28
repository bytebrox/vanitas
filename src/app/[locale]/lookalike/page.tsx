'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Footer,
  FadeIn,
  PageIntro,
  ContentWithSide,
  DocSection,
  DocsToc,
} from '@/components';
import { RichParagraph } from '@/lib/rich-text';
import {
  LOOKALIKE_CHAINS,
  analyzeLookalike,
  markPattern,
  type LookalikeChain,
  type LookalikeFinding,
} from '@/lib/lookalike';

export default function LookalikePage() {
  const t = useTranslations('tools.lookalike');
  const tc = useTranslations('common');
  const [chain, setChain] = useState<LookalikeChain>('sol');
  const [pattern, setPattern] = useState('Ace0');

  const findings = useMemo(() => analyzeLookalike(pattern, chain), [pattern, chain]);
  const hotPositions = useMemo(
    () => [...new Set(findings.flatMap((f) => f.positions ?? []))],
    [findings]
  );
  const marked = useMemo(() => markPattern(pattern, hotPositions), [pattern, hotPositions]);

  const toc = [
    { id: 'check', label: t('tocCheck'), n: '01' },
    { id: 'findings', label: t('tocFindings'), n: '02' },
    { id: 'alphabets', label: t('tocAlphabets'), n: '03' },
  ];

  const severityClass = (s: 'error' | 'warn' | 'info') => {
    if (s === 'error') return 'text-accent border-accent/40';
    if (s === 'warn') return 'text-ink border-ink/25';
    return 'text-muted border-ink/15';
  };

  const formatFinding = (f: LookalikeFinding) => {
    const noteKey = f.params?.noteKey;
    const note =
      typeof noteKey === 'string' && t.has(`pairNotes.${noteKey}`)
        ? t(`pairNotes.${noteKey}` as 'pairNotes.zeroO')
        : '';
    const chainId = (f.params?.chain as string | undefined) ?? chain;
    const chainLabel = t.has(`chains.${chainId}.label`)
      ? t(`chains.${chainId}.label` as 'chains.sol.label')
      : chainId;
    const chainNotes = t.has(`chains.${chainId}.notes`)
      ? t(`chains.${chainId}.notes` as 'chains.sol.notes')
      : '';

    const values = {
      ...f.params,
      note,
      label: chainLabel,
      notes: chainNotes,
    };

    const title = t.has(`findings.${f.code}.title`)
      ? t(`findings.${f.code}.title` as 'findings.empty.title', values)
      : f.code;
    const detail = t.has(`findings.${f.code}.detail`)
      ? t(`findings.${f.code}.detail` as 'findings.empty.detail', values)
      : '';

    return { title, detail };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-lookalike-wide.webp"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-figure.webp" caption={t('caption')}>
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection
                id="check"
                n={t('sectionCheckN')}
                title={t('sectionCheckTitle')}
                glyph="key"
              >
                <div className="flex flex-wrap gap-2">
                  {LOOKALIKE_CHAINS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setChain(c.id)}
                      className={`px-3 py-1.5 text-micro uppercase tracking-[0.12em] border transition-colors ${
                        chain === c.id
                          ? 'border-ink bg-ink text-paper'
                          : 'border-ink/25 text-muted hover:border-ink hover:text-ink'
                      }`}
                    >
                      {t(`chains.${c.id}.label`)}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted">{t(`chains.${chain}.notes`)}</p>
                <label className="block">
                  <span className="text-micro uppercase tracking-[0.16em] text-muted">
                    {t.has('patternLabel') ? t('patternLabel') : tc('pattern')}
                  </span>
                  <input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    spellCheck={false}
                    className="mt-2 w-full border border-ink/20 bg-surface px-3 py-3 font-mono text-ink text-sm focus:outline-none focus:border-accent"
                    placeholder={t('patternPh')}
                  />
                </label>
                {marked.length > 0 && (
                  <p className="font-mono text-lg sm:text-2xl tracking-wide break-all">
                    {pattern.toLowerCase().startsWith('0x') ? (
                      <span className="text-muted">0x</span>
                    ) : null}
                    {marked.map((m, i) => (
                      <span
                        key={`${m.ch}-${i}`}
                        className={m.hot ? 'text-accent underline decoration-accent/50' : 'text-ink'}
                      >
                        {m.ch}
                      </span>
                    ))}
                  </p>
                )}
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="findings"
                n={t('sectionFindingsN')}
                title={t('sectionFindingsTitle')}
                glyph="eye"
              >
                <ul className="space-y-0 border-y border-ink/15 divide-y divide-ink/10">
                  {findings.map((f, i) => {
                    const { title, detail } = formatFinding(f);
                    return (
                      <li
                        key={`${f.code}-${i}`}
                        className={`py-4 ${severityClass(f.severity)}`}
                      >
                        <p className="text-micro uppercase tracking-[0.16em] mb-1">
                          {t(`severity.${f.severity}`)}
                        </p>
                        <p className="font-display text-lg font-semibold text-ink normal-case tracking-[0.02em]">
                          {title}
                        </p>
                        {detail ? (
                          <p className="text-sm text-muted mt-1 leading-relaxed">{detail}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <RichParagraph text={t('readyGrind')} className="text-sm mt-4" />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="alphabets"
                n={t('sectionAlphabetsN')}
                title={t('sectionAlphabetsTitle')}
                glyph="scroll"
              >
                <div className="border-y border-ink/15 divide-y divide-ink/10">
                  {LOOKALIKE_CHAINS.map((c) => (
                    <div key={c.id} className="py-4">
                      <p className="text-micro uppercase tracking-[0.16em] text-muted mb-1">
                        {t(`chains.${c.id}.label`)}
                      </p>
                      <p className="font-mono text-xs text-ink break-all leading-relaxed">
                        {c.alphabet}
                      </p>
                      <p className="text-sm text-muted mt-1">{t(`chains.${c.id}.notes`)}</p>
                    </div>
                  ))}
                </div>
              </DocSection>
            </FadeIn>
          </div>
        </ContentWithSide>
      </main>

      <Footer />
    </div>
  );
}
