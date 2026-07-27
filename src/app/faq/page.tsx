'use client';

import { useState, type ReactNode } from 'react';
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

interface FAQItem {
  question: string;
  answer: ReactNode;
}

interface FAQCategory {
  id: string;
  n: string;
  label: string;
  items: FAQItem[];
}

const FAQ_GLYPHS: Record<string, { id: DocGlyphId; label: string }> = {
  general: { id: 'scroll', label: 'Fig. — Scroll' },
  solana: { id: 'colonnade', label: 'Fig. — Colonnade' },
  evm: { id: 'modes', label: 'Fig. — Modes' },
  bitcoin: { id: 'key', label: 'Fig. — Key' },
  tron: { id: 'forge', label: 'Fig. — Forge' },
  'aptos-sui': { id: 'loop', label: 'Fig. — Loop' },
  'ton-cardano-xrp': { id: 'stele', label: 'Fig. — Stele' },
  security: { id: 'shield', label: 'Fig. — Shield' },
  'proof-cli': { id: 'seal', label: 'Fig. — Seal' },
  usage: { id: 'hourglass', label: 'Fig. — Time' },
};

const categories: FAQCategory[] = [
  {
    id: 'general',
    n: '01',
    label: 'General',
    items: [
      {
        question: 'What is a vanity address?',
        answer: (
          <p>
            A cryptocurrency address that contains a pattern you choose — for example starting with{' '}
            <code className="font-mono text-ink">VANI</code> on Solana or{' '}
            <code className="font-mono text-ink">0xcafe</code> on EVM. It is cosmetic branding on top
            of a normal keypair.
          </p>
        ),
      },
      {
        question: 'Does Vanitas create “fake” addresses?',
        answer: (
          <p>
            No. Every forge produces standard keys for that chain. Import into a matching wallet and
            they work like any randomly generated address — they just look intentional.
          </p>
        ),
      },
      {
        question: 'Which forges exist?',
        answer: (
          <p>
            Nine web forges — Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano, XRP — plus{' '}
            <code className="font-mono text-ink">npx vanitas</code> for the terminal. See{' '}
            <a href="/how-it-works#chains" className="text-accent hover:underline">
              How it works → Chains
            </a>
            .
          </p>
        ),
      },
      {
        question: 'How long will my pattern take?',
        answer: (
          <p>
            Expected attempts grow exponentially with length and alphabet size. Hex (16 chars) is
            denser than Base58 (~58). Use the on-page difficulty estimate; start with 3–4 characters
            before chasing long brands.
          </p>
        ),
      },
      {
        question: 'Can I use prefix and suffix together?',
        answer: (
          <p>
            Yes — both constraints multiply difficulty. Prefer one strong side (prefix <em>or</em>{' '}
            suffix) unless you have time and hash rate to spare.
          </p>
        ),
      },
    ],
  },
  {
    id: 'solana',
    n: '02',
    label: 'Solana',
    items: [
      {
        question: 'What does the Solana forge produce?',
        answer: (
          <p>
            Ed25519 keypairs as Base58 addresses (same family as Phantom / Solflare). Export as
            Solana CLI JSON byte arrays for easy import.
          </p>
        ),
      },
      {
        question: 'Wallet vs mint mode?',
        answer: (
          <p>
            Same cryptography. <strong className="text-ink">Wallet</strong> is for personal
            addresses; <strong className="text-ink">Mint</strong> is labeled for launchpad custom-mint
            fields (pump.fun, Raydium, Meteora, …). Open{' '}
            <a href="/sol?mode=mint" className="text-accent hover:underline">
              /sol?mode=mint
            </a>
            .
          </p>
        ),
      },
      {
        question: 'Why can’t I use 0, O, I, or l?',
        answer: (
          <p>
            Base58 excludes look-alike characters. Patterns containing them can never appear in a
            real Solana address.
          </p>
        ),
      },
      {
        question: 'Do mints need to end with “pump”?',
        answer: (
          <p>
            No. That suffix is marketing, not a protocol rule. Any valid Base58 vanity pattern works
            if the launchpad accepts a custom mint keypair.
          </p>
        ),
      },
    ],
  },
  {
    id: 'evm',
    n: '03',
    label: 'EVM',
    items: [
      {
        question: 'Which networks does an EVM vanity key work on?',
        answer: (
          <div className="space-y-2">
            <p>
              All EVM-compatible chains share the same address derivation. One key → one{' '}
              <code className="font-mono text-ink">0x</code> address on Ethereum, Base, Arbitrum,
              Optimism, BSC, Polygon, Avalanche C-Chain, and others.
            </p>
          </div>
        ),
      },
      {
        question: 'What are wallet, CREATE, and CREATE2 modes?',
        answer: (
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong className="text-ink">Wallet</strong> — vanity EOA address.
            </li>
            <li>
              <strong className="text-ink">CREATE</strong> — vanity address of the first contract
              from that key (nonce 0).
            </li>
            <li>
              <strong className="text-ink">CREATE2</strong> — grind salt (fixed deployer) or grind
              deployer (fixed salt) given an init code hash.
            </li>
          </ul>
        ),
      },
      {
        question: 'Do I need a separate BNB generator?',
        answer: (
          <p>
            No for BNB Smart Chain (EVM). Old Beacon Chain <code className="font-mono text-ink">bnb1</code>{' '}
            bech32 addresses are out of scope.
          </p>
        ),
      },
    ],
  },
  {
    id: 'bitcoin',
    n: '04',
    label: 'Bitcoin',
    items: [
      {
        question: 'Which address types are supported?',
        answer: (
          <p>
            Mainnet legacy <code className="font-mono text-ink">1…</code>, SegWit{' '}
            <code className="font-mono text-ink">bc1q…</code>, and Taproot{' '}
            <code className="font-mono text-ink">bc1p…</code>. Export includes compressed WIF.
          </p>
        ),
      },
      {
        question: 'Do I type the leading 1 / bc1q myself?',
        answer: (
          <p>
            Optional. The UI auto-prepends the fixed version / HRP when your prefix does not already
            include it.
          </p>
        ),
      },
      {
        question: 'Lightning invoices?',
        answer: <p>Out of scope — forge addresses, not BOLTs.</p>,
      },
    ],
  },
  {
    id: 'tron',
    n: '05',
    label: 'Tron',
    items: [
      {
        question: 'What do I get from the Tron forge?',
        answer: (
          <p>
            Mainnet Base58Check <code className="font-mono text-ink">T…</code> addresses from
            secp256k1 keys — wallet or CREATE (nonce 0). Leading{' '}
            <code className="font-mono text-ink">T</code> is added automatically for prefixes.
          </p>
        ),
      },
      {
        question: 'Why does a lowercase case-sensitive prefix never find?',
        answer: (
          <p>
            After <code className="font-mono text-ink">T</code>, the next character is almost always
            uppercase or a digit. Leave case sensitivity off unless you need an exact case match.
            Base58 also excludes O, I, l.
          </p>
        ),
      },
    ],
  },
  {
    id: 'aptos-sui',
    n: '06',
    label: 'Aptos & Sui',
    items: [
      {
        question: 'How do Aptos and Sui differ?',
        answer: (
          <p>
            Both use Ed25519 and hex addresses, but hashing differs: Aptos uses{' '}
            <code className="font-mono text-sm text-ink">sha3-256(pubkey ‖ 0x00)</code>; Sui uses{' '}
            <code className="font-mono text-sm text-ink">blake2b-256(0x00 ‖ pubkey)</code>. Keys are
            not interchangeable across ecosystems.
          </p>
        ),
      },
      {
        question: 'Which wallets can import them?',
        answer: (
          <p>
            Aptos: Petra, Martian, and similar. Sui: Sui Wallet, Suiet, and others that accept hex
            private keys.
          </p>
        ),
      },
    ],
  },
  {
    id: 'ton-cardano-xrp',
    n: '07',
    label: 'TON · Cardano · XRP',
    items: [
      {
        question: 'TON UQ vs EQ?',
        answer: (
          <p>
            Non-bounceable (<code className="font-mono text-ink">UQ…</code>) vs bounceable (
            <code className="font-mono text-ink">EQ…</code>) user-friendly forms of Wallet v4R2.
            Matching is case-sensitive.
          </p>
        ),
      },
      {
        question: 'What Cardano address type is forged?',
        answer: (
          <p>
            Enterprise mainnet <code className="font-mono text-ink">addr1…</code> (CIP-19 type 6 —
            payment key only, no stake delegation in the address).
          </p>
        ),
      },
      {
        question: 'Is XRP the same Base58 as Bitcoin?',
        answer: (
          <p>
            No. XRPL classic addresses use a different Base58 alphabet. Vanitas encodes{' '}
            <code className="font-mono text-ink">r…</code> classics from secp256k1 keys.
          </p>
        ),
      },
    ],
  },
  {
    id: 'security',
    n: '08',
    label: 'Security',
    items: [
      {
        question: 'Do you store my private keys?',
        answer: (
          <p>
            No. Keys never leave the browser memory of your session. See the{' '}
            <a href="/security" className="text-accent hover:underline">
              Security
            </a>{' '}
            page for architecture and threat model.
          </p>
        ),
      },
      {
        question: 'How do I verify that?',
        answer: (
          <ol className="list-decimal list-inside space-y-1">
            <li>DevTools → Network while mining — no key traffic</li>
            <li>Airplane mode after load</li>
            <li>
              <a href="/audit" className="text-accent hover:underline">
                Live audit
              </a>{' '}
              + worker hash compare
            </li>
          </ol>
        ),
      },
      {
        question: 'Are vanity keys weaker?',
        answer: (
          <p>
            No. Private keys still have full CSPRNG entropy. Only the public encoding is filtered.
          </p>
        ),
      },
      {
        question: 'What about browser extensions?',
        answer: (
          <p>
            Extensions can still snoop on a page. For high-value keys use a clean profile, the CLI,
            or an offline machine. Details:{' '}
            <a href="/security#browser" className="text-accent hover:underline">
              Security → Browser
            </a>
            .
          </p>
        ),
      },
      {
        question: 'Where do I report vulnerabilities?',
        answer: (
          <p>
            Private GitHub Security Advisories — never public issues. See{' '}
            <a href="/security#disclose" className="text-accent hover:underline">
              Security → Disclose
            </a>
            .
          </p>
        ),
      },
    ],
  },
  {
    id: 'proof-cli',
    n: '09',
    label: 'Proof & CLI',
    items: [
      {
        question: 'What is Proof of find?',
        answer: (
          <p>
            A shareable <a href="/proof" className="text-accent hover:underline">/proof</a> link
            with address + pattern (and optional stats). Anyone can verify the match client-side.
            Private keys are never included.
          </p>
        ),
      },
      {
        question: 'How do I run the CLI?',
        answer: (
          <p>
            <code className="font-mono text-ink">npx vanitas</code> for a wizard, or flags like{' '}
            <code className="font-mono text-sm text-ink">
              npx vanitas sol --prefix Ace --threads 8
            </code>
            . Supports the same deploy modes as the web app (mint, CREATE, CREATE2 flags).
          </p>
        ),
      },
    ],
  },
  {
    id: 'usage',
    n: '10',
    label: 'Usage',
    items: [
      {
        question: 'How do I import into Phantom / MetaMask / etc.?',
        answer: (
          <p>
            Use the export format for that forge: Solana JSON for Phantom/Solflare, hex for most EVM
            wallets, WIF for many Bitcoin wallets, chain-specific hex/Base58 elsewhere. Always do a
            tiny test transfer first.
          </p>
        ),
      },
      {
        question: 'Can I pause and resume?',
        answer: (
          <p>
            You can stop anytime; resume is a fresh search (no checkpoint of prior attempts).
          </p>
        ),
      },
      {
        question: 'Why is Start disabled?',
        answer: (
          <p>
            Empty pattern, invalid characters for that alphabet, or pattern too long. Fix the
            validation message under the inputs.
          </p>
        ),
      },
      {
        question: 'UI freezes while mining?',
        answer: (
          <p>
            Lower the thread count. Workers should keep the UI alive, but saturating every core on a
            small laptop can still feel sluggish.
          </p>
        ),
      },
    ],
  },
];

