'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RichText } from '@/lib/rich-text';
import { DONATE_CA } from '@/lib/donate';
import { AsciiImage } from './AsciiImage';

interface FooterProps {
  /** Tighter padding for single-viewport landing */
  compact?: boolean;
}

function shortAddr(addr: string) {
  if (addr.length <= 13) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="hover:text-ink py-0.5 block">
      {children}
    </Link>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-ink py-0.5 block"
    >
      {children}
    </a>
  );
}

export function Footer({ compact = false }: FooterProps) {
  const t = useTranslations('footer');
  const tc = useTranslations('common');
  const year = new Date().getFullYear();
  const [copied, setCopied] = useState(false);

  const copyCa = async () => {
    if (!DONATE_CA) return;
    try {
      await navigator.clipboard.writeText(DONATE_CA);
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
          <AsciiImage
            src="/ascii/footer-stele.webp"
            version="2"
            sizes="100vw"
            className="footer-stone__img"
          />
          <span className="footer-stone__grain" />
          <span className="footer-stone__veil" />
        </div>
      )}

      <div
        className={`relative z-[1] flex flex-col ${
          compact ? 'gap-2.5 sm:gap-3 md:flex-row md:items-end md:justify-between' : 'gap-8 sm:gap-10'
        }`}
      >
        <div className={compact ? '' : 'md:max-w-sm'}>
          <p className="font-display font-semibold normal-case tracking-[0.02em] text-ink text-base sm:text-lg mb-1 sm:mb-2">
            Vanitas
          </p>
          <p
            className={`text-micro text-muted max-w-sm leading-relaxed normal-case tracking-normal ${
              compact ? 'line-clamp-2 sm:line-clamp-none' : ''
            }`}
          >
            <RichText text={t('blurb')} />
          </p>

          {DONATE_CA ? (
            <div
              className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 ${compact ? 'mt-2' : 'mt-3.5'}`}
            >
              <span className="text-micro uppercase tracking-[0.16em] text-muted">{t('ca')}:</span>
              <span
                title={DONATE_CA}
                className="font-mono text-[0.7rem] sm:text-micro text-ink/80 tracking-normal normal-case"
              >
                {shortAddr(DONATE_CA)}
              </span>
              <button
                type="button"
                onClick={() => {
                  void copyCa();
                }}
                className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink transition-colors"
              >
                {copied ? tc('copied') : tc('copy')}
              </button>
            </div>
          ) : null}
        </div>

        {compact ? (
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1.5 text-micro uppercase tracking-[0.14em] sm:tracking-[0.16em] text-muted">
            <FooterLink href="/security">{t('security')}</FooterLink>
            <FooterLink href="/faq">{t('faq')}</FooterLink>
            <FooterLink href="/terms">{t('terms')}</FooterLink>
            <FooterLink href="/privacy">{t('privacy')}</FooterLink>
            <ExtLink href="https://github.com/bytebrox/vanitas">{t('github')}</ExtLink>
            <span className="py-0.5">© {year}</span>
          </div>
        ) : (
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-micro uppercase tracking-[0.14em] text-muted"
          >
            <div>
              <p className="text-ink/70 mb-2.5 tracking-[0.16em]">{t('groupForges')}</p>
              <div className="flex flex-col gap-1.5">
                <FooterLink href="/">{t('allForges')}</FooterLink>
                <FooterLink href="/sol">SOL</FooterLink>
                <FooterLink href="/evm">EVM</FooterLink>
                <FooterLink href="/btc">BTC</FooterLink>
                <FooterLink href="/tron">TRON</FooterLink>
                <FooterLink href="/aptos">APTOS</FooterLink>
                <FooterLink href="/sui">SUI</FooterLink>
                <FooterLink href="/ton">TON</FooterLink>
                <FooterLink href="/cardano">ADA</FooterLink>
                <FooterLink href="/xrp">XRP</FooterLink>
              </div>
            </div>
            <div>
              <p className="text-ink/70 mb-2.5 tracking-[0.16em]">{t('groupTools')}</p>
              <div className="flex flex-col gap-1.5">
                <FooterLink href="/proof">{t('proof')}</FooterLink>
                <FooterLink href="/lab">{t('lab')}</FooterLink>
                <FooterLink href="/seed">{t('seed')}</FooterLink>
                <FooterLink href="/lookalike">{t('lookalike')}</FooterLink>
                <FooterLink href="/create2">{t('create2')}</FooterLink>
                <FooterLink href="/brand">{t('brand')}</FooterLink>
              </div>
            </div>
            <div>
              <p className="text-ink/70 mb-2.5 tracking-[0.16em]">{t('groupDocs')}</p>
              <div className="flex flex-col gap-1.5">
                <FooterLink href="/how-it-works">{t('how')}</FooterLink>
                <FooterLink href="/faq">{t('faq')}</FooterLink>
                <FooterLink href="/security">{t('security')}</FooterLink>
                <FooterLink href="/audit">{t('audit')}</FooterLink>
              </div>
            </div>
            <div>
              <p className="text-ink/70 mb-2.5 tracking-[0.16em]">{t('groupProject')}</p>
              <div className="flex flex-col gap-1.5">
                <FooterLink href="/terms">{t('terms')}</FooterLink>
                <FooterLink href="/privacy">{t('privacy')}</FooterLink>
                <ExtLink href="https://www.npmjs.com/package/vanitas">{t('cli')}</ExtLink>
                <ExtLink href="https://github.com/bytebrox/vanitas">{t('github')}</ExtLink>
                <span className="py-0.5">© {year}</span>
              </div>
            </div>
          </nav>
        )}
      </div>
    </footer>
  );
}
