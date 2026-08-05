'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const t = useTranslations('market.common');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="text-micro uppercase tracking-[0.14em] text-muted hover:text-accent"
    >
      {copied ? t('copied') : (label ?? t('copy'))}
    </button>
  );
}
