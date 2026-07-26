'use client';

/**
 * Landing — forge chooser over hero atmosphere
 */

import type { ReactNode } from 'react';
import { Navbar, Footer } from '@/components';
import {
  SolanaLogo,
  EvmChainLogos,
  BitcoinLogo,
  TronLogo,
  AptosLogo,
  SuiLogo,
  TonLogo,
  CardanoLogo,
} from '@/components/ChainLogos';

const PAPER = '#F5F0E8';

const FORGES: {
  href: string;
  name: string;
  title: string;
  blurb: string;
  logo: ReactNode;
}[] = [
  {
    href: '/sol',
    name: 'Solana',
    title: 'Wallet & mint',
    blurb: 'Base58 vanity wallets and token mints.',
    logo: <SolanaLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    href: '/evm',
    name: 'EVM',
    title: 'Wallet & contract',
    blurb: 'One 0x key for every EVM chain.',
    logo: (
      <span aria-label="Ethereum, BNB, Base, Arbitrum, Optimism">
        <EvmChainLogos />
      </span>
    ),
  },
  {
    href: '/btc',
    name: 'Bitcoin',
    title: 'Legacy · SegWit · Taproot',
    blurb: 'Vanity 1…, bc1q…, and bc1p… addresses.',
    logo: <BitcoinLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    href: '/tron',
    name: 'Tron',
    title: 'Wallet & CREATE',
    blurb: 'Vanity T… addresses for TronLink.',
    logo: <TronLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    href: '/aptos',
    name: 'Aptos',
    title: 'Ed25519 0x',
    blurb: 'Hex vanity for Petra & Martian.',
    logo: <AptosLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    href: '/sui',
    name: 'Sui',
    title: 'Ed25519 0x',
    blurb: 'Hex vanity for Sui Wallet & Suiet.',
    logo: <SuiLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    href: '/ton',
    name: 'TON',
    title: 'Wallet v4R2',
    blurb: 'Vanity UQ… / EQ… addresses.',
    logo: <TonLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
  {
    href: '/cardano',
    name: 'Cardano',
    title: 'Enterprise addr1',
    blurb: 'Bech32 vanity payment addresses.',
    logo: <CardanoLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  },
];

export function LandingContent() {
  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: PAPER }}>
      <Navbar />

      <main className="relative flex-1 flex flex-col">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src="/ascii/hero-wallet-wide.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_28%] sm:object-center select-none"
            draggable={false}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom,
                ${PAPER}e6 0%,
                ${PAPER}99 22%,
                ${PAPER}88 55%,
                ${PAPER}f2 82%,
                ${PAPER} 100%)`,
            }}
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col px-4 sm:px-8 lg:px-12 pt-[max(4.75rem,calc(env(safe-area-inset-top)+3.75rem))] pb-6 sm:pb-8">
          <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col sm:justify-center py-2 sm:py-4">
            <header className="mb-5 sm:mb-7 sm:text-center animate-fade-in-up">
              <p className="text-[0.65rem] sm:text-micro uppercase tracking-[0.18em] sm:tracking-[0.2em] text-ink/70 mb-2 sm:mb-3">
                Client-side vanity forge
              </p>
              <h1 className="font-display text-[1.75rem] sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink normal-case leading-tight drop-shadow-sm mb-1.5 sm:mb-2">
                Vanitas
              </h1>
              <p className="text-sm sm:text-base text-ink/75 leading-relaxed normal-case tracking-normal max-w-md sm:mx-auto">
                Pick a chain. Keys stay in this browser.
              </p>
            </header>

            {/* Mobile: compact stacked rows */}
            <div className="sm:hidden landing-forge-box divide-y divide-ink/12 animate-fade-in-up overflow-hidden">
              {FORGES.map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  className="flex items-center gap-3.5 px-3.5 py-3.5 active:bg-ink/[0.04] transition-colors"
                >
                  <div className="shrink-0 w-9 flex justify-center">{f.logo}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted mb-0.5">
                      {f.name}
                    </p>
                    <p className="font-display text-base font-semibold text-ink normal-case tracking-tight leading-snug">
                      {f.title}
                    </p>
                    <p className="text-[0.8rem] text-muted leading-snug normal-case tracking-normal mt-0.5 line-clamp-1">
                      {f.blurb}
                    </p>
                  </div>
                  <span className="shrink-0 text-ink/40 text-sm" aria-hidden>
                    →
                  </span>
                </a>
              ))}
            </div>

            {/* sm+: card grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-up">
              {FORGES.map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  className="landing-forge-box group flex flex-col justify-between px-5 py-5 min-h-0 active:scale-[0.99] transition-transform"
                >
                  <div className="relative z-[1]">
                    <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5">{f.name}</p>
                    <div className="mb-2">{f.logo}</div>
                    <p className="font-display text-xl font-semibold text-ink normal-case tracking-tight mb-1">
                      {f.title}
                    </p>
                    <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                      {f.blurb}
                    </p>
                  </div>
                  <p className="relative z-[1] mt-3 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
                    Enter forge →
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-10 shrink-0 bg-paper/95 backdrop-blur-sm border-t border-ink/10 pb-[env(safe-area-inset-bottom)]">
        <Footer compact />
      </div>
    </div>
  );
}
