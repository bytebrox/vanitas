/**
 * Center-spine layout: content hugs the midline from the left,
 * plate hugs it from the right — not outer margins.
 */

import { ReactNode } from 'react';

interface ContentWithSideProps {
  children: ReactNode;
  imageSrc: string;
  caption?: string;
  className?: string;
}

/** Prefer cutout plate assets (transparent ground) when given a raw side art path */
function toPlateSrc(src: string): string {
  if (src.includes('-plate.')) return src;
  return src.replace(/(\/ascii\/side-[a-z]+)\.(png|webp)$/i, '$1-plate.webp');
}

export function ContentWithSide({
  children,
  imageSrc,
  caption = 'Fig. — Vanitas',
  className = '',
}: ContentWithSideProps) {
  const plateSrc = `${toPlateSrc(imageSrc)}?v=5`;

  return (
    <div className={`relative ${className}`.trim()}>
      {/* Page midline + plate caption */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 bottom-0 z-[2] hidden lg:flex -translate-x-1/2 flex-col items-center gap-3 pt-6"
        aria-hidden="true"
      >
        <span className="side-spine__rule" />
        <p className="side-spine__caption">{caption}</p>
      </div>

      <div className="grid lg:grid-cols-2 items-start gap-0">
        {/* Left half — content flush to the center line */}
        <div className="relative z-[1] min-w-0 lg:pr-10 xl:pr-14 flex lg:justify-end">
          <div className="w-full max-w-xl xl:max-w-2xl">{children}</div>
        </div>

        {/* Right half — plate flush to the center line (desktop) */}
        <div className="relative hidden lg:flex lg:pl-10 xl:pl-14 justify-start min-h-0 self-stretch">
          <aside className="side-plate" aria-hidden="true">
            <div className="side-plate__press">
              <img
                src={plateSrc}
                alt=""
                className="side-plate__img"
                loading="lazy"
                decoding="async"
              />
              <span className="side-plate__grain" />
            </div>
          </aside>
        </div>
      </div>

      {/* Compact plate strip on mobile / tablet */}
      <figure className="lg:hidden mt-12 sm:mt-16 mx-auto max-w-[14rem] sm:max-w-[16rem]" aria-hidden="true">
        <img
          src={plateSrc}
          alt=""
          className="side-plate__img w-full h-auto select-none !h-auto"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <figcaption className="mt-2 text-center text-micro uppercase tracking-[0.16em] text-muted">
          {caption}
        </figcaption>
      </figure>
    </div>
  );
}
