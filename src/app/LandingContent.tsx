'use client';

/**
 * Landing — single viewport: hero image + two forge boxes + footer
 * On short phones, main scrolls inside the viewport so CTAs stay reachable.
 */

import { Navbar, Footer } from '@/components';

const PAPER = '#F5F0E8';

export function LandingContent() {
  return (
    <div
      className="h-dvh max-h-dvh flex flex-col overflow-hidden"
      style={{ backgroundColor: PAPER }}
    >
      <Navbar />

      <main className="relative flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain">
        {/* Full-bleed hero plane */}
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

        {/* Content over hero */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] pb-4 sm:pb-6">
          <div className="w-full max-w-5xl mx-auto my-auto">
            <header className="text-center mb-4 sm:mb-8 animate-fade-in-up">
              <p className="inline-block text-[0.65rem] sm:text-micro uppercase tracking-[0.18em] sm:tracking-[0.2em] text-ink/80 mb-2 sm:mb-3 px-2.5 sm:px-3 py-1 rounded-md bg-paper/80 backdrop-blur-sm border border-ink/10">
                Client-side vanity forge
              </p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink normal-case leading-tight drop-shadow-sm">
                Vanitas
              </h1>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 animate-fade-in-up">
              <a
                href="/sol"
                className="landing-forge-box group flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-6 min-h-0 sm:min-h-[10rem] active:scale-[0.99] transition-transform"
              >
                <div className="relative z-[1]">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5 sm:mb-2">Solana</p>
                  <p className="font-display text-lg sm:text-2xl font-semibold text-ink normal-case tracking-tight mb-1.5 sm:mb-2">
                    Wallet &amp; mint
                  </p>
                  <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                    <span className="sm:hidden">Base58 vanity wallets and token mints — in this browser.</span>
                    <span className="hidden sm:inline">
                      Forge Base58 vanity wallets and token mints entirely in this browser.
                    </span>
                  </p>
                </div>
                <p className="relative z-[1] mt-3 sm:mt-4 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
                  Enter forge →
                </p>
              </a>

              <a
                href="/eth"
                className="landing-forge-box group flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-6 min-h-0 sm:min-h-[10rem] active:scale-[0.99] transition-transform"
              >
                <div className="relative z-[1]">
                  <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5 sm:mb-2">Ethereum</p>
                  <p className="font-display text-lg sm:text-2xl font-semibold text-ink normal-case tracking-tight mb-1.5 sm:mb-2">
                    Wallet &amp; contract
                  </p>
                  <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                    <span className="sm:hidden">0x vanity wallets and contracts — every EVM chain.</span>
                    <span className="hidden sm:inline">
                      Forge 0x vanity wallets and contracts — same key on every EVM chain.
                    </span>
                  </p>
                </div>
                <p className="relative z-[1] mt-3 sm:mt-4 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
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
