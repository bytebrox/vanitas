'use client';

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
} from '@/components';

const toc = [
  { id: 'principles', label: 'Principles', n: '01' },
  { id: 'architecture', label: 'Architecture', n: '02' },
  { id: 'threats', label: 'Threats', n: '03' },
  { id: 'storage', label: 'Storage', n: '04' },
  { id: 'crypto', label: 'Crypto', n: '05' },
  { id: 'integrity', label: 'Integrity', n: '06' },
  { id: 'headers', label: 'Headers', n: '07' },
  { id: 'browser', label: 'Browser', n: '08' },
  { id: 'workflow', label: 'Workflow', n: '09' },
  { id: 'verify', label: 'Verify', n: '10' },
  { id: 'disclose', label: 'Disclose', n: '11' },
];

function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <div className="py-5 border-b border-ink/10 last:border-0">
      <h3 className="font-display text-lg font-semibold text-ink normal-case tracking-tight mb-2">
        {q}
      </h3>
      <p className="text-sm text-muted leading-relaxed">{a}</p>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-security-wide.webp"
        eyebrow="Docs"
        title="Security"
        description="Keys are generated in your browser, never on our servers. This page is the trust model: architecture, threats, crypto, headers, and how to verify every claim yourself."
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-aqueduct.webp" caption="Fig. V — Aqueduct">
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection id="principles" n="01 — Principles" title="Non-negotiables" glyph="shield" glyphLabel="Fig. A — Shield">
                <ul className="space-y-3">
                  <li>
                    <strong className="text-ink">Client-side generation</strong> — Web Workers on
                    your CPU create every keypair.
                  </li>
                  <li>
                    <strong className="text-ink">Zero key transit</strong> — there is no API that
                    accepts or returns private keys.
                  </li>
                  <li>
                    <strong className="text-ink">Zero key storage</strong> — no database, no logs of
                    secrets, no analytics of patterns or addresses.
                  </li>
                  <li>
                    <strong className="text-ink">Verifiable</strong> — open source, live audit,
                    offline test, Network panel.
                  </li>
                  <li>
                    <strong className="text-ink">Proof without exposure</strong> — shareable proofs
                    carry address + pattern only.
                  </li>
                </ul>
                <DocProofSplit />
                <p className="text-sm">
                  Marketing claims are worthless without checks. Use the{' '}
                  <a href="/audit" className="text-accent hover:text-ink">
                    live audit
                  </a>{' '}
                  and the Verify section below.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="architecture" n="02 — Architecture" title="Where keys live" glyph="key" glyphLabel="Fig. B — Locus">
                <p>
                  Vanitas is a static Next.js site. The host (e.g. Vercel) serves HTML, CSS, JS, and
                  prebuilt worker bundles. Cryptography never runs on that host for your keys.
                </p>
                <DocTrustBoundary />
                <div className="border-y border-ink/15 divide-y divide-ink/10">
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.18em] text-ink mb-3">
                      Your browser
                    </p>
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      <div>
                        <p className="text-ink">Main thread</p>
                        <p className="text-muted text-micro mt-1">UI · React · controls</p>
                      </div>
                      <div>
                        <p className="text-ink">Web Workers</p>
                        <p className="text-muted text-micro mt-1 font-mono">
                          W1…Wn — grind · match · postMessage
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-micro uppercase tracking-[0.14em] text-accent">
                      Private keys exist only here — RAM on your device
                    </p>
                  </div>
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">
                      Network during mining
                    </p>
                    <p className="text-sm">
                      None required. After assets load, airplane mode still works. The only
                      first-party API route (
                      <code className="font-mono text-xs text-ink">/api/domains</code>) suggests
                      Solana domain links — it does not generate or receive keys.
                    </p>
                  </div>
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">
                      Our servers
                    </p>
                    <p className="text-sm">
                      Deliver files. Cannot read your Worker memory. Cannot intercept a finished
                      keypair. A compromised origin could serve malicious JS — that is why integrity
                      checks and open source matter (see Integrity &amp; Browser).
                    </p>
                  </div>
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="threats" n="03 — Threats" title="Threat model (honest)" glyph="scales" glyphLabel="Fig. C — Scales">
                <DocSubheading>In scope — we design against</DocSubheading>
                <ul className="space-y-2 text-sm sm:text-body">
                  <li>Server-side key theft (no keys on server).</li>
                  <li>Casual network sniffing during mining (no key traffic).</li>
                  <li>Clickjacking of the main app (frame deny on primary routes).</li>
                  <li>Obvious XSS exfiltration paths (CSP; still not a silver bullet).</li>
                </ul>
                <DocSubheading>Out of scope / shared responsibility</DocSubheading>
                <ul className="space-y-2 text-sm sm:text-body">
                  <li>
                    <strong className="text-ink">Malicious browser extensions</strong> that read
                    page memory or clipboard — disable them on a clean profile when forging
                    high-value keys.
                  </li>
                  <li>
                    <strong className="text-ink">Compromised device / malware</strong> — OS-level
                    keyloggers beat any website.
                  </li>
                  <li>
                    <strong className="text-ink">You pasting keys into Discord / phishing</strong> —
                    operational security is yours.
                  </li>
                  <li>
                    <strong className="text-ink">Supply-chain of dependencies</strong> — we pin and
                    audit; you can verify worker hashes and rebuild from source.
                  </li>
                </ul>
                <p>
                  Vanity mining does not create a “weaker” key. Long patterns only cost more CPU —
                  they do not reduce private-key entropy.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="storage" n="04 — Storage" title="What we store" glyph="vault" glyphLabel="Fig. D — Vault">
                <p>
                  <strong className="text-ink">Nothing about your keys on our servers.</strong> No
                  database of addresses, patterns, IPs for mining, or analytics SDKs in the forge
                  path.
                </p>
                <div className="border-y border-ink/15 divide-y divide-ink/10">
                  {[
                    'No private keys on disk or server',
                    'No public keys / addresses collected remotely',
                    'No pattern telemetry',
                    'No account system',
                    'No third-party analytics in the product promise',
                    'sessionStorage recent finds = address + pattern only, this browser session',
                    'Proof links = query params you choose to share (no keys)',
                  ].map((item) => (
                    <p key={item} className="py-3 text-sm text-ink">
                      {item}
                    </p>
                  ))}
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="crypto" n="05 — Crypto" title="Algorithms per forge">
                <p>
                  Randomness always comes from the browser CSPRNG (
                  <code className="font-mono text-sm text-ink">crypto.getRandomValues</code>). Curves
                  and address derivation differ by chain:
                </p>
                <div className="border-y border-ink/15">
                  <DocLedgerRow
                    label="Solana"
                    value="Ed25519 → Base58"
                    note="Web Crypto native or WASM fallback · wallet / mint"
                  />
                  <DocLedgerRow
                    label="EVM"
                    value="secp256k1 + keccak-256"
                    note="0x EOA · CREATE · CREATE2"
                  />
                  <DocLedgerRow
                    label="Bitcoin"
                    value="secp256k1"
                    note="Legacy · SegWit · Taproot · WIF export"
                  />
                  <DocLedgerRow
                    label="Tron"
                    value="secp256k1 + keccak → Base58Check"
                    note="T… wallet / CREATE"
                  />
                  <DocLedgerRow
                    label="Aptos"
                    value="Ed25519 + SHA3-256"
                    note="0x account address"
                  />
                  <DocLedgerRow
                    label="Sui"
                    value="Ed25519 + Blake2b-256"
                    note="0x with scheme flag"
                  />
                  <DocLedgerRow
                    label="TON"
                    value="Ed25519 · Wallet v4R2"
                    note="UQ / EQ Base64url"
                  />
                  <DocLedgerRow
                    label="Cardano"
                    value="Ed25519 · CIP-19 enterprise"
                    note="addr1… payment-key only"
                  />
                  <DocLedgerRow
                    label="XRP"
                    value="secp256k1 · XRPL Base58"
                    note="Classic r… addresses"
                  />
                </div>
                <p>
                  Post-find checks can validate entropy size, CSPRNG presence, and chi-square
                  uniformity on a random sample — a health check of the RNG path, not a substitute
                  for device hygiene.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="integrity" n="06 — Integrity" title="Workers & published hashes" glyph="forge" glyphLabel="Fig. E — Hash">
                <p>
                  Mining code ships as static{' '}
                  <code className="font-mono text-sm text-ink">public/*-worker.js</code> files built
                  from TypeScript sources. Each production build records SHA-256 digests in{' '}
                  <code className="font-mono text-sm text-ink">worker-hash.json</code>. The audit page
                  re-hashes the workers your browser loaded and compares them to that file.
                </p>
                <p>
                  If hashes diverge, treat the page as untrusted — stop, do not use keys, and
                  investigate (wrong deploy, cache, or tampering). Rebuilding from the open repo
                  should reproduce the same worker bytes for a given commit.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="headers" n="07 — Headers" title="HTTP security headers">
                <p>
                  Responses include headers that reduce XSS impact, force HTTPS, and block framing
                  of the main app. CSP still allows what Next.js needs (including some inline /
                  eval tradeoffs) — headers help; they do not replace code review.
                </p>
                <div className="border-y border-ink/15">
                  <DocLedgerRow
                    label="CSP"
                    value="Content-Security-Policy"
                    note="Limits scripts, workers, connect-src"
                  />
                  <DocLedgerRow
                    label="HSTS"
                    value="Strict-Transport-Security"
                    note="max-age=31536000"
                  />
                  <DocLedgerRow
                    label="Frame"
                    value="X-Frame-Options: DENY"
                    note="Primary app not embeddable"
                  />
                  <DocLedgerRow
                    label="MIME"
                    value="X-Content-Type-Options: nosniff"
                    note="No MIME sniffing"
                  />
                  <DocLedgerRow
                    label="Referrer"
                    value="strict-origin-when-cross-origin"
                    note="Limits referrer leakage"
                  />
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="browser" n="08 — Browser" title="What the browser can still do">
                <p>
                  Anything that runs with page privileges can, in theory, read the DOM and Worker
                  messages. That includes:
                </p>
                <ul className="space-y-2 text-sm sm:text-body">
                  <li>Browser extensions with broad site access</li>
                  <li>DevTools open on a shared machine</li>
                  <li>Malicious injected scripts if XSS exists</li>
                  <li>Clipboard sniffers after you copy a key</li>
                </ul>
                <p>
                  Mitigations: clean browser profile, no unnecessary extensions, prefer download
                  files over clipboard for high-value keys, wipe clipboard after paste into a
                  wallet, consider the terminal CLI or an air-gapped machine for large treasuries.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="workflow" n="09 — Workflow" title="Safe operating procedure">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Load vanitas.fun (or run from a verified local build).</li>
                  <li>Optional: open Network, go offline, run audit.</li>
                  <li>Choose a short pattern first; increase length once you trust the setup.</li>
                  <li>On find: export, store offline, never screenshot keys into chat apps.</li>
                  <li>Import into the correct wallet for that chain; send a dust test transfer.</li>
                  <li>
                    For long-term holdings, move funds to a hardware wallet — Vanitas is a forge,
                    not a vault.
                  </li>
                </ol>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="verify" n="10 — Verify" title="Three checks anyone can run" glyph="eye" glyphLabel="Fig. F — Audit">
                <div className="border-y border-ink/15 divide-y divide-ink/10">
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.16em] text-accent mb-2">
                      01 — Network
                    </p>
                    <h3 className="font-display text-lg font-semibold text-ink normal-case mb-3">
                      Network monitor
                    </h3>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm">
                      <li>DevTools → Network → clear</li>
                      <li>Start generating</li>
                      <li>
                        Confirm <strong className="text-ink">zero</strong> requests while mining
                      </li>
                    </ol>
                  </div>
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.16em] text-accent mb-2">
                      02 — Offline
                    </p>
                    <h3 className="font-display text-lg font-semibold text-ink normal-case mb-3">
                      Airplane mode
                    </h3>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm">
                      <li>Load the app</li>
                      <li>Disconnect</li>
                      <li>Generate — success proves no live server dependency</li>
                    </ol>
                  </div>
                  <div className="py-5">
                    <p className="text-micro uppercase tracking-[0.16em] text-accent mb-2">
                      03 — Audit
                    </p>
                    <h3 className="font-display text-lg font-semibold text-ink normal-case mb-3">
                      Live audit + source
                    </h3>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm">
                      <li>
                        Run{' '}
                        <a href="/audit" className="text-accent hover:text-ink">
                          /audit
                        </a>
                      </li>
                      <li>Compare worker hashes to published JSON</li>
                      <li>
                        Review{' '}
                        <a
                          href="https://github.com/bytebrox/vanitas"
                          className="text-accent hover:text-ink"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </a>{' '}
                        workers and SECURITY.md
                      </li>
                    </ol>
                  </div>
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="disclose" n="11 — Disclose" title="Reporting issues" glyph="scroll" glyphLabel="Fig. G — Report">
                <p>
                  Do <strong className="text-ink">not</strong> open public GitHub issues for
                  security vulnerabilities. Prefer private GitHub Security Advisories on{' '}
                  <a
                    href="https://github.com/bytebrox/vanitas/security/advisories/new"
                    className="text-accent hover:text-ink"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    bytebrox/vanitas
                  </a>
                  . Include reproduction steps, impact, and a suggested fix if you have one.
                </p>
                <div className="border-y border-ink/15">
                  <FaqRow
                    q="Can you steal my keys?"
                    a="We have no server-side path that receives them. A malicious build or extension could — verify hashes and use a clean environment for high value."
                  />
                  <FaqRow
                    q="What if the host is hacked?"
                    a="Attackers could serve altered JavaScript. That is why open source, worker-hash checks, and preferring a known-good commit matter. The host still never receives your finished keys from a clean build."
                  />
                  <FaqRow
                    q="Are vanity addresses less secure?"
                    a="No. Private-key entropy is unchanged. Only the public address is filtered for appearance."
                  />
                  <FaqRow
                    q="Should I forge cold-storage keys in a daily browser?"
                    a="For significant funds: clean profile or offline/CLI, small test transfer, then hardware wallet custody."
                  />
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <section className="border-t border-ink/15 pt-10 pb-4">
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-3">Next</p>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <a
                    href="/audit"
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    Live audit
                  </a>
                  <a href="/how-it-works" className="text-muted hover:text-ink">
                    How it works
                  </a>
                  <a href="/faq" className="text-muted hover:text-ink">
                    FAQ
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
