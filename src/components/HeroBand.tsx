'use client';

import { Navbar } from './Navbar';
import { useHeroScrollFade } from '@/hooks/useHeroScrollFade';

interface HeroBandProps {
  imageSrc: string;
}

/** Exact page paper — must match tailwind `paper` / body base */
const PAPER = '#F5F0E8';

/**
 * Full-width hero. Nav is fixed separately and stays visible while scrolling.
 * Bottom edge dissolves via mask into paper so the handoff has no hard seam.
 */
export function HeroBand({ imageSrc }: HeroBandProps) {
  const { ref, imageOpacity, progress } = useHeroScrollFade();

  return (
    <>
      <Navbar />
      <div ref={ref} className="relative w-full overflow-hidden" style={{ backgroundColor: PAPER }}>
        <div
          className="will-change-[opacity,transform] relative"
          style={{
            opacity: imageOpacity,
            transform: `translateY(${progress * 8}px)`,
            transition: 'opacity 60ms linear, transform 60ms linear',
            WebkitMaskImage:
              'linear-gradient(to bottom, #000 0%, #000 42%, rgba(0,0,0,0.85) 58%, rgba(0,0,0,0.35) 78%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, #000 0%, #000 42%, rgba(0,0,0,0.85) 58%, rgba(0,0,0,0.35) 78%, transparent 100%)',
          }}
        >
          <img src={imageSrc} alt="" className="block w-full h-auto select-none" draggable={false} />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] sm:h-[42%]"
          style={{
            background: `linear-gradient(to bottom,
              ${PAPER}00 0%,
              ${PAPER}33 28%,
              ${PAPER}99 62%,
              ${PAPER} 100%)`,
          }}
        />
      </div>
    </>
  );
}
