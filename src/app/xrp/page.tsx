'use client';

import { Suspense } from 'react';
import { XrpContent } from './XrpContent';

export default function XrpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <XrpContent />
    </Suspense>
  );
}
