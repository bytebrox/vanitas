'use client';

import { useFadeIn } from '@/hooks/useFadeIn';
import { HeroBand } from './HeroBand';

interface HeaderProps {
  imageSrc?: string;
  mode?: 'wallet' | 'mint' | 'evm' | 'btc' | 'tron' | 'aptos' | 'sui';
}

export function Header({
  imageSrc = '/ascii/hero-wallet-wide.webp',
  mode = 'wallet',
}: HeaderProps) {
  const copy = useFadeIn();

  const copyByMode = {
    wallet: {
      eyebrow: 'Wallet forge',
      title: 'Solana',
      chain: 'sol' as const,
      headline: 'Name the address. Keep the key.',
      blurb: 'Generate a vanity Solana wallet address — entirely in this browser, on your CPU.',
    },
    mint: {
      eyebrow: 'Mint forge',
      title: 'Solana',
      chain: 'sol' as const,
      headline: 'Name the mint. Launch with presence.',
      blurb: 'Generate a vanity Solana mint for any launchpad — entirely in this browser.',
    },
    evm: {
      eyebrow: '0x forge',
      title: 'EVM',
      chain: 'evm' as const,
      headline: 'Name the 0x. Same key everywhere.',
      blurb:
        'Generate vanity wallet or contract addresses — entirely in this browser. One key works on Ethereum, BNB Smart Chain, Base, Arbitrum, Optimism, and every other EVM chain.',
    },
    btc: {
      eyebrow: 'UTXO forge',
      title: 'Bitcoin',
      chain: 'btc' as const,
      headline: 'Name the coin. Own the address.',
      blurb:
        'Generate vanity Bitcoin addresses — legacy 1… or SegWit bc1q… — entirely in this browser. Keys never leave this device.',
    },
    tron: {
      eyebrow: 'T forge',
      title: 'Tron',
      chain: 'tron' as const,
      headline: 'Name the T. Keep the key.',
      blurb:
        'Generate vanity Tron Base58 addresses — entirely in this browser. Import into TronLink and other Tron wallets.',
    },
    aptos: {
      eyebrow: '0x forge',
      title: 'Aptos',
      chain: 'aptos' as const,
      headline: 'Name the 0x. Keep the key.',
      blurb:
        'Generate vanity Aptos Ed25519 addresses — entirely in this browser. Import into Petra, Martian, and other Aptos wallets.',
    },
    sui: {
      eyebrow: '0x forge',
      title: 'Sui',
      chain: 'sui' as const,
      headline: 'Name the 0x. Keep the key.',
      blurb:
        'Generate vanity Sui Ed25519 addresses — entirely in this browser. Import into Sui Wallet, Suiet, and other Sui wallets.',
    },
  };

  const c = copyByMode[mode];

  return (
    <div className="w-full">
      <HeroBand
        imageSrc={imageSrc}
        title={c.title}
        eyebrow={c.eyebrow}
        chain={c.chain}
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
              {c.headline}
            </h2>
            <p className="text-sm sm:text-lg text-muted max-w-2xl leading-relaxed lg:ml-auto">
              {c.blurb}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
