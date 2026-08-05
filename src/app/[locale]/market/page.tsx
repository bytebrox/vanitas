'use client';

import { Suspense } from 'react';
import { MarketBrowseContent } from './MarketBrowseContent';

export default function MarketPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <MarketBrowseContent />
    </Suspense>
  );
}
