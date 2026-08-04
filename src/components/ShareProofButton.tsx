'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { buildProofUrl, splitMatchedPattern, type ProofChain } from '@/lib/proof-of-find';

interface ShareProofButtonProps {
  chain: ProofChain;
  address: string;
  matchedPattern: string;
  attempts: number;
  duration: number;
  mode?: string;
}

export function ShareProofButton({
  chain,
  address,
  matchedPattern,
  attempts,
  duration,
  mode,
}: ShareProofButtonProps) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const onShare = () => {
    const { prefix, suffix } = splitMatchedPattern(matchedPattern);
    const url = buildProofUrl(window.location.origin, {
      chain,
      address,
      prefix: prefix || undefined,
      suffix: suffix || undefined,
      mode,
      attempts,
      duration,
    });
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
  };

  return (
    <button
      type="button"
      onClick={onShare}
      className="text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent"
    >
      {copied ? t('proofLinkCopied') : t('shareProof')}
    </button>
  );
}
