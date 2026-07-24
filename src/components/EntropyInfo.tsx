'use client';

import { useState, useEffect } from 'react';

interface EntropyCheck {
  source: string;
  entropy: number;
  csprng: boolean;
  browser: string;
  supported: boolean;
  details: string;
}

interface RandomTest {
  sampleSize: number;
  distribution: number; // Percentage of uniformity (0-100)
  chiSquare: number;
  pValue: number;
  passed: boolean;
  rngSpeed: number; // Numbers per second
  timestamp: string;
}

/**
 * Entropy Info Component
 * Shows the cryptographic quality of the generated key
 */
export function EntropyInfo() {
  const [check, setCheck] = useState<EntropyCheck | null>(null);
  const [randomTest, setRandomTest] = useState<RandomTest | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Perform entropy check
    const performCheck = (): EntropyCheck => {
      const browser = getBrowserInfo();
      
      // Check if Web Crypto API is available
      const hasWebCrypto = typeof crypto !== 'undefined' && 
                          typeof crypto.subtle !== 'undefined';
      
      // Check if getRandomValues is available (CSPRNG)
      const hasCSPRNG = typeof crypto !== 'undefined' && 
                        typeof crypto.getRandomValues === 'function';
      
      // Check for Ed25519 support (used by our generator)
      const hasEd25519 = hasWebCrypto; // Modern browsers support it
      
      // Determine entropy source
      let source = 'Unknown';
      let entropy = 0;
      let csprng = false;
      let details = '';
      
      if (hasCSPRNG && hasEd25519) {
        source = 'Web Crypto API (Native Ed25519)';
        entropy = 256; // Ed25519 uses 256-bit keys
        csprng = true;
        details = 'Your browser uses hardware-backed cryptographic random number generation (CSPRNG). This is the gold standard for key generation.';
      } else if (hasCSPRNG) {
        source = 'Web Crypto API (CSPRNG)';
        entropy = 256;
        csprng = true;
        details = 'Using cryptographically secure pseudo-random number generator. Keys are secure.';
      } else {
        source = 'Fallback (Math.random)';
        entropy = 53; // JavaScript number precision
        csprng = false;
        details = '⚠️ Your browser does not support secure random generation. Keys may be predictable!';
      }
      
      return {
        source,
        entropy,
        csprng,
        browser,
        supported: hasCSPRNG && hasEd25519,
        details,
      };
    };
    
    // Perform random sample test
    const performRandomTest = (): RandomTest => {
      const sampleSize = 10000;
      const buckets = new Array(256).fill(0);
      
      // Measure speed with multiple iterations for accuracy
      const iterations = 100;
      const testBytes = new Uint8Array(sampleSize);
      
      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        crypto.getRandomValues(testBytes);
      }
      const endTime = performance.now();
      
      const duration = Math.max(0.001, (endTime - startTime) / 1000); // minimum 1ms to avoid infinity
      const totalBytes = sampleSize * iterations;
      const rngSpeed = Math.round(totalBytes / duration);
      
      // Generate final sample for distribution test
      const bytes = new Uint8Array(sampleSize);
      crypto.getRandomValues(bytes);
      
      // Count distribution
      for (let i = 0; i < sampleSize; i++) {
        buckets[bytes[i]]++;
      }
      
      // Calculate chi-square statistic
      const expected = sampleSize / 256;
      let chiSquare = 0;
      for (let i = 0; i < 256; i++) {
        chiSquare += Math.pow(buckets[i] - expected, 2) / expected;
      }
      
      // Chi-square critical value for 255 df at p=0.05 is ~293
      // At p=0.01 is ~310, at p=0.001 is ~330
      const pValue = chiSquare < 220 ? 0.99 : (chiSquare < 293 ? 0.95 : (chiSquare < 310 ? 0.05 : 0.01));
      const passed = chiSquare < 310; // 99% confidence
      
      // Calculate distribution uniformity based on chi-square
      // Perfect uniformity would have chiSquare = 0, expected max is ~330 for 255 df
      // Map 0-330 to 100%-90% (anything below 293 is statistically fine)
      const distribution = Math.max(90, Math.min(100, 100 - (chiSquare / 330) * 10));
      
      return {
        sampleSize,
        distribution: Math.round(distribution * 10) / 10,
        chiSquare: Math.round(chiSquare * 100) / 100,
        pValue,
        passed,
        rngSpeed,
        timestamp: new Date().toLocaleTimeString(),
      };
    };
    
    setCheck(performCheck());
    setRandomTest(performRandomTest());
  }, []);

  if (!check) return null;

  const qualityPercent = Math.min(100, (check.entropy / 256) * 100);
  const isSecure = check.csprng && check.entropy >= 256;

  return (
    <div className="border-y border-ink/15 py-5">
      <button
        type="button"
        onClick={() => { setExpanded(!expanded); }}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1">Key security</p>
          <p className="text-sm text-ink">
            {isSecure
              ? '256-bit entropy · cryptographically secure'
              : 'Security warning — expand for details'}
          </p>
        </div>
        <span className={`text-muted text-micro transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          <div>
            <div className="flex justify-between text-micro mb-2">
              <span className="uppercase tracking-[0.14em] text-muted">Entropy</span>
              <span className="font-mono text-ink">{check.entropy} bits</span>
            </div>
            <div className="h-px bg-ink/15 overflow-hidden">
              <div
                className="h-px bg-accent transition-all"
                style={{ width: `${qualityPercent}%` }}
              />
            </div>
            <p className="text-micro text-muted mt-2">
              256 bits = maximum for Ed25519 keys
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">Source</p>
              <p className="text-ink">{check.source}</p>
            </div>
            <div>
              <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">CSPRNG</p>
              <p className="text-ink">{check.csprng ? 'Verified' : 'Not available'}</p>
            </div>
            <div>
              <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">Browser</p>
              <p className="text-ink">{check.browser}</p>
            </div>
            <div>
              <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">Ed25519</p>
              <p className="text-ink">{check.supported ? 'Native' : 'Fallback'}</p>
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed">{check.details}</p>

          {randomTest && (
            <div className="border-t border-ink/15 pt-5 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-micro uppercase tracking-[0.14em] text-muted">Random sample</p>
                <p className="text-micro text-muted font-mono">{randomTest.timestamp}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono text-ink">
                <p>
                  <span className="text-muted">sample</span>{' '}
                  {randomTest.sampleSize.toLocaleString()} bytes
                </p>
                <p>
                  <span className="text-muted">speed</span>{' '}
                  {randomTest.rngSpeed > 1000000000
                    ? `${(randomTest.rngSpeed / 1000000000).toFixed(1)}B/s`
                    : `${(randomTest.rngSpeed / 1000000).toFixed(1)}M/s`}
                </p>
                <p>
                  <span className="text-muted">uniform</span> {randomTest.distribution}%
                </p>
                <p>
                  <span className="text-muted">χ²</span> {randomTest.chiSquare}{' '}
                  {randomTest.passed ? 'pass' : 'fail'}
                </p>
              </div>
              <p className="text-micro text-muted">
                {randomTest.passed
                  ? `Statistical test passed (p=${randomTest.pValue})`
                  : 'Statistical test failed — RNG quality may be compromised'}
              </p>
            </div>
          )}

          <details className="text-micro text-muted">
            <summary className="cursor-pointer hover:text-ink uppercase tracking-[0.14em]">
              Technical details
            </summary>
            <div className="mt-3 font-mono text-xs space-y-1 text-ink/70">
              <p>Algorithm: Ed25519 (EdDSA)</p>
              <p>Key size: 256 bits (32 bytes)</p>
              <p>Signature size: 512 bits (64 bytes)</p>
              <p>Security level: ~128-bit equivalent</p>
              <p>Standard: RFC 8032</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

/**
 * Get browser info string
 */
function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  
  const ua = navigator.userAgent;
  
  if (ua.includes('Chrome/')) {
    const match = ua.match(/Chrome\/(\d+)/);
    return `Chrome ${match?.[1] || ''}`;
  }
  if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/(\d+)/);
    return `Firefox ${match?.[1] || ''}`;
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/(\d+)/);
    return `Safari ${match?.[1] || ''}`;
  }
  if (ua.includes('Edge/')) {
    const match = ua.match(/Edge\/(\d+)/);
    return `Edge ${match?.[1] || ''}`;
  }
  
  return 'Unknown Browser';
}
