'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-linked fade for hero bands — softens as the user scrolls past.
 */
export function useHeroScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const height = Math.max(rect.height, 1);
      // Fade across roughly the lower two-thirds of the hero height
      const next = Math.min(Math.max(-rect.top / (height * 0.7), 0), 1);
      setProgress(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return {
    ref,
    progress,
    imageOpacity: 1 - progress * 0.72,
  };
}
