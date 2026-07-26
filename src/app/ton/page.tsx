'use client';

import { Suspense } from 'react';
import { TonContent } from './TonContent';

export default function TonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <TonContent />
    </Suspense>
  );
}
