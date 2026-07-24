'use client';

import { Suspense } from 'react';
import { SuiContent } from './SuiContent';

export default function SuiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <SuiContent />
    </Suspense>
  );
}
