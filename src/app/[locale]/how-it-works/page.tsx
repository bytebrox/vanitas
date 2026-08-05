'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Footer,
  FadeIn,
  PageIntro,
  ContentWithSide,
  DocsToc,
  DocSection,
  DocSubheading,
  DocLedgerRow,
  DocSearchLoop,
  DocDifficultyScale,
  DocWorkerPool,
  DocProofSplit,
} from '@/components';
import type { DocGlyphId } from '@/components';
import { Link } from '@/i18n/navigation';
import { RichText, RichParagraph } from '@/lib/rich-text';

const TOC_IDS = [
  'overview',
  'pipeline',
  'patterns',
  'chains',
  'modes',
  'workers',
  'proof',
  'seed',
  'cli',
  'verify',
] as const;

const CHAIN_IDS = [
  'sol',
  'evm',
  'btc',
  'tron',
  'aptos',
  'sui',
  'ton',
  'cardano',
  'xrp',
] as const;

const SECTION_GLYPHS: Record<(typeof TOC_IDS)[number], DocGlyphId> = {
  overview: 'key',
  pipeline: 'loop',
  patterns: 'hourglass',
  chains: 'colonnade',
  modes: 'modes',
  workers: 'forge',
  proof: 'seal',
  seed: 'key',
  cli: 'stele',
  verify: 'eye',
};

const OVERVIEW_LEDGER_KEYS = ['where', 'forges', 'output'] as const;
const PATTERN_LEDGER_KEYS = ['base58', 'hex', 'bech32', 'ton'] as const;
const WORKER_LEDGER_KEYS = ['parallelism', 'solSpeed', 'libraries'] as const;

