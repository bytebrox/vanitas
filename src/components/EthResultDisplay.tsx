'use client';

/**
 * ETH vanity result — wallet or contract
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { GeneratedEthResult } from '@/types/eth';
import { formatNumber, formatDuration } from '@/lib/format';
import { buildVanityExportTxt } from '@/lib/export-txt';
import { EntropyInfo } from './EntropyInfo';
import { ShareProofButton } from './ShareProofButton';

interface EthResultDisplayProps {
  result: GeneratedEthResult;
  onReset: () => void;
  onContinueSearch?: () => void;
}

export function EthResultDisplay({ result, onReset, onContinueSearch }: EthResultDisplayProps) {
  const t = useTranslations('common');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const isContract = result.mode === 'contract';
  const isCreate2 =
    result.mode === 'create2-salt' || result.mode === 'create2-deployer';
  const isDeployStyle = isContract || isCreate2;

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
    const content = isCreate2
      ? buildVanityExportTxt(t, {
          title: `${t('exportTxtTitle')} — ETH CREATE2 (${result.mode})`,
          address: result.address,
          privateKey: result.privateKey,
          extraLines: [
            `DEPLOYER ADDRESS:\n${result.deployerAddress || ''}`,
            `SALT:\n${result.create2Salt || ''}`,
            `INIT CODE HASH:\n${result.create2InitCodeHash || ''}`,
          ],
        })
      : isContract
        ? buildVanityExportTxt(t, {
            title: `${t('exportTxtTitle')} — ETH CONTRACT (CREATE · nonce 0)`,
            address: result.address,
            privateKey: result.privateKey,
            extraLines: [`DEPLOYER ADDRESS:\n${result.deployerAddress || ''}`],
          })
        : buildVanityExportTxt(t, {
            title: `${t('exportTxtTitle')} — ETH WALLET`,
            address: result.address,
            privateKey: result.privateKey,
          });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isDeployStyle
      ? `eth-contract-${result.address.slice(2, 10)}.txt`
      : `eth-wallet-${result.address.slice(2, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const payload = isCreate2
      ? {
          mode: result.mode,
          contractAddress: result.address,
          deployerAddress: result.deployerAddress,
          privateKey: result.privateKey,
          salt: result.create2Salt,
          initCodeHash: result.create2InitCodeHash,
        }
      : isContract
        ? {
            mode: 'contract',
            contractAddress: result.address,
            deployerAddress: result.deployerAddress,
            privateKey: result.privateKey,
            note: 'Deploy first contract with this key at nonce 0',
          }
        : {
            mode: 'wallet',
            address: result.address,
            privateKey: result.privateKey,
          };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isDeployStyle
      ? `eth-contract-${result.address.slice(2, 10)}.json`
      : `eth-wallet-${result.address.slice(2, 10)}.json`;
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
          {isDeployStyle ? 'Contract address ready' : 'Wallet address ready'}
        </h2>
        <p className="text-sm text-muted font-mono">
          {formatNumber(result.attempts)} attempts · {formatDuration(result.duration)}
        </p>
      </header>

      <section className="border-y border-ink/15 divide-y divide-ink/15">
        <div className="py-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">
              {isDeployStyle ? 'Contract address' : 'Wallet address'}
            </p>
            <button
              type="button"
              onClick={() => { void copyToClipboard(result.address, 'address'); }}
              className="text-micro uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              {copiedField === 'address' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="font-mono text-base sm:text-lg break-all leading-relaxed text-ink">
            <HighlightedEthAddress address={result.address} pattern={result.matchedPattern} />
          </p>
        </div>

        {isDeployStyle && result.deployerAddress && (
          <div className="py-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-micro uppercase tracking-[0.18em] text-muted">Deployer address</p>
              <button
                type="button"
                onClick={() => { void copyToClipboard(result.deployerAddress!, 'deployer'); }}
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
              {isDeployStyle ? 'Deployer private key' : 'Private key'}
            </p>
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
              <span className="text-ink/25 select-none tracking-widest">
                ••••••••••••••••••••••••••••••••
              </span>
            )}
          </p>
        </div>
      </section>

      <section>
        <p className="text-micro uppercase tracking-[0.18em] text-accent mb-3">Keep safe</p>
        <ul className="text-sm text-muted space-y-2 leading-relaxed">
          <li>Save the private key before leaving this page</li>
          {isCreate2 ? (
            <li>Use CREATE2 with the returned salt and the init code that matches initCodeHash</li>
          ) : isContract ? (
            <li>Deploy as the first transaction from this key — nonce must be 0</li>
          ) : (
            <li>Import into any EVM wallet — same address on every chain</li>
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
          <button type="button" onClick={downloadJson} className="text-muted hover:text-ink">
            Download json
          </button>
          <ShareProofButton
            chain="evm"
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
          {isDeployStyle
            ? 'TXT / JSON include contract + deployer key (and CREATE2 salt when applicable) · Share proof never includes keys'
            : 'Hex private key for MetaMask, Rabby, Frame, … · Share proof never includes keys'}
        </p>
      </section>
    </div>
  );
}

function HighlightedEthAddress({
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
