'use client';

import { useFadeIn } from '@/hooks/useFadeIn';
import { HeroBand } from './HeroBand';

interface HeaderProps {
  imageSrc?: string;
  mode?: 'wallet' | 'mint' | 'eth';
}

export function Header({
  imageSrc = '/ascii/hero-wallet-wide.webp',
  mode = 'wallet',
}: HeaderProps) {
  const copy = useFadeIn();
  const isMint = mode === 'mint';
  const isEth = mode === 'eth';

  const heroEyebrow = isEth ? 'EVM forge' : isMint ? 'Mint forge' : 'Wallet forge';
  const heroTitle = isEth ? 'Ethereum' : 'Solana';

  const headline = isEth
    ? 'Name the 0x. Same key everywhere.'
    : isMint
      ? 'Name the mint. Launch with presence.'
      : 'Name the address. Keep the key.';

  const blurb = isEth
    ? 'Generate vanity Ethereum wallet or contract addresses — entirely in this browser. Works on every EVM chain.'
    : isMint
      ? 'Generate a vanity Solana mint for any launchpad — entirely in this browser.'
      : 'Generate a vanity Solana wallet address — entirely in this browser, on your CPU.';

  return (
    <div className="w-full">
      <HeroBand
        imageSrc={imageSrc}
        title={heroTitle}
        eyebrow={heroEyebrow}
        chain={isEth ? 'eth' : 'sol'}
        scrollHref="#forge"
        scrollLabel="Scroll to forge"
      />

      <div
        id="forge-intro"
        ref={copy.ref}
        className="relative z-10 -mt-8 sm:-mt-14 bg-transparent px-4 sm:px-8 lg:px-0 py-6 sm:py-12"
        style={{
          opacity: copy.isVisible ? 1 : 0,
          transform: copy.isVisible ? 'translateY(0)' : 'translateY(22px)',
          transition: 'opacity 0.7s ease-out 0.05s, transform 0.7s ease-out 0.05s',
        }}
      >
        <div className="lg:w-1/2 lg:pr-8 xl:pr-12">
          <div className="w-full max-w-xl xl:max-w-2xl lg:ml-auto lg:pl-8 text-left lg:text-right">
            <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-ink normal-case leading-tight mb-3 sm:mb-4">
              {headline}
            </h2>
            <p className="text-sm sm:text-lg text-muted max-w-2xl leading-relaxed lg:ml-auto">
              {blurb}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
