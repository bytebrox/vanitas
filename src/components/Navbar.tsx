'use client';

import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Wallet' },
  { href: '/token', label: 'Mint' },
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

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-3 transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled
          ? 'bg-paper/90 backdrop-blur-md border-b border-ink/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="relative flex items-start justify-between gap-3">
        <a
          href="/"
          className="pointer-events-auto font-bold uppercase text-ink leading-none tracking-[0.12em] drop-shadow-sm hover:text-accent transition-colors"
          style={{ fontSize: 'clamp(1.35rem, 3.5vw, 2.35rem)' }}
        >
          Vanitas
        </a>

        <nav className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2 hidden md:block">
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
          className={`pointer-events-auto md:hidden text-micro uppercase tracking-[0.16em] px-3 py-2 text-ink/80 ${
            scrolled ? 'bg-transparent' : 'bg-paper/50 backdrop-blur-sm'
          }`}
          onClick={() => { setOpen((v) => !v); }}
          aria-expanded={open}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <div className="pointer-events-auto md:hidden mt-3 flex justify-center animate-fade-in-up">
          <nav className="bg-paper/80 backdrop-blur-md px-4 py-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-micro uppercase tracking-[0.16em] text-ink/80 max-w-sm border border-ink/10">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-ink" onClick={() => { setOpen(false); }}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
