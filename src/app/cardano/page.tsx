'use client';

import { Suspense } from 'react';
import { CardanoContent } from './CardanoContent';

export default function CardanoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <CardanoContent />
    </Suspense>
  );
}
