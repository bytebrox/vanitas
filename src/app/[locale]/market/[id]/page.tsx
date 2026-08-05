'use client';

import { Suspense } from 'react';
import { MarketListingContent } from './MarketListingContent';

export default function MarketListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <MarketListingContent />
    </Suspense>
  );
}
