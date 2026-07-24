'use client';

import { useFadeIn } from '@/hooks/useFadeIn';
import { HeroBand } from './HeroBand';
import { Navbar } from './Navbar';

interface PageIntroProps {
  eyebrow?: string;
  /** Short page name shown centered on the hero */
  title: string;
  description?: React.ReactNode;
  imageSrc?: string;
  children?: React.ReactNode;
  scrollHref?: string;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  imageSrc,
  children,
  scrollHref = '#content',
}: PageIntroProps) {
  const copy = useFadeIn();

  return (
    <div className="w-full">
      {imageSrc ? (
        <HeroBand
          imageSrc={imageSrc}
          title={title}
          eyebrow={eyebrow}
          scrollHref={scrollHref}
          scrollLabel="Scroll down"
        />
      ) : (
        <div className="relative min-h-[4.5rem] bg-paper">
          <Navbar />
        </div>
      )}

      <div
        id="content"
        ref={copy.ref}
        className="relative z-10 -mt-8 sm:-mt-14 bg-transparent px-4 sm:px-8 lg:px-0 py-6 sm:py-12 scroll-mt-24"
        style={{
          opacity: copy.isVisible ? 1 : 0,
          transform: copy.isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s ease-out 0.05s, transform 0.7s ease-out 0.05s',
        }}
      >
        <div className="lg:w-1/2 lg:pr-8 xl:pr-12">
          <div className="w-full max-w-xl xl:max-w-2xl lg:ml-auto lg:pl-8 text-left lg:text-right">
            {description && (
              <div className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed lg:ml-auto">
                {description}
              </div>
            )}
            {children && (
              <div className={`${description ? 'mt-6 sm:mt-8' : ''} lg:flex lg:justify-end`}>
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
