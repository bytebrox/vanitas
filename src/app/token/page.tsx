'use client';

import { Suspense } from 'react';
import { TokenContent } from './TokenContent';

/**
 * Token Mint Address Generator Page
 * For creating custom token addresses for Solana launchpads
 */
export default function TokenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      }
    >
      <TokenContent />
    </Suspense>
  );
}
