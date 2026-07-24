'use client';

/**
 * ETH vanity forge page
 */

import { Suspense } from 'react';
import { EthContent } from './EthContent';

export default function EthPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EthContent />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-5 sm:px-8 lg:px-12 pt-10 pb-6">
        <div className="h-14 w-48 bg-ink/5 animate-pulse" />
      </div>
      <div className="w-full aspect-video bg-beige border-y border-ink/15 animate-pulse" />
      <div className="px-5 sm:px-8 lg:px-12 py-12 max-w-3xl space-y-6">
        <div className="h-8 w-2/3 bg-ink/5 animate-pulse" />
        <div className="h-24 bg-ink/5 animate-pulse" />
        <div className="h-24 bg-ink/5 animate-pulse" />
      </div>
    </div>
  );
}
