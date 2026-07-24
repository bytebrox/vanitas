'use client';

import { useFadeIn } from '@/hooks/useFadeIn';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className = '', delay = 0 }: FadeInProps) {
  const { ref, isVisible } = useFadeIn(0.1);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.75s ease-out ${delay}ms, transform 0.75s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
