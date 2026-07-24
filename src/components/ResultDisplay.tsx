'use client';

/**
 * Wallet result — open ledger, no card chrome
 */

import { useState } from 'react';
import { GeneratedKeypair } from '@/types';
import { formatNumber, formatDuration } from '@/lib/format';
import { DomainSuggestions } from './DomainSuggestions';
import { EntropyInfo } from './EntropyInfo';

interface ResultDisplayProps {
  result: GeneratedKeypair;
  onReset: () => void;
}

export function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => { setCopiedField(null); }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadTxt = () => {
    const content = `VANITAS - SOLANA KEYPAIR
============================
Generated: ${new Date().toISOString()}

PUBLIC KEY (Address):
${result.publicKey}

PRIVATE KEY (Keep secret!):
${result.privateKey}

============================
IMPORTANT:
- Never share your private key
- Store this file securely
- This keypair was generated locally in your browser
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solana-keypair-${result.publicKey.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const secretKeyArray = Array.from(result.secretKey);
    const blob = new Blob([JSON.stringify(secretKeyArray)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solana-keypair-${result.publicKey.slice(0, 8)}.json`;
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
          Address ready
        </h2>
        <p className="text-sm text-muted font-mono">
          {formatNumber(result.attempts)} attempts · {formatDuration(result.duration)}
        </p>
      </header>

      <section className="border-y border-ink/15 divide-y divide-ink/15">
        <div className="py-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">Public address</p>
            <button
              type="button"
              onClick={() => { void copyToClipboard(result.publicKey, 'public'); }}
              className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              {copiedField === 'public' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="font-mono text-base sm:text-lg break-all leading-relaxed text-ink">
            <HighlightedKey pubkey={result.publicKey} pattern={result.matchedPattern} />
          </p>
        </div>

        <div className="py-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">Private key</p>
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
                  onClick={() => { void copyToClipboard(result.privateKey, 'private'); }}
                  className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
                >
                  {copiedField === 'private' ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
          <p className="font-mono text-base sm:text-lg break-all leading-relaxed">
            {showPrivateKey ? (
              <span className="text-accent">{result.privateKey}</span>
            ) : (
              <span className="text-ink/25 select-none tracking-widest">••••••••••••••••••••••••••••••••</span>
            )}
          </p>
        </div>
      </section>

      <section>
        <p className="text-micro uppercase tracking-[0.18em] text-accent mb-3">Keep safe</p>
        <ul className="text-sm text-muted space-y-2 leading-relaxed">
          <li>Save the private key before leaving this page</li>
          <li>Never share it — anyone with it controls the wallet</li>
          <li>Generated locally; nothing was stored on a server</li>
        </ul>
      </section>

      <DomainSuggestions pattern={result.matchedPattern} />
      <EntropyInfo />

      <section className="border-t border-ink/15 pt-8 space-y-5">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-micro uppercase tracking-[0.16em]">
          <button type="button" onClick={downloadTxt} className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent">
            Download txt
          </button>
          <button type="button" onClick={downloadJson} className="text-muted hover:text-ink">
            Download json
          </button>
          <button type="button" onClick={onReset} className="text-muted hover:text-ink">
            Forge another
          </button>
        </div>
        <p className="text-micro text-muted">
          TXT for reading · JSON for Solana CLI / Phantom / Solflare
        </p>
      </section>
    </div>
  );
}

function HighlightedKey({
  pubkey,
  pattern,
}: {
  pubkey: string;
  pattern: string;
}) {
  const parts = pattern.split('...');
  const prefix = parts[0] || '';
  const suffix = parts[1] || '';
  const prefixLen = prefix.length;
  const suffixLen = suffix.length;

  if (prefixLen === 0 && suffixLen === 0) {
    return <span>{pubkey}</span>;
  }

  return (
    <>
      {prefixLen > 0 && (
        <span className="text-accent font-bold">{pubkey.slice(0, prefixLen)}</span>
      )}
      <span>{pubkey.slice(prefixLen, suffixLen > 0 ? -suffixLen : undefined)}</span>
      {suffixLen > 0 && (
        <span className="text-accent font-bold">{pubkey.slice(-suffixLen)}</span>
      )}
    </>
  );
}
