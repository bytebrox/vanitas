'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { splitMatchedPattern, type ProofChain } from '@/lib/proof-of-find';
import { renderShareCard } from '@/lib/share-card';
import { shortAddress } from '@/lib/post-find';

interface ShareCardButtonProps {
  chain: ProofChain;
  address: string;
  matchedPattern: string;
  attempts: number;
  duration: number;
  mode?: string;
  className?: string;
}

export function ShareCardButton({
  chain,
  address,
  matchedPattern,
  attempts,
  duration,
  mode,
  className = 'text-ink border-b border-ink pb-0.5 hover:text-accent hover:border-accent',
}: ShareCardButtonProps) {
  const t = useTranslations('common');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const onDownload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { prefix, suffix } = splitMatchedPattern(matchedPattern);
      const blob = await renderShareCard({
        chain,
        address,
        matchedPattern: `${prefix}...${suffix}`,
        attempts,
        duration,
        mode,
        chainLabel: chain.toUpperCase(),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vanitas-${chain}-${shortAddress(address).replace(/…/g, '')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
        } catch {
          /* download alone is enough */
        }
      }

      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch (err) {
      console.error('Share card failed:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void onDownload();
      }}
      disabled={busy}
      className={className}
    >
      {done ? t('shareCardSaved') : busy ? t('shareCardBusy') : t('shareCard')}
    </button>
  );
}
