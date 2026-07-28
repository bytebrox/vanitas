'use client';

import { useFadeIn } from '@/hooks/useFadeIn';
import { useTranslations } from 'next-intl';
import { HeroBand } from './HeroBand';

interface HeaderProps {
  imageSrc?: string;
  mode?: 'wallet' | 'mint' | 'evm' | 'btc' | 'tron' | 'aptos' | 'sui' | 'ton' | 'cardano' | 'xrp';
}

export function Header({
  imageSrc = '/ascii/hero-wallet-wide.webp',
  mode = 'wallet',
}: HeaderProps) {
  const copy = useFadeIn();
  const t = useTranslations('forge.header');
  const tf = useTranslations('forge');
  const tc = useTranslations('common');

  const chainByMode = {
    wallet: 'sol',
    mint: 'sol',
    evm: 'evm',
    btc: 'btc',
    tron: 'tron',
    aptos: 'aptos',
    sui: 'sui',
    ton: 'ton',
    cardano: 'cardano',
    xrp: 'xrp',
  } as const;

  const scrollLabel = tf.has('scrollToForge')
    ? tf('scrollToForge')
    : tc('scrollDown');

  return (
    <div className="w-full">
      <HeroBand
        imageSrc={imageSrc}
        title={t(`${mode}.title`)}
        eyebrow={t(`${mode}.eyebrow`)}
        chain={chainByMode[mode]}
        scrollHref="#forge"
        scrollLabel={scrollLabel}
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
            <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-semibold tracking-[0.02em] text-ink normal-case leading-tight mb-3 sm:mb-4">
              {t(`${mode}.headline`)}
            </h2>
            <p className="text-sm sm:text-lg text-muted max-w-2xl leading-relaxed lg:ml-auto">
              {t(`${mode}.blurb`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
