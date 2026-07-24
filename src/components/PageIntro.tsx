'use client';

import { useFadeIn } from '@/hooks/useFadeIn';
import { HeroBand } from './HeroBand';
import { Navbar } from './Navbar';

interface PageIntroProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  imageSrc?: string;
  children?: React.ReactNode;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  imageSrc,
  children,
}: PageIntroProps) {
  const copy = useFadeIn();

  return (
    <div className="w-full">
      {imageSrc ? (
        <HeroBand imageSrc={imageSrc} />
      ) : (
        <div className="relative min-h-[4.5rem] bg-paper">
          <Navbar />
        </div>
      )}

      <div
        ref={copy.ref}
        className="relative z-10 -mt-14 sm:-mt-20 bg-transparent px-5 sm:px-8 lg:px-0 py-10 sm:py-14"
        style={{
          opacity: copy.isVisible ? 1 : 0,
          transform: copy.isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s ease-out 0.05s, transform 0.7s ease-out 0.05s',
        }}
      >
        <div className="lg:w-1/2 lg:pr-8 xl:pr-12 flex lg:justify-end">
          <div className="w-full max-w-xl xl:max-w-2xl lg:pl-8">
            {eyebrow && (
              <p className="text-micro uppercase tracking-[0.2em] text-muted mb-4">{eyebrow}</p>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink normal-case leading-tight mb-4">
              {title}
            </h1>
            {description && (
              <div className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
                {description}
              </div>
            )}
            {children && <div className="mt-8">{children}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
