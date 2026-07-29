'use client';

import { useTranslations } from 'next-intl';
import { Footer, FadeIn, Navbar } from '@/components';
import { RichParagraph, RichText } from '@/lib/rich-text';

type LegalNamespace = 'legal.terms' | 'legal.privacy';

type LegalSection = {
  title: string;
  body: string | string[];
};

function sectionParagraphs(body: string | string[]): string[] {
  const chunks = Array.isArray(body) ? body : body.split(/\n\n+/);
  return chunks.map((p) => p.trim()).filter(Boolean);
}

export function LegalPage({ ns }: { ns: LegalNamespace }) {
  const t = useTranslations(ns);
  const sections = t.raw('sections') as LegalSection[];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="relative min-h-[4.5rem] bg-paper">
        <Navbar />
      </div>

      <main className="px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-8 sm:pb-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-micro uppercase tracking-[0.16em] text-muted mb-3">{t('eyebrow')}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink normal-case tracking-[0.02em] mb-4">
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed mb-2">
            <RichText
              text={t('intro')}
              linkClassName="text-accent hover:text-ink"
              codeClassName="font-mono text-ink text-[0.9em]"
              boldClassName="text-ink font-medium"
            />
          </p>
          <p className="text-sm text-muted/80 mb-10 sm:mb-14">{t('updated')}</p>

          <div className="space-y-10 sm:space-y-12">
            {sections.map((section, i) => {
              const paragraphs = sectionParagraphs(section.body);
              return (
                <FadeIn key={`${i}-${section.title}`}>
                  <section className="border-t border-ink/10 pt-6 sm:pt-8">
                    <p className="text-micro uppercase tracking-[0.16em] text-muted mb-2">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink normal-case tracking-[0.02em] mb-3">
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {paragraphs.map((paragraph, pi) => (
                        <RichParagraph
                          key={pi}
                          text={paragraph}
                          className="text-sm sm:text-base text-muted leading-relaxed"
                          linkClassName="text-accent hover:text-ink"
                          codeClassName="font-mono text-ink text-[0.9em]"
                        />
                      ))}
                    </div>
                  </section>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
