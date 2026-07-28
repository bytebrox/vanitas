'use client';

import { Suspense } from 'react';
import { BtcContent } from './BtcContent';

export default function BtcPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <BtcContent />
    </Suspense>
  );
}