export default function HowItWorksPage() {
  const t = useTranslations('docs.howItWorks');
  const tModes = useTranslations('forge.modes');

  const toc = useMemo(
    () =>
      TOC_IDS.map((id, i) => ({
        id,
        label: t(`toc.${id}`),
        n: String(i + 1).padStart(2, '0'),
      })),
    [t],
  );

  const pipelineSteps = t.raw('sections.pipeline.steps') as string[];
  const patternTraps = t.raw('sections.patterns.traps') as string[];
  const verifySteps = t.raw('sections.verify.steps') as string[];

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-how-wide.webp"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-figure.webp" caption={t('sideCaption')}>
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection
                id="overview"
                n={t('sections.overview.n')}
                title={t('sections.overview.title')}
                glyph={SECTION_GLYPHS.overview}
                glyphLabel={t('sections.overview.glyph')}
              >
                <RichParagraph text={t('overview.p1')} />
                <RichParagraph text={t('overview.p2')} />
                <div className="border-y border-ink/15 divide-y divide-ink/10">
                  {OVERVIEW_LEDGER_KEYS.map((key) => (
                    <DocLedgerRow
                      key={key}
                      label={t(`sections.overview.ledger.${key}.label`)}
                      value={t(`sections.overview.ledger.${key}.value`)}
                      note={t(`sections.overview.ledger.${key}.note`)}
                    />
                  ))}
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="pipeline"
                n={t('sections.pipeline.n')}
                title={t('sections.pipeline.title')}
                glyph={SECTION_GLYPHS.pipeline}
                glyphLabel={t('sections.pipeline.glyph')}
              >
                <RichParagraph text={t('pipeline.intro')} />
                <DocSearchLoop />
                <ol className="list-decimal list-inside space-y-2 text-sm sm:text-body">
                  {pipelineSteps.map((step, i) => (
                    <li key={i}>
                      <RichText text={step} codeClassName="font-mono text-ink text-sm" />
                    </li>
                  ))}
                </ol>
                <RichParagraph text={t('sections.pipeline.workersNote')} />
                <DocSubheading>{t('sections.pipeline.whySecureTitle')}</DocSubheading>
                <RichParagraph text={t('pipeline.whySecure')} />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="patterns"
                n={t('sections.patterns.n')}
                title={t('sections.patterns.title')}
                glyph={SECTION_GLYPHS.patterns}
                glyphLabel={t('sections.patterns.glyph')}
              >
                <RichParagraph text={t('sections.patterns.intro')} />
                <DocDifficultyScale />
                <div className="border-y border-ink/15">
                  {PATTERN_LEDGER_KEYS.map((key) => (
                    <DocLedgerRow
                      key={key}
                      label={t(`sections.patterns.ledger.${key}.label`)}
                      value={t(`sections.patterns.ledger.${key}.value`)}
                      note={t(`sections.patterns.ledger.${key}.note`)}
                    />
                  ))}
                </div>
                <DocSubheading>{t('sections.patterns.trapsTitle')}</DocSubheading>
                <ul className="space-y-2 text-sm sm:text-body">
                  {patternTraps.map((trap, i) => (
                    <li key={i}>
                      <RichText text={trap} />
                    </li>
                  ))}
                </ul>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="chains"
                n={t('sections.chains.n')}
                title={t('sections.chains.title')}
                glyph={SECTION_GLYPHS.chains}
                glyphLabel={t('sections.chains.glyph')}
              >
                <RichParagraph text={t('sections.chains.intro')} />
                {CHAIN_IDS.map((id) => (
                  <div key={id}>
                    <DocSubheading>
                      <RichText
                        text={t(`sections.chains.links.${id}`)}
                        linkClassName="hover:text-accent"
                      />
                    </DocSubheading>
                    <RichParagraph
                      text={t(`sections.chains.${id}`)}
                      codeClassName="font-mono text-sm text-ink"
                    />
                  </div>
                ))}
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="modes"
                n={t('sections.modes.n')}
                title={t('sections.modes.title')}
                glyph={SECTION_GLYPHS.modes}
                glyphLabel={t('sections.modes.glyph')}
              >
                <DocSubheading>{tModes('mint')}</DocSubheading>
                <RichParagraph text={t('sections.modes.solMint')} />

                <DocSubheading>{tModes('create')}</DocSubheading>
                <RichParagraph
                  text={t('sections.modes.create')}
                  codeClassName="font-mono text-sm text-ink"
                />

                <DocSubheading>{tModes('create2')}</DocSubheading>
                <RichParagraph
                  text={t('sections.modes.create2Intro')}
                  codeClassName="font-mono text-sm text-ink"
                />
                <ul className="space-y-2 text-sm sm:text-body">
                  <li>
                    <RichText text={t('sections.modes.create2Salt')} />
                  </li>
                  <li>
                    <RichText text={t('sections.modes.create2Deployer')} />
                  </li>
                </ul>
                <RichParagraph
                  text={t('sections.modes.create2Hash')}
                  codeClassName="font-mono text-sm text-ink"
                />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="workers"
                n={t('sections.workers.n')}
                title={t('sections.workers.title')}
                glyph={SECTION_GLYPHS.workers}
                glyphLabel={t('sections.workers.glyph')}
              >
                <RichParagraph
                  text={t('sections.workers.intro')}
                  codeClassName="font-mono text-sm text-ink"
                  linkClassName="text-accent hover:text-ink"
                />
                <DocWorkerPool />
                <div className="border-y border-ink/15">
                  {WORKER_LEDGER_KEYS.map((key) => (
                    <DocLedgerRow
                      key={key}
                      label={t(`sections.workers.ledger.${key}.label`)}
                      value={t(`sections.workers.ledger.${key}.value`)}
                      note={t(`sections.workers.ledger.${key}.note`)}
                    />
                  ))}
                </div>
                <RichParagraph text={t('sections.workers.postFind')} />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="proof"
                n={t('sections.proof.n')}
                title={t('sections.proof.title')}
                glyph={SECTION_GLYPHS.proof}
                glyphLabel={t('sections.proof.glyph')}
              >
                <RichParagraph
                  text={t('sections.proof.p1')}
                  linkClassName="text-accent hover:text-ink"
                />
                <DocProofSplit />
                <RichParagraph
                  text={t('sections.proof.session')}
                  codeClassName="font-mono text-sm text-ink"
                />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="seed"
                n={t('sections.seed.n')}
                title={t('sections.seed.title')}
                glyph={SECTION_GLYPHS.seed}
                glyphLabel={t('sections.seed.glyph')}
              >
                <RichParagraph
                  text={t('sections.seed.p1')}
                  linkClassName="text-accent hover:text-ink"
                />
                <RichParagraph
                  text={t('sections.seed.p2')}
                  linkClassName="text-accent hover:text-ink"
                  codeClassName="font-mono text-sm text-ink"
                />
                <RichParagraph text={t('sections.seed.note')} />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="cli"
                n={t('sections.cli.n')}
                title={t('sections.cli.title')}
                glyph={SECTION_GLYPHS.cli}
                glyphLabel={t('sections.cli.glyph')}
              >
                <RichParagraph
                  text={t('sections.cli.p1')}
                  codeClassName="font-mono text-ink"
                  linkClassName="text-accent hover:text-ink"
                />
                <p className="font-mono text-sm text-ink/80">{t('sections.cli.example')}</p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="verify"
                n={t('sections.verify.n')}
                title={t('sections.verify.title')}
                glyph={SECTION_GLYPHS.verify}
                glyphLabel={t('sections.verify.glyph')}
              >
                <ol className="list-decimal list-inside space-y-2">
                  {verifySteps.map((step, i) => (
                    <li key={i}>
                      <RichText
                        text={step}
                        codeClassName="font-mono text-sm text-ink"
                        linkClassName="text-accent hover:text-ink"
                      />
                    </li>
                  ))}
                </ol>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <section className="border-t border-ink/15 pt-10 pb-4">
                <p className="text-micro uppercase tracking-[0.2em] text-accent mb-3">
                  {t('reminder.label')}
                </p>
                <p className="text-muted leading-relaxed mb-6">{t('reminder.body')}</p>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <Link
                    href="/security"
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    {t('footer.security')}
                  </Link>
                  <Link href="/faq" className="text-muted hover:text-ink">
                    {t('footer.faq')}
                  </Link>
                  <Link href="/audit" className="text-muted hover:text-ink">
                    {t('footer.audit')}
                  </Link>
                </div>
              </section>
            </FadeIn>
          </div>
        </ContentWithSide>
      </main>

      <Footer />
    </div>
  );
}
