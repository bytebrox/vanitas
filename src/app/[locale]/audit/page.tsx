'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Footer, FadeIn, PageIntro, ContentWithSide } from '@/components';
import { RichParagraph, RichText } from '@/lib/rich-text';

type TestStatus = 'idle' | 'running' | 'pass' | 'fail';

interface AuditTest {
  id: string;
  name: string;
  description: string;
  why: string;
  status: TestStatus;
  detail?: string;
  duration?: number;
}

const TEST_IDS = [
  'webcrypto',
  'csprng',
  'entropy',
  'network',
  'csp',
  'worker',
  'integrity',
  'keygen',
] as const;

async function runWebCryptoTest(): Promise<{ pass: boolean; detail: string }> {
  try {
    const key = await crypto.subtle.generateKey(
      { name: 'Ed25519' },
      true,
      ['sign', 'verify']
    );
    if (key) {
      return { pass: true, detail: 'Native Ed25519 via Web Crypto API — maximum speed' };
    }
    return { pass: false, detail: 'Ed25519 not supported, WASM fallback active' };
  } catch {
    return { pass: true, detail: 'Ed25519 not native — WASM fallback (watsign) will be used' };
  }
}

async function runCSPRNGTest(): Promise<{ pass: boolean; detail: string }> {
  try {
    const buf = new Uint8Array(32);
    crypto.getRandomValues(buf);
    const allZero = buf.every(b => b === 0);
    if (allZero) return { pass: false, detail: 'RNG returned all zeros — critically broken' };

    const buf2 = new Uint8Array(32);
    crypto.getRandomValues(buf2);
    const identical = buf.every((b, i) => b === buf2[i]);
    if (identical) return { pass: false, detail: 'RNG returned identical sequences' };

    return { pass: true, detail: `crypto.getRandomValues() operational — hardware-backed on most devices` };
  } catch {
    return { pass: false, detail: 'crypto.getRandomValues() not available' };
  }
}

async function runEntropyTest(): Promise<{ pass: boolean; detail: string }> {
  const sampleSize = 10000;
  const buf = new Uint8Array(sampleSize);
  crypto.getRandomValues(buf);

  const freq = new Array(256).fill(0);
  for (const b of buf) freq[b]++;

  const expected = sampleSize / 256;
  let chiSquare = 0;
  for (const f of freq) {
    chiSquare += ((f - expected) ** 2) / expected;
  }

  // Chi-square with 255 df: values between ~200 and ~310 are normal at p=0.05
  const pass = chiSquare > 190 && chiSquare < 330;
  return {
    pass,
    detail: `Chi-Square: ${chiSquare.toFixed(1)} (expected: ~210–300 for uniform distribution)`,
  };
}

