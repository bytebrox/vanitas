'use client';

/**
 * Landing — single viewport: hero image + forge boxes + footer
 */

import { Navbar, Footer } from '@/components';
import {
  SolanaLogo,
  EvmChainLogos,
  BitcoinLogo,
  TronLogo,
  AptosLogo,
  SuiLogo,
} from '@/components/ChainLogos';

const PAPER = '#F5F0E8';

export function LandingContent() {
  return (
    <div
      className="h-dvh max-h-dvh flex flex-col overflow-hidden"
      style={{ backgroundColor: PAPER }}
    >
      <Navbar />

      <main className="relative flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src="/ascii/hero-wallet-wide.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_30%] sm:object-center select-none"
            draggable={false}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom,
                ${PAPER}cc 0%,
                ${PAPER}66 28%,
                ${PAPER}99 72%,
                ${PAPER} 100%)`,
            }}
          />
        </div>

        <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] pb-4 sm:pb-6">
          <div className="w-full max-w-5xl mx-auto my-auto">
            <header className="text-center mb-4 sm:mb-6 animate-fade-in-up">
              <p className="inline-block text-[0.65rem] sm:text-micro uppercase tracking-[0.18em] sm:tracking-[0.2em] text-ink/80 mb-2 sm:mb-3 px-2.5 sm:px-3 py-1 rounded-md bg-paper/80 backdrop-blur-sm border border-ink/10">
                Client-side vanity forge
              </p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink normal-case leading-tight drop-shadow-sm">
                Vanitas
              </h1>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 animate-fade-in-up">
              <a
                href="/sol"
                className="landing-forge-box group flex flex-col justify-between px-4 py-3.5 sm:px-5 sm:py-5 min-h-0 active:scale-[0.99] transition-transform"
              >
                <div className="relative z-[1]">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5">Solana</p>
                  <div className="mb-2">
                    <SolanaLogo className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <p className="font-display text-lg sm:text-xl font-semibold text-ink normal-case tracking-tight mb-1">
                    Wallet &amp; mint
                  </p>
                  <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                    Base58 vanity wallets and token mints.
                  </p>
                </div>
                <p className="relative z-[1] mt-2.5 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
                  Enter forge →
                </p>
              </a>

              <a
                href="/evm"
                className="landing-forge-box group flex flex-col justify-between px-4 py-3.5 sm:px-5 sm:py-5 min-h-0 active:scale-[0.99] transition-transform"
              >
                <div className="relative z-[1]">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5">EVM</p>
                  <div className="mb-2" aria-label="Ethereum, BNB, Base, Arbitrum, Optimism">
                    <EvmChainLogos />
                  </div>
                  <p className="font-display text-lg sm:text-xl font-semibold text-ink normal-case tracking-tight mb-1">
                    Wallet &amp; contract
                  </p>
                  <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                    One 0x key for every EVM chain.
                  </p>
                </div>
                <p className="relative z-[1] mt-2.5 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
                  Enter forge →
                </p>
              </a>

              <a
                href="/btc"
                className="landing-forge-box group flex flex-col justify-between px-4 py-3.5 sm:px-5 sm:py-5 min-h-0 active:scale-[0.99] transition-transform"
              >
                <div className="relative z-[1]">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5">Bitcoin</p>
                  <div className="mb-2">
                    <BitcoinLogo className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <p className="font-display text-lg sm:text-xl font-semibold text-ink normal-case tracking-tight mb-1">
                    Legacy &amp; SegWit
                  </p>
                  <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                    Vanity 1… and bc1q… addresses.
                  </p>
                </div>
                <p className="relative z-[1] mt-2.5 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
                  Enter forge →
                </p>
              </a>

              <a
                href="/tron"
                className="landing-forge-box group flex flex-col justify-between px-4 py-3.5 sm:px-5 sm:py-5 min-h-0 active:scale-[0.99] transition-transform"
              >
                <div className="relative z-[1]">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5">Tron</p>
                  <div className="mb-2">
                    <TronLogo className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <p className="font-display text-lg sm:text-xl font-semibold text-ink normal-case tracking-tight mb-1">
                    Base58 wallet
                  </p>
                  <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                    Vanity T… addresses for TronLink.
                  </p>
                </div>
                <p className="relative z-[1] mt-2.5 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
                  Enter forge →
                </p>
              </a>

              <a
                href="/aptos"
                className="landing-forge-box group flex flex-col justify-between px-4 py-3.5 sm:px-5 sm:py-5 min-h-0 active:scale-[0.99] transition-transform"
              >
                <div className="relative z-[1]">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5">Aptos</p>
                  <div className="mb-2">
                    <AptosLogo className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <p className="font-display text-lg sm:text-xl font-semibold text-ink normal-case tracking-tight mb-1">
                    Ed25519 0x
                  </p>
                  <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                    Hex vanity for Petra &amp; Martian.
                  </p>
                </div>
                <p className="relative z-[1] mt-2.5 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
                  Enter forge →
                </p>
              </a>

              <a
                href="/sui"
                className="landing-forge-box group flex flex-col justify-between px-4 py-3.5 sm:px-5 sm:py-5 min-h-0 active:scale-[0.99] transition-transform"
              >
                <div className="relative z-[1]">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5">Sui</p>
                  <div className="mb-2">
                    <SuiLogo className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <p className="font-display text-lg sm:text-xl font-semibold text-ink normal-case tracking-tight mb-1">
                    Ed25519 0x
                  </p>
                  <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                    Hex vanity for Sui Wallet &amp; Suiet.
                  </p>
                </div>
                <p className="relative z-[1] mt-2.5 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
                  Enter forge →
                </p>
              </a>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-10 shrink-0 bg-paper/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
        <Footer compact />
      </div>
    </div>
  );
}
