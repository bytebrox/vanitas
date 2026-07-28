'use client';

import { useEffect, useMemo, useState } from 'react';
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
} from '@/components';
import { Link } from '@/i18n/navigation';
import { RichParagraph } from '@/lib/rich-text';
import {
  buildEmbedProofUrl,
  buildProofUrl,
  type ProofChain,
} from '@/lib/proof-of-find';

const CHAINS: { id: ProofChain; label: string }[] = [
  { id: 'sol', label: 'Solana' },
  { id: 'evm', label: 'EVM' },
  { id: 'btc', label: 'Bitcoin' },
  { id: 'tron', label: 'Tron' },
  { id: 'aptos', label: 'Aptos' },
  { id: 'sui', label: 'Sui' },
  { id: 'ton', label: 'TON' },
  { id: 'cardano', label: 'Cardano' },
  { id: 'xrp', label: 'XRP' },
];

const DEMO = {
  chain: 'sol' as ProofChain,
  address: 'Ace1VanitasDemoAddressDoNotUse111111111',
  prefix: 'Ace',
  suffix: '',
};

export default function BrandPage() {
  const t = useTranslations('tools.brand');
  const tCommon = useTranslations('common');

  const toc = useMemo(
    () => [
      { id: 'embed', label: t('toc.embed'), n: '01' },
      { id: 'preview', label: t('toc.preview'), n: '02' },
      { id: 'kit', label: t('toc.kit'), n: '03' },
      { id: 'copy', label: t('toc.copy'), n: '04' },
    ],
    [t]
  );

  const [chain, setChain] = useState<ProofChain>(DEMO.chain);
  const [address, setAddress] = useState(DEMO.address);
  const [prefix, setPrefix] = useState(DEMO.prefix);
  const [suffix, setSuffix] = useState(DEMO.suffix);
  const [theme, setTheme] = useState<'paper' | 'ink'>('paper');
  const [compact, setCompact] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [origin, setOrigin] = useState('https://www.vanitas.fun');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const payload = useMemo(
    () => ({
      chain,
      address: address.trim(),
      prefix: prefix.trim() || undefined,
      suffix: suffix.trim() || undefined,
    }),
    [chain, address, prefix, suffix]
  );

  const proofUrl = useMemo(() => buildProofUrl(origin, payload), [origin, payload]);
  const embedUrl = useMemo(() => {
    const base = buildEmbedProofUrl(origin, payload);
    const u = new URL(base);
    if (theme === 'ink') u.searchParams.set('theme', 'ink');
    if (compact) u.searchParams.set('compact', '1');
    return u.toString();
  }, [origin, payload, theme, compact]);

  const iframeSnippet = `<iframe
  src="${embedUrl}"
  title="${t('iframeTitle')}"
  width="420"
  height="${compact ? 168 : 220}"
  loading="lazy"
  style="border:1px solid rgba(0,0,0,0.12);background:#F5F0E8"
></iframe>`;

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => {
        setCopied(null);
      }, 1800);
    } catch {
      /* ignore */
    }
  };

  const copiedLabel = tCommon('copied');

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-brand-wide.webp"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-aqueduct.webp" caption={t('caption')}>
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection id="embed" n={t('sectionEmbedN')} title={t('sectionEmbedTitle')}>
                <RichParagraph text={t('embedIntro')} linkClassName="text-accent hover:text-ink" />

                <div className="flex flex-wrap gap-2 mb-4">
                  {CHAINS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setChain(c.id);
                      }}
                      className={`text-micro uppercase tracking-[0.14em] px-2.5 py-1.5 border transition-colors ${
                        chain === c.id
                          ? 'border-ink text-ink bg-ink/[0.04]'
                          : 'border-ink/15 text-muted hover:text-ink'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <label className="block mb-3">
                  <span className="text-micro uppercase tracking-[0.16em] text-muted">
                    {t('address')}
                  </span>
                  <input
                    className="input mt-1 font-mono text-sm"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                    }}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </label>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {t('prefix')}
                    </span>
                    <input
                      className="input mt-1 font-mono"
                      value={prefix}
                      onChange={(e) => {
                        setPrefix(e.target.value);
                      }}
                      spellCheck={false}
                    />
                  </label>
                  <label className="block">
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">
                      {t('suffix')}
                    </span>
                    <input
                      className="input mt-1 font-mono"
                      value={suffix}
                      onChange={(e) => {
                        setSuffix(e.target.value);
                      }}
                      spellCheck={false}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'paper'}
                      onChange={() => {
                        setTheme('paper');
                      }}
                    />
                    {t('paperTheme')}
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'ink'}
                      onChange={() => {
                        setTheme('ink');
                      }}
                    />
                    {t('inkTheme')}
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compact}
                      onChange={(e) => {
                        setCompact(e.target.checked);
                      }}
                    />
                    {t('compact')}
                  </label>
                </div>

                <DocSubheading>{t('iframeSnippet')}</DocSubheading>
                <pre className="text-xs font-mono text-ink/80 whitespace-pre-wrap break-all border-y border-ink/15 py-4 overflow-x-auto">
                  {iframeSnippet}
                </pre>
                <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-micro uppercase tracking-[0.16em]">
                  <button
                    type="button"
                    onClick={() => {
                      void copyText('iframe', iframeSnippet);
                    }}
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    {copied === 'iframe' ? copiedLabel : t('copyIframe')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void copyText('embed', embedUrl);
                    }}
                    className="text-muted hover:text-ink"
                  >
                    {copied === 'embed' ? copiedLabel : t('copyEmbedUrl')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void copyText('proof', proofUrl);
                    }}
                    className="text-muted hover:text-ink"
                  >
                    {copied === 'proof' ? copiedLabel : t('copyProofUrl')}
                  </button>
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="preview" n={t('sectionPreviewN')} title={t('sectionPreviewTitle')}>
                <RichParagraph text={t('previewBody')} className="mb-4" />
                <div className="border border-ink/15 bg-ink/[0.02] p-3 sm:p-4">
                  <iframe
                    title={t('previewIframeTitle')}
                    src={embedUrl}
                    width="100%"
                    height={compact ? 168 : 220}
                    className="w-full max-w-[420px] bg-paper border border-ink/10"
                  />
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="kit" n={t('sectionKitN')} title={t('sectionKitTitle')}>
                <p>{t('kitIntro')}</p>
                <div className="border-y border-ink/15">
                  <DocLedgerRow label={t('wordmark')} value="Vanitas" note={t('wordmarkNote')} />
                  <DocLedgerRow label={t('paper')} value="#F5F0E8" note={t('paperNote')} />
                  <DocLedgerRow label={t('ink')} value="near-black" note={t('inkNote')} />
                  <DocLedgerRow
                    label={t('accent')}
                    value={t('accentValue')}
                    note={t('accentNote')}
                  />
                  <DocLedgerRow
                    label={t('site')}
                    value="https://vanitas.fun"
                    note={t('siteNote')}
                  />
                </div>
                <DocSubheading>{t('badgeHeading')}</DocSubheading>
                <p className="font-mono text-sm text-ink border-y border-ink/15 py-4">
                  {t('badgeLine')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void copyText('badge', t('badgeLine'));
                  }}
                  className="mt-3 text-micro uppercase tracking-[0.16em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                >
                  {copied === 'badge' ? copiedLabel : t('copyBadge')}
                </button>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="copy" n={t('sectionCopyN')} title={t('sectionCopyTitle')}>
                <div className="space-y-6">
                  <div>
                    <p className="text-micro uppercase tracking-[0.16em] text-muted mb-2">
                      {t('shortLabel')}
                    </p>
                    <p className="text-sm text-ink leading-relaxed">{t('shortBlurb')}</p>
                    <button
                      type="button"
                      className="mt-2 text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
                      onClick={() => {
                        void copyText('short', t('shortBlurb'));
                      }}
                    >
                      {copied === 'short' ? copiedLabel : tCommon('copy')}
                    </button>
                  </div>
                  <div>
                    <p className="text-micro uppercase tracking-[0.16em] text-muted mb-2">
                      {t('launchpadLabel')}
                    </p>
                    <p className="text-sm text-ink leading-relaxed">{t('launchpadBlurb')}</p>
                    <button
                      type="button"
                      className="mt-2 text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
                      onClick={() => {
                        void copyText('launch', t('launchpadBlurb'));
                      }}
                    >
                      {copied === 'launch' ? copiedLabel : tCommon('copy')}
                    </button>
                  </div>
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <section className="border-t border-ink/15 pt-10 pb-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <Link
                    href="/proof"
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    {t('linkProof')}
                  </Link>
                  <Link href="/lab" className="text-muted hover:text-ink">
                    {t('linkLab')}
                  </Link>
                  <Link href="/security" className="text-muted hover:text-ink">
                    {t('linkSecurity')}
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
