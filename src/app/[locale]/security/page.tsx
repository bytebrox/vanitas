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
  DocTrustBoundary,
  DocProofSplit,
  type DocGlyphId,
} from '@/components';
import { Link } from '@/i18n/navigation';
import { RichParagraph, RichText } from '@/lib/rich-text';

const SECTION_IDS = [
  'principles',
  'architecture',
  'threats',
  'storage',
  'crypto',
  'integrity',
  'headers',
  'browser',
  'workflow',
  'verify',
  'disclose',
] as const;

const SECTION_GLYPHS: Partial<Record<(typeof SECTION_IDS)[number], DocGlyphId>> = {
  principles: 'shield',
  architecture: 'key',
  threats: 'scales',
  storage: 'vault',
  integrity: 'forge',
  verify: 'eye',
  disclose: 'scroll',
};

const CRYPTO_ROW_KEYS = [
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

const HEADER_ROW_KEYS = ['csp', 'hsts', 'frame', 'mime', 'referrer'] as const;

const DISCLOSE_FAQ_KEYS = ['steal', 'host', 'weaker', 'cold'] as const;

const VERIFY_SUBSECTIONS = ['network', 'offline', 'audit'] as const;

function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <div className="py-5 border-b border-ink/10 last:border-0">
      <h3 className="font-display text-lg font-semibold text-ink normal-case tracking-tight mb-2">
        {q}
      </h3>
      <RichParagraph
        text={a}
        className="text-sm text-muted leading-relaxed"
        linkClassName="text-accent hover:text-ink"
      />
    </div>
  );
}

