'use client';

/**
 * Landing — one headline forge over hero atmosphere, everything else demoted.
 *
 * The EVM forge on Robinhood Chain is the product now, so it gets the whole
 * width and the other eight chains sit underneath as a compact row. They are
 * still one click away, just no longer competing for the same attention.
 */

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar, Footer, AsciiImage } from '@/components';
import { Link } from '@/i18n/navigation';
import { MARKET_ENABLED } from '@/lib/market-flag';
import {
  SolanaLogo,
  EvmChainLogos,
  RobinhoodLogo,
  BitcoinLogo,
  TronLogo,
  AptosLogo,
  SuiLogo,
  TonLogo,
  CardanoLogo,
  XrpLogo,
} from '@/components/ChainLogos';

const OTHER_KEYS = ['sol', 'btc', 'tron', 'aptos', 'sui', 'ton', 'cardano', 'xrp'] as const;

const OTHER_HREF: Record<(typeof OTHER_KEYS)[number], `/${string}`> = {
  sol: '/sol',
  btc: '/btc',
  tron: '/tron',
  aptos: '/aptos',
  sui: '/sui',
  ton: '/ton',
  cardano: '/cardano',
  xrp: '/xrp',
};

const OTHER_LOGO: Record<(typeof OTHER_KEYS)[number], ReactNode> = {
  sol: <SolanaLogo className="w-5 h-5" />,
  btc: <BitcoinLogo className="w-5 h-5" />,
  tron: <TronLogo className="w-5 h-5" />,
  aptos: <AptosLogo className="w-5 h-5" />,
  sui: <SuiLogo className="w-5 h-5" />,
  ton: <TonLogo className="w-5 h-5" />,
  cardano: <CardanoLogo className="w-5 h-5" />,
  xrp: <XrpLogo className="w-5 h-5" />,
};

/** The full width card that carries the Robinhood EVM forge. */
function PrimaryForge() {
  const t = useTranslations('landing');

  return (
    <Link
      href="/evm"
      className="landing-forge-box group flex flex-col gap-4 px-5 py-6 sm:px-8 sm:py-8 active:scale-[0.995] transition-transform"
    >
      <div className="relative z-[1] flex flex-wrap items-center gap-x-3 gap-y-2">
        <RobinhoodLogo className="w-6 h-6 sm:w-7 sm:h-7" />
        <p className="text-micro uppercase tracking-[0.2em] text-muted">
          {t('primary.name')}
        </p>
      </div>

      <div className="relative z-[1]">
        <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink normal-case tracking-[0.02em] mb-2">
          {t('primary.title')}
        </p>
        <p className="text-sm sm:text-base text-muted leading-relaxed normal-case tracking-normal max-w-xl">
          {t('primary.blurb')}
        </p>
      </div>

      <div className="relative z-[1] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-1">
        <span className="text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
          {t('primary.cta')}
        </span>
        <span className="inline-flex items-center gap-2.5">
          <span className="text-micro normal-case tracking-normal text-muted hidden sm:inline">
            {t('primary.alsoOn')}
          </span>
          <EvmChainLogos />
        </span>
      </div>
    </Link>
  );
}

/** Secondary card for the marketplace, shown only where it is switched on. */
function MarketCard() {
  const t = useTranslations('landing');

  return (
    <Link
      href="/market"
      className="landing-forge-box group flex flex-col justify-between gap-3 px-5 py-5 active:scale-[0.99] transition-transform"
    >
      <div className="relative z-[1]">
        <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1.5">
          {t('market.name')}
        </p>
        <p className="font-display text-xl font-semibold text-ink normal-case tracking-[0.02em] mb-1">
          {t('market.title')}
        </p>
        <p className="text-sm text-muted leading-relaxed normal-case tracking-normal">
          {t('market.blurb')}
        </p>
      </div>
      <p className="relative z-[1] text-micro uppercase tracking-[0.16em] text-ink group-hover:text-accent transition-colors">
        {t('market.cta')}
      </p>
    </Link>
  );
}

export function LandingContent() {
  const t = useTranslations('landing');

  return (
    <div className="min-h-dvh flex flex-col bg-paper">
      <Navbar />

      <main className="relative flex-1 flex flex-col">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <AsciiImage
            src="/ascii/hero-landing-wide.webp"
            sizes="100vw"
            priority
            className="absolute inset-0 w-full h-full object-cover object-[center_28%] sm:object-center select-none ascii-hero"
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
              <div className="mb-2 sm:mb-3 hidden md:flex justify-center" aria-hidden>
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

            <div
              className={`animate-fade-in-up grid gap-3 ${MARKET_ENABLED ? 'lg:grid-cols-[1.9fr_1fr]' : ''}`}
            >
              <PrimaryForge />
              {MARKET_ENABLED && <MarketCard />}
            </div>

            <section className="mt-6 sm:mt-8 animate-fade-in-up">
              <h2 className="text-micro uppercase tracking-[0.2em] text-muted mb-3">
                {t('otherChains')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OTHER_KEYS.map((key) => (
                  <Link
                    key={key}
                    href={OTHER_HREF[key]}
                    className="landing-forge-box group flex items-center gap-3 px-3.5 py-3 active:scale-[0.99] transition-transform"
                  >
                    <span className="relative z-[1] shrink-0">{OTHER_LOGO[key]}</span>
                    <span className="relative z-[1] min-w-0">
                      <span className="block font-display text-sm font-semibold text-ink normal-case tracking-[0.02em] leading-tight group-hover:text-accent transition-colors">
                        {t(`forges.${key}.name`)}
                      </span>
                      <span className="block text-[0.7rem] text-muted normal-case tracking-normal leading-tight truncate">
                        {t(`forges.${key}.title`)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

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
