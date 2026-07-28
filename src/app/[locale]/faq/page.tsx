'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Footer,
  FadeIn,
  PageIntro,
  ContentWithSide,
  DocsToc,
  DOC_SECTION_SCROLL_MT,
  DocVanityAnatomy,
  DocDifficultyScale,
  DocGlyph,
} from '@/components';
import type { DocGlyphId } from '@/components';
import { Link } from '@/i18n/navigation';
import { RichText } from '@/lib/rich-text';

const CATEGORY_IDS = [
  'general',
  'solana',
  'evm',
  'bitcoin',
  'tron',
  'aptos-sui',
  'ton-cardano-xrp',
  'security',
  'proof-cli',
  'usage',
] as const;

const FAQ_GLYPH_IDS: Record<string, DocGlyphId> = {
  general: 'scroll',
  solana: 'colonnade',
  evm: 'modes',
  bitcoin: 'key',
  tron: 'forge',
  'aptos-sui': 'loop',
  'ton-cardano-xrp': 'stele',
  security: 'shield',
  'proof-cli': 'seal',
  usage: 'hourglass',
};

function FaqAccordion({
  items,
}: {
  items: { id: string; question: string; answer: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      {items.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.id} className="border-b border-ink/15">
            <button
              type="button"
              onClick={() => {
                setOpen(isOpen ? null : i);
              }}
              className="w-full py-5 flex items-start justify-between text-left gap-4 group"
            >
              <h3 className="text-lg font-medium text-ink group-hover:text-accent transition-colors">
                {faq.question}
              </h3>
              <span
                className={`text-xl text-muted transition-transform duration-300 shrink-0 ${
                  isOpen ? 'rotate-45' : ''
                }`}
              >
                +
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isOpen ? '640px' : '0',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="pb-5 pr-4 sm:pr-8 text-muted leading-relaxed whitespace-pre-line">
                <RichText text={faq.answer} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FAQPage() {
  const t = useTranslations('faq');

  const categories = useMemo(() => {
    return CATEGORY_IDS.map((id) => {
      const itemsRaw = t.raw(`categories.${id}.items`) as Record<
        string,
        { q: string; a: string }
      >;
      const items = Object.entries(itemsRaw).map(([itemId, item]) => ({
        id: itemId,
        question: item.q,
        answer: item.a,
      }));
      return {
        id,
        n: t(`categories.${id}.n`),
        label: t(`categories.${id}.label`),
        items,
      };
    });
  }, [t]);

  const toc = categories.map((c) => ({ id: c.id, label: c.label, n: c.n }));

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-faq-wide.webp"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-landscape.webp" caption={t('sideCaption')}>
          <DocsToc items={toc} label={t('topics')} />

          <div className="space-y-2">
            {categories.map((cat) => {
              const glyphId = FAQ_GLYPH_IDS[cat.id];
              const glyphLabel = t.has(`glyphs.${cat.id}`)
                ? t(`glyphs.${cat.id}`)
                : undefined;
              return (
                <FadeIn key={cat.id}>
                  <section
                    id={cat.id}
                    className={`border-t border-ink/15 pt-10 ${DOC_SECTION_SCROLL_MT}`}
                  >
                    {glyphId ? (
                      <div className="relative z-[1] flex flex-col items-center text-center mb-8 sm:mb-10">
                        <DocGlyph
                          id={glyphId}
                          label={glyphLabel}
                          variant="band"
                          className="w-[7rem] sm:w-[8.5rem] md:w-[9.5rem] mb-5 sm:mb-6"
                        />
                        <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">
                          {cat.n} — {cat.label}
                        </p>
                        <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink normal-case">
                          {cat.label}
                        </h2>
                      </div>
                    ) : (
                      <>
                        <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">
                          {cat.n} — {cat.label}
                        </p>
                        <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink normal-case mb-2">
                          {cat.label}
                        </h2>
                      </>
                    )}
                    {cat.id === 'general' ? (
                      <>
                        <DocVanityAnatomy />
                        <DocDifficultyScale />
                      </>
                    ) : null}
                    <FaqAccordion items={cat.items} />
                  </section>
                </FadeIn>
              );
            })}

            <FadeIn>
              <section className="border-t border-ink/15 pt-10 pb-4">
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-3">
                  {t('stillStuck')}
                </p>
                <p className="text-muted mb-6 max-w-xl leading-relaxed">{t('stillStuckBody')}</p>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <Link
                    href="/how-it-works"
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    {t('linkHow')}
                  </Link>
                  <Link href="/security" className="text-muted hover:text-ink">
                    {t('linkSecurity')}
                  </Link>
                  <Link href="/audit" className="text-muted hover:text-ink">
                    {t('linkAudit')}
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
