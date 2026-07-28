'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { GeneratedTronResult } from '@/types/tron';
import { formatNumber, formatDuration } from '@/lib/format';
import { buildVanityExportTxt } from '@/lib/export-txt';
import { EntropyInfo } from './EntropyInfo';
import { ShareProofButton } from './ShareProofButton';

interface TronResultDisplayProps {
  result: GeneratedTronResult;
  onReset: () => void;
  onContinueSearch?: () => void;
}

export function TronResultDisplay({ result, onReset, onContinueSearch }: TronResultDisplayProps) {
  const t = useTranslations('common');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const isContract = result.mode === 'contract' || Boolean(result.deployerAddress);

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

  const downloadTxt = () => {
    const content = buildVanityExportTxt(t, {
      title: `${t('exportTxtTitle')} — TRON`,
      address: result.address,
      privateKey: result.privateKey,
      extraLines: [
        `Mode: ${isContract ? 'contract (CREATE nonce 0)' : 'wallet'}`,
        ...(isContract && result.deployerAddress
          ? [`DEPLOYER ADDRESS:\n${result.deployerAddress}`]
          : []),
      ],
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tron-${result.address.slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const payload = {
      chain: 'tron',
      network: 'mainnet',
      mode: isContract ? 'contract' : 'wallet',
      address: result.address,
      deployerAddress: result.deployerAddress,
      privateKey: result.privateKey,
      generatedAt: new Date().toISOString(),
      importHint: isContract
        ? 'Use deployer privateKey; first CREATE (nonce 0) yields address.'
        : 'Import privateKey (hex) into TronLink or another Tron wallet.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tron-${result.address.slice(0, 10)}.json`;
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
          {isContract ? 'Contract address ready' : 'Tron address ready'}
        </h2>
        <p className="text-sm text-muted font-mono">
          {formatNumber(result.attempts)} attempts · {formatDuration(result.duration)}
        </p>
      </header>

      <section className="border-y border-ink/15 divide-y divide-ink/15">
        <div className="py-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">
              {isContract ? 'Contract address' : 'Address'}
            </p>
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
            {result.address}
          </p>
        </div>

        {isContract && result.deployerAddress && (
          <div className="py-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-micro uppercase tracking-[0.18em] text-muted">Deployer address</p>
              <button
                type="button"
                onClick={() => {
                  void copyToClipboard(result.deployerAddress!, 'deployer');
                }}
                className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
              >
                {copiedField === 'deployer' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="font-mono text-base sm:text-lg break-all leading-relaxed text-ink">
              {result.deployerAddress}
            </p>
          </div>
        )}

        <div className="py-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">
              {isContract ? 'Deployer private key' : 'Private key'}
            </p>
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
          <p className="text-micro text-muted mt-3 normal-case tracking-normal leading-relaxed">
            {isContract
              ? 'Deploy as the first transaction from this key — nonce must be 0.'
              : 'Import hex private key into TronLink or any Tron wallet.'}
          </p>
        </div>
      </section>

      <section>
        <p className="text-micro uppercase tracking-[0.18em] text-accent mb-3">Keep safe</p>
        <ul className="text-sm text-muted space-y-2 leading-relaxed">
          <li>Save the private key before leaving this page</li>
          {isContract ? (
            <li>First CREATE from the deployer yields the vanity contract address</li>
          ) : (
            <li>Import into TronLink or any Tron wallet</li>
          )}
          <li>Generated locally; nothing was stored on a server</li>
        </ul>
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
            chain="tron"
            address={result.address}
            matchedPattern={result.matchedPattern}
            attempts={result.attempts}
            duration={result.duration}
            mode={result.mode}
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
        <p className="text-micro text-muted">
          {isContract
            ? 'TXT / JSON include contract + deployer key · Share proof never includes keys'
            : 'Hex private key for TronLink and compatible wallets · Share proof never includes keys'}
        </p>
      </section>
    </div>
  );
}
