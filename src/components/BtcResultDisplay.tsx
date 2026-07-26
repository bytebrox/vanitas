'use client';

import { useState } from 'react';
import type { GeneratedBtcResult } from '@/types/btc';
import { formatNumber, formatDuration } from '@/lib/format';
import { EntropyInfo } from './EntropyInfo';
import { ShareProofButton } from './ShareProofButton';

interface BtcResultDisplayProps {
  result: GeneratedBtcResult;
  onReset: () => void;
}

function modeLabel(mode: GeneratedBtcResult['mode']): string {
  if (mode === 'taproot') return 'TAPROOT bc1p';
  if (mode === 'segwit') return 'SEGWIT bc1q';
  return 'LEGACY 1…';
}

export function BtcResultDisplay({ result, onReset }: BtcResultDisplayProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => { setCopiedField(null); }, 2000);
    } catch {
      /* ignore */
    }
  };

  const downloadTxt = () => {
    const content = `VANITAS - BITCOIN VANITY (${modeLabel(result.mode)})
===============================================
Generated: ${new Date().toISOString()}

ADDRESS:
${result.address}

PRIVATE KEY (WIF, compressed):
${result.privateKeyWif}

PRIVATE KEY (hex):
${result.privateKeyHex}

===============================================
Import WIF into Electrum, Sparrow, BlueWallet, etc.
(Taproot: use a Taproot-capable wallet; key is still standard secp256k1 WIF.)

IMPORTANT:
- Never share the private key
- Generated locally in your browser
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `btc-${result.address.slice(0, 12)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const payload = {
      chain: 'bitcoin',
      network: 'mainnet',
      mode: result.mode,
      address: result.address,
      privateKeyWif: result.privateKeyWif,
      privateKeyHex: result.privateKeyHex,
      generatedAt: new Date().toISOString(),
      importHint: 'Import privateKeyWif into Electrum, Sparrow, or another Bitcoin wallet.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `btc-${result.address.slice(0, 12)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <header className="border-b border-ink/15 pb-6">
        <p className="text-micro uppercase tracking-[0.2em] text-accent mb-2">Found</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink normal-case tracking-tight mb-2">
          Bitcoin address ready
        </h2>
        <p className="text-sm text-muted font-mono">
          {formatNumber(result.attempts)} attempts · {formatDuration(result.duration)} · {result.mode}
        </p>
      </header>

      <section className="border-y border-ink/15 divide-y divide-ink/15">
        <div className="py-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">Address</p>
            <button
              type="button"
              onClick={() => { void copyToClipboard(result.address, 'address'); }}
              className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              {copiedField === 'address' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="font-mono text-base sm:text-lg break-all leading-relaxed text-ink">
            {result.address}
          </p>
        </div>

        <div className="py-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">Private key (WIF)</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => { setShowPrivateKey(!showPrivateKey); }}
                className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
              >
                {showPrivateKey ? 'Hide' : 'Reveal'}
              </button>
              {showPrivateKey && (
                <button
                  type="button"
                  onClick={() => { void copyToClipboard(result.privateKeyWif, 'wif'); }}
                  className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
                >
                  {copiedField === 'wif' ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
          <p className="font-mono text-base sm:text-lg break-all leading-relaxed">
            {showPrivateKey ? (
              <span className="text-accent">{result.privateKeyWif}</span>
            ) : (
              <span className="text-ink/25 select-none tracking-widest">••••••••••••••••••••••••••••••••</span>
            )}
          </p>
          <p className="text-micro text-muted mt-3 normal-case tracking-normal leading-relaxed">
            Import WIF into Electrum, Sparrow, BlueWallet, etc.
          </p>
        </div>
      </section>

      <EntropyInfo />

      <section className="border-t border-ink/15 pt-8 space-y-5">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-micro uppercase tracking-[0.16em]">
          <button
            type="button"
            onClick={downloadTxt}
            className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
          >
            Download txt
          </button>
          <button
            type="button"
            onClick={downloadJson}
            className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
          >
            Download json
          </button>
          <ShareProofButton
            chain="btc"
            address={result.address}
            matchedPattern={result.matchedPattern}
            attempts={result.attempts}
            duration={result.duration}
            mode={result.mode}
          />
          <button
            type="button"
            onClick={onReset}
            className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
          >
            Forge another
          </button>
        </div>
        <p className="text-micro text-muted">Share proof links never include private keys</p>
      </section>
    </div>
  );
}