export default function SecurityPage() {
  const t = useTranslations('docs.security');

  const toc = useMemo(
    () =>
      SECTION_IDS.map((id, i) => ({
        id,
        label: t(`toc.${id}`),
        n: String(i + 1).padStart(2, '0'),
      })),
    [t],
  );

  const principlesItems = t.raw('sections.principles.items') as string[];
  const threatsInScope = t.raw('sections.threats.inScope') as string[];
  const threatsOutScope = t.raw('sections.threats.outScope') as string[];
  const storageItems = t.raw('sections.storage.items') as string[];
  const browserItems = t.raw('sections.browser.items') as string[];
  const workflowSteps = t.raw('sections.workflow.steps') as string[];

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-security-wide.webp"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-aqueduct.webp" caption={t('sideCaption')}>
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection
                id="principles"
                n={t('sections.principles.n')}
                title={t('sections.principles.title')}
                glyph={SECTION_GLYPHS.principles}
                glyphLabel={t('sections.principles.glyph')}
              >
                <ul className="space-y-3">
                  {principlesItems.map((item) => (
                    <li key={item}>
                      <RichText text={item} />
                    </li>
                  ))}
                </ul>
                <DocProofSplit />
                <RichParagraph
                  text={t('principles.marketing')}
                  className="text-sm"
                  linkClassName="text-accent hover:text-ink"
                />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="architecture"
                n={t('sections.architecture.n')}
                title={t('sections.architecture.title')}
                glyph={SECTION_GLYPHS.architecture}
                glyphLabel={t('sections.architecture.glyph')}
              >
                <RichParagraph text={t('sections.architecture.intro')} />
                <DocTrustBoundary />
                <div className="border-y border-ink/15 divide-y divide-ink/10">
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.18em] text-ink mb-3">
                      {t('sections.architecture.browserLabel')}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      <div>
                        <p className="text-ink">{t('sections.architecture.mainThread')}</p>
                        <p className="text-muted text-micro mt-1">
                          {t('sections.architecture.mainThreadNote')}
                        </p>
                      </div>
                      <div>
                        <p className="text-ink">{t('sections.architecture.webWorkers')}</p>
                        <p className="text-muted text-micro mt-1 font-mono">
                          {t('sections.architecture.webWorkersNote')}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-micro uppercase tracking-[0.14em] text-accent">
                      {t('architecture.keysRam')}
                    </p>
                  </div>
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">
                      {t('sections.architecture.networkLabel')}
                    </p>
                    <RichParagraph
                      text={t('sections.architecture.networkBody')}
                      className="text-sm"
                      codeClassName="font-mono text-xs text-ink"
                    />
                  </div>
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">
                      {t('sections.architecture.serversLabel')}
                    </p>
                    <RichParagraph text={t('sections.architecture.serversBody')} className="text-sm" />
                  </div>
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="threats"
                n={t('sections.threats.n')}
                title={t('sections.threats.title')}
                glyph={SECTION_GLYPHS.threats}
                glyphLabel={t('sections.threats.glyph')}
              >
                <DocSubheading>{t('sections.threats.inScopeTitle')}</DocSubheading>
                <ul className="space-y-2 text-sm sm:text-body">
                  {threatsInScope.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <DocSubheading>{t('sections.threats.outScopeTitle')}</DocSubheading>
                <ul className="space-y-2 text-sm sm:text-body">
                  {threatsOutScope.map((item) => (
                    <li key={item}>
                      <RichText text={item} />
                    </li>
                  ))}
                </ul>
                <RichParagraph text={t('sections.threats.vanityNote')} />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="storage"
                n={t('sections.storage.n')}
                title={t('sections.storage.title')}
                glyph={SECTION_GLYPHS.storage}
                glyphLabel={t('sections.storage.glyph')}
              >
                <RichParagraph text={t('sections.storage.intro')} />
                <div className="border-y border-ink/15 divide-y divide-ink/10">
                  {storageItems.map((item) => (
                    <p key={item} className="py-3 text-sm text-ink">
                      {item}
                    </p>
                  ))}
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="crypto"
                n={t('sections.crypto.n')}
                title={t('sections.crypto.title')}
              >
                <RichParagraph
                  text={t('sections.crypto.intro')}
                  codeClassName="font-mono text-sm text-ink"
                />
                <div className="border-y border-ink/15">
                  {CRYPTO_ROW_KEYS.map((key) => (
                    <DocLedgerRow
                      key={key}
                      label={t(`sections.crypto.rows.${key}.label`)}
                      value={t(`sections.crypto.rows.${key}.value`)}
                      note={t(`sections.crypto.rows.${key}.note`)}
                    />
                  ))}
                </div>
                <RichParagraph text={t('sections.crypto.postFind')} />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="integrity"
                n={t('sections.integrity.n')}
                title={t('sections.integrity.title')}
                glyph={SECTION_GLYPHS.integrity}
                glyphLabel={t('sections.integrity.glyph')}
              >
                <RichParagraph
                  text={t('sections.integrity.p1')}
                  codeClassName="font-mono text-sm text-ink"
                />
                <RichParagraph text={t('sections.integrity.p2')} />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="headers"
                n={t('sections.headers.n')}
                title={t('sections.headers.title')}
              >
                <RichParagraph text={t('sections.headers.intro')} />
                <div className="border-y border-ink/15">
                  {HEADER_ROW_KEYS.map((key) => (
                    <DocLedgerRow
                      key={key}
                      label={t(`sections.headers.rows.${key}.label`)}
                      value={t(`sections.headers.rows.${key}.value`)}
                      note={t(`sections.headers.rows.${key}.note`)}
                    />
                  ))}
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="browser"
                n={t('sections.browser.n')}
                title={t('sections.browser.title')}
              >
                <RichParagraph text={t('sections.browser.intro')} />
                <ul className="space-y-2 text-sm sm:text-body">
                  {browserItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <RichParagraph text={t('sections.browser.mitigations')} />
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="workflow"
                n={t('sections.workflow.n')}
                title={t('sections.workflow.title')}
              >
                <ol className="list-decimal list-inside space-y-2">
                  {workflowSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
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
                <div className="border-y border-ink/15 divide-y divide-ink/10">
                  {VERIFY_SUBSECTIONS.map((sub) => {
                    const steps = t.raw(`sections.verify.${sub}.steps`) as string[];
                    return (
                      <div key={sub} className="py-5">
                        <p className="text-micro uppercase tracking-[0.16em] text-accent mb-2">
                          {t(`sections.verify.${sub}.n`)}
                        </p>
                        <h3 className="font-display text-lg font-semibold text-ink normal-case mb-3">
                          {t(`sections.verify.${sub}.title`)}
                        </h3>
                        <ol className="list-decimal list-inside space-y-1.5 text-sm">
                          {steps.map((step) => (
                            <li key={step}>
                              <RichText
                                text={step}
                                linkClassName="text-accent hover:text-ink"
                              />
                            </li>
                          ))}
                        </ol>
                      </div>
                    );
                  })}
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="disclose"
                n={t('sections.disclose.n')}
                title={t('sections.disclose.title')}
                glyph={SECTION_GLYPHS.disclose}
                glyphLabel={t('sections.disclose.glyph')}
              >
                <RichParagraph
                  text={t('sections.disclose.intro')}
                  linkClassName="text-accent hover:text-ink"
                />
                <div className="border-y border-ink/15">
                  {DISCLOSE_FAQ_KEYS.map((key) => (
                    <FaqRow
                      key={key}
                      q={t(`sections.disclose.faq.${key}.q`)}
                      a={t(`sections.disclose.faq.${key}.a`)}
                    />
                  ))}
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <section className="border-t border-ink/15 pt-10 pb-4">
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-3">
                  {t('next.label')}
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <Link
                    href="/audit"
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    {t('next.audit')}
                  </Link>
                  <Link href="/how-it-works" className="text-muted hover:text-ink">
                    {t('next.how')}
                  </Link>
                  <Link href="/faq" className="text-muted hover:text-ink">
                    {t('next.faq')}
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
