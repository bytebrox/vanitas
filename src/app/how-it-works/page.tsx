'use client';

import { Footer, FadeIn, PageIntro, ContentWithSide } from '@/components';

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FadeIn>
      <section className="border-t border-ink/15 pt-10">
        <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{n}</p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink normal-case mb-5">
          {title}
        </h2>
        <div className="space-y-4 text-body text-muted leading-relaxed">{children}</div>
      </section>
    </FadeIn>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-how-wide.webp"
        eyebrow="Docs"
        title="How it works"
        description="Everything happens in your browser. No servers compute keys. No trust required."
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16">
        <ContentWithSide imageSrc="/ascii/side-figure.webp" caption="Fig. III — Orator">
          <div className="space-y-4">
            <Section n="01 — Performance" title="Native speed">
              <p>
                <strong className="text-ink">Vanitas</strong> runs generation in Web Workers on your CPU.
                The Solana forge uses the native Web Crypto Ed25519 path where available —
                up to <span className="text-ink">100,000+ keys/sec</span>, about{' '}
                <span className="text-ink">125×</span> faster than typical JS implementations.
                EVM, Bitcoin, and Tron forges use audited secp256k1 stacks with the same multi-core model.
              </p>
              <p className="font-mono text-sm text-ink/70">
                Multi-core · 100% local · four forges
              </p>
              <p>
                Chrome 113+, Firefox 129+, Safari 17+ use native Ed25519 for Solana. Older browsers fall back to WASM.
              </p>
            </Section>

            <Section n="02 — Security" title="Security first">
              <ul className="space-y-3">
                <li><strong className="text-ink">Client-side</strong> — generation runs in Web Workers on your device.</li>
                <li><strong className="text-ink">Open source</strong> — audit the code yourself.</li>
                <li><strong className="text-ink">No storage</strong> — keys live only in memory until you leave.</li>
                <li><strong className="text-ink">Offline</strong> — after load, disconnect to verify independence.</li>
              </ul>
            </Section>

            <Section n="03 — Verify" title="How to verify">
              <ol className="list-decimal list-inside space-y-2">
                <li>Open DevTools (F12) → Network</li>
                <li>Start generating an address</li>
                <li>Confirm: no requests during generation</li>
                <li>Optional: go offline and try again</li>
                <li>Or run the <a href="/audit" className="text-accent hover:text-ink">live audit</a></li>
              </ol>
            </Section>

            <Section n="04 — Architecture" title="Technical architecture">
              <p>
                <strong className="text-ink">Where?</strong> Your browser. The server only serves static files.
              </p>
              <p>
                <strong className="text-ink">Workers</strong> parallelize across your CPU cores — more cores, more speed.
                Each forge has its own worker bundle (`sol`, `evm`, `btc`, `tron`).
              </p>
              <p>
                <strong className="text-ink">Crypto</strong> — Solana: Ed25519 via Web Crypto (or WASM fallback).
                EVM / Bitcoin / Tron: secp256k1 (+ keccak where needed). Randomness from{' '}
                <span className="font-mono text-sm">crypto.getRandomValues</span>.
              </p>
            </Section>

            <Section n="05 — Roles" title="Server vs browser">
              <div className="grid sm:grid-cols-2 gap-8 font-mono text-sm">
                <div>
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-3">Server</p>
                  <ul className="space-y-2">
                    <li>Static files only</li>
                    <li>No computation</li>
                    <li>No key access</li>
                    <li>No data storage</li>
                  </ul>
                </div>
                <div>
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-3">Your browser</p>
                  <ul className="space-y-2 text-ink">
                    <li>Runs all JavaScript</li>
                    <li>Executes workers</li>
                    <li>Generates keys</li>
                    <li>Uses your CPU</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section n="06 — CSP" title="Content Security Policy">
              <p>Strict headers block external scripts, outbound APIs, data exfiltration, and iframe embedding.</p>
            </Section>

            <Section n="07 — Modes" title="Mint, contract, and chain formats">
              <p>
                <strong className="text-ink">Solana mint</strong> — vanity mint addresses for pump.fun, Raydium, Meteora, and other launchpads.
                Open <a href="/sol?mode=mint" className="text-accent hover:text-ink">/sol</a> (Mint mode), copy the private key, paste into the launchpad custom-mint field.
              </p>
              <p>
                <strong className="text-ink">EVM</strong> — wallet, CREATE (nonce 0), and CREATE2 (grind salt or deployer) on{' '}
                <a href="/evm" className="text-accent hover:text-ink">/evm</a>.
              </p>
              <p>
                <strong className="text-ink">Bitcoin</strong> — legacy <span className="font-mono text-sm">1…</span>, SegWit{' '}
                <span className="font-mono text-sm">bc1q…</span>, Taproot <span className="font-mono text-sm">bc1p…</span> on{' '}
                <a href="/btc" className="text-accent hover:text-ink">/btc</a> (WIF export).
              </p>
              <p>
                <strong className="text-ink">Tron</strong> — wallet or CREATE (nonce 0) Base58Check <span className="font-mono text-sm">T…</span> on{' '}
                <a href="/tron" className="text-accent hover:text-ink">/tron</a>.
              </p>
              <p>
                <strong className="text-ink">Aptos / Sui</strong> — hex account addresses on{' '}
                <a href="/aptos" className="text-accent hover:text-ink">/aptos</a> and{' '}
                <a href="/sui" className="text-accent hover:text-ink">/sui</a>.
              </p>
            </Section>

            <Section n="08 — Quality" title="Key security check">
              <p>After each find we check entropy, CSPRNG path, sample randomness, and chi-square distribution.</p>
            </Section>

            <FadeIn>
              <section className="border-t border-ink/15 pt-10 pb-4">
                <p className="text-micro uppercase tracking-[0.2em] text-accent mb-3">Reminder</p>
                <p className="text-muted leading-relaxed">
                  Save your private key before closing the page. Lost keys cannot be recovered.
                </p>
              </section>
            </FadeIn>
          </div>
        </ContentWithSide>
      </main>

      <Footer />
    </div>
  );
}
