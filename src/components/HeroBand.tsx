'use client';

import { Navbar } from './Navbar';
import { useHeroScrollFade } from '@/hooks/useHeroScrollFade';
import {
  SolanaLogo,
  EvmChainLogos,
  BitcoinLogo,
  TronLogo,
  AptosLogo,
  SuiLogo,
  TonLogo,
  CardanoLogo,
  XrpLogo,
} from './ChainLogos';

interface HeroBandProps {
  imageSrc: string;
  /** Centered page label on the hero */
  title?: string;
  eyebrow?: string;
  /** Official chain mark(s) with the title */
  chain?: 'sol' | 'evm' | 'btc' | 'tron' | 'aptos' | 'sui' | 'ton' | 'cardano' | 'xrp';
  /** Anchor for the scroll cue */
  scrollHref?: string;
  scrollLabel?: string;
}

/**
 * Full-width hero — image keeps its natural aspect (fully visible).
 * Paper fades use CSS vars so dark mode applies on first paint (no light flash).
 */
export function HeroBand({
  imageSrc,
  title,
  eyebrow,
  chain,
  scrollHref = '#content',
  scrollLabel = 'Scroll down',
}: HeroBandProps) {
  const { ref, imageOpacity, progress } = useHeroScrollFade();
  const showOverlay = Boolean(title);

  return (
    <>
      <Navbar />
      <div ref={ref} className="relative w-full overflow-hidden bg-paper">
        <div
          className="will-change-[opacity,transform] relative"
          style={{
            opacity: imageOpacity,
            transform: `translateY(${progress * 8}px)`,
            transition: 'opacity 60ms linear, transform 60ms linear',
            WebkitMaskImage:
              'linear-gradient(to bottom, #000 0%, #000 42%, rgba(0,0,0,0.85) 58%, rgba(0,0,0,0.35) 78%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, #000 0%, #000 42%, rgba(0,0,0,0.85) 58%, rgba(0,0,0,0.35) 78%, transparent 100%)',
          }}
        >
          <img
            src={imageSrc}
            alt=""
            className="block w-full h-auto select-none ascii-hero"
            draggable={false}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] sm:h-[42%] hero-fade-bottom"
          aria-hidden
        />

        {showOverlay ? (
          <div className="pointer-events-none absolute inset-0 z-[5] hero-fade-top" aria-hidden />
        ) : null}

        {showOverlay && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-5 text-center pt-20 sm:pt-20 pb-12 sm:pb-16"
            style={{
              opacity: Math.max(0, 1 - progress * 1.35),
              transform: `translateY(${progress * 24}px)`,
              transition: 'opacity 60ms linear, transform 60ms linear',
            }}
          >
            <div className="hero-text-veil flex flex-col items-center px-6 py-5 sm:px-10 sm:py-7">
            {eyebrow && (
              <p className="text-[0.65rem] sm:text-micro uppercase tracking-[0.2em] sm:tracking-[0.22em] text-ink/80 mb-2 sm:mb-4">
                {eyebrow}
              </p>
            )}
            {chain === 'sol' ||
            chain === 'btc' ||
            chain === 'tron' ||
            chain === 'aptos' ||
            chain === 'sui' ||
            chain === 'ton' ||
            chain === 'cardano' ||
            chain === 'xrp' ? (
              <div className="flex items-center justify-center gap-2.5 sm:gap-4 max-w-[16rem] sm:max-w-3xl">
                {chain === 'sol' && (
                  <SolanaLogo className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 drop-shadow-sm" />
                )}
                {chain === 'btc' && (
                  <BitcoinLogo className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 drop-shadow-sm" />
                )}
                {chain === 'tron' && (
                  <TronLogo className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 drop-shadow-sm" />
                )}
                {chain === 'aptos' && (
                  <AptosLogo className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 drop-shadow-sm" />
                )}
                {chain === 'sui' && (
                  <SuiLogo className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 drop-shadow-sm" />
                )}
                {chain === 'ton' && (
                  <TonLogo className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 drop-shadow-sm" />
                )}
                {chain === 'cardano' && (
                  <CardanoLogo className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 drop-shadow-sm" />
                )}
                {chain === 'xrp' && (
                  <XrpLogo className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 drop-shadow-sm" />
                )}
                <h1 className="font-display text-[2rem] leading-tight sm:text-5xl md:text-6xl font-semibold tracking-tight text-ink normal-case drop-shadow-sm">
                  {title}
                </h1>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5 sm:gap-3 max-w-[20rem] sm:max-w-3xl">
                <h1 className="font-display text-[2rem] leading-tight sm:text-5xl md:text-6xl font-semibold tracking-tight text-ink normal-case drop-shadow-sm">
                  {title}
                </h1>
                {chain === 'evm' && (
                  <>
                    <EvmChainLogos className="drop-shadow-sm [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-6 sm:[&_svg]:h-6" />
                    <p className="text-[0.65rem] sm:text-micro uppercase tracking-[0.14em] sm:tracking-[0.16em] text-ink/70 max-w-[18rem] sm:max-w-md leading-relaxed">
                      Ethereum · BNB · Base · Arbitrum · Optimism · + EVM
                    </p>
                  </>
                )}
              </div>
            )}
            <a
              href={scrollHref}
              className="mt-6 sm:mt-10 inline-flex flex-col items-center gap-1.5 sm:gap-2 text-[0.65rem] sm:text-micro uppercase tracking-[0.18em] sm:tracking-[0.2em] text-ink/80 hover:text-ink transition-colors min-h-11 justify-center"
            >
              <span>{scrollLabel}</span>
              <span className="hero-scroll-chevron text-base sm:text-lg leading-none" aria-hidden>
                ↓
              </span>
            </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
