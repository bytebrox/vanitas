'use client';

import { useFadeIn } from '@/hooks/useFadeIn';
import { HeroBand } from './HeroBand';

interface HeaderProps {
  imageSrc?: string;
  mode?: 'wallet' | 'mint';
}

export function Header({
  imageSrc = '/ascii/hero-wallet-wide.webp',
  mode = 'wallet',
}: HeaderProps) {
  const copy = useFadeIn();
  const isMint = mode === 'mint';

  return (
    <div className="w-full">
      <HeroBand imageSrc={imageSrc} />

      <div
        ref={copy.ref}
        className="relative z-10 -mt-14 sm:-mt-20 bg-transparent px-5 sm:px-8 lg:px-0 py-10 sm:py-14"
        style={{
          opacity: copy.isVisible ? 1 : 0,
          transform: copy.isVisible ? 'translateY(0)' : 'translateY(22px)',
          transition: 'opacity 0.7s ease-out 0.05s, transform 0.7s ease-out 0.05s',
        }}
      >
        <div className="lg:w-1/2 lg:pr-8 xl:pr-12 flex lg:justify-end">
          <div className="w-full max-w-xl xl:max-w-2xl lg:pl-8">
            <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">
              {isMint ? 'Token mint addresses' : 'Wallet addresses'}
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink normal-case leading-tight mb-4">
              {isMint
                ? 'Name the mint. Launch with presence.'
                : 'Name the address. Keep the key.'}
            </h1>
            <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed mb-8">
              {isMint
                ? 'Generate a vanity Solana mint for any launchpad — entirely in this browser.'
                : 'Generate a vanity Solana wallet address — entirely in this browser, on your CPU.'}
            </p>
            <a
              href="#forge"
              className="inline-block text-micro uppercase tracking-[0.2em] border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors"
            >
              Scroll to forge ↓
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