const toc = categories.map((c) => ({ id: c.id, label: c.label, n: c.n }));

function FaqAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      {items.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.question} className="border-b border-ink/15">
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
              <div className="pb-5 pr-4 sm:pr-8 text-muted leading-relaxed">{faq.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-faq-wide.webp"
        eyebrow="Docs"
        title="FAQ"
        description="Answers across every forge — patterns, modes, security, proof links, CLI, and day-to-day usage. Use the submenu to jump by topic."
      />

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-20">
        <ContentWithSide imageSrc="/ascii/side-landscape.webp" caption="Fig. IV — Landscape">
          <DocsToc items={toc} label="Topics" />

          <div className="space-y-2">
            {categories.map((cat) => {
              const glyph = FAQ_GLYPHS[cat.id];
              return (
              <FadeIn key={cat.id}>
                <section id={cat.id} className={`border-t border-ink/15 pt-10 ${DOC_SECTION_SCROLL_MT}`}>
                  {glyph ? (
                    <div className="relative z-[1] flex flex-col items-center text-center mb-8 sm:mb-10">
                      <DocGlyph
                        id={glyph.id}
                        label={glyph.label}
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
                <p className="text-micro uppercase tracking-[0.2em] text-muted mb-3">Still stuck?</p>
                <p className="text-muted mb-6 max-w-xl leading-relaxed">
                  Deep technical detail lives in How it works. Trust model and threat notes live on
                  Security. Integrity checks live on Audit.
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-micro uppercase tracking-[0.16em]">
                  <a
                    href="/how-it-works"
                    className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
                  >
                    How it works
                  </a>
                  <a href="/security" className="text-muted hover:text-ink">
                    Security
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
