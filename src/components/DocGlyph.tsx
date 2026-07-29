import { AsciiImage } from './AsciiImage';

export type DocGlyphId =
  | 'key'
  | 'loop'
  | 'hourglass'
  | 'colonnade'
  | 'forge'
  | 'seal'
  | 'shield'
  | 'eye'
  | 'scroll'
  | 'scales'
  | 'stele'
  | 'modes'
  | 'vault';

const GLYPH_SRC: Record<DocGlyphId, string> = {
  key: '/ascii/glyphs/doc-glyph-key.webp',
  loop: '/ascii/glyphs/doc-glyph-loop.webp',
  hourglass: '/ascii/glyphs/doc-glyph-hourglass.webp',
  colonnade: '/ascii/glyphs/doc-glyph-colonnade.webp',
  forge: '/ascii/glyphs/doc-glyph-forge.webp',
  seal: '/ascii/glyphs/doc-glyph-seal.webp',
  shield: '/ascii/glyphs/doc-glyph-shield.webp',
  eye: '/ascii/glyphs/doc-glyph-eye.webp',
  scroll: '/ascii/glyphs/doc-glyph-scroll.webp',
  scales: '/ascii/glyphs/doc-glyph-scales.webp',
  stele: '/ascii/glyphs/doc-glyph-stele.webp',
  modes: '/ascii/glyphs/doc-glyph-modes.webp',
  vault: '/ascii/glyphs/doc-glyph-vault.webp',
};

interface DocGlyphProps {
  id: DocGlyphId;
  /** Small caption under the plate */
  label?: string;
  /** Layout variant */
  variant?: 'mark' | 'watermark' | 'band';
  className?: string;
}

/**
 * ASCII letterpress glyph for docs sections.
 * Same multiply + grain treatment as side plates.
 */
export function DocGlyph({
  id,
  label,
  variant = 'mark',
  className = '',
}: DocGlyphProps) {
  const src = GLYPH_SRC[id];

  if (variant === 'watermark') {
    return (
      <div className={`doc-glyph doc-glyph--watermark ${className}`.trim()} aria-hidden>
        <div className="doc-glyph__press">
          <AsciiImage src={src} version="2" sizes="13rem" className="doc-glyph__img" />
          <span className="doc-glyph__grain" />
        </div>
      </div>
    );
  }

  if (variant === 'band') {
    return (
      <div className={`doc-glyph doc-glyph--band ${className}`.trim()} aria-hidden>
        <div className="doc-glyph__press">
          <AsciiImage src={src} version="2" sizes="13rem" className="doc-glyph__img" />
          <span className="doc-glyph__grain" />
        </div>
        {label ? <p className="doc-glyph__label">{label}</p> : null}
      </div>
    );
  }

  return (
    <div className={`doc-glyph doc-glyph--mark ${className}`.trim()} aria-hidden>
      <div className="doc-glyph__press">
        <AsciiImage src={src} version="2" sizes="13rem" className="doc-glyph__img" />
        <span className="doc-glyph__grain" />
      </div>
      {label ? <p className="doc-glyph__label">{label}</p> : null}
    </div>
  );
}

/** Mid-page plate strip — for FAQ category intros etc. */
export function DocGlyphBand({ id, label }: { id: DocGlyphId; label?: string }) {
  return (
    <div className="my-6 flex justify-center">
      <DocGlyph id={id} label={label} variant="band" className="w-28 sm:w-32" />
    </div>
  );
}
