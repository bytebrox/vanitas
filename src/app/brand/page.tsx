'use client';

import { useEffect, useMemo, useState } from 'react';
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
import {
  buildEmbedProofUrl,
  buildProofUrl,
  type ProofChain,
} from '@/lib/proof-of-find';

const toc = [
  { id: 'embed', label: 'Embed', n: '01' },
  { id: 'preview', label: 'Preview', n: '02' },
  { id: 'kit', label: 'Kit', n: '03' },
  { id: 'copy', label: 'Copy', n: '04' },
];

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

  const payload = useMemo(    () => ({
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
  title="Vanitas proof"
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

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-security-wide.webp"
        eyebrow="Tools"
        title="Brand"
        description="Embed proof cards on launchpads and docs, plus a light branding kit — wordmark, colors, and copy. Never includes private keys."
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-aqueduct.webp" caption="Fig. — Brand">
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection id="embed" n="01 — Embed" title="Proof widget">
                <p>
                  Paste chain, address, and pattern (from a find or a demo). We build an iframe that
                  verifies the match client-side — same rules as{' '}
                  <a href="/proof" className="text-accent hover:text-ink">
                    /proof
                  </a>
                  .
                </p>

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
                  <span className="text-micro uppercase tracking-[0.16em] text-muted">Address</span>
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
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">Prefix</span>
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
                    <span className="text-micro uppercase tracking-[0.16em] text-muted">Suffix</span>
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
                    Paper theme
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
                    Ink theme
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compact}
                      onChange={(e) => {
                        setCompact(e.target.checked);
                      }}
                    />
                    Compact
                  </label>
                </div>

                <DocSubheading>Iframe snippet</DocSubheading>
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
                    {copied === 'iframe' ? 'Copied' : 'Copy iframe'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void copyText('embed', embedUrl);
                    }}
                    className="text-muted hover:text-ink"
                  >
                    {copied === 'embed' ? 'Copied' : 'Copy embed URL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void copyText('proof', proofUrl);
                    }}
                    className="text-muted hover:text-ink"
                  >
                    {copied === 'proof' ? 'Copied' : 'Copy full proof URL'}
                  </button>
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="preview" n="02 — Preview" title="Live card">
                <p className="mb-4">
                  Framed preview of <code className="font-mono text-xs text-ink">/embed/proof</code>.
                  Demo address may show mismatch until you paste a real find.
                </p>
                <div className="border border-ink/15 bg-ink/[0.02] p-3 sm:p-4">
                  <iframe
                    title="Vanitas proof preview"
                    src={embedUrl}
                    width="100%"
                    height={compact ? 168 : 220}
                    className="w-full max-w-[420px] bg-paper border border-ink/10"
                  />
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="kit" n="03 — Kit" title="Branding kit">
                <p>
                  Use Vanitas marks when linking proofs or forges. Do not imply custody, partnership,
                  or audited-by-Vanitas unless true.
                </p>
                <div className="border-y border-ink/15">
                  <DocLedgerRow
                    label="Wordmark"
                    value="Vanitas"
                    note="Display / serif weight — hero-level when branded alone"
                  />
                  <DocLedgerRow
                    label="Paper"
                    value="#F5F0E8"
                    note="Primary ground"
                  />
                  <DocLedgerRow
                    label="Ink"
                    value="near-black"
                    note="Body + chrome"
                  />
                  <DocLedgerRow
                    label="Accent"
                    value="site accent token"
                    note="Links / verified states — keep sparing"
                  />
                  <DocLedgerRow
                    label="Site"
                    value="https://vanitas.fun"
                    note="Prefer www.vanitas.fun for canonical links"
                  />
                </div>
                <DocSubheading>Badge line</DocSubheading>
                <p className="font-mono text-sm text-ink border-y border-ink/15 py-4">
                  Proof verified client-side · vanitas.fun
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void copyText('badge', 'Proof verified client-side · vanitas.fun');
                  }}
                  className="mt-3 text-micro uppercase tracking-[0.16em] text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                >
                  {copied === 'badge' ? 'Copied' : 'Copy badge line'}
                </button>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="copy" n="04 — Copy" title="Suggested blurbs">
                <div className="space-y-6">
                  <div>
                    <p className="text-micro uppercase tracking-[0.16em] text-muted mb-2">Short</p>
                    <p className="text-sm text-ink leading-relaxed">
                      Vanity address forged locally with Vanitas — keys never leave the device.
                      Pattern match verified client-side.
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
                      onClick={() => {
                        void copyText(
                          'short',
                          'Vanity address forged locally with Vanitas — keys never leave the device. Pattern match verified client-side.'
                        );
                      }}
                    >
                      {copied === 'short' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div>
                    <p className="text-micro uppercase tracking-[0.16em] text-muted mb-2">Launchpad</p>
                    <p className="text-sm text-ink leading-relaxed">
                      Custom mint / vanity wallet generated in-browser via vanitas.fun. Share the
                      proof link to let anyone verify the pattern — private keys stay off the page.
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
                      onClick={() => {
                        void copyText(
                          'launch',
                          'Custom mint / vanity wallet generated in-browser via vanitas.fun. Share the proof link to let anyone verify the pattern — private keys stay off the page.'
                        );
                      }}
                    >
                      {copied === 'launch' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <section className="border-t border-ink/15 pt-10 pb-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <a href="/proof" className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent">
                    Proof page
                  </a>
                  <a href="/lab" className="text-muted hover:text-ink">
                    Pattern lab
                  </a>
                  <a href="/security" className="text-muted hover:text-ink">
                    Security
                  </a>
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
