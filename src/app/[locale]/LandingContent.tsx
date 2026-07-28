'use client';

/**
 * Landing — forge chooser over hero atmosphere
 */

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar, Footer } from '@/components';
import { Link } from '@/i18n/navigation';
import {
  SolanaLogo,
  EvmChainLogos,
  EthereumLogo,
  BitcoinLogo,
  TronLogo,
  AptosLogo,
  SuiLogo,
  TonLogo,
  CardanoLogo,
  XrpLogo,
} from '@/components/ChainLogos';

const FORGE_KEYS = [
  'sol',
  'evm',
  'btc',
  'tron',
  'aptos',
  'sui',
  'ton',
  'cardano',
  'xrp',
] as const;

const FORGE_HREF: Record<(typeof FORGE_KEYS)[number], `/${string}`> = {
  sol: '/sol',
  evm: '/evm',
  btc: '/btc',
  tron: '/tron',
  aptos: '/aptos',
  sui: '/sui',
  ton: '/ton',
  cardano: '/cardano',
  xrp: '/xrp',
};

const FORGE_LOGO: Record<(typeof FORGE_KEYS)[number], ReactNode> = {
  sol: <SolanaLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  evm: <EvmChainLogos />,
  btc: <BitcoinLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  tron: <TronLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  aptos: <AptosLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  sui: <SuiLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  ton: <TonLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  cardano: <CardanoLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
  xrp: <XrpLogo className="w-5 h-5 sm:w-6 sm:h-6" />,
};

export function LandingContent() {
  const t = useTranslations('landing');

  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <Navbar />

      <main className="relative flex-1 flex flex-col">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src="/ascii/hero-landing-wide.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_28%] sm:object-center select-none ascii-hero"
            draggable={false}
          />
          <div className="absolute inset-0 hero-fade-landing" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col px-4 sm:px-8 lg:px-12 pt-[max(4.75rem,calc(env(safe-area-inset-top)+3.75rem))] pb-6 sm:pb-8">
          <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col sm:justify-center py-2 sm:py-4">
            <header className="mb-5 sm:mb-7 text-center animate-fade-in-up">
              <p className="text-[0.65rem] sm:text-micro uppercase tracking-[0.18em] sm:tracking-[0.2em] text-ink/70 mb-2 sm:mb-3">
                {t('eyebrow')}
              </p>
              <h1 className="sr-only">{t('title')}</h1>
              {/* Desktop/tablet: brand mark in hero. Mobile uses logo in the navbar instead. */}
              <div
                className="mb-2 sm:mb-3 hidden md:flex justify-center"
                aria-hidden
              >
                <img
                  src="/logo-light.png"
                  alt=""
                  width={256}
                  height={256}
                  className="h-[4.5rem] w-[4.5rem] md:h-20 md:w-20 object-contain drop-shadow-sm select-none dark:hidden"
                  draggable={false}
                />
                <img
                  src="/logo.png"
                  alt=""
                  width={256}
                  height={256}
                  className="hidden h-[4.5rem] w-[4.5rem] md:h-20 md:w-20 object-contain drop-shadow-sm select-none dark:block"
                  draggable={false}
                />
              </div>
              <p className="text-sm sm:text-base text-ink/75 leading-relaxed normal-case tracking-normal max-w-md mx-auto">
                {t('subtitle')}
              </p>
            </header>

            <div className="sm:hidden landing-forge-box divide-y divide-ink/12 animate-fade-in-up overflow-hidden">
              {FORGE_KEYS.map((key) => (
                <Link
                  key={key}
                  href={FORGE_HREF[key]}
                  className="flex items-center gap-3.5 px-3.5 py-3.5 active:bg-ink/[0.04] transition-colors"
                >
                  <div className="shrink-0 w-9 flex justify-center">
                    {key === 'evm' ? (
                      <span aria-label={t('forges.evm.aria')}>
                        <EthereumLogo className="w-5 h-5" />
                      </span>
                    ) : (
                      FORGE_LOGO[key]
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted mb-0.5">
                      {t(`forges.${key}.name`)}
                    </p>
                    <p className="font-display text-base font-semibold text-ink normal-case tracking-tight leading-snug">
                      {t(`forges.${key}.title`)}
                    </p>
                    <p className="text-[0.8rem] text-muted leading-snug normal-case tracking-normal mt-0.5 line-clamp-1">
                      {t(`forges.${key}.blurb`)}
                    </p>
                  </div>
                  <span className="shrink-0 text-ink/40 text-sm" aria-hidden>
                    →
                  </span>
                </Link>
              ))}
            </div>

            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-up">
              {FORGE_KEYS.map((key) => (
                <Link
                  key={key}
                  href={FORGE_HREF[key]}
                  className="landing-forge-box group flex flex-col justify-between px-5 py-5 min-h-0 active:scale-[0.99] transition-transform"
                >
                  <div className="relative z-[1]">
                    <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5">
                      {t(`forges.${key}.name`)}
                    </p>
                    <div className="mb-2">
                      {key === 'evm' ? (
                        <span aria-label={t('forges.evm.aria')}>{FORGE_LOGO[key]}</span>
                      ) : (
                        FORGE_LOGO[key]
                      )}
                    </div>
                    <p className="font-display text-xl font-semibold text-ink normal-case tracking-tight mb-1">
                      {t(`forges.${key}.title`)}
                    </p>
                    <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
                      {t(`forges.${key}.blurb`)}
                    </p>
                  </div>
                  <p className="relative z-[1] mt-3 text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
                    {t('enterForge')}
                  </p>
                </Link>
              ))}
            </div>

            <p className="mt-5 sm:mt-7 sm:text-center text-sm text-muted normal-case tracking-normal animate-fade-in-up">
              {t('preferTerminal')}{' '}
              <a
                href="https://www.npmjs.com/package/vanitas"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-ink underline underline-offset-2 decoration-ink/30 hover:decoration-ink"
              >
                npx vanitas
              </a>
            </p>
          </div>
        </div>
      </main>

      <div className="relative z-10 shrink-0 bg-paper/95 backdrop-blur-sm border-t border-ink/10 pb-[env(safe-area-inset-bottom)]">
        <Footer compact />
      </div>
    </div>
  );
}
