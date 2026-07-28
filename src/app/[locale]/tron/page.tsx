'use client';

import { Suspense } from 'react';
import { TronContent } from './TronContent';

export default function TronPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <TronContent />
    </Suspense>
  );
}
