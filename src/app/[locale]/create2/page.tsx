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
import { Link } from '@/i18n/navigation';
import { RichParagraph } from '@/lib/rich-text';
import {
  buildCreate2ForgeHref,
  computeCreate2Address,
  hashInitCode,
  matchesCreate2Pattern,
} from '@/lib/create2-helper';

export default function Create2Page() {
  const t = useTranslations('tools.create2');

  const toc = useMemo(
    () => [
      { id: 'hash', label: t('toc.hash'), n: '01' },
      { id: 'preview', label: t('toc.preview'), n: '02' },
      { id: 'forge', label: t('toc.forge'), n: '03' },
    ],
    [t]
  );

  const [bytecode, setBytecode] = useState('');
  const [initHash, setInitHash] = useState('');
  const [deployer, setDeployer] = useState('');
  const [salt, setSalt] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');

  const hashed = useMemo(() => (bytecode.trim() ? hashInitCode(bytecode) : null), [bytecode]);

  const effectiveHash = initHash.trim() || hashed?.initCodeHash || '';

  const preview = useMemo(() => {
    if (!deployer.trim() || !effectiveHash) return null;
    return computeCreate2Address(deployer, salt, effectiveHash);
  }, [deployer, salt, effectiveHash]);

  const patternOk =
    preview?.ok && preview.address
      ? matchesCreate2Pattern(preview.address, prefix, suffix)
      : null;

  const applyHash = () => {
    if (hashed?.ok && hashed.initCodeHash) setInitHash(hashed.initCodeHash);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-security-wide.webp"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-aqueduct.webp" caption={t('caption')}>
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection id="hash" n={t('sectionHashN')} title={t('sectionHashTitle')} glyph="seal">
                <RichParagraph text={t('hashIntro')} className="text-sm" />
                <label className="block">
                  <span className="text-micro uppercase tracking-[0.16em] text-muted">
                    {t('initCodeLabel')}
                  </span>
                  <textarea
                    value={bytecode}
                    onChange={(e) => setBytecode(e.target.value)}
                    rows={5}
                    spellCheck={false}
                    className="mt-2 w-full border border-ink/20 bg-surface px-3 py-3 font-mono text-ink text-xs leading-relaxed focus:outline-none focus:border-accent"
                    placeholder={t('initCodePh')}
                  />
                </label>
                {hashed && (
                  <div className="border-y border-ink/15 py-4 space-y-2">
                    {hashed.ok ? (
                      <>
                        <p className="text-micro uppercase tracking-[0.16em] text-muted">
                          {t('initCodeHashResult', { bytes: hashed.byteLength ?? 0 })}
                        </p>
                        <p className="font-mono text-sm text-ink break-all">{hashed.initCodeHash}</p>
                        <button
                          type="button"
                          onClick={applyHash}
                          className="text-micro uppercase tracking-[0.14em] text-accent hover:text-ink"
                        >
                          {t('useInPreview')}
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-accent">{hashed.error}</p>
                    )}
                  </div>
                )}
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection
                id="preview"
                n={t('sectionPreviewN')}
                title={t('sectionPreviewTitle')}
                glyph="modes"
              >
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {t('initCodeHashLabel')}
                    </span>
                    <input
                      value={initHash}
                      onChange={(e) => setInitHash(e.target.value)}
                      spellCheck={false}
                      className="mt-2 w-full border border-ink/20 bg-surface px-3 py-3 font-mono text-ink text-sm focus:outline-none focus:border-accent"
                      placeholder={t('initCodeHashPh')}
                    />
                  </label>
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {t('deployerLabel')}
                    </span>
                    <input
                      value={deployer}
                      onChange={(e) => setDeployer(e.target.value)}
                      spellCheck={false}
                      className="mt-2 w-full border border-ink/20 bg-surface px-3 py-3 font-mono text-ink text-sm focus:outline-none focus:border-accent"
                      placeholder={t('deployerPh')}
                    />
                  </label>
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {t('saltLabel')}
                    </span>
                    <input
                      value={salt}
                      onChange={(e) => setSalt(e.target.value)}
                      spellCheck={false}
                      className="mt-2 w-full border border-ink/20 bg-surface px-3 py-3 font-mono text-ink text-sm focus:outline-none focus:border-accent"
                      placeholder={t('saltPh')}
                    />
                  </label>
                </div>

                {preview && (
                  <div className="border-y border-ink/15 py-4 mt-2">
                    {preview.ok ? (
                      <>
                        <p className="text-micro uppercase tracking-[0.16em] text-muted mb-1">
                          {t('create2Address')}
                        </p>
                        <p className="font-mono text-sm sm:text-base text-ink break-all">
                          {preview.address}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-accent">{preview.error}</p>
                    )}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {t('wantedPrefix')}
                    </span>
                    <input
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      spellCheck={false}
                      className="mt-2 w-full border border-ink/20 bg-surface px-3 py-2.5 font-mono text-ink text-sm focus:outline-none focus:border-accent"
                      placeholder={t('prefixPh')}
                    />
                  </label>
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {t('wantedSuffix')}
                    </span>
                    <input
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                      spellCheck={false}
                      className="mt-2 w-full border border-ink/20 bg-surface px-3 py-2.5 font-mono text-ink text-sm focus:outline-none focus:border-accent"
                      placeholder={t('suffixPh')}
                    />
                  </label>
                </div>
                {patternOk !== null && (
                  <p className={`text-sm ${patternOk ? 'text-ink' : 'text-accent'}`}>
                    {patternOk ? t('patternMatch') : t('patternMismatch')}
                  </p>
                )}
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="forge" n={t('sectionForgeN')} title={t('sectionForgeTitle')} glyph="forge">
                <p className="text-sm">{t('forgeIntro')}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-micro uppercase tracking-[0.14em]">
                  <a
                    href={buildCreate2ForgeHref({
                      mode: 'create2-salt',
                      prefix,
                      suffix,
                      initCodeHash: effectiveHash || undefined,
                    })}
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    {t('grindSalt')}
                  </a>
                  <a
                    href={buildCreate2ForgeHref({
                      mode: 'create2-deployer',
                      prefix,
                      suffix,
                      initCodeHash: effectiveHash || undefined,
                      salt: salt || undefined,
                    })}
                    className="text-muted hover:text-ink"
                  >
                    {t('grindDeployer')}
                  </a>
                  <Link href="/evm" className="text-muted hover:text-ink">
                    {t('evmForge')}
                  </Link>
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
