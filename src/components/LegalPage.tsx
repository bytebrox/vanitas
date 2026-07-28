'use client';

import { useTranslations } from 'next-intl';
import { Footer, FadeIn, PageIntro } from '@/components';
import { RichParagraph } from '@/lib/rich-text';

type LegalNamespace = 'legal.terms' | 'legal.privacy';

export function LegalPage({ ns }: { ns: LegalNamespace }) {
  const t = useTranslations(ns);
  const sections = t.raw('sections') as { title: string; body: string }[];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <PageIntro
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={
          <div className="space-y-2">
            <p>{t('intro')}</p>
            <p className="text-sm text-muted/80">{t('updated')}</p>
          </div>
        }
        imageSrc="/ascii/page-security-wide.webp"
      />

      <main className="px-4 sm:px-8 lg:px-12 pb-8 sm:pb-12">
        <div className="max-w-2xl mx-auto space-y-10 sm:space-y-12">
          {sections.map((section, i) => (
            <FadeIn key={section.title}>
              <section className="border-t border-ink/10 pt-6 sm:pt-8">
                <p className="text-micro uppercase tracking-[0.16em] text-muted mb-2">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink normal-case tracking-tight mb-3">
                  {section.title}
                </h2>
                <RichParagraph
                  text={section.body}
                  className="text-sm sm:text-base text-muted leading-relaxed"
                  linkClassName="text-accent hover:text-ink"
                  codeClassName="font-mono text-ink text-[0.9em]"
                />
              </section>
            </FadeIn>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
