'use client';

import { useEffect, useState } from 'react';

const GITHUB_URL = 'https://github.com/bytebrox/vanitas';

const links = [
  { href: '/', label: 'Home' },
  { href: '/sol', label: 'SOL' },
  { href: '/evm', label: 'EVM' },
  { href: '/btc', label: 'BTC' },
  { href: '/tron', label: 'TRON' },
  { href: '/how-it-works', label: 'How' },
  { href: '/faq', label: 'FAQ' },
  { href: '/security', label: 'Security' },
  { href: '/audit', label: 'Audit' },
];

function GitHubIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/**
 * Fixed top chrome — stays visible while scrolling.
 * Soft over the hero; solid paper once you leave it.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 48);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
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

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 px-4 sm:px-6 lg:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-5 pb-3 transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled || open
          ? 'bg-paper/95 backdrop-blur-md border-b border-ink/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="relative flex items-center justify-between gap-3 min-h-[2.75rem]">
        <a
          href="/"
          className="pointer-events-auto font-display font-semibold normal-case text-ink leading-none tracking-tight drop-shadow-sm hover:text-accent transition-colors"
          style={{ fontSize: 'clamp(1.25rem, 5vw, 2.35rem)' }}
        >
          Vanitas
        </a>

        <nav className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <div
            className={`flex items-center gap-1 px-3 py-2 text-micro uppercase tracking-[0.16em] text-ink/80 transition-colors ${
              scrolled ? 'bg-transparent' : 'bg-paper/50 backdrop-blur-sm'
            }`}
          >
            {links.map((l, i) => (
              <span key={l.href} className="flex items-center gap-1">
                {i > 0 && <span className="text-ink/25 px-0.5" aria-hidden>·</span>}
                <a href={l.href} className="px-1.5 py-0.5 hover:text-ink transition-colors whitespace-nowrap">
                  {l.label}
                </a>
              </span>
            ))}
          </div>
        </nav>

        <div className="pointer-events-auto flex items-center gap-1 sm:gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center min-h-11 min-w-11 text-ink/70 hover:text-ink transition-colors ${
              scrolled || open ? '' : 'md:bg-paper/50 md:backdrop-blur-sm'
            }`}
            aria-label="GitHub repository"
            title="GitHub"
          >
            <GitHubIcon />
          </a>

          <button
            type="button"
            className={`md:hidden text-micro uppercase tracking-[0.16em] min-h-11 min-w-[4.5rem] px-3 py-2 text-ink/80 ${
              scrolled || open ? 'bg-transparent' : 'bg-paper/50 backdrop-blur-sm'
            }`}
            onClick={() => { setOpen((v) => !v); }}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="pointer-events-auto md:hidden mt-3 -mx-4 sm:-mx-6 border-t border-ink/10 bg-paper/98 backdrop-blur-md animate-fade-in-up"
        >
          <ul className="flex flex-col divide-y divide-ink/10">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="flex items-center justify-between px-5 py-3.5 text-sm uppercase tracking-[0.16em] text-ink/85 hover:text-ink hover:bg-ink/[0.03] active:bg-ink/[0.05]"
                  onClick={() => { setOpen(false); }}
                >
                  <span>{l.label}</span>
                  <span className="text-muted" aria-hidden>→</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-5 py-3.5 text-sm uppercase tracking-[0.16em] text-ink/85 hover:text-ink hover:bg-ink/[0.03]"
                onClick={() => { setOpen(false); }}
              >
                <span className="inline-flex items-center gap-2">
                  <GitHubIcon />
                  GitHub
                </span>
                <span className="text-muted" aria-hidden>↗</span>
              </a>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
