'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  SolanaLogo,
  RobinhoodLogo,
  BitcoinLogo,
  TronLogo,
  AptosLogo,
  SuiLogo,
  TonLogo,
  CardanoLogo,
  XrpLogo,
} from './ChainLogos';
import { MARKET_ENABLED } from '@/lib/market-flag';
import { useTheme } from './ThemeProvider';
import { LanguageSwitcher } from './LanguageSwitcher';

const GITHUB_URL = 'https://github.com/bytebrox/vanitas';
const X_URL = 'https://x.com/bytebrox';

/** The EVM forge is the headline act and sits in the bar itself, not in here. */
const otherChainDefs: { href: '/sol' | '/btc' | '/tron' | '/aptos' | '/sui' | '/ton' | '/cardano' | '/xrp'; label: string; short: string; logo: ReactNode }[] = [
  { href: '/sol', label: 'Solana', short: 'SOL', logo: <SolanaLogo className="w-4 h-4" /> },
  { href: '/btc', label: 'Bitcoin', short: 'BTC', logo: <BitcoinLogo className="w-4 h-4" /> },
  { href: '/tron', label: 'Tron', short: 'TRON', logo: <TronLogo className="w-4 h-4" /> },
  { href: '/aptos', label: 'Aptos', short: 'APTOS', logo: <AptosLogo className="w-4 h-4" /> },
  { href: '/sui', label: 'Sui', short: 'SUI', logo: <SuiLogo className="w-4 h-4" /> },
  { href: '/ton', label: 'TON', short: 'TON', logo: <TonLogo className="w-4 h-4" /> },
  { href: '/cardano', label: 'Cardano', short: 'ADA', logo: <CardanoLogo className="w-4 h-4" /> },
  { href: '/xrp', label: 'XRP', short: 'XRP', logo: <XrpLogo className="w-4 h-4" /> },
];

function GitHubIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function XIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ThemeToggleButton({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('nav');
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={className}
      aria-label={isDark ? t('themeToLight') : t('themeToDark')}
      title={isDark ? t('themeLight') : t('themeDark')}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
          <path d="M21 14.3A9 9 0 1 1 9.7 3a7 7 0 1 0 11.3 11.3Z" />
        </svg>
      )}
    </button>
  );
}

function NavDot() {
  return (
    <span className="text-ink/25 px-0.5" aria-hidden>
      ·
    </span>
  );
}

function DesktopDropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string; hint?: string }[];
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        className="px-1.5 py-0.5 hover:text-ink transition-colors whitespace-nowrap inline-flex items-center gap-1"
        aria-haspopup="true"
      >
        {label}
        <span className="text-[0.65em] text-ink/40 group-hover:text-ink/70" aria-hidden>
          ▾
        </span>
      </button>
      <div className="invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-opacity duration-150 z-50">
        <div className="min-w-[13.5rem] border border-ink/15 bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href as '/'}
              className="flex items-center justify-between gap-6 px-3.5 py-2.5 text-micro uppercase tracking-[0.14em] text-ink/75 hover:text-ink hover:bg-ink/[0.04] transition-colors"
            >
              <span className="shrink-0">{item.label}</span>
              {item.hint ? (
                <span className="text-ink/35 normal-case tracking-normal text-[0.7rem] text-right whitespace-nowrap">
                  {item.hint}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const [chainsOpen, setChainsOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const docsLinks = [
    { href: '/how-it-works', label: t('docsHow'), hint: t('docsHowHint') },
    { href: '/faq', label: t('docsFaq'), hint: t('docsFaqHint') },
    { href: '/security', label: t('docsSecurity'), hint: t('docsSecurityHint') },
  ];

  const toolsLinks = [
    { href: '/audit', label: t('toolsAudit'), hint: t('toolsAuditHint') },
    { href: '/proof', label: t('toolsProof'), hint: t('toolsProofHint') },
    { href: '/lab', label: t('toolsLab'), hint: t('toolsLabHint') },
    { href: '/seed', label: t('toolsSeed'), hint: t('toolsSeedHint') },
    { href: '/lookalike', label: t('toolsLookalike'), hint: t('toolsLookalikeHint') },
    { href: '/create2', label: t('toolsCreate2'), hint: t('toolsCreate2Hint') },
    { href: '/brand', label: t('toolsBrand'), hint: t('toolsBrandHint') },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 48);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) {
      setChainsOpen(false);
      setDocsOpen(false);
      setToolsOpen(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const closeMobile = () => {
    setOpen(false);
  };

  const softBtn = scrolled || open ? '' : 'lg:bg-paper/50 lg:backdrop-blur-sm';

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 px-4 sm:px-6 lg:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-5 pb-3 transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled || open
          ? 'bg-paper/95 backdrop-blur-md border-b border-ink/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="relative flex items-center justify-between gap-3 min-h-[2.75rem]">
        <Link
          href="/"
          className="pointer-events-auto group/brand inline-flex items-center text-ink leading-none tracking-tight drop-shadow-sm focus-visible:outline-none"
          aria-label="Vanitas"
        >
          <span className="relative md:hidden inline-flex items-center" aria-hidden>
            <img
              src="/logo-light.png"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 object-contain dark:hidden transition-transform duration-300 group-hover/brand:-translate-y-px"
              draggable={false}
            />
            <img
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              className="hidden h-9 w-9 object-contain dark:block transition-transform duration-300 group-hover/brand:-translate-y-px"
              draggable={false}
            />
            <span className="brand-spark brand-spark--mark" />
          </span>
          <span
            className="brand-ink relative hidden md:inline-grid font-brand font-semibold uppercase tracking-[0.06em]"
            style={{ fontSize: 'clamp(1.15rem, 4.2vw, 1.85rem)' }}
          >
            <span className="col-start-1 row-start-1">Vanitas</span>
            <span className="col-start-1 row-start-1 text-accent brand-ink-fill" aria-hidden>
              Vanitas
            </span>
            <span className="brand-spark" aria-hidden />
          </span>
        </Link>

        {/* Six entries no longer clear the wordmark and the icon rail at md, so the
            centred bar waits for lg and tablets keep the drawer. */}
        <nav className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
          <div
            className={`flex items-center gap-1 px-3 py-2 text-micro uppercase tracking-[0.16em] text-ink/80 transition-colors ${
              scrolled ? 'bg-transparent' : 'bg-paper/50 backdrop-blur-sm'
            }`}
          >
            <Link href="/" className="px-1.5 py-0.5 hover:text-ink transition-colors whitespace-nowrap">
              {t('home')}
            </Link>
            <NavDot />

            <Link
              href="/evm"
              className="px-1.5 py-0.5 text-ink hover:text-accent transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
            >
              <RobinhoodLogo className="w-3.5 h-3.5" />
              {t('forge')}
            </Link>
            {MARKET_ENABLED && (
              <>
                <NavDot />
                <Link
                  href="/market"
                  className="px-1.5 py-0.5 hover:text-ink transition-colors whitespace-nowrap"
                >
                  {t('market')}
                </Link>
              </>
            )}
            <NavDot />

            <div className="relative group">
              <button
                type="button"
                className="px-1.5 py-0.5 hover:text-ink transition-colors whitespace-nowrap inline-flex items-center gap-1"
                aria-haspopup="true"
              >
                {t('otherChains')}
                <span className="text-[0.65em] text-ink/40 group-hover:text-ink/70" aria-hidden>
                  ▾
                </span>
              </button>
              <div className="invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-opacity duration-150 z-50">
                <div className="min-w-[12rem] border border-ink/15 bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1">
                  {otherChainDefs.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="flex items-center justify-between gap-6 px-3.5 py-2.5 text-micro uppercase tracking-[0.14em] text-ink/75 hover:text-ink hover:bg-ink/[0.04] transition-colors"
                    >
                      <span className="inline-flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 flex items-center justify-center w-4 h-4" aria-hidden>
                          {c.logo}
                        </span>
                        <span>{c.label}</span>
                      </span>
                      <span className="text-ink/35 normal-case tracking-normal text-[0.7rem]">{c.short}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <NavDot />
            <DesktopDropdown label={t('docs')} items={docsLinks} />
            <NavDot />
            <DesktopDropdown label={t('tools')} items={toolsLinks} />
          </div>
        </nav>

        <div className="pointer-events-auto flex items-center gap-0.5 sm:gap-1">
          <LanguageSwitcher className={softBtn} />
          <ThemeToggleButton
            className={`inline-flex items-center justify-center min-h-11 min-w-11 text-ink/70 hover:text-ink transition-colors ${softBtn}`}
          />
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center min-h-11 min-w-11 text-ink/70 hover:text-ink transition-colors ${softBtn}`}
            aria-label="Bytebrox on X"
            title="X"
          >
            <XIcon />
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center min-h-11 min-w-11 text-ink/70 hover:text-ink transition-colors ${softBtn}`}
            aria-label="GitHub repository"
            title="GitHub"
          >
            <GitHubIcon />
          </a>

          <button
            type="button"
            className={`lg:hidden text-micro uppercase tracking-[0.16em] min-h-11 min-w-[4.5rem] px-3 py-2 text-ink/80 ${
              scrolled || open ? 'bg-transparent' : 'bg-paper/50 backdrop-blur-sm'
            }`}
            onClick={() => {
              setOpen((v) => !v);
            }}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? t('close') : t('menu')}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="pointer-events-auto lg:hidden mt-3 -mx-4 sm:-mx-6 border-t border-ink/10 bg-paper/98 backdrop-blur-md animate-fade-in-up"
        >
          <ul className="flex flex-col divide-y divide-ink/10">
            <li>
              <Link
                href="/"
                className="flex items-center justify-between px-5 py-3.5 text-sm uppercase tracking-[0.16em] text-ink/85 hover:text-ink hover:bg-ink/[0.03] active:bg-ink/[0.05]"
                onClick={closeMobile}
              >
                <span>{t('home')}</span>
                <span className="text-muted" aria-hidden>
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/evm"
                className="flex items-center justify-between px-5 py-3.5 text-sm uppercase tracking-[0.16em] text-ink hover:bg-ink/[0.03] active:bg-ink/[0.05]"
                onClick={closeMobile}
              >
                <span className="inline-flex items-center gap-2.5">
                  <RobinhoodLogo className="w-4 h-4" />
                  {t('forge')}
                </span>
                <span className="text-muted" aria-hidden>
                  →
                </span>
              </Link>
            </li>
            {MARKET_ENABLED && (
              <li>
                <Link
                  href="/market"
                  className="flex items-center justify-between px-5 py-3.5 text-sm uppercase tracking-[0.16em] text-ink/85 hover:text-ink hover:bg-ink/[0.03] active:bg-ink/[0.05]"
                  onClick={closeMobile}
                >
                  <span>{t('market')}</span>
                  <span className="text-muted" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            )}
            <li>
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-3.5 text-sm uppercase tracking-[0.16em] text-ink/85 hover:text-ink hover:bg-ink/[0.03]"
                aria-expanded={chainsOpen}
                onClick={() => {
                  setChainsOpen((v) => !v);
                }}
              >
                <span>{t('otherChains')}</span>
                <span className="text-muted" aria-hidden>
                  {chainsOpen ? '▴' : '▾'}
                </span>
              </button>
              {chainsOpen && (
                <ul className="border-t border-ink/10 bg-ink/[0.02]">
                  {otherChainDefs.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        className="flex items-center justify-between px-5 pl-8 py-3 text-sm uppercase tracking-[0.16em] text-ink/75 hover:text-ink hover:bg-ink/[0.03]"
                        onClick={closeMobile}
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <span className="shrink-0 flex items-center justify-center w-4 h-4" aria-hidden>
                            {c.logo}
                          </span>
                          <span>{c.label}</span>
                        </span>
                        <span className="text-muted text-micro tracking-[0.12em]">{c.short}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-3.5 text-sm uppercase tracking-[0.16em] text-ink/85 hover:text-ink hover:bg-ink/[0.03]"
                aria-expanded={docsOpen}
                onClick={() => {
                  setDocsOpen((v) => !v);
                }}
              >
                <span>{t('docs')}</span>
                <span className="text-muted" aria-hidden>
                  {docsOpen ? '▴' : '▾'}
                </span>
              </button>
              {docsOpen && (
                <ul className="border-t border-ink/10 bg-ink/[0.02]">
                  {docsLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href as '/'}
                        className="flex items-center justify-between px-5 pl-8 py-3 text-sm uppercase tracking-[0.16em] text-ink/75 hover:text-ink hover:bg-ink/[0.03]"
                        onClick={closeMobile}
                      >
                        <span>{l.label}</span>
                        <span className="text-muted text-micro tracking-[0.12em] normal-case">{l.hint}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-3.5 text-sm uppercase tracking-[0.16em] text-ink/85 hover:text-ink hover:bg-ink/[0.03]"
                aria-expanded={toolsOpen}
                onClick={() => {
                  setToolsOpen((v) => !v);
                }}
              >
                <span>{t('tools')}</span>
                <span className="text-muted" aria-hidden>
                  {toolsOpen ? '▴' : '▾'}
                </span>
              </button>
              {toolsOpen && (
                <ul className="border-t border-ink/10 bg-ink/[0.02]">
                  {toolsLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href as '/'}
                        className="flex items-center justify-between px-5 pl-8 py-3 text-sm uppercase tracking-[0.16em] text-ink/75 hover:text-ink hover:bg-ink/[0.03]"
                        onClick={closeMobile}
                      >
                        <span>{l.label}</span>
                        <span className="text-muted text-micro tracking-[0.12em] normal-case">{l.hint}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
