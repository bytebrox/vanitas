'use client';

import { Suspense } from 'react';
import { MarketAccountContent } from './MarketAccountContent';

export default function MarketAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <MarketAccountContent />
    </Suspense>
  );
}
