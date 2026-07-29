import type { CSSProperties } from 'react';
import { ASCII_IMAGES } from '@/lib/ascii-images';

interface AsciiImageProps {
  /** Original path under `/ascii`, e.g. `/ascii/hero-landing-wide.webp`. */
  src: string;
  /** Layout hint for the browser's variant pick — always pass a real one. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  /** Above the fold: eager + high fetch priority instead of lazy. */
  priority?: boolean;
  /** Cache-buster kept from the previous `?v=` query strings. */
  version?: string;
  alt?: string;
}

function variantSrcSet(src: string, widths: number[], ext: 'avif' | 'webp', version?: string) {
  const rel = src.replace(/^\/ascii\//, '').replace(/\.webp$/i, '');
  const query = version ? `?v=${version}` : '';
  return widths.map((w) => `/ascii/r/${rel}-${w}.${ext}${query} ${w}w`).join(', ');
}

/**
 * ASCII art with pre-generated AVIF/WebP variants.
 *
 * `display: contents` on the <picture> keeps the <img> a direct layout child of
 * its container, so the existing plate/hero CSS (which sizes the img itself)
 * keeps working unchanged.
 */
export function AsciiImage({
  src,
  sizes,
  className,
  style,
  priority = false,
  version,
  alt = '',
}: AsciiImageProps) {
  const meta = ASCII_IMAGES[src];
  const versioned = version ? `${src}?v=${version}` : src;

  const img = (
    <img
      src={versioned}
      alt={alt}
      width={meta?.width}
      height={meta?.height}
      className={className}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      draggable={false}
      {...(alt ? {} : { 'aria-hidden': true })}
    />
  );

  if (!meta) return img;

  return (
    <picture className="contents">
      <source
        type="image/avif"
        srcSet={variantSrcSet(src, meta.widths, 'avif', version)}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={variantSrcSet(src, meta.widths, 'webp', version)}
        sizes={sizes}
      />
      {img}
    </picture>
  );
}
