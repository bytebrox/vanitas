'use client';

/**
 * Sui vanity result — Ed25519 wallet
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { GeneratedSuiResult } from '@/types/sui';
import { formatNumber, formatDuration } from '@/lib/format';
import { buildVanityExportTxt } from '@/lib/export-txt';
import { EntropyInfo } from './EntropyInfo';
import { ShareProofButton } from './ShareProofButton';
import { ShareCardButton } from './ShareCardButton';
import { PostFindPlaybook } from './PostFindPlaybook';
import { ImportGuide } from './ImportGuide';
import { LaunchKit } from './LaunchKit';

interface SuiResultDisplayProps {
  result: GeneratedSuiResult;
  onReset: () => void;
  onContinueSearch?: () => void;
}

export function SuiResultDisplay({ result, onReset, onContinueSearch }: SuiResultDisplayProps) {
  const t = useTranslations('common');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch {
      /* ignore */
    }
  };

  const shortId = result.address.slice(2, 10);

  const downloadTxt = () => {
    const content = buildVanityExportTxt(t, {
      title: `${t('exportTxtTitle')} — SUI`,
      address: result.address,
      privateKey: result.privateKey,
      extraLines: [`PUBLIC KEY:\n${result.publicKey}`],
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sui-${shortId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const payload = {
      chain: 'sui',
      address: result.address,
      publicKey: result.publicKey,
      privateKey: result.privateKey,
      generatedAt: new Date().toISOString(),
      importHint: 'Import privateKey (hex) into Sui Wallet, Suiet, or another Sui wallet.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sui-${shortId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <header className="border-b border-ink/15 pb-6">
        <p className="text-micro uppercase tracking-[0.2em] text-accent mb-2">Found</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink normal-case tracking-[0.02em] mb-2">
          Sui address ready
        </h2>
        <p className="text-sm text-muted font-mono">
          {formatNumber(result.attempts)} attempts · {formatDuration(result.duration)}
        </p>
      </header>

      <section className="border-y border-ink/15 divide-y divide-ink/15">
        <div className="py-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">Address</p>
            <button
              type="button"
              onClick={() => {
                void copyToClipboard(result.address, 'address');
              }}
              className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              {copiedField === 'address' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="font-mono text-base sm:text-lg break-all leading-relaxed text-ink">
            <HighlightedHexAddress address={result.address} pattern={result.matchedPattern} />
          </p>
        </div>

        <div className="py-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">Private key</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowPrivateKey(!showPrivateKey);
                }}
                className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
              >
                {showPrivateKey ? 'Hide' : 'Reveal'}
              </button>
              {showPrivateKey && (
                <button
                  type="button"
                  onClick={() => {
                    void copyToClipboard(result.privateKey, 'private');
                  }}
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
              <span className="text-ink/25 select-none tracking-widest">
                ••••••••••••••••••••••••••••••••
              </span>
            )}
          </p>
        </div>
      </section>
      <PostFindPlaybook chain="sui" mode={'wallet'} address={result.address} />
      <ImportGuide chain="sui" mode={'wallet'} />

      <section className="border-t border-ink/15 pt-8 space-y-5">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-micro uppercase tracking-[0.16em]">
          <button
            type="button"
            onClick={downloadTxt}
            className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
          >
            Download txt
          </button>
          <button type="button" onClick={downloadJson} className="text-muted hover:text-ink">
            Download json
          </button>
          <ShareProofButton
            chain="sui"
            address={result.address}
            matchedPattern={result.matchedPattern}
            attempts={result.attempts}
            duration={result.duration}
          />
          <ShareCardButton
            chain={"sui"}
            address={result.address}
            matchedPattern={result.matchedPattern}
            attempts={result.attempts}
            duration={result.duration}
          />
          {onContinueSearch && (
            <button type="button" onClick={onContinueSearch} className="text-ink hover:text-accent">
              {t('continueSearch')}
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
          >{t('forgeAnother')}</button>
        </div>
      </section>

      <LaunchKit
        chain="sui"
        mode={'wallet'}
        address={result.address}
        matchedPattern={result.matchedPattern}
        attempts={result.attempts}
        duration={result.duration}
      />

      <EntropyInfo />
    </div>
  );
}

function HighlightedHexAddress({
  address,
  pattern,
}: {
  address: string;
  pattern: string;
}) {
  const parts = pattern.split('...');
  const prefix = (parts[0] || '').toLowerCase();
  const suffix = (parts[1] || '').toLowerCase();
  const body = address.slice(2);
  const prefixLen = prefix.length;
  const suffixLen = suffix.length;

  if (prefixLen === 0 && suffixLen === 0) {
    return <span>{address}</span>;
  }

  return (
    <>
      <span>0x</span>
      {prefixLen > 0 && (
        <span className="text-accent font-bold">{body.slice(0, prefixLen)}</span>
      )}
      <span>{body.slice(prefixLen, suffixLen > 0 ? -suffixLen : undefined)}</span>
      {suffixLen > 0 && (
        <span className="text-accent font-bold">{body.slice(-suffixLen)}</span>
      )}
    </>
  );
}
