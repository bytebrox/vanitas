'use client';

import { Suspense } from 'react';
import { MarketForgeContent } from './MarketForgeContent';

export default function MarketForgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <MarketForgeContent />
    </Suspense>
  );
}
