'use client';

import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/sol', label: 'SOL' },
  { href: '/eth', label: 'ETH' },
  { href: '/how-it-works', label: 'How' },
  { href: '/faq', label: 'FAQ' },
  { href: '/security', label: 'Security' },
  { href: '/audit', label: 'Audit' },
];

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

        <button
          type="button"
          className={`pointer-events-auto md:hidden text-micro uppercase tracking-[0.16em] min-h-11 min-w-[4.5rem] px-3 py-2 text-ink/80 ${
            scrolled || open ? 'bg-transparent' : 'bg-paper/50 backdrop-blur-sm'
          }`}
          onClick={() => { setOpen((v) => !v); }}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? 'Close' : 'Menu'}
        </button>
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
          </ul>
        </nav>
      )}
    </div>
  );
}
