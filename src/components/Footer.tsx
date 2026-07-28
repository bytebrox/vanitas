'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RichText } from '@/lib/rich-text';

/** Solana tip jar — Bytebrox */
export const DONATE_SOL = '3ZgrgEADJJtjyWYag6XfYd7zoD7LEwFhsoEpj7FFWUPo';

interface FooterProps {
  /** Tighter padding for single-viewport landing */
  compact?: boolean;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function Footer({ compact = false }: FooterProps) {
  const t = useTranslations('footer');
  const tc = useTranslations('common');
  const year = new Date().getFullYear();
  const [copied, setCopied] = useState(false);

  const copyDonate = async () => {
    try {
      await navigator.clipboard.writeText(DONATE_SOL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <footer
      className={`relative overflow-hidden px-4 sm:px-8 lg:px-12 border-t border-ink/15 ${
        compact
          ? 'py-3 sm:py-5 border-t-0'
          : 'mt-14 sm:mt-20 py-8 sm:py-10 pb-[max(2rem,env(safe-area-inset-bottom))]'
      }`}
    >
      {!compact && (
        <div className="footer-stone" aria-hidden>
          <img
            src="/ascii/footer-stele.webp?v=2"
            alt=""
            className="footer-stone__img"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <span className="footer-stone__grain" />
          <span className="footer-stone__veil" />
        </div>
      )}

      <div
        className={`relative z-[1] flex flex-col md:flex-row md:items-end md:justify-between ${
          compact ? 'gap-2.5 sm:gap-3' : 'gap-5 sm:gap-6'
        }`}
      >
        <div>
          <p className="font-display font-semibold normal-case tracking-tight text-ink text-base sm:text-lg mb-1 sm:mb-2">
            Vanitas
          </p>
          <p
            className={`text-micro text-muted max-w-sm leading-relaxed normal-case tracking-normal ${
              compact ? 'line-clamp-2 sm:line-clamp-none' : ''
            }`}
          >
            <RichText text={t('blurb')} />
          </p>

          <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${compact ? 'mt-2' : 'mt-3.5'}`}>
            <span className="text-micro uppercase tracking-[0.16em] text-muted">{t('donateSol')}</span>
            <button
              type="button"
              onClick={() => {
                void copyDonate();
              }}
              title={DONATE_SOL}
              className="font-mono text-[0.7rem] sm:text-micro text-ink/80 hover:text-accent tracking-normal normal-case transition-colors"
            >
              {copied ? tc('copied') : shortAddr(DONATE_SOL)}
            </button>
            <a
              href={`https://solscan.io/account/${DONATE_SOL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              {t('solscan')}
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1.5 text-micro uppercase tracking-[0.14em] sm:tracking-[0.16em] text-muted">
          {!compact && (
            <>
              <Link href="/" className="hover:text-ink py-1">
                {t('home')}
              </Link>
              <Link href="/sol" className="hover:text-ink py-1">
                SOL
              </Link>
              <Link href="/evm" className="hover:text-ink py-1">
                EVM
              </Link>
              <Link href="/btc" className="hover:text-ink py-1">
                BTC
              </Link>
              <Link href="/tron" className="hover:text-ink py-1">
                TRON
              </Link>
              <Link href="/aptos" className="hover:text-ink py-1">
                APTOS
              </Link>
              <Link href="/sui" className="hover:text-ink py-1">
                SUI
              </Link>
              <Link href="/ton" className="hover:text-ink py-1">
                TON
              </Link>
              <Link href="/cardano" className="hover:text-ink py-1">
                ADA
              </Link>
              <Link href="/xrp" className="hover:text-ink py-1">
                XRP
              </Link>
              <Link href="/proof" className="hover:text-ink py-1">
                {t('proof')}
              </Link>
              <Link href="/lab" className="hover:text-ink py-1">
                {t('lab')}
              </Link>
              <Link href="/lookalike" className="hover:text-ink py-1">
                {t('lookalike')}
              </Link>
              <Link href="/create2" className="hover:text-ink py-1">
                {t('create2')}
              </Link>
              <Link href="/brand" className="hover:text-ink py-1">
                {t('brand')}
              </Link>
            </>
          )}
          <Link href="/security" className="hover:text-ink py-1">
            {t('security')}
          </Link>
          <Link href="/audit" className="hover:text-ink py-1">
            {t('audit')}
          </Link>
          <Link href="/faq" className="hover:text-ink py-1">
            {t('faq')}
          </Link>
          <Link href="/how-it-works" className="hover:text-ink py-1">
            {t('how')}
          </Link>
          <a
            href="https://www.npmjs.com/package/vanitas"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink py-1"
          >
            {t('cli')}
          </a>
          <a
            href="https://github.com/bytebrox/vanitas"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink py-1"
          >
            {t('github')}
          </a>
          <span className="py-1">© {year}</span>
        </div>
      </div>
    </footer>
  );
}
