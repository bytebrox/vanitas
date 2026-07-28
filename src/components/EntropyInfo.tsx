'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface EntropyCheck {
  sourceKey: 'webCryptoEd' | 'webCrypto' | 'math' | 'unknown';
  entropy: number;
  csprng: boolean;
  browser: string;
  supported: boolean;
}

interface RandomTest {
  sampleSize: number;
  distribution: number;
  chiSquare: number;
  pValue: number;
  passed: boolean;
  rngSpeed: number;
  timestamp: string;
}

export function EntropyInfo() {
  const t = useTranslations('common');
  const [check, setCheck] = useState<EntropyCheck | null>(null);
  const [randomTest, setRandomTest] = useState<RandomTest | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const hasWebCrypto =
      typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
    const hasCSPRNG =
      typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function';
    const hasEd25519 = hasWebCrypto;

    let sourceKey: EntropyCheck['sourceKey'] = 'unknown';
    let entropy = 0;
    let csprng = false;

    if (hasCSPRNG && hasEd25519) {
      sourceKey = 'webCryptoEd';
      entropy = 256;
      csprng = true;
    } else if (hasCSPRNG) {
      sourceKey = 'webCrypto';
      entropy = 256;
      csprng = true;
    } else {
      sourceKey = 'math';
      entropy = 53;
      csprng = false;
    }

    setCheck({
      sourceKey,
      entropy,
      csprng,
      browser: getBrowserInfo(),
      supported: hasCSPRNG && hasEd25519,
    });

    const sampleSize = 10000;
    const buckets = new Array(256).fill(0);
    const iterations = 100;
    const testBytes = new Uint8Array(sampleSize);
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      crypto.getRandomValues(testBytes);
    }
    const endTime = performance.now();
    const duration = Math.max(0.001, (endTime - startTime) / 1000);
    const rngSpeed = Math.round((sampleSize * iterations) / duration);

    const bytes = new Uint8Array(sampleSize);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < sampleSize; i++) buckets[bytes[i]]++;

    const expected = sampleSize / 256;
    let chiSquare = 0;
    for (let i = 0; i < 256; i++) {
      chiSquare += Math.pow(buckets[i] - expected, 2) / expected;
    }
    const pValue =
      chiSquare < 220 ? 0.99 : chiSquare < 293 ? 0.95 : chiSquare < 310 ? 0.05 : 0.01;
    const passed = chiSquare < 310;
    const distribution = Math.max(90, Math.min(100, 100 - (chiSquare / 330) * 10));

    setRandomTest({
      sampleSize,
      distribution: Math.round(distribution * 10) / 10,
      chiSquare: Math.round(chiSquare * 100) / 100,
      pValue,
      passed,
      rngSpeed,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, []);

  if (!check) return null;

  const qualityPercent = Math.min(100, (check.entropy / 256) * 100);
  const isSecure = check.csprng && check.entropy >= 256;

  const sourceLabel =
    check.sourceKey === 'webCryptoEd'
      ? t('entropySourceWebCryptoEd')
      : check.sourceKey === 'webCrypto'
        ? t('entropySourceWebCrypto')
        : check.sourceKey === 'math'
          ? t('entropySourceMath')
          : t('unknown');

  const detail =
    check.sourceKey === 'webCryptoEd'
      ? t('entropyDetailSecure')
      : check.sourceKey === 'webCrypto'
        ? t('entropyDetailOk')
        : t('entropyDetailBad');

  return (
    <div className="border-y border-ink/15 py-5">
      <button
        type="button"
        onClick={() => {
          setExpanded(!expanded);
        }}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted mb-1">{t('entropyTitle')}</p>
          <p className="text-sm text-ink">{isSecure ? t('entropySecure') : t('entropyWarning')}</p>
        </div>
        <span className={`text-muted text-micro transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          <div>
            <div className="flex justify-between text-micro mb-2">
              <span className="uppercase tracking-[0.14em] text-muted">{t('entropy')}</span>
              <span className="font-mono text-ink">{t('entropyBits', { n: check.entropy })}</span>
            </div>
            <div className="h-px bg-ink/15 overflow-hidden">
              <div className="h-px bg-accent transition-all" style={{ width: `${qualityPercent}%` }} />
            </div>
            <p className="text-micro text-muted mt-2">{t('entropyMaxEd25519')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">{t('source')}</p>
              <p className="text-ink">{sourceLabel}</p>
            </div>
            <div>
              <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">{t('csprng')}</p>
              <p className="text-ink">
                {check.csprng ? t('entropyVerified') : t('entropyNotAvailable')}
              </p>
            </div>
            <div>
              <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">{t('browser')}</p>
              <p className="text-ink">{check.browser}</p>
            </div>
            <div>
              <p className="text-micro uppercase tracking-[0.14em] text-muted mb-1">Ed25519</p>
              <p className="text-ink">
                {check.supported ? t('entropyNative') : t('entropyFallback')}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed">{detail}</p>

          {randomTest && (
            <div className="border-t border-ink/15 pt-5 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-micro uppercase tracking-[0.14em] text-muted">
                  {t('entropyRandomSample')}
                </p>
                <p className="text-micro text-muted font-mono">{randomTest.timestamp}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono text-ink">
                <p>
                  <span className="text-muted">{t('entropySample')}</span>{' '}
                  {randomTest.sampleSize.toLocaleString()} bytes
                </p>
                <p>
                  <span className="text-muted">{t('entropySpeed')}</span>{' '}
                  {randomTest.rngSpeed > 1000000000
                    ? `${(randomTest.rngSpeed / 1000000000).toFixed(1)}B/s`
                    : `${(randomTest.rngSpeed / 1000000).toFixed(1)}M/s`}
                </p>
                <p>
                  <span className="text-muted">{t('entropyUniform')}</span> {randomTest.distribution}%
                </p>
                <p>
                  <span className="text-muted">χ²</span> {randomTest.chiSquare}{' '}
                  {randomTest.passed ? t('entropyPass') : t('entropyFail')}
                </p>
              </div>
              <p className="text-micro text-muted">
                {randomTest.passed
                  ? t('entropyTestPassed', { p: randomTest.pValue })
                  : t('entropyTestFailed')}
              </p>
            </div>
          )}

          <details className="text-micro text-muted">
            <summary className="cursor-pointer hover:text-ink uppercase tracking-[0.14em]">
              {t('entropyTechnical')}
            </summary>
            <div className="mt-3 font-mono text-xs space-y-1 text-ink/70">
              <p>{t('entropyAlgo')}</p>
              <p>{t('entropyKeySize')}</p>
              <p>{t('entropySigSize')}</p>
              <p>{t('entropySecLevel')}</p>
              <p>{t('entropyStandard')}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

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
  if (ua.includes('Edge/') || ua.includes('Edg/')) {
    const match = ua.match(/Edg?\/(\d+)/);
    return `Edge ${match?.[1] || ''}`;
  }
  return 'Unknown';
}
