'use client';

import { useState } from 'react';

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
      {/* Full-bleed ASCII stone structure background */}
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
            Client-side vanity tooling for Solana, EVM, Bitcoin, Tron, Aptos, Sui, TON, Cardano & XRP. No project token. No key leaves this
            device. Dev’d by{' '}
            <a
              href="https://x.com/bytebrox"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline underline-offset-2 decoration-ink/30 hover:decoration-ink"
            >
              Bytebrox
            </a>
            .
          </p>

          <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${compact ? 'mt-2' : 'mt-3.5'}`}>
            <span className="text-micro uppercase tracking-[0.16em] text-muted">Donate SOL</span>
            <button
              type="button"
              onClick={() => {
                void copyDonate();
              }}
              title={DONATE_SOL}
              className="font-mono text-[0.7rem] sm:text-micro text-ink/80 hover:text-accent tracking-normal normal-case transition-colors"
            >
              {copied ? 'Copied' : shortAddr(DONATE_SOL)}
            </button>
            <a
              href={`https://solscan.io/account/${DONATE_SOL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              Solscan
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1.5 text-micro uppercase tracking-[0.14em] sm:tracking-[0.16em] text-muted">
          {!compact && (
            <>
              <a href="/" className="hover:text-ink py-1">
                Home
              </a>
              <a href="/sol" className="hover:text-ink py-1">
                SOL
              </a>
              <a href="/evm" className="hover:text-ink py-1">
                EVM
              </a>
              <a href="/btc" className="hover:text-ink py-1">
                BTC
              </a>
              <a href="/tron" className="hover:text-ink py-1">
                TRON
              </a>
              <a href="/aptos" className="hover:text-ink py-1">
                APTOS
              </a>
              <a href="/sui" className="hover:text-ink py-1">
                SUI
              </a>
              <a href="/ton" className="hover:text-ink py-1">
                TON
              </a>
              <a href="/cardano" className="hover:text-ink py-1">
                ADA
              </a>
              <a href="/xrp" className="hover:text-ink py-1">
                XRP
              </a>
              <a href="/proof" className="hover:text-ink py-1">
                Proof
              </a>
              <a href="/lab" className="hover:text-ink py-1">
                Lab
              </a>
              <a href="/brand" className="hover:text-ink py-1">
                Brand
              </a>
            </>
          )}
          <a href="/security" className="hover:text-ink py-1">
            Security
          </a>
          <a href="/audit" className="hover:text-ink py-1">
            Audit
          </a>
          <a href="/faq" className="hover:text-ink py-1">
            FAQ
          </a>
          <a href="/how-it-works" className="hover:text-ink py-1">
            How
          </a>
          <a
            href="https://www.npmjs.com/package/vanitas"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink py-1"
          >
            CLI
          </a>
          <a
            href="https://github.com/bytebrox/vanitas"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink py-1"
          >
            GitHub
          </a>
          <span className="py-1">© {year}</span>
        </div>
      </div>
    </footer>
  );
}
