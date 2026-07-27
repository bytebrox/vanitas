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
  DocSearchLoop,
  DocDifficultyScale,
  DocWorkerPool,
  DocProofSplit,
} from '@/components';

const toc = [
  { id: 'overview', label: 'Overview', n: '01' },
  { id: 'pipeline', label: 'Pipeline', n: '02' },
  { id: 'patterns', label: 'Patterns', n: '03' },
  { id: 'chains', label: 'Chains', n: '04' },
  { id: 'modes', label: 'Modes', n: '05' },
  { id: 'workers', label: 'Workers', n: '06' },
  { id: 'proof', label: 'Proof', n: '07' },
  { id: 'cli', label: 'CLI', n: '08' },
  { id: 'verify', label: 'Verify', n: '09' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-how-wide.webp"
        eyebrow="Docs"
        title="How it works"
        description="A full tour of Vanitas: how vanity mining works, what each forge produces, how workers search in parallel, and how to verify that nothing leaves your machine."
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-figure.webp" caption="Fig. III — Orator">
          <DocsToc items={toc} />

          <div className="space-y-2">
            <FadeIn>
              <DocSection id="overview" n="01 — Overview" title="What Vanitas is" glyph="key" glyphLabel="Fig. A — Key">
                <p>
                  <strong className="text-ink">Vanitas</strong> is a client-side multi-chain vanity
                  address forge. You choose a prefix and/or suffix; the app searches for a keypair
                  whose public address matches that pattern. Generation runs in{' '}
                  <strong className="text-ink">Web Workers on your CPU</strong>. Private keys are
                  created in memory on your device and are never uploaded.
                </p>
                <p>
                  A vanity address is still a normal cryptographic address. The private key is
                  random; only the <em>public</em> encoding is filtered until it looks the way you
                  want — useful for branding, donations, mints, and memorable public wallets.
                </p>
                <div className="border-y border-ink/15 divide-y divide-ink/10">
                  <DocLedgerRow
                    label="Where"
                    value="Your browser · your CPU"
                    note="Static hosting only; mining makes no network calls"
                  />
                  <DocLedgerRow
                    label="Forges"
                    value="9 chains + terminal CLI"
                    note="Solana · EVM · Bitcoin · Tron · Aptos · Sui · TON · Cardano · XRP"
                  />
                  <DocLedgerRow
                    label="Output"
                    value="Address + private key"
                    note="Export formats depend on the forge (JSON, hex, WIF, …)"
                  />
                </div>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="pipeline" n="02 — Pipeline" title="The search loop" glyph="loop" glyphLabel="Fig. B — Loop">
                <p>Every forge follows the same high-level loop, repeated millions of times:</p>
                <DocSearchLoop />
                <ol className="list-decimal list-inside space-y-2 text-sm sm:text-body">
                  <li>
                    Draw a cryptographically secure random private key (
                    <code className="font-mono text-ink text-sm">crypto.getRandomValues</code>).
                  </li>
                  <li>Derive the public key with the chain&apos;s curve (Ed25519 or secp256k1).</li>
                  <li>Encode the address the way that chain expects (Base58, hex, bech32, …).</li>
                  <li>Compare against your prefix / suffix (and mode rules).</li>
                  <li>On match: stop workers, show the result, optional sound / proof / export.</li>
                </ol>
                <p>
                  Workers run this loop in parallel across CPU cores. The UI thread stays responsive;
                  progress (attempts, rate, ETA) is aggregated from worker messages. When one worker
                  finds a hit, the pool is terminated.
                </p>
                <DocSubheading>Why this is secure</DocSubheading>
                <p>
                  Searching for a vanity address does <strong className="text-ink">not</strong>{' '}
                  weaken the private key. You are rejecting candidates until the public address
                  looks right — the same process as generating random keys and keeping the lucky
                  one. Security comes from 256-bit entropy and a proper CSPRNG, not from how random
                  the address <em>looks</em>.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="patterns" n="03 — Patterns" title="Difficulty, alphabets, warnings" glyph="hourglass" glyphLabel="Fig. C — Time">
                <p>
                  Expected time scales with pattern length and alphabet size. Each extra character
                  multiplies the search space. The forge UI shows a live difficulty estimate based
                  on your pattern and a measured or assumed hash rate.
                </p>
                <DocDifficultyScale />
                <div className="border-y border-ink/15">
                  <DocLedgerRow
                    label="Base58"
                    value="~58 symbols"
                    note="Solana, Tron, XRP (XRPL alphabet), Bitcoin legacy"
                  />
                  <DocLedgerRow
                    label="Hex"
                    value="16 symbols (0–9, a–f)"
                    note="EVM, Aptos, Sui — case-insensitive for matching"
                  />
                  <DocLedgerRow
                    label="Bech32"
                    value="bc1q / bc1p / addr1…"
                    note="Bitcoin SegWit/Taproot, Cardano — fixed HRP, then charset"
                  />
                  <DocLedgerRow
                    label="TON"
                    value="Base64url"
                    note="UQ… / EQ… — case-sensitive"
                  />
                </div>
                <DocSubheading>Alphabet traps</DocSubheading>
                <ul className="space-y-2 text-sm sm:text-body">
                  <li>
                    <strong className="text-ink">Solana / Bitcoin Base58</strong> — no{' '}
                    <code className="font-mono text-ink">0</code>,{' '}
                    <code className="font-mono text-ink">O</code>,{' '}
                    <code className="font-mono text-ink">I</code>, or{' '}
                    <code className="font-mono text-ink">l</code> (look-alike rejection).
                  </li>
                  <li>
                    <strong className="text-ink">EVM</strong> — only hex after{' '}
                    <code className="font-mono text-ink">0x</code>. Letters beyond{' '}
                    <code className="font-mono text-ink">a–f</code> are invalid.
                  </li>
                  <li>
                    <strong className="text-ink">Tron</strong> — addresses start with{' '}
                    <code className="font-mono text-ink">T</code>; the next character is usually
                    uppercase. Case-sensitive lowercase prefixes often never match.
                  </li>
                  <li>
                    <strong className="text-ink">Prefix + suffix</strong> — both constraints multiply
                    difficulty. Start short; grow the pattern once you know your rate.
                  </li>
                </ul>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="chains" n="04 — Chains" title="Every forge, explained" glyph="colonnade" glyphLabel="Fig. D — Forges">
                <p>
                  Nine forges share the same UX pattern — pick a mode, set a pattern, start workers —
                  but each chain uses different curves, hashes, and address encodings.
                </p>

                <DocSubheading>
                  <a href="/sol" className="hover:text-accent">
                    Solana
                  </a>
                </DocSubheading>
                <p>
                  Ed25519 keypairs encoded as Base58 (32-byte public key). Native Web Crypto Ed25519
                  is used when the browser supports it; otherwise a WASM fallback (
                  <code className="font-mono text-sm text-ink">watsign</code>). Modes:{' '}
                  <strong className="text-ink">wallet</strong> and{' '}
                  <strong className="text-ink">mint</strong> — same key math; mint framing is for
                  launchpad custom-mint flows. Export: Solana CLI JSON byte array.
                </p>

                <DocSubheading>
                  <a href="/evm" className="hover:text-accent">
                    EVM
                  </a>
                </DocSubheading>
                <p>
                  secp256k1 → uncompressed pubkey → keccak-256 → last 20 bytes →{' '}
                  <code className="font-mono text-sm text-ink">0x…</code> address. One private key
                  yields the same address on Ethereum, Base, Arbitrum, Optimism, BSC, Polygon, and
                  every other EVM network. Modes: wallet (EOA), CREATE at nonce 0, CREATE2 (grind
                  salt or grind deployer). See Modes below.
                </p>

                <DocSubheading>
                  <a href="/btc" className="hover:text-accent">
                    Bitcoin
                  </a>
                </DocSubheading>
                <p>
                  secp256k1. Three address types: legacy P2PKH (
                  <code className="font-mono text-sm text-ink">1…</code>), native SegWit P2WPKH (
                  <code className="font-mono text-sm text-ink">bc1q…</code>), Taproot P2TR (
                  <code className="font-mono text-sm text-ink">bc1p…</code>). Export includes WIF
                  (compressed) for wallet import. Leading HRP / version byte is handled for you when
                  typing prefixes.
                </p>

                <DocSubheading>
                  <a href="/tron" className="hover:text-accent">
                    Tron
                  </a>
                </DocSubheading>
                <p>
                  Same secp256k1 + keccak path as EVM for the 20-byte account ID, then Base58Check
                  with version byte <code className="font-mono text-sm text-ink">0x41</code> →{' '}
                  <code className="font-mono text-sm text-ink">T…</code>. Modes: wallet and CREATE
                  (nonce 0), using the same RLP layout as EVM then Tron encoding.
                </p>

                <DocSubheading>
                  <a href="/aptos" className="hover:text-accent">
                    Aptos
                  </a>
                </DocSubheading>
                <p>
                  Ed25519. Address ={' '}
                  <code className="font-mono text-sm text-ink">sha3-256(pubkey ‖ 0x00)</code> as hex.
                  Compatible with Petra, Martian, and other Aptos wallets that import hex secrets.
                </p>

                <DocSubheading>
                  <a href="/sui" className="hover:text-accent">
                    Sui
                  </a>
                </DocSubheading>
                <p>
                  Ed25519. Address ={' '}
                  <code className="font-mono text-sm text-ink">
                    blake2b-256(0x00 ‖ pubkey)
                  </code>{' '}
                  as hex (flag byte marks the scheme). Import into Sui Wallet / Suiet with the hex
                  private key.
                </p>

                <DocSubheading>
                  <a href="/ton" className="hover:text-accent">
                    TON
                  </a>
                </DocSubheading>
                <p>
                  Ed25519 + Wallet contract v4R2. Addresses are user-friendly Base64url forms:{' '}
                  <code className="font-mono text-sm text-ink">UQ…</code> (non-bounceable) and{' '}
                  <code className="font-mono text-sm text-ink">EQ…</code> (bounceable). Matching is
                  case-sensitive. Import into Tonkeeper / MyTonWallet.
                </p>

                <DocSubheading>
                  <a href="/cardano" className="hover:text-accent">
                    Cardano
                  </a>
                </DocSubheading>
                <p>
                  Ed25519 enterprise address (CIP-19 type 6, payment key only): header{' '}
                  <code className="font-mono text-sm text-ink">0x61</code> + Blake2b-224 payment hash,
                  bech32 with HRP <code className="font-mono text-sm text-ink">addr</code> →{' '}
                  <code className="font-mono text-sm text-ink">addr1…</code>.
                </p>

                <DocSubheading>
                  <a href="/xrp" className="hover:text-accent">
                    XRP
                  </a>
                </DocSubheading>
                <p>
                  secp256k1 compressed pubkey → RIPEMD160(SHA256) account ID → XRPL classic Base58
                  Check → <code className="font-mono text-sm text-ink">r…</code>. Note: XRPL uses a
                  different Base58 alphabet than Bitcoin.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="modes" n="05 — Modes" title="Wallet, mint, CREATE, CREATE2" glyph="modes" glyphLabel="Fig. E — Modes">
                <DocSubheading>Solana mint</DocSubheading>
                <p>
                  Cryptographically identical to a wallet keypair. Launchpads ask for a custom mint
                  keypair / private key; Vanitas labels the result as mint so the export matches that
                  workflow. Open{' '}
                  <a href="/sol?mode=mint" className="text-accent hover:text-ink">
                    /sol?mode=mint
                  </a>
                  , find a pattern, paste the key into pump.fun, Raydium, Meteora, etc.
                </p>

                <DocSubheading>EVM / Tron CREATE (nonce 0)</DocSubheading>
                <p>
                  The first contract deployed from an EOA with nonce 0 has a deterministic address:{' '}
                  <code className="font-mono text-sm text-ink">
                    keccak256(RLP([sender, 0]))[12:]
                  </code>
                  . Vanitas grinds EOAs until that derived contract address matches your pattern.
                  You receive the deployer private key — deploy once from a fresh nonce-0 account.
                </p>

                <DocSubheading>EVM CREATE2</DocSubheading>
                <p>
                  Address ={' '}
                  <code className="font-mono text-sm text-ink">
                    keccak256(0xff ‖ deployer ‖ salt ‖ initCodeHash)[12:]
                  </code>
                  . Two grind strategies:
                </p>
                <ul className="space-y-2 text-sm sm:text-body">
                  <li>
                    <strong className="text-ink">create2-salt</strong> — fix deployer key + init code
                    hash; search for a salt that yields the vanity address.
                  </li>
                  <li>
                    <strong className="text-ink">create2-deployer</strong> — fix salt + init code
                    hash; search for a deployer key whose CREATE2 address matches.
                  </li>
                </ul>
                <p>
                  You must supply a correct <code className="font-mono text-sm text-ink">initCodeHash</code>{' '}
                  (keccak of the deployment bytecode). Wrong hash → wrong on-chain address.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="workers" n="06 — Workers" title="Performance architecture" glyph="forge" glyphLabel="Fig. F — Forge">
                <p>
                  Worker sources live under{' '}
                  <code className="font-mono text-sm text-ink">src/workers/*.worker.source.ts</code>{' '}
                  and are bundled with esbuild into{' '}
                  <code className="font-mono text-sm text-ink">public/*-worker.js</code>. Each build
                  writes SHA-256 digests to{' '}
                  <code className="font-mono text-sm text-ink">public/worker-hash.json</code> for the{' '}
                  <a href="/audit" className="text-accent hover:text-ink">
                    live audit
                  </a>
                  .
                </p>
                <DocWorkerPool />
                <div className="border-y border-ink/15">
                  <DocLedgerRow
                    label="Parallelism"
                    value="CPU cores − 1 (default)"
                    note="Adjust threads if the machine heats up or the UI stutters"
                  />
                  <DocLedgerRow
                    label="Solana speed"
                    value="Native Ed25519 when available"
                    note="Chrome 113+ · Firefox 129+ · Safari 17+; else WASM"
                  />
                  <DocLedgerRow
                    label="Libraries"
                    value="@noble · tweetnacl · watsign · @ton/*"
                    note="Audited pure-JS / WASM crypto in the browser"
                  />
                </div>
                <p>
                  After a find, optional <strong className="text-ink">key security checks</strong>{' '}
                  probe entropy, CSPRNG availability, and a chi-square uniformity test on random
                  bytes — confirming the browser RNG path looks healthy.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="proof" n="07 — Proof" title="Proof of find" glyph="seal" glyphLabel="Fig. G — Seal">
                <p>
                  <strong className="text-ink">Share proof</strong> builds a public link to{' '}
                  <a href="/proof" className="text-accent hover:text-ink">
                    /proof
                  </a>{' '}
                  with chain, address, and pattern only —{' '}
                  <strong className="text-ink">never the private key</strong>. Anyone can open the
                  link and verify the address matches the claimed prefix/suffix client-side.
                </p>
                <DocProofSplit />
                <p>
                  Recent finds in the UI use <code className="font-mono text-sm text-ink">sessionStorage</code>{' '}
                  for address + pattern metadata only. Closing the tab clears that history; keys are
                  not stored there.
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="cli" n="08 — CLI" title="Terminal forge" glyph="stele" glyphLabel="Fig. H — Stele">
                <p>
                  Same idea outside the browser:{' '}
                  <code className="font-mono text-ink">npx vanitas</code> opens a wizard, or pass
                  flags for chain, mode, prefix, threads, and CREATE2 parameters. Results write a
                  JSON file with mode <code className="font-mono text-sm text-ink">0600</code> when the
                  OS supports it. Package:{' '}
                  <a
                    href="https://www.npmjs.com/package/vanitas"
                    className="text-accent hover:text-ink"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    npmjs.com/package/vanitas
                  </a>
                  .
                </p>
                <p className="font-mono text-sm text-ink/80">
                  npx vanitas evm --mode contract --prefix cafe --threads 8
                </p>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <DocSection id="verify" n="09 — Verify" title="Confirm it yourself" glyph="eye" glyphLabel="Fig. I — Eye">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Open DevTools → Network, clear the log, start a forge — you should see{' '}
                    <strong className="text-ink">no requests</strong> while mining.
                  </li>
                  <li>Load the page, go offline, generate again — it still works.</li>
                  <li>
                    Run the{' '}
                    <a href="/audit" className="text-accent hover:text-ink">
                      live audit
                    </a>{' '}
                    and compare worker hashes to{' '}
                    <code className="font-mono text-sm text-ink">worker-hash.json</code>.
                  </li>
                  <li>
                    Read the source on{' '}
                    <a
                      href="https://github.com/bytebrox/vanitas"
                      className="text-accent hover:text-ink"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>{' '}
                    — especially <code className="font-mono text-sm text-ink">src/workers/</code>.
                  </li>
                </ol>
              </DocSection>
            </FadeIn>

            <FadeIn>
              <section className="border-t border-ink/15 pt-10 pb-4">
                <p className="text-micro uppercase tracking-[0.2em] text-accent mb-3">Reminder</p>
                <p className="text-muted leading-relaxed mb-6">
                  Save your private key before closing the tab. Lost keys cannot be recovered. For
                  large balances: test with a small transfer first, prefer hardware wallets for
                  long-term custody, and never paste keys into untrusted sites.
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <a href="/security" className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent">
                    Security
                  </a>
                  <a href="/faq" className="text-muted hover:text-ink">
                    FAQ
                  </a>
                  <a href="/audit" className="text-muted hover:text-ink">
                    Live audit
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
