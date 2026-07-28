'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { DocGlyph, type DocGlyphId } from './DocGlyph';

export type { DocGlyphId };

export interface DocsTocItem {
  id: string;
  label: string;
  n?: string;
}

interface DocsTocProps {
  items: DocsTocItem[];
  label?: string;
}

/** Extra gap below the sticky TOC when scrolling to a section */
const TOC_SCROLL_GAP = 16;

function scrollToSection(id: string, tocEl: HTMLElement | null) {
  const target = document.getElementById(id);
  if (!target) return;

  const tocBottom = tocEl?.getBoundingClientRect().bottom ?? 96;
  const y = window.scrollY + target.getBoundingClientRect().top - tocBottom - TOC_SCROLL_GAP;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

/**
 * Sticky on-page submenu for docs pages (How / FAQ / Security).
 * Click/hash navigation offsets for the sticky bar so headings stay visible.
 */
export function DocsToc({ items, label = 'On this page' }: DocsTocProps) {
  const [active, setActive] = useState(items[0]?.id ?? '');
  const tocRef = useRef<HTMLElement>(null);

  const goTo = useCallback((id: string) => {
    setActive(id);
    scrollToSection(id, tocRef.current);
  }, []);

  useEffect(() => {
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.7] }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items]);

  // Correct browser default hash jump (lands under the sticky TOC)
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash || !items.some((i) => i.id === hash)) return;

    const run = () => {
      goTo(hash);
    };
    // After layout so TOC height is known
    const t = window.setTimeout(run, 50);
    return () => window.clearTimeout(t);
  }, [items, goTo]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    goTo(id);
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav
      ref={tocRef}
      aria-label={label}
      className="sticky top-20 z-20 mb-10 sm:mb-12 border-y border-ink/15 bg-paper/90 backdrop-blur-sm py-3 -mx-1 px-1"
    >
      <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2.5 px-1">{label}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-micro uppercase tracking-[0.14em]">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`inline-flex items-baseline gap-1.5 transition-colors ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
                onClick={(e) => {
                  handleNavClick(e, item.id);
                }}
              >
                {item.n ? <span className="text-ink/35">{item.n}</span> : null}
                <span className={isActive ? 'border-b border-ink pb-px' : ''}>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Shared scroll margin: navbar + sticky TOC (fallback for non-JS / in-page links) */
export const DOC_SECTION_SCROLL_MT = 'scroll-mt-[12.5rem] sm:scroll-mt-[11rem]';

export function DocSection({
  id,
  n,
  title,
  glyph,
  glyphLabel,
  children,
}: {
  id: string;
  n: string;
  title: string;
  /** Optional ASCII letterpress ornament for the section */
  glyph?: DocGlyphId;
  glyphLabel?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`relative border-t border-ink/15 pt-10 ${DOC_SECTION_SCROLL_MT}`}>
      {glyph ? (
        <div className="relative z-[1] flex flex-col items-center text-center mb-8 sm:mb-10">
          <DocGlyph
            id={glyph}
            label={glyphLabel}
            variant="band"
            className="w-[7rem] sm:w-[8.5rem] md:w-[9.5rem] mb-5 sm:mb-6"
          />
          <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{n}</p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-[0.02em] text-ink normal-case">
            {title}
          </h2>
        </div>
      ) : (
        <div className="relative z-[1]">
          <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{n}</p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-[0.02em] text-ink normal-case mb-5">
            {title}
          </h2>
        </div>
      )}
      <div className="relative z-[1] space-y-4 text-body text-muted leading-relaxed">{children}</div>
    </section>
  );
}

export function DocSubheading({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-display text-lg font-semibold text-ink normal-case tracking-[0.02em] pt-2">
      {children}
    </h3>
  );
}

export function DocLedgerRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-1 sm:gap-6 py-4 border-b border-ink/10 last:border-0">
      <p className="text-micro uppercase tracking-[0.16em] text-muted pt-0.5">{label}</p>
      <div>
        <p className="text-ink font-mono text-sm break-all">{value}</p>
        {note ? (
          <p className="text-sm text-muted mt-1 normal-case tracking-normal leading-relaxed">{note}</p>
        ) : null}
      </div>
    </div>
  );
}
