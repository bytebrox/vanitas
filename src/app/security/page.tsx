/**
 * Security Page — open ledger layout (no card chrome / boxed tables)
 */

import { Footer, FadeIn, PageIntro, ContentWithSide } from '@/components';

function Section({
  id,
  n,
  title,
  children,
}: {
  id?: string;
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FadeIn>
      <section id={id} className="border-t border-ink/15 pt-10 scroll-mt-24">
        <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{n}</p>
        <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink normal-case mb-5">
          {title}
        </h2>
        <div className="space-y-4 text-body text-muted leading-relaxed">{children}</div>
      </section>
    </FadeIn>
  );
}

function LedgerRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-1 sm:gap-6 py-4 border-b border-ink/10 last:border-0">
      <p className="text-micro uppercase tracking-[0.16em] text-muted pt-0.5">{label}</p>
      <div>
        <p className="text-ink font-mono text-sm break-all">{value}</p>
        {note && (
          <p className="text-sm text-muted mt-1 normal-case tracking-normal leading-relaxed">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

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
        eyebrow="Trust"
        title="Security"
        description="Your keys never leave this browser. No exceptions. No backdoors. Client-side generation, zero storage, verifiable in DevTools and on the live audit page."
      >
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-micro uppercase tracking-[0.16em] text-muted lg:justify-end">
          <a href="#architecture" className="hover:text-ink">01 Architecture</a>
          <a href="#storage" className="hover:text-ink">02 Storage</a>
          <a href="#crypto" className="hover:text-ink">03 Crypto</a>
          <a href="#headers" className="hover:text-ink">04 Headers</a>
          <a href="#verify" className="hover:text-ink">05 Verify</a>
          <a href="#faq" className="hover:text-ink">06 FAQ</a>
        </div>
      </PageIntro>

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16">
        <ContentWithSide imageSrc="/ascii/side-aqueduct.webp" caption="Fig. V — Aqueduct">
          <div className="space-y-4">
            <FadeIn>
              <section className="border-y border-ink/15 py-8">
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">TL;DR</p>
                <ul className="space-y-3 text-muted">
                  <li>
                    <strong className="text-ink">Keys generate in your browser</strong> — never on our servers
                  </li>
                  <li>
                    <strong className="text-ink">We cannot see your keys</strong> — we neither receive nor store them
                  </li>
                  <li>
                    <strong className="text-ink">Works offline</strong> — disconnect after load to prove it
                  </li>
                  <li>
                    <strong className="text-ink">Open source</strong> — auditable code
                  </li>
                  <li>
                    <strong className="text-ink">Live auditable</strong> — run{' '}
                    <a href="/audit" className="text-accent hover:text-ink">
                      8 checks
                    </a>{' '}
                    in-browser
                  </li>
                </ul>
              </section>
            </FadeIn>

            <Section id="architecture" n="01 — Architecture" title="Where your keys are generated">
              <p>
                Vanitas serves static files only. Cryptography runs in isolated Web Workers on your CPU —
                in your memory, never on a remote machine.
              </p>

              <div className="border-y border-ink/15 divide-y divide-ink/10">
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.18em] text-ink mb-3">Your browser</p>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div>
                      <p className="text-ink">Main thread</p>
                      <p className="text-muted text-micro mt-1">UI · React</p>
                    </div>
                    <div>
                      <p className="text-ink">Web Workers</p>
                      <p className="text-muted text-micro mt-1 font-mono">
                        W1 · W2 · … · Wn — Ed25519 / secp256k1
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-micro uppercase tracking-[0.14em] text-accent">
                    Keys generated here — your CPU, your memory
                  </p>
                </div>
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">
                    Link to server
                  </p>
                  <p className="text-sm">
                    Static HTML / JS / CSS only · no key payloads · no key endpoints
                  </p>
                </div>
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-2">Our server</p>
                  <p className="text-sm">
                    Delivers files · cannot compute keys · no memory access · no key access
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8 pt-2">
                <div>
                  <p className="text-micro uppercase tracking-[0.18em] text-ink mb-3">In your browser</p>
                  <ul className="space-y-2 text-sm">
                    <li>All JavaScript execution</li>
                    <li>All cryptography</li>
                    <li>RNG and keypair creation</li>
                    <li>Pattern matching &amp; downloads</li>
                  </ul>
                </div>
                <div>
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-3">Server cannot</p>
                  <ul className="space-y-2 text-sm">
                    <li>See private keys</li>
                    <li>Access browser memory</li>
                    <li>Intercept generated keys</li>
                    <li>Track your patterns</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section id="storage" n="02 — Storage" title="What we store (nothing)">
              <p>
                Vanitas stores <strong className="text-ink">absolutely no data</strong>. There is no
                database, no analytics, no tracking. The forge runs entirely in your browser.
              </p>
              <div className="border-y border-ink/15 divide-y divide-ink/10">
                {[
                  'No private keys',
                  'No public keys / addresses',
                  'No patterns searched',
                  'No IP addresses',
                  'No timestamps',
                  'No user identifiers',
                  'No cookies',
                  'No analytics',
                ].map((item) => (
                  <p key={item} className="py-3 text-sm text-ink">
                    {item}
                  </p>
                ))}
              </div>
            </Section>

            <Section id="crypto" n="03 — Crypto" title="Cryptographic security">
              <p>
                Solana forges use Ed25519; Ethereum forges use secp256k1 + keccak-256. Randomness
                comes from the browser CSPRNG.
              </p>
              <div className="border-y border-ink/15">
                <LedgerRow label="Algorithm" value="Ed25519 · secp256k1" note="RFC 8032 · SEC standards" />
                <LedgerRow label="Key gen" value="Web Crypto API · @noble" note="W3C · audited libraries" />
                <LedgerRow label="RNG" value="crypto.getRandomValues()" note="Hardware-backed CSPRNG" />
                <LedgerRow label="Entropy" value="256 bits" note="Industry standard private-key size" />
                <LedgerRow label="Encoding" value="Base58 · hex 0x" note="Solana · EVM compatible" />
              </div>
              <div className="border-t border-ink/15 pt-6">
                <p className="text-micro uppercase tracking-[0.18em] text-accent mb-3">
                  Key security check
                </p>
                <p className="mb-3">
                  After a find, Vanitas can run live checks on entropy and randomness quality:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong className="text-ink">Entropy verification</strong> — confirms full key entropy
                  </li>
                  <li>
                    <strong className="text-ink">CSPRNG check</strong> — verifies secure RNG path
                  </li>
                  <li>
                    <strong className="text-ink">Chi-square test</strong> — statistical randomness probe
                  </li>
                  <li>
                    <strong className="text-ink">Distribution</strong> — uniform byte spread check
                  </li>
                </ul>
              </div>
            </Section>

            <Section id="headers" n="04 — Headers" title="HTTP security headers">
              <p>Responses ship with strict headers that limit exfiltration and framing attacks.</p>
              <div className="border-y border-ink/15">
                <LedgerRow
                  label="CSP"
                  value="Content-Security-Policy"
                  note="Restricts scripts, workers, and connections to self"
                />
                <LedgerRow
                  label="HSTS"
                  value="Strict-Transport-Security"
                  note="max-age=31536000 — forces HTTPS"
                />
                <LedgerRow
                  label="Frame"
                  value="X-Frame-Options: DENY"
                  note="Blocks clickjacking via iframes"
                />
                <LedgerRow
                  label="MIME"
                  value="X-Content-Type-Options: nosniff"
                  note="Prevents MIME sniffing"
                />
                <LedgerRow
                  label="Referrer"
                  value="Referrer-Policy: strict-origin-when-cross-origin"
                  note="Limits referrer leakage"
                />
              </div>
            </Section>

            <Section id="verify" n="05 — Verify" title="How to verify yourself">
              <p>Don&apos;t trust claims — confirm locally. Three short methods:</p>
              <div className="border-y border-ink/15 divide-y divide-ink/10">
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.16em] text-accent mb-2">01 — Network</p>
                  <h3 className="font-display text-lg font-semibold text-ink normal-case mb-3">
                    Network monitor
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm">
                    <li>Open DevTools (F12)</li>
                    <li>Open the Network tab and clear entries</li>
                    <li>Generate an address</li>
                    <li>
                      Confirm: <strong className="text-ink">zero requests</strong> during generation
                    </li>
                  </ol>
                </div>
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.16em] text-accent mb-2">02 — Offline</p>
                  <h3 className="font-display text-lg font-semibold text-ink normal-case mb-3">
                    Offline test
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm">
                    <li>Load Vanitas</li>
                    <li>Go offline (airplane mode)</li>
                    <li>Generate an address — it still works</li>
                  </ol>
                </div>
                <div className="py-5">
                  <p className="text-micro uppercase tracking-[0.16em] text-accent mb-2">03 — Source</p>
                  <h3 className="font-display text-lg font-semibold text-ink normal-case mb-3">
                    Code &amp; audit
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm">
                    <li>
                      Review workers in the repo (
                      <code className="font-mono text-xs text-ink">vanity.worker.source.ts</code>,{' '}
                      <code className="font-mono text-xs text-ink">eth.worker.source.ts</code>)
                    </li>
                    <li>
                      Run the{' '}
                      <a href="/audit" className="text-accent hover:text-ink">
                        live audit
                      </a>
                    </li>
                    <li>Compare published worker hashes</li>
                  </ol>
                </div>
              </div>
            </Section>

            <Section id="faq" n="06 — FAQ" title="Common questions">
              <div className="border-y border-ink/15">
                <FaqRow
                  q="Can you steal my keys?"
                  a="No. Keys never leave your browser, and there is no code path that transmits them. Audit the source or watch Network traffic to confirm."
                />
                <FaqRow
                  q="What if your servers get hacked?"
                  a="Attackers would still only get static files. The server never receives or processes keys — they exist only in your browser memory."
                />
                <FaqRow
                  q="Are vanity addresses less secure?"
                  a="No. The private key uses the same secure generation. Only the public address is filtered for your pattern."
                />
                <FaqRow
                  q="Do you collect any data?"
                  a="No. No database, analytics, or tracking. Everything runs in the browser."
                />
                <FaqRow
                  q="Should I use this for large amounts?"
                  a="For significant funds: generate offline, test with a small transfer first, and prefer a hardware wallet for long-term storage."
                />
              </div>
            </Section>

            <FadeIn>
              <section className="border-t border-ink/15 pt-10 pb-4">
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-3">Still questions?</p>
                <h2 className="font-display text-xl font-semibold text-ink normal-case mb-3">
                  Talk to us carefully
                </h2>
                <p className="text-muted mb-6 max-w-xl leading-relaxed">
                  Security comes first. For vulnerabilities, use responsible disclosure — not public
                  issues. See SECURITY.md / GitHub Advisories.
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <a
                    href="/audit"
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    Live audit
                  </a>
                  <a href="/faq" className="text-muted hover:text-ink">
                    FAQ
                  </a>
                  <a href="/how-it-works" className="text-muted hover:text-ink">
                    How it works
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