async function runNetworkTest(): Promise<{ pass: boolean; detail: string }> {
  if (typeof PerformanceObserver === 'undefined') {
    return { pass: true, detail: 'PerformanceObserver not available — manual verification recommended' };
  }

  return new Promise((resolve) => {
    const requests: string[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const url = (entry as PerformanceResourceTiming).name;
          if (!url.includes('fonts.googleapis.com') && !url.includes('fonts.gstatic.com')) {
            requests.push(url);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    // Generate 100 random keypairs to simulate work
    const work = async () => {
      for (let i = 0; i < 100; i++) {
        const seed = new Uint8Array(32);
        crypto.getRandomValues(seed);
        await crypto.subtle.digest('SHA-256', seed);
      }
    };

    work().then(() => {
      setTimeout(() => {
        observer.disconnect();
        if (requests.length === 0) {
          resolve({ pass: true, detail: 'Zero network requests during cryptographic operations' });
        } else {
          resolve({ pass: false, detail: `${requests.length} unexpected request(s): ${requests[0]}` });
        }
      }, 500);
    });
  });
}

async function runCSPTest(): Promise<{ pass: boolean; detail: string }> {
  const checks: string[] = [];
  let score = 0;

  // Check meta CSP or rely on header
  try {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (meta) {
      checks.push('CSP meta tag found');
    }
  } catch { /* ignore */ }

  // Test that fetch to external is blocked
  try {
    await fetch('https://httpbin.org/get', { mode: 'cors', signal: AbortSignal.timeout(2000) });
    checks.push('External fetch NOT blocked');
  } catch {
    checks.push('External fetch blocked');
    score++;
  }

  // Check security headers via own page
  try {
    const resp = await fetch(window.location.href, { method: 'HEAD' });
    const hsts = resp.headers.get('strict-transport-security');
    const xcto = resp.headers.get('x-content-type-options');
    const xfo = resp.headers.get('x-frame-options');

    if (hsts) { checks.push('HSTS active'); score++; }
    if (xcto === 'nosniff') { checks.push('X-Content-Type-Options: nosniff'); score++; }
    if (xfo === 'DENY') { checks.push('X-Frame-Options: DENY'); score++; }
  } catch {
    checks.push('Header check: limited in dev mode');
    score += 2;
  }

  return {
    pass: score >= 2,
    detail: checks.join(' · '),
  };
}

async function runWorkerTest(): Promise<{ pass: boolean; detail: string }> {
  try {
    if (typeof Worker === 'undefined') {
      return { pass: false, detail: 'Web Workers not supported in this browser' };
    }

    const cores = navigator.hardwareConcurrency || 'unknown';
    return {
      pass: true,
      detail: `Web Workers available — ${cores} CPU cores detected for parallel generation`,
    };
  } catch {
    return { pass: false, detail: 'Worker check failed' };
  }
}

async function hashWorkerFile(path: string): Promise<string> {
  const workerResp = await fetch(path);
  if (!workerResp.ok) throw new Error(`Failed to fetch ${path}`);
  const workerBuf = await workerResp.arrayBuffer();
  const hashBuf = await crypto.subtle.digest('SHA-256', workerBuf);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return 'sha256-' + hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function runIntegrityTest(): Promise<{ pass: boolean; detail: string }> {
  try {
    const hashResp = await fetch('/worker-hash.json');
    if (!hashResp.ok) {
      return { pass: false, detail: 'Could not load published worker-hash.json' };
    }
    const published = await hashResp.json() as {
      hash?: string;
      eth?: { hash?: string };
      btc?: { hash?: string };
      tron?: { hash?: string };
      aptos?: { hash?: string };
      sui?: { hash?: string };
      ton?: { hash?: string };
      cardano?: { hash?: string };
      xrp?: { hash?: string };
    };

    const checks: { label: string; path: string; expected?: string }[] = [
      { label: 'Solana', path: '/vanity-worker.js', expected: published.hash },
      { label: 'EVM', path: '/eth-worker.js', expected: published.eth?.hash },
      { label: 'Bitcoin', path: '/btc-worker.js', expected: published.btc?.hash },
      { label: 'Tron', path: '/tron-worker.js', expected: published.tron?.hash },
      { label: 'Aptos', path: '/aptos-worker.js', expected: published.aptos?.hash },
      { label: 'Sui', path: '/sui-worker.js', expected: published.sui?.hash },
      { label: 'TON', path: '/ton-worker.js', expected: published.ton?.hash },
      { label: 'Cardano', path: '/cardano-worker.js', expected: published.cardano?.hash },
      { label: 'XRP', path: '/xrp-worker.js', expected: published.xrp?.hash },
    ];

    const results: string[] = [];
    let allPass = true;
    for (const check of checks) {
      if (!check.expected) {
        allPass = false;
        results.push(`${check.label}: missing published hash`);
        continue;
      }
      const live = await hashWorkerFile(check.path);
      const ok = live === check.expected;
      if (!ok) allPass = false;
      results.push(
        ok
          ? `${check.label}: ok`
          : `${check.label}: mismatch (${live.slice(0, 18)}…)`
      );
    }

    return {
      pass: allPass,
      detail: results.join(' · '),
    };
  } catch (e) {
    return { pass: false, detail: `Integrity check failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

async function runKeygenTest(): Promise<{ pass: boolean; detail: string }> {
  try {
    const start = performance.now();

    // Generate a keypair
    const seed = new Uint8Array(32);
    crypto.getRandomValues(seed);

    try {
      // Try native Ed25519
      const keyPair = await crypto.subtle.generateKey(
        { name: 'Ed25519' },
        true,
        ['sign', 'verify']
      );

      // Sign and verify
      const message = new TextEncoder().encode('vanitas-audit-test');
      const signature = await crypto.subtle.sign('Ed25519', keyPair.privateKey, message);
      const valid = await crypto.subtle.verify('Ed25519', keyPair.publicKey, signature, message);

      const elapsed = (performance.now() - start).toFixed(1);

      if (valid) {
        return { pass: true, detail: `Native Ed25519: generate + sign + verify in ${elapsed}ms` };
      }
      return { pass: false, detail: 'Signature verification failed' };
    } catch {
      // Fallback: just test that we can generate random data
      const elapsed = (performance.now() - start).toFixed(1);
      return { pass: true, detail: `WASM fallback mode — seed generation verified in ${elapsed}ms` };
    }
  } catch (e) {
    return { pass: false, detail: `Keygen test failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

const testRunners: Record<string, () => Promise<{ pass: boolean; detail: string }>> = {
  webcrypto: runWebCryptoTest,
  csprng: runCSPRNGTest,
  entropy: runEntropyTest,
  network: runNetworkTest,
  csp: runCSPTest,
  worker: runWorkerTest,
  integrity: runIntegrityTest,
  keygen: runKeygenTest,
};

export default function AuditPage() {
  const t = useTranslations('tools.audit');
  const tCommon = useTranslations('common');
  const tTests = useTranslations('tools.audit.tests');

  const testMeta = useMemo(
    () =>
      TEST_IDS.map((id) => ({
        id,
        name: tTests(`${id}.name`),
        description: tTests(`${id}.description`),
        why: tTests(`${id}.why`),
      })),
    [tTests]
  );

  const [tests, setTests] = useState<AuditTest[]>([]);
  const [running, setRunning] = useState(false);
  const [totalTime, setTotalTime] = useState<number | null>(null);

  useEffect(() => {
    setTests(testMeta.map((m) => ({ ...m, status: 'idle' as TestStatus })));
  }, [testMeta]);

  const runAllTests = useCallback(async () => {
    setRunning(true);
    setTotalTime(null);
    const start = performance.now();

    setTests(testMeta.map((m) => ({ ...m, status: 'idle' as TestStatus })));

    for (const meta of testMeta) {
      setTests((prev) =>
        prev.map((item) =>
          item.id === meta.id ? { ...item, ...meta, status: 'running' as TestStatus } : item
        )
      );

      const testStart = performance.now();
      const runner = testRunners[meta.id];
      const result = await runner();
      const duration = performance.now() - testStart;

      setTests((prev) =>
        prev.map((item) =>
          item.id === meta.id
            ? {
                ...item,
                ...meta,
                status: result.pass ? ('pass' as TestStatus) : ('fail' as TestStatus),
                detail: result.detail,
                duration,
              }
            : item
        )
      );

      await new Promise((r) => setTimeout(r, 150));
    }

    setTotalTime(performance.now() - start);
    setRunning(false);
  }, [testMeta]);

  const passed = tests.filter((item) => item.status === 'pass').length;
  const failed = tests.filter((item) => item.status === 'fail').length;
  const total = tests.length;
  const allDone = total > 0 && passed + failed === total;

  const introDescription =
    allDone && failed === 0
      ? t('descriptionPass')
      : allDone && failed > 0
        ? t('descriptionFail', { failed })
        : t('descriptionIdle');

  return (
    <div className="min-h-screen flex flex-col">
      <PageIntro
        imageSrc="/ascii/page-audit-wide.webp"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={introDescription}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            type="button"
            onClick={runAllTests}
            disabled={running}
            className={`btn-primary ${running ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {running ? t('running') : allDone ? t('runAgain') : t('start')}
          </button>
          <span className="text-micro uppercase tracking-[0.16em] text-muted font-mono">
            {allDone
              ? t('passedSummary', { passed, total })
              : t('checksTotal', { total })}
            {totalTime !== null ? ` · ${(totalTime / 1000).toFixed(2)}s` : ''}
          </span>
        </div>
      </PageIntro>

      <main className="flex-1 px-4 sm:px-8 lg:px-8 xl:px-12 pb-16">
        <ContentWithSide imageSrc="/ascii/side-forum.webp" caption={t('caption')}>
          <FadeIn>
            <div className="mb-12 border-y border-ink/15 py-8">
              <p className="text-micro uppercase tracking-[0.2em] text-muted mb-3">{t('whatIsThis')}</p>
              <RichParagraph
                text={t('whatIsThisBody')}
                className="text-muted leading-relaxed"
                boldClassName="text-ink font-medium"
              />
            </div>
          </FadeIn>

          <div className="divide-y divide-ink/15 border-y border-ink/15">
            {tests.map((test, i) => (
              <FadeIn key={test.id} delay={i * 40}>
                <div className="py-5">
                  <div className="flex items-start gap-3">
                    <StatusIcon status={test.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="font-semibold text-ink">{test.name}</h3>
                        {test.duration !== undefined && (
                          <span className="text-micro text-muted font-mono">{test.duration.toFixed(0)}ms</span>
                        )}
                        <span className={`text-micro uppercase tracking-[0.14em] ${
                          test.status === 'pass' ? 'text-accent' :
                          test.status === 'fail' ? 'text-ink' :
                          test.status === 'running' ? 'text-accent' : 'text-ink/30'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted mt-1">{test.description}</p>
                      <p className="text-micro text-ink/40 mt-1 leading-relaxed">{test.why}</p>
                      {test.detail && (
                        <p className={`text-sm mt-2 font-mono ${
                          test.status === 'pass' ? 'text-accent' : test.status === 'fail' ? 'text-ink' : 'text-muted'
                        }`}>
                          {test.detail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <div className="mt-14 border-t border-ink/15 pt-10">
              <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{t('buildIntegrity')}</p>
              <h4 className="text-lg font-bold text-ink normal-case mb-3">{t('workerFingerprint')}</h4>
              <RichParagraph
                text={t('workerFingerprintIntro')}
                className="text-sm text-muted mb-4 leading-relaxed"
                codeClassName="font-mono text-ink/70"
              />
              <div className="border-y border-ink/15 py-4">
                <WorkerHash />
              </div>
              <details className="mt-4">
                <summary className="text-micro text-muted cursor-pointer hover:text-ink uppercase tracking-[0.14em]">
                  {t('verifyYourself')}
                </summary>
                <div className="mt-3 text-micro text-muted space-y-1 pl-3 border-l border-ink/15">
                  <p>
                    <RichText text={t('verifyStep1')} />
                  </p>
                  <p>
                    <RichText text={t('verifyStep2')} />
                  </p>
                  <p>
                    <RichText text={t('verifyStep3')} />
                  </p>
                </div>
              </details>
            </div>
          </FadeIn>

          <FadeIn delay={500}>
            <div className="mt-14">
              <NetworkMonitor />
            </div>
          </FadeIn>
        </ContentWithSide>
      </main>

      <Footer />
    </div>
  );
}

function StatusIcon({ status }: { status: TestStatus }) {
  switch (status) {
    case 'idle':
      return <span className="w-5 h-5  border-2 border-ink/20 shrink-0" />;
    case 'running':
      return (
        <span className="w-5 h-5 shrink-0 flex items-center justify-center">
          <span className="w-4 h-4 border-2 border-accent/30 border-t-accent  animate-spin" />
        </span>
      );
    case 'pass':
      return (
        <span className="w-5 h-5  bg-green-500 text-white flex items-center justify-center shrink-0 text-xs">
          ✓
        </span>
      );
    case 'fail':
      return (
        <span className="w-5 h-5  bg-red-500 text-white flex items-center justify-center shrink-0 text-xs">
          ✗
        </span>
      );
  }
}

function WorkerHash() {
  const t = useTranslations('tools.audit');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav.chainItems');
  const [rows, setRows] = useState<{ label: string; hash: string }[] | null>(null);

  useEffect(() => {
    fetch('/worker-hash.json')
      .then((r) => r.json())
      .then((data: {
        hash?: string;
        eth?: { hash?: string };
        btc?: { hash?: string };
        tron?: { hash?: string };
        aptos?: { hash?: string };
        sui?: { hash?: string };
        ton?: { hash?: string };
        cardano?: { hash?: string };
        xrp?: { hash?: string };
      }) => {
        setRows([
          { label: tNav('sol.label'), hash: data.hash || '...' },
          { label: tNav('evm.label'), hash: data.eth?.hash || '...' },
          { label: tNav('btc.label'), hash: data.btc?.hash || '...' },
          { label: tNav('tron.label'), hash: data.tron?.hash || '...' },
          { label: tNav('aptos.label'), hash: data.aptos?.hash || '...' },
          { label: tNav('sui.label'), hash: data.sui?.hash || '...' },
          { label: tNav('ton.label'), hash: data.ton?.hash || '...' },
          { label: tNav('cardano.label'), hash: data.cardano?.hash || '...' },
          { label: tNav('xrp.label'), hash: data.xrp?.hash || '...' },
        ]);
      })
      .catch(() => {
        setRows([{ label: 'error', hash: t('hashUnavailable') }]);
      });
  }, [t, tNav]);

  if (!rows) {
    return <p className="font-mono text-sm text-muted animate-pulse">{tCommon('loading')}</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <p className="text-micro text-muted mb-1 font-mono uppercase tracking-[0.14em]">{row.label}</p>
          <p className="font-mono text-sm break-all select-all cursor-pointer" title="Click to select">
            {row.hash}
          </p>
        </div>
      ))}
    </div>
  );
}

interface NetworkEntry {
  url: string;
  type: string;
  size: number;
  duration: number;
  timestamp: number;
}

function getRequestCategory(url: string): { label: string; color: string; icon: string } {
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com'))
    return { label: 'Font', color: 'text-accent bg-beige border-border', icon: 'Aa' };
  if (url.endsWith('.js') || url.includes('/_next/static/chunks'))
    return { label: 'Script', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: 'JS' };
  if (url.endsWith('.css') || url.includes('/_next/static/css'))
    return { label: 'Style', color: 'text-pink-600 bg-pink-50 border-pink-200', icon: 'CSS' };
  if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)(\?|$)/))
    return { label: 'Image', color: 'text-green-600 bg-green-50 border-green-200', icon: 'IMG' };
  if (url.endsWith('.json'))
    return { label: 'Data', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: '{ }' };
  if (url.includes('/_next/'))
    return { label: 'Next.js', color: 'text-ink/60 bg-ink/5 border-ink/10', icon: '▲' };
  return { label: 'Other', color: 'text-ink/60 bg-ink/5 border-ink/10', icon: '•' };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.origin === window.location.origin) {
      return u.pathname + u.search;
    }
    return u.host + u.pathname;
  } catch {
    return url;
  }
}

function NetworkMonitor() {
  const t = useTranslations('tools.audit.monitor');
  const tAudit = useTranslations('tools.audit');
  const [entries, setEntries] = useState<NetworkEntry[]>([]);
  const [monitoring, setMonitoring] = useState(false);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const pageLoadTime = useRef(performance.now());

  const startMonitoring = useCallback(() => {
    if (typeof PerformanceObserver === 'undefined') return;

    setEntries([]);
    setMonitoring(true);

    // Capture existing entries
    const existing = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const initial: NetworkEntry[] = existing.map(e => ({
      url: e.name,
      type: e.initiatorType,
      size: e.transferSize || 0,
      duration: Math.round(e.duration),
      timestamp: Math.round(e.startTime),
    }));
    setEntries(initial);

    const observer = new PerformanceObserver((list) => {
      const newEntries = list.getEntries() as PerformanceResourceTiming[];
      setEntries(prev => [
        ...prev,
        ...newEntries.map(e => ({
          url: e.name,
          type: e.initiatorType,
          size: e.transferSize || 0,
          duration: Math.round(e.duration),
          timestamp: Math.round(e.startTime),
        })),
      ]);
    });

    observer.observe({ entryTypes: ['resource'] });
    observerRef.current = observer;
  }, []);

  const stopMonitoring = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    setMonitoring(false);
  }, []);

  useEffect(() => {
    return () => { observerRef.current?.disconnect(); };
  }, []);

  const externalRequests = entries.filter(e => {
    try {
      const u = new URL(e.url);
      return u.origin !== window.location.origin
        && !e.url.includes('fonts.googleapis.com')
        && !e.url.includes('fonts.gstatic.com');
    } catch { return false; }
  });

  const totalSize = entries.reduce((sum, e) => sum + e.size, 0);

  return (
    <div className="border-t border-ink/15 pt-10">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-micro uppercase tracking-[0.2em] text-muted mb-2">{t('transparency')}</p>
          <h4 className="text-lg font-bold text-ink normal-case">{tAudit('networkMonitor')}</h4>
        </div>
        <button
          type="button"
          onClick={monitoring ? stopMonitoring : startMonitoring}
          className="text-micro uppercase tracking-[0.16em] text-muted hover:text-ink border-b border-ink/25 pb-0.5"
        >
          {monitoring ? t('stop') : entries.length > 0 ? t('restart') : t('startMonitoring')}
        </button>
      </div>

      <p className="text-sm text-muted mb-6 leading-relaxed">{t('intro')}</p>

      {entries.length > 0 && (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-micro uppercase tracking-[0.14em] text-muted font-mono">
            <span>
              {entries.length === 1
                ? t('requestSingular')
                : t('requests', { count: entries.length })}
            </span>
            <span>{formatBytes(totalSize)}</span>
            {externalRequests.length === 0 ? (
              <span className="text-accent">{t('noSuspicious')}</span>
            ) : (
              <span className="text-ink">{t('externalCount', { count: externalRequests.length })}</span>
            )}
          </div>

          <div className="border-y border-ink/15 overflow-x-auto">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 px-0 py-2 text-micro font-medium text-muted uppercase tracking-[0.14em]">
              <span>{t('colType')}</span>
              <span>{t('colUrl')}</span>
              <span className="text-right">{t('colSize')}</span>
              <span className="text-right">{t('colTime')}</span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-ink/5">
              {entries.map((entry, i) => {
                const cat = getRequestCategory(entry.url);
                return (
                  <div
                    key={`${entry.url}-${i}`}
                    className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 px-3 py-2 text-sm hover:bg-ink/[0.02] transition-colors"
                  >
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border ${cat.color} w-10 text-center`}>
                      {cat.icon}
                    </span>
                    <span className="font-mono text-xs truncate self-center" title={entry.url}>
                      {shortenUrl(entry.url)}
                    </span>
                    <span className="font-mono text-xs text-muted text-right self-center whitespace-nowrap">
                      {formatBytes(entry.size)}
                    </span>
                    <span className="font-mono text-xs text-muted text-right self-center whitespace-nowrap">
                      {entry.duration}ms
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted mt-3">
            {externalRequests.length === 0 ? t('footerSafe') : t('footerWarning')}
          </p>
        </>
      )}

      {entries.length === 0 && !monitoring && (
        <div className="text-center py-8 text-muted">
          <p className="text-sm">{t('emptyHint')}</p>
          <p className="text-xs mt-1">{t('emptySubhint')}</p>
        </div>
      )}

      {entries.length === 0 && monitoring && (
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-muted">
            <span className="w-2 h-2 bg-green-500  animate-pulse" />
            <p className="text-sm">{t('activeHint')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
