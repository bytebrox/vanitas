'use client';

import { Suspense } from 'react';
import { AptosContent } from './AptosContent';

export default function AptosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <AptosContent />
    </Suspense>
  );
}
